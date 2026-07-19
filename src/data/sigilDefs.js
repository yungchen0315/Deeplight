/* ============================================================================
 * sigilDefs.js — 深淵協約（第二層轉生）印記樹：3 分支 × 4 階＋3 個進階自動化
 * 節點，花「深淵印記」購買，永久保留（協約重置只清空核心與重構，印記樹不變）。
 * effect 格式沿用 research/refitDefs 共用的通用格式，交給 economySystem 彙總。
 * ==========================================================================*/
(function () {
  const SIGIL_DEFS = [
    // 光之脈：全域產量與購買效率。
    { id: 'lp1', branch: 'light', tier: 1, cost: 1, name: '光之脈・微光', desc: '全螢光產量 +100%', effect: { type: 'allProdMult', value: 2 } },
    { id: 'lp2', branch: 'light', tier: 2, cost: 2, name: '光之脈・盛光', desc: '全螢光產量 x3', effect: { type: 'allProdMult', value: 3 } },
    { id: 'lp3', branch: 'light', tier: 3, cost: 4, name: '光之脈・共鳴', desc: '每次重生開局自動完成「螢光濃縮」研究', effect: { type: 'autoResearchOnStart', researchId: 'r1' } },
    { id: 'lp4', branch: 'light', tier: 4, cost: 8, name: '光之脈・湧現', desc: '模組升級費用 -50%', effect: { type: 'upgradeCostMult', value: 0.5 } },

    // 深之錨：下潛速度與轉生起點。
    { id: 'da1', branch: 'anchor', tier: 1, cost: 1, name: '深之錨・穩流', desc: '下潛速度 +5 m/min', effect: { type: 'startDescentBonus', value: 5 } },
    { id: 'da2', branch: 'anchor', tier: 2, cost: 2, name: '深之錨・破壓', desc: '所有錨點閘門成本 -25%', effect: { type: 'gateCostMult', value: 0.75 } },
    { id: 'da3', branch: 'anchor', tier: 3, cost: 4, name: '深之錨・領航', desc: '轉生後直接從 1000m（午夜帶已通過）開始', effect: { type: 'startDepth', value: 1000 } },
    { id: 'da4', branch: 'anchor', tier: 4, cost: 8, name: '深之錨・極限', desc: '壓載最高等級 +4', effect: { type: 'ballastMaxAdd', value: 4 } },

    // 潮之息：離線與生物收益。
    { id: 'ti1', branch: 'tide', tier: 1, cost: 1, name: '潮之息・沉眠', desc: '離線收益絕對上限 48h → 96h', effect: { type: 'offlineCapHours', value: 96 } },
    { id: 'ti2', branch: 'tide', tier: 2, cost: 2, name: '潮之息・共感', desc: '生物爆發獎勵 x2', effect: { type: 'clickRewardMult', value: 2 } },
    { id: 'ti3', branch: 'tide', tier: 3, cost: 4, name: '潮之息・潮汐', desc: '離線待領取生物上限 5 → 15', effect: { type: 'pendingCapAdd', value: 10 } },
    { id: 'ti4', branch: 'tide', tier: 4, cost: 8, name: '潮之息・回響', desc: '生物有 2% 機率額外掉落一顆深海珍珠', effect: { type: 'creaturePearlChance', value: 0.02 } },

    // 自動化：各分支點滿第 4 階後解鎖的進階節點。
    { id: 'auto_buy', branch: 'light', tier: 5, cost: 15, requires: 'lp4', name: '自動化・採買', desc: '每秒自動購買一次目前買得起的最便宜模組', effect: { type: 'autoBuyCheapest' } },
    { id: 'auto_gate', branch: 'anchor', tier: 5, cost: 15, requires: 'da4', name: '自動化・領航', desc: '抵達錨點且螢光足夠時自動通過閘門', effect: { type: 'autoGate' } },
    { id: 'auto_collect', branch: 'tide', tier: 5, cost: 15, requires: 'ti4', name: '自動化・巡遊', desc: '路過的生物 3 秒後自動收集', effect: { type: 'autoCollect' } }
  ];

  function sigilById(id) { return SIGIL_DEFS.find((s) => s.id === id); }
  function sigilsForBranch(branch) { return SIGIL_DEFS.filter((s) => s.branch === branch).sort((a, b) => a.tier - b.tier); }

  window.App.Data.SIGIL_DEFS = SIGIL_DEFS;
  window.App.Data.sigilById = sigilById;
  window.App.Data.sigilsForBranch = sigilsForBranch;
})();
