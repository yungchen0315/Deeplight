/* ============================================================================
 * signalSystem.js — 深淵訊號殘片：全遊戲最稀有的隨機事件，跟金燈魚共用「主動遊玩
 * 期間限定、離線不倒數、不追趕」的設計，但間隔長得多、且全部收集齊後就永久停止
 * 出現（純敘事收藏品，沒有「重複觸發」的必要）。
 * ==========================================================================*/
(function () {
  const D = window.App.Data;
  const B = D.BALANCE;
  const U = window.App.Utils;

  function allCollected(save) {
    return (save.signalFragments || []).length >= D.SIGNAL_FRAGMENT_DEFS.length;
  }

  function dueToSpawn(save, now) {
    if (allCollected(save)) return false;
    if ((save.currentZone || 0) < B.SIGNAL_MIN_ZONE) return false;
    return (save.nextSignalAt || 0) <= (now == null ? Date.now() : now);
  }

  function scheduleNext(save, now) {
    now = now == null ? Date.now() : now;
    const [min, max] = B.SIGNAL_SPAWN_INTERVAL_MS;
    save.nextSignalAt = now + U.randomInt(min, max);
  }

  /** 從尚未收集過的殘片中隨機抽一段；全部收集完後理論上不會再被呼叫（見 dueToSpawn）。 */
  function collect(save) {
    const remaining = D.SIGNAL_FRAGMENT_DEFS.filter((def) => !(save.signalFragments || []).includes(def.id));
    if (remaining.length === 0) return { ok: false, reason: '所有訊號殘片都已收集完畢' };
    const def = U.choice(remaining);
    save.signalFragments = (save.signalFragments || []).concat(def.id);
    save.pearls = (save.pearls || 0) + B.SIGNAL_PEARL_REWARD;
    const justCompleted = allCollected(save);
    window.App.Systems.EventLog.log(save, '收到一段深淵訊號殘片（' + save.signalFragments.length + ' / ' + D.SIGNAL_FRAGMENT_DEFS.length + '）');
    return { ok: true, def, justCompleted };
  }

  window.App.Systems.Signal = { allCollected, dueToSpawn, scheduleNext, collect };
})();
