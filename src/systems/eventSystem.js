/* ============================================================================
 * eventSystem.js — 純前端、本地日期判斷的限時活動：週末「大遷徙」＋固定日期的
 * 季節活動。全部只讀本地時間，不需要伺服器，效果透過回傳的倍率讓
 * creatureSystem/economySystem 疊乘套用。
 * ==========================================================================*/
(function () {
  function isWeekend(now) {
    const d = new Date(now == null ? Date.now() : now);
    const day = d.getDay(); // 0=週日, 6=週六
    return day === 0 || day === 6;
  }

  /** month 為 0-11（對應 Date#getMonth）。startDay/endDay 為當月日期範圍，含頭尾。 */
  const SEASONAL_EVENTS = [
    { id: 'newyear', name: '新年深潮', month: 0, startDay: 1, endDay: 3,
      banner: '🎊 新年深潮：全螢光產量 x1.5，生物出現速度 x1.4', prodMult: 1.5, spawnIntervalMult: 1 / 1.4, rareChanceMult: 1 },
    { id: 'oceansday', name: '世界海洋日', month: 5, startDay: 8, endDay: 8,
      banner: '🌊 世界海洋日：生物出現速度 x2，稀有機率 x2', prodMult: 1, spawnIntervalMult: 0.5, rareChanceMult: 2 }
  ];

  /** 回傳今天生效的季節活動，沒有的話回傳 null。同時間只會有一個生效（設計上刻意
   *  不重疊日期，避免疊加效果難以預期）。 */
  function currentSeasonalEvent(now) {
    const d = new Date(now == null ? Date.now() : now);
    const month = d.getMonth();
    const day = d.getDate();
    return SEASONAL_EVENTS.find((e) => e.month === month && day >= e.startDay && day <= e.endDay) || null;
  }

  window.App.Systems.Event = { isWeekend, currentSeasonalEvent, SEASONAL_EVENTS };
})();
