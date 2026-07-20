/* ============================================================================
 * pactDefs.js — 永夜盟約（第三層轉生）的印記樹，4 分支 × 3 階＝12 節，花「夜輝」
 * 購買。effect 格式跟 sigilDefs/refitDefs/researchDefs 共用同一套通用格式，交給
 * economySystem 彙總，所以這裡大量直接重用既有的效果類型（跟深淵協約印記樹疊乘）
 * ，只新增 3 種盟約樹專屬的效果類型：keepTopSigilOnReset／autoClaimQuests／
 * autoSpeedMult。lore 是盟約節點詳細彈窗（nodeDetailModal.js）顯示的風味文字，
 * 純敘事用途，不影響任何數值。
 * ==========================================================================*/
(function () {
  const PACT_DEFS = [
    // 星塵回聲：全域產量與購買效率，跟光之脈疊乘。
    { id: 'sr1', branch: 'echo', tier: 1, cost: 2, name: '星塵回聲・共振', desc: '全螢光產量 +150%', effect: { type: 'allProdMult', value: 2.5 },
      lore: '締結永夜盟約後，星塵核心留下的能量餘波在潛燈號裡持續回聲震盪，比深淵協約時期的印記還要更加渾厚。' },
    { id: 'sr2', branch: 'echo', tier: 2, cost: 4, name: '星塵回聲・湧現', desc: '全螢光產量 x4', effect: { type: 'allProdMult', value: 4 },
      lore: '回聲不再只是餘波，而是主動湧現的能量源——彷彿星塵核心本身就活在潛燈號的核心迴路裡。' },
    { id: 'sr3', branch: 'echo', tier: 3, cost: 8, name: '星塵回聲・終焉', desc: '模組升級費用再 -50%（與光之脈疊乘）', effect: { type: 'upgradeCostMult', value: 0.5 },
      lore: '星塵回聲分支的終點，把光之脈當初留下的效率優勢再推向一個原本認為不可能達到的極限。' },

    // 永夜壓艙：下潛與轉生起點，跟深之錨疊乘。
    { id: 'sa1', branch: 'anchor2', tier: 1, cost: 2, name: '永夜壓艙・沉錨', desc: '下潛速度 +10 m/min', effect: { type: 'startDescentBonus', value: 10 },
      lore: '永夜盟約層級的壓艙裝置，沉得更深、也錨得更穩，下潛速度的增幅是深之錨分支的整整兩倍。' },
    { id: 'sa2', branch: 'anchor2', tier: 2, cost: 4, name: '永夜壓艙・破界', desc: '所有錨點閘門成本再 -25%（與深之錨疊乘）', effect: { type: 'gateCostMult', value: 0.75 },
      lore: '「破界」不只是破壓，而是讓潛燈號彷彿不再受海域之間界線的束縛，通行費一降再降。' },
    { id: 'sa3', branch: 'anchor2', tier: 3, cost: 8, name: '永夜壓艙・遠航', desc: '轉生後直接從 4000m（深淵帶已通過）開始', effect: { type: 'startDepth', value: 4000 },
      lore: '把重返的起點直接推進到深淵帶入口，象徵著永夜盟約層級的潛燈號，早已不是當年那艘只能貼著透光帶打轉的觀測站。' },

    // 虛空潮汐：離線與生物收益，跟潮之息疊乘。
    { id: 'sv1', branch: 'tide2', tier: 1, cost: 2, name: '虛空潮汐・深眠', desc: '離線收益絕對上限 96h → 168h', effect: { type: 'offlineCapHours', value: 168 },
      lore: '一整週的沉眠時間——虛空潮汐分支讓潛燈號即使長時間無人看管，也能撐過整整七天不失速。' },
    { id: 'sv2', branch: 'tide2', tier: 2, cost: 4, name: '虛空潮汐・共感', desc: '生物爆發獎勵再 x2（與潮之息疊乘）', effect: { type: 'clickRewardMult', value: 2 },
      lore: '共感的範圍從潮之息時期的近距離感應，擴大到幾乎整片深淵——每一次點擊收集都更加豐厚。' },
    { id: 'sv3', branch: 'tide2', tier: 3, cost: 8, name: '虛空潮汐・回響', desc: '生物再有額外 3% 機率掉落深海珍珠', effect: { type: 'creaturePearlChance', value: 0.03 },
      lore: '虛空潮汐分支的終點，讓深海珍珠的回響不再稀少，幾乎成了每一次生物目擊都值得期待的驚喜。' },

    // 星海羅盤：自動化與便利性，盟約樹獨有、不與其他樹重疊的效果類型。
    { id: 'sc1', branch: 'compass', tier: 1, cost: 2, name: '星海羅盤・傳承', desc: '締結永夜盟約時，各分支保留最高階已購印記（不影響深淵協約——協約本來就不會動印記樹）', effect: { type: 'keepTopSigilOnReset' },
      lore: '星海羅盤分支的起點，讓潛燈號記住「傳承」的意義——每次締結新的層級，過去點滿的心血都不必從零開始。' },
    { id: 'sc2', branch: 'compass', tier: 2, cost: 4, name: '星海羅盤・自律', desc: '每日任務完成時自動領取', effect: { type: 'autoClaimQuests' },
      lore: '潛燈號學會了自律——每日任務一旦達標，不需要玩家再回來手動點擊領取。' },
    { id: 'sc3', branch: 'compass', tier: 3, cost: 8, name: '星海羅盤・極速', desc: '自動採光／自動收集生物的效率 x2', effect: { type: 'autoSpeedMult', value: 2 },
      lore: '星海羅盤分支的終點，把所有已經解鎖的自動化系統再推快一倍，讓「自動」這件事本身也變得更值得依賴。' }
  ];

  function pactById(id) { return PACT_DEFS.find((p) => p.id === id); }
  function pactsForBranch(branch) { return PACT_DEFS.filter((p) => p.branch === branch).sort((a, b) => a.tier - b.tier); }

  window.App.Data.PACT_DEFS = PACT_DEFS;
  window.App.Data.pactById = pactById;
  window.App.Data.pactsForBranch = pactsForBranch;
})();
