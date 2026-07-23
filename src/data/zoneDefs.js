/* ============================================================================
 * zoneDefs.js — 十七段海域主幹（企劃書第 4a 節 + v1.1~Phase12 擴充）。depth 會被夾在
 * [minDepth, anchorDepth] 之間，直到玩家花 gateCost 通過錨點才能進入下一海域。
 * filterHue 是 CSS hue-rotate 濾鏡角度，讓深層海域有獨立色調又不必新增色盤顏色
 * （企劃書要求全遊戲硬上限 20 色，見 palette.js）。
 * gateCost 曲線：0~3 段是上一輪依實測回饋調整過的（見當時的模擬結果），4~13 段
 * 用同一套模擬工具（含研究樹/模組升級/壓載）校正，把「時間到下一海域」的成長率
 * 抹平成穩定的 1.3~2.5 倍區間，取代原本忽快忽慢的曲線。id 15 的 gateCost 這次隨著
 * 第 16 海域（薪火）正式開放重新校正過——原本 1.1e46 只是預告牌占位值，重新求解為
 * 6e45（模擬結果：z14→z15 約 408h，z15→z16 約 581h，比例 1.43x，落在同一區間內）。
 * id 16 的 gateCost 目前無法被觸發（下一個海域是 comingSoon 的預告牌，
 * descentSystem.passGate 會擋下），先延續同一套倍率保留一個佔位數值，等真的開放
 * 第 18 海域時再一併重新校正。
 * ==========================================================================*/
(function () {
  const ZONE_DEFS = [
    { id: 0, name: '透光帶', minDepth: 0, anchorDepth: 200, mult: 1, bg: 'W1', filterHue: 0, gateCost: 7500 },
    { id: 1, name: '暮光帶', minDepth: 200, anchorDepth: 1000, mult: 3, bg: 'W2', filterHue: 0, gateCost: 750000 },
    { id: 2, name: '午夜帶', minDepth: 1000, anchorDepth: 4000, mult: 10, bg: 'W3', filterHue: 0, gateCost: 700000000 },
    { id: 3, name: '深淵帶', minDepth: 4000, anchorDepth: 11000, mult: 40, bg: 'INK', filterHue: 0, gateCost: 2000000000000 },
    { id: 4, name: '海溝幽域', minDepth: 11000, anchorDepth: 20000, mult: 150, bg: 'INK', filterHue: 250, gateCost: 3.8e14 },
    { id: 5, name: '無光帶', minDepth: 20000, anchorDepth: 35000, mult: 600, bg: 'INK', filterHue: 120, gateCost: 5.3e17 },
    { id: 6, name: '深海平原', minDepth: 35000, anchorDepth: 55000, mult: 2200, bg: 'INK', filterHue: 40, gateCost: 6.5e20 },
    { id: 7, name: '熱泉海淵', minDepth: 55000, anchorDepth: 80000, mult: 9000, bg: 'INK', filterHue: 300, gateCost: 8.2e23 },
    { id: 8, name: '裂谷深淵', minDepth: 80000, anchorDepth: 130000, mult: 35000, bg: 'INK', filterHue: 160, gateCost: 2e26 },
    { id: 9, name: '先驅遺跡', minDepth: 130000, anchorDepth: 210000, mult: 130000, bg: 'INK', filterHue: 200, gateCost: 1.5e29 },
    { id: 10, name: '回音迴廊', minDepth: 210000, anchorDepth: 340000, mult: 500000, bg: 'INK', filterHue: 20, gateCost: 8.5e31 },
    { id: 11, name: '沉眠都市', minDepth: 340000, anchorDepth: 540000, mult: 2000000, bg: 'INK', filterHue: 340, gateCost: 5e34 },
    { id: 12, name: '低語塹', minDepth: 540000, anchorDepth: 840000, mult: 8000000, bg: 'INK', filterHue: 80, gateCost: 4.5e37 },
    { id: 13, name: '本源塹', minDepth: 840000, anchorDepth: 1300000, mult: 32000000, bg: 'INK', filterHue: 260, gateCost: 2e40 },
    { id: 14, name: '彼岸', minDepth: 1300000, anchorDepth: 1950000, mult: 128000000, bg: 'INK', filterHue: 180, gateCost: 1.5e43 },
    { id: 15, name: '歸墟', minDepth: 1950000, anchorDepth: 2900000, mult: 512000000, bg: 'INK', filterHue: 210, gateCost: 6e45 },
    { id: 16, name: '薪火', minDepth: 2900000, anchorDepth: 4300000, mult: 2000000000, bg: 'INK', filterHue: 30, gateCost: 4.2e48 },
    { id: 17, name: '未知深淵．即將開放', minDepth: 4300000, anchorDepth: 4300000, mult: 2000000000, bg: 'INK', filterHue: 30, gateCost: null, comingSoon: true }
  ];

  function zoneById(id) { return ZONE_DEFS.find((z) => z.id === id); }
  function zoneForDepth(depth) { return ZONE_DEFS.find((z) => depth >= z.minDepth && depth < z.anchorDepth) || ZONE_DEFS[ZONE_DEFS.length - 1]; }

  window.App.Data.ZONE_DEFS = ZONE_DEFS;
  window.App.Data.zoneById = zoneById;
  window.App.Data.zoneForDepth = zoneForDepth;
})();
