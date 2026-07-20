/* ============================================================================
 * economySystem.js — 螢光產出、模組成本／升級、壓載成本、研究＋重構效果彙總、
 * 點擊採光、珍珠加護。對應企劃書第 3、4b、4c 節公式，所有數值常數來自
 * data/balance.js。
 * ==========================================================================*/
(function () {
  const D = window.App.Data;
  const B = D.BALANCE;

  /** 圖鑑星級：目擊次數達到門檻升星（0~5 星），星級決定產量加成，取代 v1.1 的扁平加成。 */
  function bestiaryStarLevel(seen) {
    let lvl = 0;
    B.BESTIARY_STAR_THRESHOLDS.forEach((t, i) => { if (seen >= t) lvl = i + 1; });
    return lvl;
  }

  /** 彙總所有已完成研究＋已購重構＋已購印記的效果，供 glowPerSec／descentRate 等共用。 */
  function computeEffects(save) {
    const eff = {
      allProdMult: 1,
      moduleMult: {},
      spawnIntervalMult: 1,
      clickRewardMult: 1,
      descentMult: 1,
      offlineFullHours: B.OFFLINE_FULL_HOURS,
      offlineHalfHours: B.OFFLINE_HALF_HOURS,
      offlineCapHours: B.OFFLINE_ABSOLUTE_CAP_HOURS,
      offlineMult: 1,
      rareChanceMult: 1,
      startDescentBonus: 0,
      startModules: {},
      burstSeconds: B.CREATURE_BURST_SECONDS,
      startDepth: 0,
      corePct: B.CORE_PRODUCTION_BONUS_PCT,
      autoTapPerSec: 0,
      upgradeCostMult: 1,
      gateCostMult: 1,
      ballastMaxAdd: 0,
      pendingCapAdd: 0,
      creaturePearlChance: 0,
      autoResearchIds: [],
      autoBuyCheapest: false,
      autoGate: false,
      autoCollect: false,
      keepTopSigilOnReset: false,
      autoClaimQuests: false,
      autoSpeedMult: 1
    };
    function apply(e) {
      if (!e) return;
      switch (e.type) {
        case 'allProdMult': eff.allProdMult *= e.value; break;
        case 'moduleMult': eff.moduleMult[e.module] = (eff.moduleMult[e.module] || 1) * e.value; break;
        case 'moduleMultMany': e.modules.forEach((m) => { eff.moduleMult[m] = (eff.moduleMult[m] || 1) * e.value; }); break;
        case 'spawnIntervalMult': eff.spawnIntervalMult *= e.value; break;
        case 'clickRewardMult': eff.clickRewardMult *= e.value; break;
        case 'descentMult': eff.descentMult *= e.value; break;
        case 'offlineFullHours': eff.offlineFullHours = Math.max(eff.offlineFullHours, e.value); break;
        case 'offlineBoost': eff.offlineMult *= e.mult; eff.offlineHalfHours = Math.max(eff.offlineHalfHours, e.halfHours); break;
        case 'offlineCapHours': eff.offlineCapHours = Math.max(eff.offlineCapHours, e.value); break;
        case 'rareChanceMult': eff.rareChanceMult *= e.value; break;
        case 'startDescentBonus': eff.startDescentBonus += e.value; break;
        case 'startModule': eff.startModules[e.module] = (eff.startModules[e.module] || 0) + e.value; break;
        case 'burstSeconds': eff.burstSeconds = Math.max(eff.burstSeconds, e.value); break;
        case 'startDepth': eff.startDepth = Math.max(eff.startDepth, e.value); break;
        case 'corePctOverride': eff.corePct = Math.max(eff.corePct, e.value); break;
        case 'autoTapPerSec': eff.autoTapPerSec += e.value; break;
        case 'upgradeCostMult': eff.upgradeCostMult *= e.value; break;
        case 'gateCostMult': eff.gateCostMult *= e.value; break;
        case 'ballastMaxAdd': eff.ballastMaxAdd += e.value; break;
        case 'pendingCapAdd': eff.pendingCapAdd += e.value; break;
        case 'creaturePearlChance': eff.creaturePearlChance += e.value; break;
        case 'autoResearchOnStart': eff.autoResearchIds.push(e.researchId); break;
        case 'autoBuyCheapest': eff.autoBuyCheapest = true; break;
        case 'autoGate': eff.autoGate = true; break;
        case 'autoCollect': eff.autoCollect = true; break;
        case 'keepTopSigilOnReset': eff.keepTopSigilOnReset = true; break;
        case 'autoClaimQuests': eff.autoClaimQuests = true; break;
        case 'autoSpeedMult': eff.autoSpeedMult *= e.value; break;
        default: break;
      }
    }
    (save.research || []).forEach((id) => { const r = D.researchById(id); if (r) apply(r.effect); });
    (save.refits || []).forEach((id) => { const f = D.refitById(id); if (f) apply(f.effect); });
    (save.sigils || []).forEach((id) => { const s = D.sigilById(id); if (s) apply(s.effect); });
    (save.nightPactNodes || []).forEach((id) => { const p = D.pactById(id); if (p) apply(p.effect); });
    eff.allProdMult *= 1 + (save.cores || 0) * eff.corePct / 100;
    // 深淵圖鑑星級產量加成：每星 +0.5%，永久保留、跨轉生（含深淵協約）不重置。
    let starTotal = 0;
    Object.keys(save.bestiary || {}).forEach((id) => { starTotal += bestiaryStarLevel(save.bestiary[id].seen || 0); });
    eff.allProdMult *= 1 + starTotal * B.BESTIARY_STAR_PROD_PCT / 100;
    // 珍珠加護：消耗珍珠換來的限時全產量倍率。
    if (save.boostUntil && Date.now() < save.boostUntil) eff.allProdMult *= B.PEARL_BOOST_MULT;
    // 金燈魚限時增益（產量或下潛速度倍率二選一，見 goldenCreatureSystem）。
    if (save.tempBuff && save.tempBuff.until > Date.now()) {
      if (save.tempBuff.kind === 'prod') eff.allProdMult *= save.tempBuff.mult;
      else if (save.tempBuff.kind === 'descent') eff.descentMult *= save.tempBuff.mult;
      else if (save.tempBuff.kind === 'gate') eff.gateCostMult *= save.tempBuff.mult;
    }
    // 季節活動（見 eventSystem.js）：固定日期的全螢光產量加成。
    const Event = window.App.Systems.Event;
    const seasonal = Event && Event.currentSeasonalEvent();
    if (seasonal) eff.allProdMult *= seasonal.prodMult;
    // 自動化開關：已解鎖的自動化效果仍可在設定裡暫停，兩者是「有沒有」跟「要不要」
    // 的不同問題——買了自動化節點不代表玩家永遠想要它每秒都在花螢光。
    const st = save.settings || {};
    if (st.autoBuyEnabled === false) eff.autoBuyCheapest = false;
    if (st.autoGateEnabled === false) eff.autoGate = false;
    if (st.autoCollectEnabled === false) eff.autoCollect = false;
    if (st.autoTapEnabled === false) eff.autoTapPerSec = 0;
    if (st.autoClaimQuestsEnabled === false) eff.autoClaimQuests = false;
    return eff;
  }

  /** 單一模組目前每單位的產量（含升級倍率與研究倍率），不含海域倍率／全域倍率。 */
  function moduleUnitProd(save, eff, moduleId) {
    const def = D.moduleById(moduleId);
    if (!def) return 0;
    const state = save.modules[moduleId];
    const tier = (state && state.upgradeTier) || 0;
    const tierMult = Math.pow(B.MODULE_UPGRADE_PROD_MULT, tier);
    const researchMult = eff.moduleMult[moduleId] || 1;
    return def.baseProd * tierMult * researchMult;
  }

  /** 模組列表 UI 顯示用：單一模組「現在實際」每單位每秒產量，含海域倍率與全域加成——
   *  跟 moduleUnitProd（只含升級/研究倍率，glowPerSec 內部彙總用的建構區塊）不同，這個
   *  才是玩家在模組頁看到的「單體 X/s」乘上持有數後，應該直接加總得出頂欄總產量的數字。
   *  過去 UI 直接顯示 moduleUnitProd，卻沒有套用海域倍率／全域加成，導致玩家自己心算
   *  「單體 × 持有數」永遠對不上頂欄顯示的總產量——這是玩家回報「自動生產邏輯很怪」
   *  的根本原因，不是產量計算本身算錯，而是顯示的數字跟實際用來計算總量的數字不一致。 */
  function effectiveModuleUnitProd(save, eff, moduleId) {
    const zone = D.zoneById(save.currentZone) || D.ZONE_DEFS[0];
    return moduleUnitProd(save, eff, moduleId) * zone.mult * eff.allProdMult;
  }

  /** 全勢力（其實只有玩家一份）每秒螢光產出：Σ(模組單位產量×持有數) × 海域倍率 × 全域倍率。 */
  function glowPerSec(save) {
    const eff = computeEffects(save);
    const zone = D.zoneById(save.currentZone) || D.ZONE_DEFS[0];
    let total = 0;
    D.MODULE_DEFS.forEach((def) => {
      const state = save.modules[def.id];
      if (!state || state.count <= 0) return;
      total += moduleUnitProd(save, eff, def.id) * state.count;
    });
    return total * zone.mult * eff.allProdMult;
  }

  function moduleCost(save, moduleId) {
    const def = D.moduleById(moduleId);
    const count = (save.modules[moduleId] || { count: 0 }).count;
    return Math.round(def.baseCost * Math.pow(B.MODULE_COST_GROWTH, count));
  }

  /** 買 qty 個（從目前持有數 n 開始）的總花費：baseCost * g^n * (g^qty - 1) / (g - 1)。 */
  function moduleCostForQty(save, moduleId, qty) {
    if (qty <= 0) return 0;
    const def = D.moduleById(moduleId);
    const n = (save.modules[moduleId] || { count: 0 }).count;
    const g = B.MODULE_COST_GROWTH;
    return Math.round(def.baseCost * Math.pow(g, n) * (Math.pow(g, qty) - 1) / (g - 1));
  }

  /** 目前螢光最多能買幾個此模組（xMax）。 */
  function maxAffordableQty(save, moduleId) {
    const def = D.moduleById(moduleId);
    const n = (save.modules[moduleId] || { count: 0 }).count;
    const g = B.MODULE_COST_GROWTH;
    const glow = save.glow;
    const firstCost = def.baseCost * Math.pow(g, n);
    if (glow < firstCost) return 0;
    const rhs = 1 + (glow * (g - 1)) / firstCost;
    const k = Math.floor(Math.log(rhs) / Math.log(g));
    return Math.max(0, k);
  }

  /** 該模組下一個尚未購買的升級節點資訊；還沒解鎖門檻或已買滿所有階時回傳 null。 */
  function moduleUpgradeInfo(save, moduleId, eff) {
    const def = D.moduleById(moduleId);
    const state = save.modules[moduleId] || { count: 0, upgradeTier: 0 };
    const tier = state.upgradeTier || 0;
    if (tier >= B.MODULE_UPGRADE_THRESHOLDS.length) return null;
    const threshold = B.MODULE_UPGRADE_THRESHOLDS[tier];
    const costMult = (eff || computeEffects(save)).upgradeCostMult;
    const cost = Math.round(def.baseCost * B.MODULE_UPGRADE_COST_MULTIPLIERS[tier] * costMult);
    return { tier, threshold, cost, unlocked: state.count >= threshold };
  }

  function buyModule(save, moduleId, qty) {
    qty = qty || 1;
    if (qty === 'max') qty = maxAffordableQty(save, moduleId);
    if (qty <= 0) return { ok: false, reason: '螢光不足' };
    const cost = moduleCostForQty(save, moduleId, qty);
    if (save.glow < cost) return { ok: false, reason: '螢光不足' };
    save.glow -= cost;
    if (!save.modules[moduleId]) save.modules[moduleId] = { count: 0, upgradeTier: 0 };
    save.modules[moduleId].count += qty;
    save.stats.totalModulesBought = (save.stats.totalModulesBought || 0) + qty;
    return { ok: true, qty, cost };
  }

  /** 便利功能：依序（照 MODULE_DEFS 順序，天生由便宜到貴）對每個已解鎖模組買 xMax，
   *  買到沒得買為止。回傳實際花費與購買的模組數，方便 UI 顯示一則總結 toast。 */
  function buyAllAffordable(save) {
    let totalQty = 0;
    let totalCost = 0;
    let touchedAny = false;
    D.MODULE_DEFS.forEach((def) => {
      const state = save.modules[def.id];
      const locked = save.depth < def.unlockDepth && (!state || state.count === 0);
      if (locked) return;
      const qty = maxAffordableQty(save, def.id);
      if (qty <= 0) return;
      const r = buyModule(save, def.id, qty);
      if (r.ok) { totalQty += r.qty; totalCost += r.cost; touchedAny = true; }
    });
    if (!touchedAny) return { ok: false, reason: '沒有買得起的模組' };
    return { ok: true, totalQty, totalCost };
  }

  function buyModuleUpgrade(save, moduleId) {
    const info = moduleUpgradeInfo(save, moduleId);
    if (!info || !info.unlocked) return { ok: false, reason: '尚未解鎖此升級' };
    if (save.glow < info.cost) return { ok: false, reason: '螢光不足' };
    save.glow -= info.cost;
    save.modules[moduleId].upgradeTier = info.tier + 1;
    save.stats.totalModuleUpgrades = (save.stats.totalModuleUpgrades || 0) + 1;
    return { ok: true };
  }

  /** 目前有效的壓載最高等級：基礎值 + 深之錨印記樹的加成。 */
  function effectiveBallastMax(save, eff) {
    return B.BALLAST_MAX_LEVEL + (eff || computeEffects(save)).ballastMaxAdd;
  }

  function ballastCost(save, eff) {
    if (save.ballastLevel >= effectiveBallastMax(save, eff)) return null;
    return Math.round(B.BALLAST_BASE_COST * Math.pow(B.BALLAST_COST_GROWTH, save.ballastLevel));
  }

  function buyBallast(save) {
    const cost = ballastCost(save);
    if (cost === null) return { ok: false, reason: '已達最高等級' };
    if (save.glow < cost) return { ok: false, reason: '螢光不足' };
    save.glow -= cost;
    save.ballastLevel += 1;
    save.stats.totalBallastUpgrades = (save.stats.totalBallastUpgrades || 0) + 1;
    return { ok: true };
  }

  function descentRate(save) {
    const eff = computeEffects(save);
    const base = B.BALLAST_BASE_RATE + B.BALLAST_RATE_PER_LEVEL * save.ballastLevel + eff.startDescentBonus;
    return base * eff.descentMult;
  }

  /** 手動點擊水域的螢光獎勵：目前每秒產量的固定比例（有下限），讓點擊在任何階段都值得做。 */
  function tapReward(save) {
    return Math.max(B.CLICK_TAP_MIN, glowPerSec(save) * B.CLICK_TAP_GPS_FRACTION);
  }

  /** 套用一次點擊採光（手動或自動皆呼叫此函式，UI 層另外處理音效/特效）。
   *  回傳 lureTriggered＝這一次是否「跨越」了誘光門檻（用 floor 比較前後值，而不是
   *  檢查目前值是否恰好整除），這樣自動採光（f9 重構）跳著推進時也不會把某次剛好落在
   *  整數倍上的觸發時機吃掉——只看「現在的數字」在自動點擊時完全有可能永遠錯過。 */
  function applyTap(save) {
    const amt = tapReward(save);
    save.glow += amt;
    save.stats.totalGlowEarned += amt;
    save.stats.totalTaps = (save.stats.totalTaps || 0) + 1;
    const before = save.tapLureProgress || 0;
    save.tapLureProgress = before + 1;
    const lureTriggered = Math.floor(before / B.TAPS_PER_LURE) !== Math.floor(save.tapLureProgress / B.TAPS_PER_LURE);
    return { amount: amt, lureTriggered };
  }

  /** 消耗珍珠換取限時全產量倍率加護；疊加時距今上限 PEARL_BOOST_MAX_AHEAD_HOURS。 */
  function buyPearlBoost(save) {
    if (save.pearls < 1) return { ok: false, reason: '珍珠不足' };
    const now = Date.now();
    const maxAhead = now + B.PEARL_BOOST_MAX_AHEAD_HOURS * 3600 * 1000;
    const base = Math.max(now, save.boostUntil || 0);
    if (base >= maxAhead) return { ok: false, reason: '加護時數已達上限' };
    save.pearls -= 1;
    save.boostUntil = Math.min(maxAhead, base + B.PEARL_BOOST_HOURS * 3600 * 1000);
    save.stats.totalPearlBoostsUsed = (save.stats.totalPearlBoostsUsed || 0) + 1;
    return { ok: true };
  }

  /** 消耗珍珠直接獲得數小時的當前產量。 */
  function buyPearlInstant(save) {
    if (save.pearls < B.PEARL_INSTANT_COST) return { ok: false, reason: '珍珠不足' };
    save.pearls -= B.PEARL_INSTANT_COST;
    const gained = glowPerSec(save) * B.PEARL_INSTANT_HOURS * 3600;
    save.glow += gained;
    save.stats.totalGlowEarned += gained;
    return { ok: true, gained };
  }

  window.App.Systems.Economy = {
    computeEffects, moduleUnitProd, effectiveModuleUnitProd, glowPerSec, moduleCost, moduleCostForQty, maxAffordableQty, moduleUpgradeInfo,
    buyModule, buyAllAffordable, buyModuleUpgrade, ballastCost, buyBallast, descentRate, effectiveBallastMax, bestiaryStarLevel,
    tapReward, applyTap, buyPearlBoost, buyPearlInstant
  };
})();
