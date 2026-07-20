/* ============================================================================
 * gameLoopSystem.js — 唯一的時間推進入口，前景 tick 用實測 dt 結算，
 * 不假設固定步長；離線追趕交給 offlineSystem，兩者共用同一套螢光/深度公式。
 * 也在這裡處理自動化重構（自動採光／自動採買／自動過閘門）——這些都是純數值
 * 規則，回傳結果讓 bootstrap（UI orchestrator）決定要不要跳提示音/toast，
 * 維持 systems 層不直接碰 UI 的分層原則。
 * ==========================================================================*/
(function () {
  const D = window.App.Data;
  const Econ = window.App.Systems.Economy;
  const Descent = window.App.Systems.Descent;
  const Achievement = window.App.Systems.Achievement;
  const Log = window.App.Systems.Log;

  /** 自動採買：找出目前已解鎖（或已持有）模組中最便宜且買得起的一個，買 1 個。 */
  function tryAutoBuy(save) {
    const candidates = D.MODULE_DEFS.filter((def) => save.depth >= def.unlockDepth || (save.modules[def.id] && save.modules[def.id].count > 0));
    let cheapest = null;
    let cheapestCost = Infinity;
    candidates.forEach((def) => {
      const cost = Econ.moduleCost(save, def.id);
      if (cost < cheapestCost) { cheapestCost = cost; cheapest = def; }
    });
    if (!cheapest || save.glow < cheapestCost) return null;
    const r = Econ.buyModule(save, cheapest.id, 1);
    return r.ok ? cheapest : null;
  }

  /** 自動過閘門：抵達錨點且螢光足夠時直接通過。 */
  function tryAutoGate(save, eff) {
    if (!Descent.atGate(save)) return null;
    const cost = Descent.gateCost(save, eff);
    if (cost === null || save.glow < cost) return null;
    const r = Descent.passGate(save);
    return r.ok ? r.zone : null;
  }

  /**
   * @param {SaveGame} save
   * @param {number} dtMs 距離上次 tick 的實際毫秒數。
   * @returns {{newAchievements: AchievementDef[], newLogEntries: LogDef[], autoTapped: boolean,
   *   lureTriggered: boolean, autoBoughtModule: ?ModuleDef, autoGatedZone: ?ZoneDef}}
   */
  function tick(save, dtMs) {
    const dtSec = Math.max(0, dtMs / 1000);
    const gps = Econ.glowPerSec(save);
    const gained = gps * dtSec;
    save.glow += gained;
    save.stats.totalGlowEarned += gained;
    save.stats.playSeconds = (save.stats.playSeconds || 0) + dtSec;
    Descent.advance(save, dtSec);

    const eff = Econ.computeEffects(save);

    // 自動採光（f9 重構）：每秒發生機率 = autoTapPerSec × autoSpeedMult × dt，
    // 避免另存一份小數累加器。autoSpeedMult 來自永夜盟約的星海羅盤・極速節點。
    let autoTapped = false;
    let lureTriggered = false;
    if (eff.autoTapPerSec > 0 && Math.random() < eff.autoTapPerSec * eff.autoSpeedMult * dtSec) {
      const result = Econ.applyTap(save);
      autoTapped = true;
      lureTriggered = result.lureTriggered;
    }

    const autoBoughtModule = eff.autoBuyCheapest ? tryAutoBuy(save) : null;
    const autoGatedZone = eff.autoGate ? tryAutoGate(save, eff) : null;

    let autoClaimedQuestCount = 0;
    if (eff.autoClaimQuests) {
      const Quest = window.App.Systems.Quest;
      save.quests.items.forEach((item) => {
        if (!item.claimed && Quest.isDone(save, item)) {
          const r = Quest.claim(save, item.tplId);
          if (r.ok) autoClaimedQuestCount += 1;
        }
      });
    }

    const newAchievements = Achievement.checkAchievements(save);
    const newLogEntries = Log.checkEntries(save);
    return { newAchievements, newLogEntries, autoTapped, lureTriggered, autoBoughtModule, autoGatedZone, autoClaimedQuestCount };
  }

  window.App.Systems.GameLoop = { tick };
})();
