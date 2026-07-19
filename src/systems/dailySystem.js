/* ============================================================================
 * dailySystem.js — 每日簽到＋連續天數（7 天循環獎勵）。日期用本地時區的
 * YYYY-MM-DD 字串比較，不依賴伺服器時間。
 * ==========================================================================*/
(function () {
  const B = window.App.Data.BALANCE;
  const Econ = window.App.Systems.Economy;

  function todayKey(now) {
    const d = new Date(now);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + day;
  }

  function yesterdayKey(now) { return todayKey(now - 24 * 3600 * 1000); }

  function canClaim(save, now) {
    return save.daily.lastClaimDate !== todayKey(now == null ? Date.now() : now);
  }

  /** 依 streak 對 7 的餘數決定今天的獎勵種類，不消耗任何資源，純描述用。 */
  function rewardForStreak(streak) {
    const idx = ((streak - 1) % B.DAILY_CYCLE_LENGTH + B.DAILY_CYCLE_LENGTH) % B.DAILY_CYCLE_LENGTH;
    const table = [
      { kind: 'samples', amount: 3, label: '樣本 x3' },
      { kind: 'glowSeconds', amount: 900, label: '螢光（15 分鐘產量）' },
      { kind: 'pearls', amount: 1, label: '深海珍珠 x1' },
      { kind: 'samples', amount: 6, label: '樣本 x6' },
      { kind: 'glowSeconds', amount: 3600, label: '螢光（1 小時產量）' },
      { kind: 'pearls', amount: 2, label: '深海珍珠 x2' },
      { kind: 'jackpot', amount: 0, label: '稀有生物圖鑑 + 樣本 x10（或珍珠 x3）' }
    ];
    return Object.assign({ day: idx + 1 }, table[idx]);
  }

  function previewCycle() {
    const list = [];
    for (let i = 1; i <= B.DAILY_CYCLE_LENGTH; i++) list.push(rewardForStreak(i));
    return list;
  }

  function claim(save, now) {
    now = now == null ? Date.now() : now;
    if (!canClaim(save, now)) return { ok: false, reason: '今日已簽到' };
    const isConsecutive = save.daily.lastClaimDate === yesterdayKey(now);
    save.daily.streak = isConsecutive ? save.daily.streak + 1 : 1;
    save.daily.lastClaimDate = todayKey(now);

    const reward = rewardForStreak(save.daily.streak);
    if (reward.kind === 'samples') {
      save.samples = (save.samples || 0) + reward.amount;
    } else if (reward.kind === 'pearls') {
      save.pearls = (save.pearls || 0) + reward.amount;
    } else if (reward.kind === 'glowSeconds') {
      const gained = Econ.glowPerSec(save) * reward.amount;
      save.glow += gained;
      save.stats.totalGlowEarned += gained;
      reward.gained = gained;
    } else if (reward.kind === 'jackpot') {
      const D = window.App.Data;
      const unseenRares = D.CREATURE_DEFS.filter((c) => c.rare && !save.bestiary[c.id]);
      if (unseenRares.length > 0) {
        const pick = unseenRares[Math.floor(Math.random() * unseenRares.length)];
        save.bestiary[pick.id] = { seen: 1, firstAt: now };
        reward.creature = pick;
      } else {
        save.pearls = (save.pearls || 0) + 3;
        reward.pearlsInstead = 3;
      }
      save.samples = (save.samples || 0) + 10;
    }
    return { ok: true, reward, streak: save.daily.streak };
  }

  window.App.Systems.Daily = { canClaim, rewardForStreak, previewCycle, claim, todayKey };
})();
