/* ============================================================================
 * moduleDefs.js — 8 種發光模組（企劃書第 4b 節 + v1.1 深淵帶擴充）。cost(n) 與
 * 升級節點的計算交給 economySystem，這裡只放靜態資料。
 * ==========================================================================*/
(function () {
  const MODULE_DEFS = [
    { id: 'jelly', name: '燈籠水母', icon: 'mod_jelly', baseCost: 15, baseProd: 0.1, unlockDepth: 0 },
    { id: 'moss', name: '光苔板', icon: 'mod_moss', baseCost: 100, baseProd: 1, unlockDepth: 0 },
    { id: 'buoy', name: '迴聲浮標', icon: 'mod_buoy', baseCost: 1100, baseProd: 8, unlockDepth: 100 },
    { id: 'coral', name: '螢光珊瑚架', icon: 'mod_coral', baseCost: 12000, baseProd: 47, unlockDepth: 250 },
    { id: 'vent', name: '熱泉導管', icon: 'mod_vent', baseCost: 130000, baseProd: 260, unlockDepth: 700 },
    { id: 'whalefall', name: '鯨落生態圈', icon: 'mod_whalefall', baseCost: 1400000, baseProd: 1400, unlockDepth: 1200 },
    { id: 'lure', name: '深淵燈籠陣', icon: 'mod_lure', baseCost: 16000000, baseProd: 8000, unlockDepth: 3000 },
    { id: 'reactor', name: '熱液反應爐', icon: 'mod_reactor', baseCost: 180000000, baseProd: 45000, unlockDepth: 5000 },
    { id: 'pillar', name: '虛淵光柱', icon: 'mod_pillar', baseCost: 2000000000, baseProd: 500000, unlockDepth: 9000 },
    { id: 'whaletemple', name: '古鯨聖殿', icon: 'mod_whaletemple', baseCost: 24000000000, baseProd: 2800000, unlockDepth: 14000 }
  ];

  function moduleById(id) { return MODULE_DEFS.find((m) => m.id === id); }

  window.App.Data.MODULE_DEFS = MODULE_DEFS;
  window.App.Data.moduleById = moduleById;
})();
