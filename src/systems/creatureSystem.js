/* ============================================================================
 * creatureSystem.js — 路過生物的生成間隔、點擊收集、深淵圖鑑記錄，以及離線
 * 「錯過的生物」佇列的請領。首次遇見必掉樣本，之後依 balance 機率掉落。
 * ==========================================================================*/
(function () {
  const D = window.App.Data;
  const U = window.App.Utils;
  const B = D.BALANCE;
  const Econ = window.App.Systems.Economy;

  function nextSpawnDelayMs(save) {
    const eff = Econ.computeEffects(save);
    const [min, max] = B.CREATURE_SPAWN_INTERVAL_MS;
    const Event = window.App.Systems.Event;
    const weekendMult = (Event && Event.isWeekend()) ? B.WEEKEND_SPAWN_INTERVAL_MULT : 1;
    const seasonal = Event && Event.currentSeasonalEvent();
    const seasonalMult = seasonal ? seasonal.spawnIntervalMult : 1;
    return U.randomInt(min, max) * eff.spawnIntervalMult * weekendMult * seasonalMult;
  }

  /** 依目前海域與稀有機率抽一種會路過的生物。 */
  function rollSpecies(save) {
    const eff = Econ.computeEffects(save);
    const list = D.creaturesForZone(save.currentZone);
    if (list.length === 0) return null;
    const rares = list.filter((c) => c.rare);
    const commons = list.filter((c) => !c.rare);
    const Event = window.App.Systems.Event;
    const seasonal = Event && Event.currentSeasonalEvent();
    const seasonalRareMult = seasonal ? seasonal.rareChanceMult : 1;
    const rareChance = B.CREATURE_RARE_CHANCE * eff.rareChanceMult * seasonalRareMult;
    if (rares.length > 0 && Math.random() < rareChance) return U.choice(rares);
    return U.choice(commons.length ? commons : list);
  }

  function recordSighting(save, creatureId) {
    const eff = Econ.computeEffects(save);
    const isFirst = !save.bestiary[creatureId];
    let gotPearl = false;
    if (eff.creaturePearlChance > 0 && Math.random() < eff.creaturePearlChance) {
      save.pearls = (save.pearls || 0) + 1;
      gotPearl = true;
    }
    if (isFirst) {
      save.bestiary[creatureId] = { seen: 1, firstAt: Date.now() };
      save.samples = (save.samples || 0) + 1;
      return { isFirst: true, gotSample: true, gotPearl };
    }
    save.bestiary[creatureId].seen += 1;
    const gotSample = Math.random() < B.CREATURE_SAMPLE_DROP_CHANCE;
    if (gotSample) save.samples = (save.samples || 0) + 1;
    return { isFirst: false, gotSample, gotPearl };
  }

  function burstReward(save) {
    const eff = Econ.computeEffects(save);
    return Econ.glowPerSec(save) * eff.burstSeconds * eff.clickRewardMult;
  }

  /** 玩家點擊畫面上正在游過的生物。 */
  function collect(save, creatureId) {
    const def = D.creatureById(creatureId);
    if (!def) return { ok: false, reason: '找不到此生物' };
    const burst = burstReward(save);
    save.glow += burst;
    save.stats.totalGlowEarned += burst;
    save.stats.totalCreaturesCollected = (save.stats.totalCreaturesCollected || 0) + 1;
    const rec = recordSighting(save, creatureId);
    if (rec.isFirst && def.rare) window.App.Systems.EventLog.log(save, '首次記錄稀有生物「' + def.name + '」');
    return Object.assign({ ok: true, burst, def }, rec);
  }

  /** 請領一隻離線期間錯過的生物（隨機從已解鎖海域中抽）。 */
  function claimPending(save) {
    if (save.pendingCreatures <= 0) return { ok: false, reason: '沒有待領取的生物' };
    save.pendingCreatures -= 1;
    const pool = D.CREATURE_DEFS.filter((c) => c.zone <= save.currentZone);
    const def = U.choice(pool.length ? pool : D.CREATURE_DEFS);
    const burst = burstReward(save);
    save.glow += burst;
    save.stats.totalGlowEarned += burst;
    save.stats.totalCreaturesCollected = (save.stats.totalCreaturesCollected || 0) + 1;
    save.stats.totalMissedClaimed = (save.stats.totalMissedClaimed || 0) + 1;
    const rec = recordSighting(save, def.id);
    if (rec.isFirst && def.rare) window.App.Systems.EventLog.log(save, '首次記錄稀有生物「' + def.name + '」');
    return Object.assign({ ok: true, burst, def }, rec);
  }

  window.App.Systems.Creature = { nextSpawnDelayMs, rollSpecies, collect, claimPending };
})();
