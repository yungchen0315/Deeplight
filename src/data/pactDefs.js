/* ============================================================================
 * pactDefs.js — 永夜盟約（第三層轉生）的印記樹，4 分支 × 3 階＝12 節，花「夜輝」
 * 購買。effect 格式跟 sigilDefs/refitDefs/researchDefs 共用同一套通用格式，交給
 * economySystem 彙總，所以這裡大量直接重用既有的效果類型（跟深淵協約印記樹疊乘）
 * ，只新增 3 種盟約樹專屬的效果類型：keepTopSigilOnReset／autoClaimQuests／
 * autoSpeedMult。
 * ==========================================================================*/
(function () {
  const PACT_DEFS = [
    // 星塵回聲：全域產量與購買效率，跟光之脈疊乘。
    { id: 'sr1', branch: 'echo', tier: 1, cost: 2, name: '星塵回聲・共振', desc: '全螢光產量 +150%', effect: { type: 'allProdMult', value: 2.5 } },
    { id: 'sr2', branch: 'echo', tier: 2, cost: 4, name: '星塵回聲・湧現', desc: '全螢光產量 x4', effect: { type: 'allProdMult', value: 4 } },
    { id: 'sr3', branch: 'echo', tier: 3, cost: 8, name: '星塵回聲・終焉', desc: '模組升級費用再 -50%（與光之脈疊乘）', effect: { type: 'upgradeCostMult', value: 0.5 } },

    // 永夜壓艙：下潛與轉生起點，跟深之錨疊乘。
    { id: 'sa1', branch: 'anchor2', tier: 1, cost: 2, name: '永夜壓艙・沉錨', desc: '下潛速度 +10 m/min', effect: { type: 'startDescentBonus', value: 10 } },
    { id: 'sa2', branch: 'anchor2', tier: 2, cost: 4, name: '永夜壓艙・破界', desc: '所有錨點閘門成本再 -25%（與深之錨疊乘）', effect: { type: 'gateCostMult', value: 0.75 } },
    { id: 'sa3', branch: 'anchor2', tier: 3, cost: 8, name: '永夜壓艙・遠航', desc: '轉生後直接從 4000m（深淵帶已通過）開始', effect: { type: 'startDepth', value: 4000 } },

    // 虛空潮汐：離線與生物收益，跟潮之息疊乘。
    { id: 'sv1', branch: 'tide2', tier: 1, cost: 2, name: '虛空潮汐・深眠', desc: '離線收益絕對上限 96h → 168h', effect: { type: 'offlineCapHours', value: 168 } },
    { id: 'sv2', branch: 'tide2', tier: 2, cost: 4, name: '虛空潮汐・共感', desc: '生物爆發獎勵再 x2（與潮之息疊乘）', effect: { type: 'clickRewardMult', value: 2 } },
    { id: 'sv3', branch: 'tide2', tier: 3, cost: 8, name: '虛空潮汐・回響', desc: '生物再有額外 3% 機率掉落深海珍珠', effect: { type: 'creaturePearlChance', value: 0.03 } },

    // 星海羅盤：自動化與便利性，盟約樹獨有、不與其他樹重疊的效果類型。
    { id: 'sc1', branch: 'compass', tier: 1, cost: 2, name: '星海羅盤・傳承', desc: '締結協約或盟約時，各分支保留最高階已購印記', effect: { type: 'keepTopSigilOnReset' } },
    { id: 'sc2', branch: 'compass', tier: 2, cost: 4, name: '星海羅盤・自律', desc: '每日任務完成時自動領取', effect: { type: 'autoClaimQuests' } },
    { id: 'sc3', branch: 'compass', tier: 3, cost: 8, name: '星海羅盤・極速', desc: '自動採光／自動收集生物的效率 x2', effect: { type: 'autoSpeedMult', value: 2 } }
  ];

  function pactById(id) { return PACT_DEFS.find((p) => p.id === id); }
  function pactsForBranch(branch) { return PACT_DEFS.filter((p) => p.branch === branch).sort((a, b) => a.tier - b.tier); }

  window.App.Data.PACT_DEFS = PACT_DEFS;
  window.App.Data.pactById = pactById;
  window.App.Data.pactsForBranch = pactsForBranch;
})();
