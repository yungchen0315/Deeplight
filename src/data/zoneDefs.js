/* ============================================================================
 * zoneDefs.js — 四段海域主幹（企劃書第 4a 節 + v1.1 深淵帶擴充）。depth 會被夾在
 * [minDepth, anchorDepth] 之間，直到玩家花 gateCost 通過錨點才能進入下一海域。
 * ==========================================================================*/
(function () {
  const ZONE_DEFS = [
    { id: 0, name: '透光帶', minDepth: 0, anchorDepth: 200, mult: 1, bg: 'W1', gateCost: 7500 },
    { id: 1, name: '暮光帶', minDepth: 200, anchorDepth: 1000, mult: 3, bg: 'W2', gateCost: 300000 },
    { id: 2, name: '午夜帶', minDepth: 1000, anchorDepth: 4000, mult: 10, bg: 'W3', gateCost: 200000000 },
    { id: 3, name: '深淵帶', minDepth: 4000, anchorDepth: 11000, mult: 40, bg: 'INK', gateCost: 1000000000000 },
    { id: 4, name: '海溝幽域．即將開放', minDepth: 11000, anchorDepth: 11000, mult: 40, bg: 'INK', gateCost: null, comingSoon: true }
  ];

  function zoneById(id) { return ZONE_DEFS.find((z) => z.id === id); }
  function zoneForDepth(depth) { return ZONE_DEFS.find((z) => depth >= z.minDepth && depth < z.anchorDepth) || ZONE_DEFS[ZONE_DEFS.length - 1]; }

  window.App.Data.ZONE_DEFS = ZONE_DEFS;
  window.App.Data.zoneById = zoneById;
  window.App.Data.zoneForDepth = zoneForDepth;
})();
