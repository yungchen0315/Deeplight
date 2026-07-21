/* ============================================================================
 * hintSystem.js — 情境提示：在玩家第一次「有能力做某件事」的當下推一則一次性
 * 提示（存進 tutorial.seenHints，不會重複跳）。比起把新手教學做成一次講完的
 * 大彈窗，這種「當下需要才提示」的設計更不容易被玩家略過不看。
 * ==========================================================================*/
(function () {
  const D = window.App.Data;
  const Econ = window.App.Systems.Economy;

  function hasModules(save) { return Object.keys(save.modules).some((k) => save.modules[k].count > 0); }

  const HINTS = [
    {
      id: 'firstModuleHint',
      message: '螢光足夠了！前往「模組」頁面購買第一個發光模組吧',
      when: (save) => !hasModules(save) && save.glow >= Econ.moduleCost(save, 'jelly')
    },
    {
      id: 'firstResearchHint',
      message: '取得樣本了！前往「研究」頁面可以換取永久強化',
      when: (save) => save.research.length === 0 && save.samples >= D.RESEARCH_DEFS[0].cost
    },
    {
      id: 'firstRefitHint',
      message: '獲得壓力核心了！前往「海面」頁面購買重構升級吧',
      when: (save) => save.refits.length === 0 && save.cores >= Math.min.apply(null, D.REFIT_DEFS.map((f) => f.cost))
    },
    {
      id: 'covenantHint',
      message: '已達成深淵協約門檻！前往「協約」頁面締結協約，開啟印記樹',
      when: (save) => window.App.Systems.Covenant.eligible(save) && save.covenantCount === 0
    },
    {
      id: 'pactHint',
      message: '已達成永夜盟約門檻！前往「盟約」頁面締結盟約，開啟盟約樹',
      when: (save) => window.App.Systems.Pact.eligible(save) && save.pactCount === 0
    },
    {
      id: 'pearlBoostHint',
      message: '手上有深海珍珠了，去「海面」頁面兌換限時加護吧',
      when: (save) => save.pearls >= 1 && !save.boostUntil
    },
    {
      id: 'sonarHint',
      message: '左上角的 📡 是聲納脈衝：冷卻好了隨時可以按，立即強制刷新一隻路過生物，且那次抽到稀有種的機率有加成',
      when: (save) => (save.stats.totalTaps || 0) >= 3
    }
  ];

  /** 檢查所有尚未觸發過的提示，回傳這次新觸發的訊息陣列（可能是多則）。 */
  function checkHints(save) {
    const triggered = [];
    HINTS.forEach((hint) => {
      if (save.tutorial.seenHints.includes(hint.id)) return;
      if (hint.when(save)) {
        save.tutorial.seenHints.push(hint.id);
        triggered.push(hint.message);
      }
    });
    return triggered;
  }

  window.App.Systems.Hint = { checkHints };
})();
