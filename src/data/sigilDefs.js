/* ============================================================================
 * sigilDefs.js — 深淵協約（第二層轉生）印記樹：3 分支 × 4 階＋3 個進階自動化
 * 節點，花「深淵印記」購買，永久保留（協約重置只清空核心與重構，印記樹不變）。
 * effect 格式沿用 research/refitDefs 共用的通用格式，交給 economySystem 彙總。
 * lore 是印記詳細彈窗（nodeDetailModal.js）顯示的風味文字，純敘事用途，不影響
 * 任何數值。
 * ==========================================================================*/
(function () {
  const SIGIL_DEFS = [
    // 光之脈：全域產量與購買效率。
    { id: 'lp1', branch: 'light', tier: 1, cost: 1, name: '光之脈・微光', desc: '全螢光產量 +100%', effect: { type: 'allProdMult', value: 2 },
      lore: '締結深淵協約後在潛燈號核心刻下的第一道印記，微弱卻穩定，是整條光之脈分支的起點。' },
    { id: 'lp2', branch: 'light', tier: 2, cost: 2, name: '光之脈・盛光', desc: '全螢光產量 x3', effect: { type: 'allProdMult', value: 3 },
      lore: '印記的光紋從核心表面蔓延開來，像是替整艘潛燈號重新鍍上一層會發光的外殼。' },
    { id: 'lp3', branch: 'light', tier: 3, cost: 4, name: '光之脈・共鳴', desc: '每次重生開局自動完成「螢光濃縮」研究', effect: { type: 'autoResearchOnStart', researchId: 'r1' },
      lore: '這道印記記住了「螢光濃縮」研究的每一個步驟，往後每次重新出航，潛燈號都會憑本能把它自動完成。' },
    { id: 'lp4', branch: 'light', tier: 4, cost: 8, name: '光之脈・湧現', desc: '模組升級費用 -50%', effect: { type: 'upgradeCostMult', value: 0.5 },
      lore: '光之脈分支的頂點印記，讓螢光本身湧現得比消耗還快，模組升級的門檻因此大幅降低。' },

    // 深之錨：下潛速度與轉生起點。
    { id: 'da1', branch: 'anchor', tier: 1, cost: 1, name: '深之錨・穩流', desc: '下潛速度 +5 m/min', effect: { type: 'startDescentBonus', value: 5 },
      lore: '深之錨分支的起點，把艙體周圍的暗流梳理得更平順，下潛時不再無謂地被水流拉扯。' },
    { id: 'da2', branch: 'anchor', tier: 2, cost: 2, name: '深之錨・破壓', desc: '所有錨點閘門成本 -25%', effect: { type: 'gateCostMult', value: 0.75 },
      lore: '印記賦予艙體一種近似「破壓」的特性，讓每一道錨點閘門的過路費都變得容易負擔。' },
    { id: 'da3', branch: 'anchor', tier: 3, cost: 4, name: '深之錨・領航', desc: '轉生後直接從 1000m（午夜帶已通過）開始', effect: { type: 'startDepth', value: 1000 },
      lore: '這道印記彷彿替潛燈號畫好了一條熟悉的下潛航線，往後每次出航都直接略過已經走過千百遍的路段。' },
    { id: 'da4', branch: 'anchor', tier: 4, cost: 8, name: '深之錨・極限', desc: '壓載最高等級 +4', effect: { type: 'ballastMaxAdd', value: 4 },
      lore: '深之錨分支的頂點印記，把壓載系統原本設計上的安全上限一口氣往外推了一大截。' },

    // 潮之息：離線與生物收益。
    { id: 'ti1', branch: 'tide', tier: 1, cost: 1, name: '潮之息・沉眠', desc: '離線收益絕對上限 48h → 96h', effect: { type: 'offlineCapHours', value: 96 },
      lore: '潮之息分支的起點，讓潛燈號在無人看管時也能維持更長時間的「沉眠式」低耗能運作。' },
    { id: 'ti2', branch: 'tide', tier: 2, cost: 2, name: '潮之息・共感', desc: '生物爆發獎勵 x2', effect: { type: 'clickRewardMult', value: 2 },
      lore: '印記讓艙體感應系統與路過生物的生物光產生某種共感，每次點擊收集到的能量因此加倍。' },
    { id: 'ti3', branch: 'tide', tier: 3, cost: 4, name: '潮之息・潮汐', desc: '離線待領取生物上限 5 → 15', effect: { type: 'pendingCapAdd', value: 10 },
      lore: '把離線期間錯過的生物訊號暫存起來的能力隨著印記一起強化，能等待玩家回來領取的名額變多了。' },
    { id: 'ti4', branch: 'tide', tier: 4, cost: 8, name: '潮之息・回響', desc: '生物有 2% 機率額外掉落一顆深海珍珠', effect: { type: 'creaturePearlChance', value: 0.02 },
      lore: '潮之息分支的頂點印記，讓每一次生物目擊的回響裡都藏著找到深海珍珠的可能。' },

    // 自動化：各分支點滿第 4 階後解鎖的進階節點。
    { id: 'auto_buy', branch: 'light', tier: 5, cost: 15, requires: 'lp4', name: '自動化・採買', desc: '每秒自動購買一次目前買得起的最便宜模組', effect: { type: 'autoBuyCheapest' },
      lore: '光之脈徹底點滿後解鎖的進階節點，潛燈號會自己盤算預算、自動把買得起的模組一一補齊。' },
    { id: 'auto_gate', branch: 'anchor', tier: 5, cost: 15, requires: 'da4', name: '自動化・領航', desc: '抵達錨點且螢光足夠時自動通過閘門', effect: { type: 'autoGate' },
      lore: '深之錨徹底點滿後解鎖的進階節點，只要螢光足夠，潛燈號抵達錨點就會自己通過閘門，不必手動確認。' },
    { id: 'auto_collect', branch: 'tide', tier: 5, cost: 15, requires: 'ti4', name: '自動化・巡遊', desc: '路過的生物 3 秒後自動收集', effect: { type: 'autoCollect' },
      lore: '潮之息徹底點滿後解鎖的進階節點，路過的生物不必手忙腳亂去點——潛燈號會自己巡遊過去收集。' }
  ];

  function sigilById(id) { return SIGIL_DEFS.find((s) => s.id === id); }
  function sigilsForBranch(branch) { return SIGIL_DEFS.filter((s) => s.branch === branch).sort((a, b) => a.tier - b.tier); }

  window.App.Data.SIGIL_DEFS = SIGIL_DEFS;
  window.App.Data.sigilById = sigilById;
  window.App.Data.sigilsForBranch = sigilsForBranch;
})();
