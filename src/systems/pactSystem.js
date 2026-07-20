/* ============================================================================
 * pactSystem.js — 「永夜盟約」：第三層轉生。門檻比深淵協約更高，換的貨幣是
 * 「夜輝」，用來點滿 pactDefs.js 的盟約樹。盟約會連同深淵協約與一般轉生的重置
 * 一起做，並額外清空印記與印記點數（除非點了「星海羅盤・傳承」保留最高階印記）。
 * ==========================================================================*/
(function () {
  const D = window.App.Data;
  const B = D.BALANCE;
  const Econ = window.App.Systems.Economy;

  function eligible(save) {
    return save.covenantCount >= B.PACT_MIN_COVENANT_COUNT && save.maxDepthEver >= B.PACT_MIN_DEPTH;
  }

  /** floor(sqrt(累積賺過的深淵印記 / divisor))，用「賺過的總量」而非目前持有量，
   *  避免玩家為了刷夜輝刻意不點印記樹、囤積印記點數再締結盟約。抽成純函式供試算
   *  面板對任意假設總量計算。 */
  function nightshardsForSigilPoints(totalSigilPoints) {
    if (!totalSigilPoints) return 0;
    return Math.floor(Math.pow(totalSigilPoints / B.PACT_NIGHTSHARD_DIVISOR, B.PACT_NIGHTSHARD_EXPONENT));
  }

  function previewNightshards(save) { return nightshardsForSigilPoints(save.stats && save.stats.totalSigilPointsEarned); }

  /** 依「星海羅盤・傳承」是否已點，決定每個印記樹分支保留最高階已購項目或全部清空。 */
  function resetSigils(save, eff) {
    if (!eff.keepTopSigilOnReset) { save.sigils = []; return; }
    const kept = [];
    ['light', 'anchor', 'tide'].forEach((branch) => {
      const owned = D.sigilsForBranch(branch).filter((def) => save.sigils.includes(def.id));
      if (owned.length === 0) return;
      const top = owned[owned.length - 1]; // sigilsForBranch 已依 tier 排序
      kept.push(top.id);
    });
    save.sigils = kept;
  }

  function enact(save) {
    if (!eligible(save)) return { ok: false, reason: '尚未達成永夜盟約門檻' };
    const eff = Econ.computeEffects(save);
    const gained = previewNightshards(save);

    save.nightshards = (save.nightshards || 0) + gained;
    save.pactCount += 1;

    // 本輪＋轉生層＋協約層進度全部歸零。
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
    save.sigilPoints = 0;
    resetSigils(save, eff);

    // 重新套用開局附贈類效果（此時只剩盟約樹＋（若有保留）印記樹的效果生效）。
    const effAfter = Econ.computeEffects(save);
    Object.keys(effAfter.startModules).forEach((moduleId) => {
      save.modules[moduleId] = { count: effAfter.startModules[moduleId], upgradeTier: 0 };
    });
    if (effAfter.startDepth > 0) {
      save.depth = effAfter.startDepth;
      save.maxDepthThisRun = effAfter.startDepth;
      const zone = D.zoneForDepth(effAfter.startDepth);
      save.currentZone = zone ? zone.id : 0;
    }
    effAfter.autoResearchIds.forEach((id) => {
      if (id && !save.research.includes(id)) save.research.push(id);
    });
    window.App.Systems.Quest.rebaseNonMonotonic(save);

    window.App.Systems.EventLog.log(save, '締結永夜盟約，獲得 ' + gained + ' 顆夜輝（第 ' + save.pactCount + ' 次盟約）');
    return { ok: true, gained };
  }

  function buyNode(save, nodeId) {
    const def = D.pactById(nodeId);
    if (!def) return { ok: false, reason: '找不到此盟約節點' };
    if (save.nightPactNodes.includes(nodeId)) return { ok: false, reason: '已購買此節點' };
    const branchNodes = D.pactsForBranch(def.branch);
    const idx = branchNodes.findIndex((n) => n.id === nodeId);
    if (idx > 0 && !save.nightPactNodes.includes(branchNodes[idx - 1].id)) return { ok: false, reason: '需先購買上一階' };
    if (save.nightshards < def.cost) return { ok: false, reason: '夜輝不足' };
    save.nightshards -= def.cost;
    save.nightPactNodes.push(nodeId);
    return { ok: true };
  }

  window.App.Systems.Pact = { eligible, previewNightshards, nightshardsForSigilPoints, enact, buyNode };
})();
