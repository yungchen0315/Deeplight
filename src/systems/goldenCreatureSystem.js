/* ============================================================================
 * goldenCreatureSystem.js — 金燈魚：主動遊玩期間限定的稀有快速生物。點擊後從三
 * 選二的強力短效增益中挑一個套用。時機（nextGoldenAt）存進存檔，離線期間不倒數。
 * ==========================================================================*/
(function () {
  const D = window.App.Data;
  const B = D.BALANCE;
  const U = window.App.Utils;
  const Econ = window.App.Systems.Economy;

  function dueToSpawn(save, now) {
    return (save.nextGoldenAt || 0) <= (now == null ? Date.now() : now);
  }

  /** 錯過的金燈魚不累積、也不追趕——排到下一個隨機間隔即可，避免離線幾天回來時
   *  被回溯觸發的金燈魚淹沒（這款生物設計上就是「主動遊玩時的驚喜」）。 */
  function scheduleNext(save, now) {
    now = now == null ? Date.now() : now;
    const [min, max] = B.GOLDEN_SPAWN_INTERVAL_MS;
    save.nextGoldenAt = now + U.randomInt(min, max);
  }

  /** 從三種增益中隨機抽兩種，做成二選一卡片。 */
  function rollChoices() {
    const pool = D.GOLDEN_BUFF_DEFS.slice();
    const first = pool.splice(Math.floor(Math.random() * pool.length), 1)[0];
    const second = pool.splice(Math.floor(Math.random() * pool.length), 1)[0];
    return [first, second];
  }

  function applyBuff(save, buffId) {
    const def = D.goldenBuffById(buffId);
    if (!def) return { ok: false, reason: '找不到此增益' };
    const now = Date.now();
    window.App.Systems.EventLog.log(save, '捕獲金燈魚，選擇「' + def.label + '」');
    if (def.kind === 'instant') {
      const gained = Econ.glowPerSec(save) * def.minutes * 60;
      save.glow += gained;
      save.stats.totalGlowEarned += gained;
      return { ok: true, def, gained };
    }
    save.tempBuff = { kind: def.kind, mult: def.mult, until: now + def.seconds * 1000 };
    return { ok: true, def };
  }

  window.App.Systems.Golden = { dueToSpawn, scheduleNext, rollChoices, applyBuff };
})();
