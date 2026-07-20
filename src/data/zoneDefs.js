/* ============================================================================
 * zoneDefs.js — 九段海域主幹（企劃書第 4a 節 + v1.1/Phase2/Phase3/Phase4 擴充）。depth 會被夾在
 * [minDepth, anchorDepth] 之間，直到玩家花 gateCost 通過錨點才能進入下一海域。
 * filterHue 是 CSS hue-rotate 濾鏡角度，讓深層海域有獨立色調又不必新增色盤顏色
 * （企劃書要求全遊戲硬上限 20 色，見 palette.js）。
 * ==========================================================================*/
(function () {
  const ZONE_DEFS = [
    { id: 0, name: '透光帶', minDepth: 0, anchorDepth: 200, mult: 1, bg: 'W1', filterHue: 0, gateCost: 7500 },
    { id: 1, name: '暮光帶', minDepth: 200, anchorDepth: 1000, mult: 3, bg: 'W2', filterHue: 0, gateCost: 300000 },
    { id: 2, name: '午夜帶', minDepth: 1000, anchorDepth: 4000, mult: 10, bg: 'W3', filterHue: 0, gateCost: 200000000 },
    { id: 3, name: '深淵帶', minDepth: 4000, anchorDepth: 11000, mult: 40, bg: 'INK', filterHue: 0, gateCost: 1000000000000 },
    { id: 4, name: '海溝幽域', minDepth: 11000, anchorDepth: 20000, mult: 150, bg: 'INK', filterHue: 250, gateCost: 500000000000000 },
    { id: 5, name: '無光帶', minDepth: 20000, anchorDepth: 35000, mult: 600, bg: 'INK', filterHue: 120, gateCost: 300000000000000000 },
    { id: 6, name: '深海平原', minDepth: 35000, anchorDepth: 55000, mult: 2200, bg: 'INK', filterHue: 40, gateCost: 2e20 },
    { id: 7, name: '熱泉海淵', minDepth: 55000, anchorDepth: 80000, mult: 9000, bg: 'INK', filterHue: 300, gateCost: 6e23 },
    { id: 8, name: '裂谷深淵', minDepth: 80000, anchorDepth: 130000, mult: 35000, bg: 'INK', filterHue: 160, gateCost: 4e27 },
    { id: 9, name: '深海溝底．即將開放', minDepth: 130000, anchorDepth: 130000, mult: 35000, bg: 'INK', filterHue: 160, gateCost: null, comingSoon: true }
  ];

  function zoneById(id) { return ZONE_DEFS.find((z) => z.id === id); }
  function zoneForDepth(depth) { return ZONE_DEFS.find((z) => depth >= z.minDepth && depth < z.anchorDepth) || ZONE_DEFS[ZONE_DEFS.length - 1]; }

  window.App.Data.ZONE_DEFS = ZONE_DEFS;
  window.App.Data.zoneById = zoneById;
  window.App.Data.zoneForDepth = zoneForDepth;
})();
