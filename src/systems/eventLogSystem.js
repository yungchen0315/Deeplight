/* ============================================================================
 * eventLogSystem.js — 重大事件時間軸：轉生／協約／盟約／通過閘門／稀有生物初遇／
 * 金燈魚／成就解鎖，純記錄用途，最多保留最近 50 筆（FIFO），不影響任何數值。
 * ==========================================================================*/
(function () {
  const CAP = 50;

  function log(save, message) {
    if (!Array.isArray(save.eventLog)) save.eventLog = [];
    save.eventLog.push({ ts: Date.now(), message });
    while (save.eventLog.length > CAP) save.eventLog.shift();
  }

  function recent(save, count) {
    const list = save.eventLog || [];
    return list.slice(Math.max(0, list.length - (count || CAP))).slice().reverse();
  }

  window.App.Systems.EventLog = { log, recent };
})();
