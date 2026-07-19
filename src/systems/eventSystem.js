/* ============================================================================
 * eventSystem.js — 純前端、本地日期判斷的限時活動。目前只有週末「大遷徙」（本地
 * 週六日，生物出現間隔減半），之後可以照同樣模式加更多日期判斷式活動。
 * ==========================================================================*/
(function () {
  function isWeekend(now) {
    const d = new Date(now == null ? Date.now() : now);
    const day = d.getDay(); // 0=週日, 6=週六
    return day === 0 || day === 6;
  }

  window.App.Systems.Event = { isWeekend };
})();
