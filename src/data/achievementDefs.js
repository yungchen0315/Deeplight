/* ============================================================================
 * achievementDefs.js — 12 個成就（企劃書第 7 節 + v1.1 深淵帶擴充），部分掉深海
 * 珍珠。condition(state) 由 achievementSystem 呼叫；state 是完整 SaveGame。
 * ==========================================================================*/
(function () {
  const ACHIEVEMENT_DEFS = [
    { id: 'first_module', name: '第一盞燈', desc: '購買任一發光模組', pearl: 0,
      condition: (s) => Object.keys(s.modules).some((k) => s.modules[k].count > 0) },
    { id: 'first_creature', name: '初次相遇', desc: '記錄第一種深淵生物', pearl: 0,
      condition: (s) => Object.keys(s.bestiary).length >= 1 },
    { id: 'depth_200', name: '透光帶盡頭', desc: '下潛至 200 公尺', pearl: 0,
      condition: (s) => s.maxDepthEver >= 200 },
    { id: 'depth_1000', name: '永夜降臨', desc: '下潛至 1000 公尺', pearl: 1,
      condition: (s) => s.maxDepthEver >= 1000 },
    { id: 'first_prestige', name: '重返海面', desc: '完成第一次轉生', pearl: 1,
      condition: (s) => s.prestigeCount >= 1 },
    { id: 'bestiary_8', name: '博物學家', desc: '深淵圖鑑集滿 8 種', pearl: 0,
      condition: (s) => Object.keys(s.bestiary).length >= 8 },
    { id: 'depth_4000', name: '深淵之門', desc: '下潛至 4000 公尺', pearl: 2,
      condition: (s) => s.maxDepthEver >= 4000 },
    { id: 'depth_11000', name: '挑戰者深淵', desc: '下潛至 11000 公尺', pearl: 3,
      condition: (s) => s.maxDepthEver >= 11000 },
    { id: 'bestiary_16', name: '深海百科', desc: '深淵圖鑑集滿 16 種', pearl: 2,
      condition: (s) => Object.keys(s.bestiary).length >= 16 },
    { id: 'prestige_5', name: '老練站長', desc: '完成 5 次轉生', pearl: 2,
      condition: (s) => s.prestigeCount >= 5 },
    { id: 'modules_100', name: '百燈齊明', desc: '任一模組持有數達 100', pearl: 1,
      condition: (s) => Object.keys(s.modules).some((k) => (s.modules[k].count || 0) >= 100) },
    { id: 'taps_1000', name: '不倦之手', desc: '累計點擊水域 1000 次', pearl: 1,
      condition: (s) => (s.stats.totalTaps || 0) >= 1000 }
  ];

  window.App.Data.ACHIEVEMENT_DEFS = ACHIEVEMENT_DEFS;
})();
