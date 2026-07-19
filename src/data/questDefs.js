/* ============================================================================
 * questDefs.js — 每日任務範本池（10 種），每天從中抽 3 個不重複的種類。進度一律
 * 用「終身統計數字 - 領取當天抽到時的基準值」算出，不需要另外維護一份每日計數器。
 * statPath 為 'stats.xxx' 時讀 save.stats[xxx]；'depth' 時直接讀 save.depth（本輪
 * 深度，非終身最大值，符合「今天下潛了多少」的直覺）。
 * ==========================================================================*/
(function () {
  const QUEST_TEMPLATES = [
    { id: 'tap', label: '點擊水域', unit: '次', statPath: 'stats.totalTaps', target: 200, reward: 4 },
    { id: 'collect', label: '收集路過生物', unit: '隻', statPath: 'stats.totalCreaturesCollected', target: 8, reward: 5 },
    { id: 'buyModule', label: '購買發光模組', unit: '個', statPath: 'stats.totalModulesBought', target: 25, reward: 6 },
    { id: 'glow', label: '累積螢光', unit: '', statPath: 'stats.totalGlowEarned', target: 'dynamic', reward: 5 },
    { id: 'descend', label: '下潛深度', unit: 'm', statPath: 'depth', target: 500, reward: 6 },
    { id: 'research', label: '完成研究', unit: '節', statPath: 'stats.totalResearchBought', target: 1, reward: 4 },
    { id: 'claimMissed', label: '領取離線錯過的生物', unit: '隻', statPath: 'stats.totalMissedClaimed', target: 3, reward: 4 },
    { id: 'pearlBoost', label: '使用珍珠加護', unit: '次', statPath: 'stats.totalPearlBoostsUsed', target: 1, reward: 3 },
    { id: 'upgrade', label: '購買模組升級', unit: '次', statPath: 'stats.totalModuleUpgrades', target: 1, reward: 5 },
    { id: 'gate', label: '通過錨點閘門', unit: '次', statPath: 'stats.totalGatesPassed', target: 1, reward: 6 }
  ];

  function questTemplateById(id) { return QUEST_TEMPLATES.find((q) => q.id === id); }

  window.App.Data.QUEST_TEMPLATES = QUEST_TEMPLATES;
  window.App.Data.questTemplateById = questTemplateById;
})();
