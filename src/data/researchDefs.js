/* ============================================================================
 * researchDefs.js — 32 節研究（企劃書第 4d 節 + v1.1/Phase2/Phase3 擴充），花樣本（SP）
 * 購買，轉生時重置。effect 是給 researchSystem/economySystem 讀的通用格式，跟
 * refitDefs.js 共用。lore 是研究詳細彈窗（nodeDetailModal.js）顯示的風味文字，
 * 純敘事用途，不影響任何數值。
 * ==========================================================================*/
(function () {
  const RESEARCH_DEFS = [
    { id: 'r1', name: '螢光濃縮', cost: 3, desc: '全螢光產量 +25%', effect: { type: 'allProdMult', value: 1.25 },
      lore: '把採集到的螢光先過濾、再濃縮儲存，減少運送與轉換過程中的耗損。最基礎的一項研究，卻是後面所有效率提升的起點。' },
    { id: 'r2', name: '水母共生', cost: 5, desc: '燈籠水母產量 x2', effect: { type: 'moduleMult', module: 'jelly', value: 2 },
      lore: '調整柵欄裡的電解質濃度，讓燈籠水母的發光頻率更穩定，單體產光量因此翻倍。' },
    { id: 'r3', name: '聲納誘餌', cost: 8, desc: '路過生物出現間隔 -25%', effect: { type: 'spawnIntervalMult', value: 0.75 },
      lore: '在艙外加裝一圈低頻聲納脈衝，模擬其他生物覓食時的震動，吸引路過的深海生物更頻繁靠近。' },
    { id: 'r4', name: '樣本離心機', cost: 10, desc: '點擊生物獎勵 x2', effect: { type: 'clickRewardMult', value: 2 },
      lore: '一台小型離心機，能把手動採集到的生物光快速分離、純化，讓每一次點擊的收穫都更划算。' },
    { id: 'r5', name: '壓載優化', cost: 14, desc: '下潛速度 x1.5', effect: { type: 'descentMult', value: 1.5 },
      lore: '重新配置壓載艙的配重分布，讓潛燈號下潛時的姿態更穩，阻力也隨之降低。' },
    { id: 'r6', name: '休眠模式', cost: 18, desc: '離線全速時窗 8h → 12h', effect: { type: 'offlineFullHours', value: 12 },
      lore: '設計一套低耗能待機模式，艙內系統不需要人在場也能維持全速運轉更久。' },
    { id: 'r7', name: '苔壁增生', cost: 24, desc: '光苔板與珊瑚架產量 x2', effect: { type: 'moduleMultMany', modules: ['moss', 'coral'], value: 2 },
      lore: '找到一種促進共生藻類與珊瑚骨架同時生長的礦物質配方，兩種模組的產量因此一起翻倍。' },
    { id: 'r8', name: '深壓透鏡', cost: 30, desc: '全螢光產量 +50%', effect: { type: 'allProdMult', value: 1.5 },
      lore: '一組能在高壓環境下不變形的特製透鏡，把原本會散射流失的微弱生物光重新聚焦收集起來。' },
    { id: 'r9', name: '深淵適壓', cost: 40, desc: '全螢光產量 +75%', effect: { type: 'allProdMult', value: 1.75 },
      lore: '艙體結構針對深淵帶的壓力重新校正，減少了能量在抗壓外殼上的無謂損耗。' },
    { id: 'r10', name: '鈦合金壓載', cost: 50, desc: '下潛速度 x1.5', effect: { type: 'descentMult', value: 1.5 },
      lore: '換裝一批鈦合金壓載塊，重量更輕、強度卻更高，下潛速度因此再進一步提升。' },
    { id: 'r11', name: '深淵誘光', cost: 65, desc: '生物爆發獎勵時長 30s → 60s', effect: { type: 'burstSeconds', value: 60 },
      lore: '延長誘光陣列的殘光效果，點擊生物換來的爆發獎勵能持續更久才衰退。' },
    { id: 'r12', name: '螢光共振', cost: 80, desc: '全螢光產量 x2', effect: { type: 'allProdMult', value: 2 },
      lore: '讓艙內各個發光模組的頻率彼此同步共振，整體輸出效率因此翻倍，是研究樹上第一個真正的「質變」節點。' },
    { id: 'r13', name: '無光適應', cost: 100, desc: '全螢光產量 +75%', effect: { type: 'allProdMult', value: 1.75 },
      lore: '在完全無光的深度待久了，艙內系統學會了怎麼在幾乎沒有背景光源的情況下，把每一絲能量都榨取出來。' },
    { id: 'r14', name: '虛淵導航', cost: 130, desc: '下潛速度 x1.5', effect: { type: 'descentMult', value: 1.5 },
      lore: '結合聲納回波與磁力計數據建立的導航模型，讓潛燈號在能見度趨近於零的虛淵裡也能果斷下潛。' },
    { id: 'r15', name: '深壓共鳴腔', cost: 160, desc: '虛淵光柱與古鯨聖殿產量 x2', effect: { type: 'moduleMultMany', modules: ['pillar', 'whaletemple'], value: 2 },
      lore: '在虛淵光柱與古鯨聖殿之間架設共鳴腔，讓兩種截然不同來源的能量互相增幅。' },
    { id: 'r16', name: '無光之心', cost: 200, desc: '全螢光產量 x2', effect: { type: 'allProdMult', value: 2 },
      lore: '把無光帶收集到的所有數據彙整成一套全新的能量轉換核心演算法，全艙產量因此再翻一倍。' },
    { id: 'r17', name: '虛無感應', cost: 250, desc: '全螢光產量 +100%', effect: { type: 'allProdMult', value: 2 },
      lore: '一套專門偵測「幾乎不存在的微光」的感應陣列，讓潛燈號能捕捉到過去被判定為雜訊而捨棄的能量。' },
    { id: 'r18', name: '星塵壓載', cost: 300, desc: '下潛速度 x1.5', effect: { type: 'descentMult', value: 1.5 },
      lore: '參考星塵核心礦石的密度特性重新鑄造壓載塊，下潛時的慣性因此更容易維持。' },
    { id: 'r19', name: '虛無燈塔陣列', cost: 380, desc: '虛無燈塔與星塵核心產量 x2', effect: { type: 'moduleMultMany', modules: ['voidbeacon', 'starcore'], value: 2 },
      lore: '把虛無燈塔的來源不明能量與星塵核心的隕石結晶並聯，兩者的輸出效率意外地互相放大。' },
    { id: 'r20', name: '深海盡頭之光', cost: 500, desc: '全螢光產量 x2', effect: { type: 'allProdMult', value: 2 },
      lore: '整合無光帶累積下來的所有研究成果，重新設計一套艙體能量迴路，象徵這一段旅程階段性的終點。' },
    { id: 'r21', name: '平原共鳴', cost: 650, desc: '全螢光產量 x2', effect: { type: 'allProdMult', value: 2 },
      lore: '深海平原地形毫無遮蔽，聲波與光波都能傳得更遠——把這個特性納入能量收集模型後，整體產量再度翻倍。' },
    { id: 'r22', name: '震波導航', cost: 800, desc: '下潛速度 x1.5', effect: { type: 'descentMult', value: 1.5 },
      lore: '利用深海平原偶發的地質震動當作定位訊號，讓下潛路徑的修正更即時、更省力。' },
    { id: 'r23', name: '平原光帶陣列', cost: 950, desc: '平原光帶與震波核心產量 x2', effect: { type: 'moduleMultMany', modules: ['plainlight', 'seismocore'], value: 2 },
      lore: '把長條發光帶與震波發電裝置串成一套陣列，光能與震動能互相補償彼此的低谷。' },
    { id: 'r24', name: '深海平原之心', cost: 1200, desc: '全螢光產量 x2', effect: { type: 'allProdMult', value: 2 },
      lore: '深海平原階段的集大成研究，把這片一望無際的海床所能提供的一切都壓榨到極限。' },
    { id: 'r25', name: '熱泉適應', cost: 1500, desc: '全螢光產量 +100%', effect: { type: 'allProdMult', value: 2 },
      lore: '重新設計散熱系統，讓艙體能在熱泉海淵的高溫環境裡維持效率，而不是被迫降頻保護自己。' },
    { id: 'r26', name: '岩漿導航', cost: 1800, desc: '下潛速度 x1.5', effect: { type: 'descentMult', value: 1.5 },
      lore: '偵測地殼裂縫下方的岩漿流動熱訊號，反過來當成下潛時判斷地形安全與否的參考。' },
    { id: 'r27', name: '熱泉鍛爐強化', cost: 2200, desc: '熱泉鍛爐與岩漿之心產量 x2', effect: { type: 'moduleMultMany', modules: ['ventforge', 'magmaheart'], value: 2 },
      lore: '替熱泉鍛爐與岩漿之心加裝一層耐熱合金外殼，讓它們敢於吸收比原設計上限更多的熱能。' },
    { id: 'r28', name: '熱泉之心', cost: 2800, desc: '全螢光產量 x2', effect: { type: 'allProdMult', value: 2 },
      lore: '熱泉海淵階段的最終研究，把整片灼熱深淵能提供的能量全部收束進潛燈號的核心迴路。' },
    { id: 'r29', name: '裂谷共振', cost: 3500, desc: '全螢光產量 +100%', effect: { type: 'allProdMult', value: 2 },
      lore: '裂谷本身就是地殼的一道傷口，隨時都在微微震動——把這股震動轉換成穩定的能量共振，是進入裂谷深淵後的第一課。' },
    { id: 'r30', name: '裂谷壓載', cost: 4200, desc: '下潛速度 x1.5', effect: { type: 'descentMult', value: 1.5 },
      lore: '針對裂谷兩側不對稱的水壓重新設計壓載配重，避免潛燈號在狹窄裂縫裡被暗流帶偏。' },
    { id: 'r31', name: '裂谷晶簇陣列', cost: 5000, desc: '裂谷晶簇與虛空熔爐產量 x2', effect: { type: 'moduleMultMany', modules: ['riftcrystal', 'voidforge'], value: 2 },
      lore: '把裂谷晶簇的天然共振頻率與虛空熔爐的鍛造熱能連成一套陣列，兩者的產出效率一起被推上新的高度。' },
    { id: 'r32', name: '裂谷之心', cost: 6500, desc: '全螢光產量 x2', effect: { type: 'allProdMult', value: 2 },
      lore: '目前研究樹的終點，把裂谷深淵所有能被理解、被利用的能量來源全部整合進潛燈號最新一版的核心演算法。' }
  ];

  function researchById(id) { return RESEARCH_DEFS.find((r) => r.id === id); }

  window.App.Data.RESEARCH_DEFS = RESEARCH_DEFS;
  window.App.Data.researchById = researchById;
})();
