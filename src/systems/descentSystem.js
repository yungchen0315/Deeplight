/* ============================================================================
 * descentSystem.js — 深度隨時間推進、抵達錨點後停住等待玩家付費通過。
 * ==========================================================================*/
(function () {
  const D = window.App.Data;
  const Econ = window.App.Systems.Economy;

  /** 依經過的秒數推進深度，夾在目前海域的錨點深度以內（含離線追趕時呼叫）。 */
  function advance(save, dtSeconds) {
    const zone = D.zoneById(save.currentZone) || D.ZONE_DEFS[0];
    const rate = Econ.descentRate(save); // m/min
    const gained = (rate / 60) * dtSeconds;
    save.depth = Math.min(save.depth + gained, zone.anchorDepth);
    if (save.depth > save.maxDepthThisRun) save.maxDepthThisRun = save.depth;
    if (save.depth > save.maxDepthEver) save.maxDepthEver = save.depth;
  }

  function atGate(save) {
    const zone = D.zoneById(save.currentZone) || D.ZONE_DEFS[0];
    return !zone.comingSoon && save.depth >= zone.anchorDepth;
  }

  function nextZone(save) {
    return D.zoneById(save.currentZone + 1);
  }

  /** 目前錨點實際要付的螢光（套用深之錨印記樹的閘門成本折扣）。 */
  function gateCost(save, eff) {
    const zone = D.zoneById(save.currentZone) || D.ZONE_DEFS[0];
    if (zone.gateCost === null || zone.gateCost === undefined) return null;
    return Math.round(zone.gateCost * (eff || Econ.computeEffects(save)).gateCostMult);
  }

  /** 支付通過目前錨點，進入下一海域；成功時附帶隨海域遞增的 SP 獎勵（企劃書第 4a 節）。 */
  function passGate(save) {
    const zone = D.zoneById(save.currentZone) || D.ZONE_DEFS[0];
    if (zone.comingSoon) return { ok: false, reason: '此海域尚未開放' };
    if (save.depth < zone.anchorDepth) return { ok: false, reason: '尚未抵達錨點' };
    const cost = gateCost(save);
    if (cost === null) return { ok: false, reason: '此海域尚未開放' };
    if (save.glow < cost) return { ok: false, reason: '螢光不足' };
    const next = nextZone(save);
    if (!next || next.comingSoon) return { ok: false, reason: '已達目前版本最深處' };
    save.glow -= cost;
    save.currentZone += 1;
    save.samples = (save.samples || 0) + 3 + 3 * zone.id;
    save.stats.totalGatesPassed = (save.stats.totalGatesPassed || 0) + 1;
    // 記錄「這輩子第一次抵達的海域」——只在第一次進入某片海域時回傳 firstTime，
    // 讓 UI 端可以放一個一次性的抵達慶祝，之後轉生重玩經過同一片海域就不再重複。
    save.zonesSeen = save.zonesSeen || [];
    const firstTime = !save.zonesSeen.includes(next.id);
    if (firstTime) save.zonesSeen.push(next.id);
    window.App.Systems.EventLog.log(save, '通過錨點閘門，進入「' + next.name + '」');
    return { ok: true, zone: next, firstTime: firstTime };
  }

  window.App.Systems.Descent = { advance, atGate, nextZone, gateCost, passGate };
})();
