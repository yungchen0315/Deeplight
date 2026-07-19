/* ============================================================================
 * SaveGame.js — 整份存檔的形狀與「建立空殼」工廠函式。純資料，不含遊戲規則。
 * 衍生數值（螢光/秒、各種倍率）一律不存檔，載入時由 systems 重新計算。
 * @typedef {Object} SaveGame
 * @property {number} version
 * @property {number} createdAt
 * @property {number} lastActiveAt 絕對時戳，供離線進度結算使用。
 * @property {number} glow 螢光（軟性主貨幣，轉生重置）。
 * @property {number} samples 樣本（研究樹貨幣，轉生重置）。
 * @property {number} pearls 深海珍珠（成就掉落，永久保留，可兌換珍珠加護）。
 * @property {number} cores 壓力核心（轉生貨幣，深淵協約重置）。
 * @property {number} depth 目前深度（公尺），轉生重置。
 * @property {number} maxDepthThisRun 本輪最大深度，決定轉生結算，轉生重置。
 * @property {number} maxDepthEver 史上最大深度，永久保留（成就用）。
 * @property {number} currentZone 目前海域索引（ZONE_DEFS 的 id），轉生重置。
 * @property {Object<string,{count:number, upgradeTier:number}>} modules 以 ModuleDef.id 為 key，轉生重置。
 * @property {number} ballastLevel 壓載等級，轉生重置。
 * @property {string[]} research 已完成研究 id（RESEARCH_DEFS），轉生重置。
 * @property {string[]} refits 已購重構 id（REFIT_DEFS），深淵協約重置（一般轉生不重置）。
 * @property {string[]} sigils 已購深淵印記 id（SIGIL_DEFS），永久保留、協約不重置。
 * @property {number} sigilPoints 深淵印記（第二層轉生貨幣，用來買 sigils 樹），永久保留。
 * @property {number} covenantCount 已完成深淵協約（第二層轉生）次數，永久保留。
 * @property {Object<string,{seen:number, firstAt:number}>} bestiary 以 CreatureDef.id 為 key，永久保留。
 * @property {number} pendingCreatures 離線期間累積、尚未點擊領取的「錯過的生物」數量。
 * @property {string[]} achievements 已解鎖成就 id，永久保留。
 * @property {number} prestigeCount 已轉生次數，永久保留。
 * @property {number} tapLureProgress 累積點擊次數（誘光進度條），轉生不重置。
 * @property {number} boostUntil 珍珠加護到期時戳（ms），永久保留欄位、隨時間自然過期。
 * @property {?{kind:string, mult:number, until:number}} tempBuff 金燈魚限時增益，自然過期。
 * @property {number} nextGoldenAt 下一次允許刷新金燈魚的時戳（ms），永久保留、隨時間推進。
 * @property {{streak:number, lastClaimDate:string}} daily 每日簽到連續天數與最後領取日期（本地 YYYY-MM-DD）。
 * @property {{dayKey:string, items:Array, allBonusClaimed:boolean}} quests 每日任務狀態。
 * @property {{done:boolean, seenHints:string[]}} tutorial 新手引導完成狀態與已顯示過的提示 id。
 * @property {Object} stats 永久保留的統計數字（見下方預設值列出的完整欄位）。
 * @property {{sound:boolean, ambient:boolean, reducedMotion:boolean, numberFormat:string}} settings
 * ==========================================================================*/
(function () {
  function createDefaultSave(now) {
    return {
      version: 3,
      createdAt: now,
      lastActiveAt: now,
      glow: 0,
      samples: 0,
      pearls: 0,
      cores: 0,
      depth: 0,
      maxDepthThisRun: 0,
      maxDepthEver: 0,
      currentZone: 0,
      modules: {},
      ballastLevel: 0,
      research: [],
      refits: [],
      sigils: [],
      sigilPoints: 0,
      covenantCount: 0,
      bestiary: {},
      pendingCreatures: 0,
      achievements: [],
      prestigeCount: 0,
      tapLureProgress: 0,
      boostUntil: 0,
      tempBuff: null,
      nextGoldenAt: now + 600000,
      daily: { streak: 0, lastClaimDate: '' },
      quests: { dayKey: '', items: [], allBonusClaimed: false },
      tutorial: { done: false, seenHints: [] },
      stats: {
        totalGlowEarned: 0,
        totalTaps: 0,
        totalCoresEarned: 0,
        playSeconds: 0,
        totalModulesBought: 0,
        totalCreaturesCollected: 0,
        totalResearchBought: 0,
        totalMissedClaimed: 0,
        totalPearlBoostsUsed: 0,
        totalModuleUpgrades: 0,
        totalGatesPassed: 0,
        totalGoldenCaught: 0
      },
      settings: { sound: true, ambient: true, reducedMotion: false, numberFormat: 'zh' }
    };
  }

  window.App.Models.createDefaultSave = createDefaultSave;
})();
