/* ============================================================================
 * researchDefs.js — 12 節研究（企劃書第 4d 節 + v1.1 深淵帶擴充），花樣本（SP）
 * 購買，轉生時重置。effect 是給 researchSystem/economySystem 讀的通用格式，跟
 * refitDefs.js 共用。
 * ==========================================================================*/
(function () {
  const RESEARCH_DEFS = [
    { id: 'r1', name: '螢光濃縮', cost: 3, desc: '全螢光產量 +25%', effect: { type: 'allProdMult', value: 1.25 } },
    { id: 'r2', name: '水母共生', cost: 5, desc: '燈籠水母產量 x2', effect: { type: 'moduleMult', module: 'jelly', value: 2 } },
    { id: 'r3', name: '聲納誘餌', cost: 8, desc: '路過生物出現間隔 -25%', effect: { type: 'spawnIntervalMult', value: 0.75 } },
    { id: 'r4', name: '樣本離心機', cost: 10, desc: '點擊生物獎勵 x2', effect: { type: 'clickRewardMult', value: 2 } },
    { id: 'r5', name: '壓載優化', cost: 14, desc: '下潛速度 x1.5', effect: { type: 'descentMult', value: 1.5 } },
    { id: 'r6', name: '休眠模式', cost: 18, desc: '離線全速時窗 8h → 12h', effect: { type: 'offlineFullHours', value: 12 } },
    { id: 'r7', name: '苔壁增生', cost: 24, desc: '光苔板與珊瑚架產量 x2', effect: { type: 'moduleMultMany', modules: ['moss', 'coral'], value: 2 } },
    { id: 'r8', name: '深壓透鏡', cost: 30, desc: '全螢光產量 +50%', effect: { type: 'allProdMult', value: 1.5 } },
    { id: 'r9', name: '深淵適壓', cost: 40, desc: '全螢光產量 +75%', effect: { type: 'allProdMult', value: 1.75 } },
    { id: 'r10', name: '鈦合金壓載', cost: 50, desc: '下潛速度 x1.5', effect: { type: 'descentMult', value: 1.5 } },
    { id: 'r11', name: '深淵誘光', cost: 65, desc: '生物爆發獎勵時長 30s → 60s', effect: { type: 'burstSeconds', value: 60 } },
    { id: 'r12', name: '螢光共振', cost: 80, desc: '全螢光產量 x2', effect: { type: 'allProdMult', value: 2 } },
    { id: 'r13', name: '無光適應', cost: 100, desc: '全螢光產量 +75%', effect: { type: 'allProdMult', value: 1.75 } },
    { id: 'r14', name: '虛淵導航', cost: 130, desc: '下潛速度 x1.5', effect: { type: 'descentMult', value: 1.5 } },
    { id: 'r15', name: '深壓共鳴腔', cost: 160, desc: '虛淵光柱與古鯨聖殿產量 x2', effect: { type: 'moduleMultMany', modules: ['pillar', 'whaletemple'], value: 2 } },
    { id: 'r16', name: '無光之心', cost: 200, desc: '全螢光產量 x2', effect: { type: 'allProdMult', value: 2 } },
    { id: 'r17', name: '虛無感應', cost: 250, desc: '全螢光產量 +100%', effect: { type: 'allProdMult', value: 2 } },
    { id: 'r18', name: '星塵壓載', cost: 300, desc: '下潛速度 x1.5', effect: { type: 'descentMult', value: 1.5 } },
    { id: 'r19', name: '虛無燈塔陣列', cost: 380, desc: '虛無燈塔與星塵核心產量 x2', effect: { type: 'moduleMultMany', modules: ['voidbeacon', 'starcore'], value: 2 } },
    { id: 'r20', name: '深海盡頭之光', cost: 500, desc: '全螢光產量 x2', effect: { type: 'allProdMult', value: 2 } }
  ];

  function researchById(id) { return RESEARCH_DEFS.find((r) => r.id === id); }

  window.App.Data.RESEARCH_DEFS = RESEARCH_DEFS;
  window.App.Data.researchById = researchById;
})();
