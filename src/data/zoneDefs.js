/* ============================================================================
 * zoneDefs.js — 十段海域主幹（企劃書第 4a 節 + v1.1/Phase2/Phase3/Phase4/Phase5 擴充）。
 * depth 會被夾在 [minDepth, anchorDepth] 之間，直到玩家花 gateCost 通過錨點才能
 * 進入下一海域。filterHue 是 CSS hue-rotate 濾鏡角度，讓深層海域有獨立色調又不必
 * 新增色盤顏色（企劃書要求全遊戲硬上限 20 色，見 palette.js）。
 * gateCost 曲線：0~3 段是上一輪依實測回饋調整過的（見當時的模擬結果），4~8 段
 * 用同一套模擬工具（含研究樹/模組升級/壓載）校正，把「時間到下一海域」的成長率
 * 抹平成穩定的 1.3~2.5 倍區間，取代原本忽快忽慢（甚至中段幾乎打平、最後兩段又
 * 暴衝好幾倍）的曲線。id 8 的 gateCost 這次隨著第 9 海域（先驅遺跡）正式開放重新
 * 校正過（模擬結果：z7→z8 約 21.6h，z8→z9 約 30.3h，比例 1.34x，落在同一區間內）。
 * id 9 的 gateCost 目前無法被觸發（下一個海域是 comingSoon 的預告牌，
 * descentSystem.passGate 會擋下），先延續同一套倍率保留一個佔位數值，等真的開放
 * 第 11 海域時再一併重新校正。
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
    { id: 9, name: '先驅遺跡', minDepth: 130000, anchorDepth: 210000, mult: 130000, bg: 'INK', filterHue: 200, gateCost: 4e29 },
    { id: 10, name: '深海溝底．即將開放', minDepth: 210000, anchorDepth: 210000, mult: 130000, bg: 'INK', filterHue: 200, gateCost: null, comingSoon: true }
  ];

  function zoneById(id) { return ZONE_DEFS.find((z) => z.id === id); }
  function zoneForDepth(depth) { return ZONE_DEFS.find((z) => depth >= z.minDepth && depth < z.anchorDepth) || ZONE_DEFS[ZONE_DEFS.length - 1]; }

  window.App.Data.ZONE_DEFS = ZONE_DEFS;
  window.App.Data.zoneById = zoneById;
  window.App.Data.zoneForDepth = zoneForDepth;
})();
