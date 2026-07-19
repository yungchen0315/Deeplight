/* ============================================================================
 * covenantSystem.js — 「深淵協約」：第二層轉生。門檻比一般轉生（重返海面）更高，
 * 換來的貨幣是「深淵印記」，用來點滿 sigilDefs.js 的印記樹。協約會連同一般轉生
 * 的重置一起做（畢竟不可能保留本輪進度卻又重置核心），並額外清空核心與重構。
 * ==========================================================================*/
(function () {
  const D = window.App.Data;
  const B = D.BALANCE;
  const Econ = window.App.Systems.Economy;

  function eligible(save) {
    return save.prestigeCount >= B.COVENANT_MIN_PRESTIGE_COUNT && save.maxDepthEver >= B.COVENANT_MIN_DEPTH;
  }

  /** floor(sqrt(累積壓力核心 / divisor))：企劃書 Phase 2 公式，用「賺過的核心總量」而非
   *  「目前持有量」計算，避免玩家為了刷印記刻意不買重構、囤積核心再協約。 */
  function previewSigilPoints(save) {
    if (!save.stats || !save.stats.totalCoresEarned) return 0;
    return Math.floor(Math.pow(save.stats.totalCoresEarned / B.COVENANT_SIGIL_DIVISOR, B.COVENANT_SIGIL_EXPONENT));
  }

  function enact(save) {
    if (!eligible(save)) return { ok: false, reason: '尚未達成深淵協約門檻' };
    const gained = previewSigilPoints(save);

    save.sigilPoints = (save.sigilPoints || 0) + gained;
    save.covenantCount += 1;

    // 本輪＋轉生層進度全部歸零（同一般轉生），額外再清空核心與重構。
    save.glow = 0;
    save.samples = 0;
    save.depth = 0;
    save.maxDepthThisRun = 0;
    save.currentZone = 0;
    save.modules = {};
    save.ballastLevel = 0;
    save.research = [];
    save.cores = 0;
    save.refits = [];

    // 重構已清空，只剩印記樹的效果可以套用「開局附贈」類效果。
    const eff = Econ.computeEffects(save);
    Object.keys(eff.startModules).forEach((moduleId) => {
      save.modules[moduleId] = { count: eff.startModules[moduleId], upgradeTier: 0 };
    });
    if (eff.startDepth > 0) {
      save.depth = eff.startDepth;
      save.maxDepthThisRun = eff.startDepth;
      const zone = D.zoneForDepth(eff.startDepth);
      save.currentZone = zone ? zone.id : 0;
    }
    eff.autoResearchIds.forEach((id) => {
      if (id && !save.research.includes(id)) save.research.push(id);
    });

    return { ok: true, gained };
  }

  function buySigil(save, sigilId) {
    const def = D.sigilById(sigilId);
    if (!def) return { ok: false, reason: '找不到此印記' };
    if (save.sigils.includes(sigilId)) return { ok: false, reason: '已購買此印記' };
    if (def.requires && !save.sigils.includes(def.requires)) return { ok: false, reason: '尚未解鎖此印記' };
    if (save.sigilPoints < def.cost) return { ok: false, reason: '深淵印記不足' };
    save.sigilPoints -= def.cost;
    save.sigils.push(sigilId);
    return { ok: true };
  }

  window.App.Systems.Covenant = { eligible, previewSigilPoints, enact, buySigil };
})();
