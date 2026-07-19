/* ============================================================================
 * questSystem.js — 每日任務：依日期換一批任務（3 個不重複範本），進度用終身
 * 統計數字扣掉抽到當下的基準值算出。全部完成加碼 1 珍珠。
 * ==========================================================================*/
(function () {
  const D = window.App.Data;
  const B = D.BALANCE;
  const Econ = window.App.Systems.Economy;

  function readStat(save, path) {
    if (path === 'depth') return save.depth || 0;
    const key = path.split('.')[1];
    return (save.stats && save.stats[key]) || 0;
  }

  function resolveTarget(save, tpl) {
    if (tpl.target !== 'dynamic') return tpl.target;
    if (tpl.id === 'glow') return Math.max(100, Math.round(Econ.glowPerSec(save) * 600));
    return 1;
  }

  function rollFresh(save, dayKey) {
    const pool = D.QUEST_TEMPLATES.slice();
    const picked = [];
    while (picked.length < B.QUEST_COUNT_PER_DAY && pool.length > 0) {
      const idx = Math.floor(Math.random() * pool.length);
      picked.push(pool.splice(idx, 1)[0]);
    }
    const items = picked.map((tpl) => ({
      tplId: tpl.id,
      target: resolveTarget(save, tpl),
      baseline: readStat(save, tpl.statPath),
      claimed: false
    }));
    save.quests = { dayKey, items, allBonusClaimed: false };
  }

  /** 確保 save.quests 對應到「今天」；日期換了就重抽一組新任務（放棄前一天未完成的）。 */
  function ensureToday(save, now) {
    const Daily = window.App.Systems.Daily;
    const dayKey = Daily.todayKey(now == null ? Date.now() : now);
    if (save.quests.dayKey !== dayKey) rollFresh(save, dayKey);
    return save.quests;
  }

  function progressFor(save, item) {
    const tpl = D.questTemplateById(item.tplId);
    if (!tpl) return 0;
    const current = readStat(save, tpl.statPath);
    return Math.max(0, Math.min(item.target, current - item.baseline));
  }

  function isDone(save, item) { return progressFor(save, item) >= item.target; }

  function allClaimed(save) { return save.quests.items.length > 0 && save.quests.items.every((it) => it.claimed); }

  function claim(save, tplId) {
    const item = save.quests.items.find((it) => it.tplId === tplId);
    if (!item) return { ok: false, reason: '找不到此任務' };
    if (item.claimed) return { ok: false, reason: '已領取過此任務' };
    if (!isDone(save, item)) return { ok: false, reason: '任務尚未完成' };
    const tpl = D.questTemplateById(tplId);
    item.claimed = true;
    save.samples = (save.samples || 0) + tpl.reward;
    save.stats.totalQuestsCompleted = (save.stats.totalQuestsCompleted || 0) + 1;
    let bonus = 0;
    if (allClaimed(save) && !save.quests.allBonusClaimed) {
      save.quests.allBonusClaimed = true;
      save.pearls = (save.pearls || 0) + B.QUEST_ALL_DONE_PEARL;
      bonus = B.QUEST_ALL_DONE_PEARL;
    }
    return { ok: true, reward: tpl.reward, bonus };
  }

  window.App.Systems.Quest = { ensureToday, progressFor, isDone, allClaimed, claim, readStat };
})();
