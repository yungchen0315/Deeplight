/* ============================================================================
 * refitDefs.js — 10 項重構升級（企劃書第 6 節 + v1.1 深淵帶擴充），花壓力核心
 * （PC）購買，永久保留。lore 是重構詳細彈窗（nodeDetailModal.js）顯示的風味
 * 文字，純敘事用途，不影響任何數值。
 * ==========================================================================*/
(function () {
  const REFIT_DEFS = [
    { id: 'f1', name: '快速壓載', cost: 3, desc: '初始下潛速度 2 → 4 m/min', effect: { type: 'startDescentBonus', value: 2 },
      lore: '把上一輪報廢的壓載塊重新鑄造成更輕巧的版本，讓每一次重新出發都比上次起步更快。' },
    { id: 'f2', name: '種苗庫', cost: 4, desc: '開局附贈 10 隻燈籠水母', effect: { type: 'startModule', module: 'jelly', value: 10 },
      lore: '在重返海面前，先留一小批燈籠水母的種苗——下次出航時就不必從零開始馴養。' },
    { id: 'f3', name: '深眠迴路', cost: 5, desc: '離線收益 x1.25、半速時窗 16h → 40h', effect: { type: 'offlineBoost', mult: 1.25, halfHours: 40 },
      lore: '重新設計待機時的能量迴路，讓潛燈號在無人看管的時候也能撐得更久、賺得更多。' },
    { id: 'f4', name: '誘光塗層', cost: 6, desc: '點擊生物獎勵 x2', effect: { type: 'clickRewardMult', value: 2 },
      lore: '在艙體外殼塗上一層特製反光塗料，讓每次手動點擊生物時捕捉到的光都更完整。' },
    { id: 'f5', name: '深淵圖譜', cost: 8, desc: '稀有生物出現率 x2', effect: { type: 'rareChanceMult', value: 2 },
      lore: '把上一輪繪製的深淵生態圖譜留下來，這輪出航就更清楚稀有生物容易出沒的路線。' },
    { id: 'f6', name: '壓力渦輪', cost: 10, desc: '全螢光產量 +50%', effect: { type: 'allProdMult', value: 1.5 },
      lore: '在艙體外側加裝一具利用水壓差發電的小型渦輪，把下潛過程本身也變成一種能量來源。' },
    { id: 'f7', name: '起錨協議', cost: 12, desc: '轉生後直接從 200m（透光帶已通過）開始', effect: { type: 'startDepth', value: 200 },
      lore: '簽署一份「起錨協議」——下次重返海面時，透光帶的閘門直接視為已通過，不必重新繳一次過路費。' },
    { id: 'f8', name: '深淵種燈', cost: 15, desc: '開局附贈 5 座迴聲浮標', effect: { type: 'startModule', module: 'buoy', value: 5 },
      lore: '預先組裝好一批迴聲浮標存放在艙體外掛架上，下潛第一天就能立刻部署使用。' },
    { id: 'f9', name: '自動採光', cost: 20, desc: '每秒自動點擊水域 1 次', effect: { type: 'autoTapPerSec', value: 1 },
      lore: '為採光機構加裝一套簡單的自動控制器，就算沒有人盯著畫面，潛燈號也會自己伸手去採集。' },
    { id: 'f10', name: '核心共鳴', cost: 30, desc: '每顆壓力核心加成 10% → 13%', effect: { type: 'corePctOverride', value: 13 },
      lore: '重新校準壓力核心的能量釋放頻率，讓每一顆核心單獨提供的加成都比原本設計的再高一截。' }
  ];

  function refitById(id) { return REFIT_DEFS.find((f) => f.id === id); }

  window.App.Data.REFIT_DEFS = REFIT_DEFS;
  window.App.Data.refitById = refitById;
})();
