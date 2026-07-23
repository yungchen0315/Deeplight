/* ============================================================================
 * beginnerQuestDefs.js — 新手任務：8 個一次性任務範本，跟每天重抽 3 個的每日
 * 任務池是完全獨立的系統。用終身統計數字（從存檔建立那一刻就是 0）直接跟
 * target 比較，不像每日任務需要扣掉抽到當下的基準值——新手任務只需要判斷
 * 「這件事這輩子做過幾次」，沒有「今天」這個概念，也永遠不會重置或換一批。
 * 全部領完後，「新手任務」區塊會從潛航畫面的任務彈窗整個消失，不留給老玩家
 * 造成畫面雜訊。獎勵一律是樣本／深海珍珠（永久貨幣），不給「一次性螢光」，
 * 呼應「成就/新手獎勵要留下永久痕跡，而不是曇花一現的螢光」的設計方向。
 * ==========================================================================*/
(function () {
  const BEGINNER_QUEST_DEFS = [
    { id: 'bq_tap', label: '點擊水域', unit: '次', statPath: 'stats.totalTaps', target: 1, rewardSamples: 3, rewardPearls: 0 },
    { id: 'bq_module', label: '購買發光模組', unit: '個', statPath: 'stats.totalModulesBought', target: 1, rewardSamples: 4, rewardPearls: 0 },
    { id: 'bq_creature', label: '收集路過生物', unit: '隻', statPath: 'stats.totalCreaturesCollected', target: 1, rewardSamples: 5, rewardPearls: 0 },
    { id: 'bq_research', label: '完成研究', unit: '節', statPath: 'stats.totalResearchBought', target: 1, rewardSamples: 6, rewardPearls: 0 },
    { id: 'bq_gate', label: '通過錨點閘門', unit: '次', statPath: 'stats.totalGatesPassed', target: 1, rewardSamples: 8, rewardPearls: 1 },
    { id: 'bq_taps50', label: '點擊水域累計', unit: '次', statPath: 'stats.totalTaps', target: 50, rewardSamples: 10, rewardPearls: 0 },
    { id: 'bq_daily', label: '完成每日簽到', unit: '次', statPath: 'stats.totalDailyClaims', target: 1, rewardSamples: 8, rewardPearls: 1 },
    { id: 'bq_prestige', label: '完成重返海面', unit: '次', statPath: 'stats.totalCoresEarned', target: 1, rewardSamples: 15, rewardPearls: 2 }
  ];

  function beginnerQuestById(id) { return BEGINNER_QUEST_DEFS.find((q) => q.id === id); }

  window.App.Data.BEGINNER_QUEST_DEFS = BEGINNER_QUEST_DEFS;
  window.App.Data.beginnerQuestById = beginnerQuestById;
})();
