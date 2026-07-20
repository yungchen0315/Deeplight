/* ============================================================================
 * goldenBuffDefs.js — 金燈魚被點擊後從這個池子隨機抽 2 種讓玩家二選一的強力短效
 * 增益（見 goldenCreatureSystem.js 如何抽選與套用）。
 * ==========================================================================*/
(function () {
  const B = window.App.Data.BALANCE;

  const GOLDEN_BUFF_DEFS = [
    { id: 'prod', label: '全產量 x' + B.GOLDEN_PROD_MULT + '（' + B.GOLDEN_PROD_SECONDS + ' 秒）', kind: 'prod', mult: B.GOLDEN_PROD_MULT, seconds: B.GOLDEN_PROD_SECONDS },
    { id: 'instant', label: '立即獲得 ' + B.GOLDEN_INSTANT_MINUTES + ' 分鐘產量', kind: 'instant', minutes: B.GOLDEN_INSTANT_MINUTES },
    { id: 'descent', label: '下潛速度 x' + B.GOLDEN_DESCENT_MULT + '（' + Math.round(B.GOLDEN_DESCENT_SECONDS / 60) + ' 分鐘）', kind: 'descent', mult: B.GOLDEN_DESCENT_MULT, seconds: B.GOLDEN_DESCENT_SECONDS },
    { id: 'pearl', label: '立即獲得 ' + B.GOLDEN_PEARL_AMOUNT + ' 顆深海珍珠', kind: 'pearl', amount: B.GOLDEN_PEARL_AMOUNT },
    { id: 'gate', label: '錨點閘門費用 x' + B.GOLDEN_GATE_MULT + '（' + B.GOLDEN_GATE_SECONDS + ' 秒）', kind: 'gate', mult: B.GOLDEN_GATE_MULT, seconds: B.GOLDEN_GATE_SECONDS }
  ];

  function goldenBuffById(id) { return GOLDEN_BUFF_DEFS.find((b) => b.id === id); }

  window.App.Data.GOLDEN_BUFF_DEFS = GOLDEN_BUFF_DEFS;
  window.App.Data.goldenBuffById = goldenBuffById;
})();
