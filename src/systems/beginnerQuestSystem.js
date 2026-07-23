/* ============================================================================
 * beginnerQuestSystem.js — 新手任務的進度判定與領取。跟 questSystem.js 共用同一套
 * readStat() 讀終身統計數字，但沒有「今天」或 baseline 的概念，領取後永久標記
 * 在 save.beginnerQuests.claimed，不受任何轉生重置（教新手的任務，做過一次
 * 就永遠算數，不該因為轉生又要玩家重新證明一次）。
 * ==========================================================================*/
(function () {
  const D = window.App.Data;

  function progressFor(save, tpl) {
    const Quest = window.App.Systems.Quest;
    const current = Quest.readStat(save, tpl.statPath);
    return Math.max(0, Math.min(tpl.target, current));
  }

  function isDone(save, tpl) { return progressFor(save, tpl) >= tpl.target; }

  function isClaimed(save, id) { return (save.beginnerQuests.claimed || []).includes(id); }

  function allClaimed(save) { return D.BEGINNER_QUEST_DEFS.every((tpl) => isClaimed(save, tpl.id)); }

  /** 目前有幾個新手任務已完成、卻還沒領取——供潛航畫面的任務按鈕顯示紅點提示。 */
  function claimableCount(save) {
    return D.BEGINNER_QUEST_DEFS.filter((tpl) => !isClaimed(save, tpl.id) && isDone(save, tpl)).length;
  }

  function claim(save, id) {
    const tpl = D.beginnerQuestById(id);
    if (!tpl) return { ok: false, reason: '找不到此任務' };
    if (isClaimed(save, id)) return { ok: false, reason: '已領取過此任務' };
    if (!isDone(save, tpl)) return { ok: false, reason: '任務尚未完成' };
    save.beginnerQuests.claimed.push(id);
    save.samples = (save.samples || 0) + tpl.rewardSamples;
    if (tpl.rewardPearls) save.pearls = (save.pearls || 0) + tpl.rewardPearls;
    return { ok: true, rewardSamples: tpl.rewardSamples, rewardPearls: tpl.rewardPearls };
  }

  window.App.Systems.BeginnerQuest = { progressFor, isDone, isClaimed, allClaimed, claimableCount, claim };
})();
