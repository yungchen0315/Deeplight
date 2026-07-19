/* ============================================================================
 * milestoneDefs.js — 40 個深度里程碑，構成一條跨越全部海域的「潛航紀錄」，跟
 * 成就（給珍珠、偏向里程碑式榮譽）與每日任務（給樣本、每天重置）刻意做出區隔：
 * 里程碑只給「立即螢光」，獎勵＝領取當下每秒產量 × rewardSeconds，且必須手動
 * 領取——愈晚領（產量愈高時）愈划算，鼓勵玩家點開這個畫面看看還有什麼沒領。
 * 以 maxDepthEver 判定達成，永久保留、不受一般轉生或深淵協約重置影響。
 * ==========================================================================*/
(function () {
  const MILESTONE_DEFS = [
    { id: 'm50', depth: 50, name: '透光帶入口', rewardSeconds: 20 },
    { id: 'm100', depth: 100, name: '陽光邊界', rewardSeconds: 30 },
    { id: 'm150', depth: 150, name: '藍色深處', rewardSeconds: 45 },
    { id: 'm200', depth: 200, name: '透光帶盡頭', rewardSeconds: 60 },
    { id: 'm300', depth: 300, name: '暮色初現', rewardSeconds: 90 },
    { id: 'm400', depth: 400, name: '微光遞減', rewardSeconds: 120 },
    { id: 'm500', depth: 500, name: '半程暮光', rewardSeconds: 150 },
    { id: 'm650', depth: 650, name: '壓力漸增', rewardSeconds: 180 },
    { id: 'm800', depth: 800, name: '幽暗漸濃', rewardSeconds: 210 },
    { id: 'm1000', depth: 1000, name: '永夜降臨', rewardSeconds: 240 },
    { id: 'm1300', depth: 1300, name: '午夜帶深處', rewardSeconds: 270 },
    { id: 'm1600', depth: 1600, name: '寂靜水層', rewardSeconds: 300 },
    { id: 'm2000', depth: 2000, name: '重返海面門檻', rewardSeconds: 330 },
    { id: 'm2500', depth: 2500, name: '無盡黑暗', rewardSeconds: 360 },
    { id: 'm3000', depth: 3000, name: '深壓漸強', rewardSeconds: 400 },
    { id: 'm3500', depth: 3500, name: '午夜帶邊界', rewardSeconds: 450 },
    { id: 'm4000', depth: 4000, name: '深淵之門', rewardSeconds: 500 },
    { id: 'm5000', depth: 5000, name: '深淵初探', rewardSeconds: 600 },
    { id: 'm6000', depth: 6000, name: '深淵漸深', rewardSeconds: 700 },
    { id: 'm7000', depth: 7000, name: '深淵中層', rewardSeconds: 800 },
    { id: 'm8000', depth: 8000, name: '深淵深處', rewardSeconds: 900 },
    { id: 'm9000', depth: 9000, name: '深淵邊界', rewardSeconds: 1000 },
    { id: 'm10000', depth: 10000, name: '萬米關口', rewardSeconds: 1200 },
    { id: 'm11000', depth: 11000, name: '挑戰者深淵', rewardSeconds: 1500 },
    { id: 'm13000', depth: 13000, name: '海溝幽域深處', rewardSeconds: 1800 },
    { id: 'm15000', depth: 15000, name: '無光中層', rewardSeconds: 2100 },
    { id: 'm17000', depth: 17000, name: '無光深處', rewardSeconds: 2400 },
    { id: 'm18500', depth: 18500, name: '無光邊界', rewardSeconds: 2700 },
    { id: 'm20000', depth: 20000, name: '無光帶入口', rewardSeconds: 3600 },
    { id: 'm23000', depth: 23000, name: '虛無深處', rewardSeconds: 4200 },
    { id: 'm26000', depth: 26000, name: '星塵回聲', rewardSeconds: 4800 },
    { id: 'm29000', depth: 29000, name: '無光中心', rewardSeconds: 5400 },
    { id: 'm32000', depth: 32000, name: '深海邊界', rewardSeconds: 6000 },
    { id: 'm35000', depth: 35000, name: '深海平原入口', rewardSeconds: 7200 },
    { id: 'm42000', depth: 42000, name: '平原中央', rewardSeconds: 8400 },
    { id: 'm50000', depth: 50000, name: '平原邊緣', rewardSeconds: 9600 },
    { id: 'm60000', depth: 60000, name: '熱泉海淵入口', rewardSeconds: 12000 },
    { id: 'm70000', depth: 70000, name: '熱泉核心', rewardSeconds: 15000 },
    { id: 'm80000', depth: 80000, name: '熱泉海淵盡頭．目前版本最深處', rewardSeconds: 18000 }
  ];

  function milestoneById(id) { return MILESTONE_DEFS.find((m) => m.id === id); }

  window.App.Data.MILESTONE_DEFS = MILESTONE_DEFS;
  window.App.Data.milestoneById = milestoneById;
})();
