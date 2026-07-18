/* ============================================================================
 * surfaceScreen.js — 「海面」分頁：每日簽到、重返海面（轉生）、重構升級、成就、
 * 統計。設定（音效/存檔匯出匯入/重置）移至頂欄齒輪按鈕開啟的彈窗。
 * ==========================================================================*/
(function () {
  const U = window.App.Utils;
  const D = window.App.Data;
  const PR = window.App.UI.PixelRenderer;
  const Prestige = window.App.Systems.Prestige;
  const Daily = window.App.Systems.Daily;
  const Toast = window.App.UI.Toast;
  const Audio = window.App.Systems.Audio;
  const FX = window.App.UI.FX;

  function renderDaily(container, save, onChange) {
    const panel = U.el('div', 'panel');
    panel.appendChild(U.el('div', 'panelTitle', '每日簽到（連續 ' + save.daily.streak + ' 天）'));
    const grid = U.el('div', 'dailyGrid');
    const cycle = Daily.previewCycle(save);
    const claimableToday = Daily.canClaim(save);
    const todayIdx = ((save.daily.streak + (claimableToday ? 0 : -1)) % D.BALANCE.DAILY_CYCLE_LENGTH + D.BALANCE.DAILY_CYCLE_LENGTH) % D.BALANCE.DAILY_CYCLE_LENGTH;
    cycle.forEach((r, i) => {
      const isToday = claimableToday ? (i === (save.daily.streak % D.BALANCE.DAILY_CYCLE_LENGTH)) : (i === todayIdx);
      const isPast = !claimableToday && i <= todayIdx;
      const cell = U.el('div', 'dailyCell' + (isToday && claimableToday ? ' dailyToday' : '') + (isPast ? ' dailyPast' : ''));
      cell.appendChild(U.el('div', 'dailyDay', '第 ' + r.day + ' 天'));
      cell.appendChild(U.el('div', 'dailyLabel', r.label));
      grid.appendChild(cell);
    });
    panel.appendChild(grid);
    const btn = U.el('button', 'prestigeBtn' + (claimableToday ? '' : ' disabled'), claimableToday ? '簽到領取' : '明天再來');
    U.onTap(btn, () => {
      const r = Daily.claim(save);
      if (!r.ok) { Toast.toast(r.reason); return; }
      Audio.play('daily');
      FX.popButton(btn);
      Toast.toast('簽到成功：' + r.reward.label);
      onChange();
    });
    panel.appendChild(btn);
    container.appendChild(panel);
  }

  function render(container, save, onChange) {
    U.clearNode(container);

    renderDaily(container, save, onChange);

    const prestigePanel = U.el('div', 'panel');
    prestigePanel.appendChild(U.el('div', 'panelTitle', '重返海面'));
    prestigePanel.appendChild(U.el('div', 'subHint', '本輪最大深度：' + Math.floor(save.maxDepthThisRun) + ' m'));
    const preview = Prestige.previewCores(save);
    prestigePanel.appendChild(U.el('div', 'subHint', '可獲得壓力核心：' + preview));
    const eligible = Prestige.eligible(save);
    const btn = U.el('button', 'prestigeBtn' + (eligible ? '' : ' disabled'), '重返海面');
    U.onTap(btn, () => {
      const r = Prestige.resurface(save);
      if (r.ok) {
        Audio.play('prestige');
        FX.shake(document.getElementById('screens'), 6, 400);
        Toast.toast('重返海面！獲得 ' + r.gained + ' 顆壓力核心');
        onChange();
      } else { Audio.play('error'); Toast.toast(r.reason); }
    });
    prestigePanel.appendChild(btn);
    if (!eligible) prestigePanel.appendChild(U.el('div', 'lockedHint', '需下潛至 ' + D.BALANCE.PRESTIGE_MIN_DEPTH + ' 公尺才能轉生'));
    container.appendChild(prestigePanel);

    const boostPanel = U.el('div', 'panel');
    boostPanel.appendChild(U.el('div', 'panelTitle', '深海珍珠（' + save.pearls + '）'));
    boostPanel.appendChild(U.el('div', 'subHint', '珍珠由成就掉落，可兌換限時加護'));
    const boostRow = U.el('div', 'ballastRow');
    const boostBtn = U.el('button', 'smallBtn' + (save.pearls < 1 ? ' disabled' : ''), '1 珍珠 → 全產量 x' + D.BALANCE.PEARL_BOOST_MULT + ' / ' + D.BALANCE.PEARL_BOOST_HOURS + 'h');
    U.onTap(boostBtn, () => {
      const r = window.App.Systems.Economy.buyPearlBoost(save);
      if (r.ok) { Audio.play('upgrade'); FX.popButton(boostBtn); onChange(); } else { Audio.play('error'); Toast.toast(r.reason); }
    });
    boostRow.appendChild(boostBtn);
    boostPanel.appendChild(boostRow);
    const instantBtn = U.el('button', 'smallBtn' + (save.pearls < D.BALANCE.PEARL_INSTANT_COST ? ' disabled' : ''), D.BALANCE.PEARL_INSTANT_COST + ' 珍珠 → 立即獲得 ' + D.BALANCE.PEARL_INSTANT_HOURS + 'h 產量');
    U.onTap(instantBtn, () => {
      const r = window.App.Systems.Economy.buyPearlInstant(save);
      if (r.ok) { Audio.play('buy'); FX.popButton(instantBtn); Toast.toast('+' + U.formatNum(r.gained) + ' 螢光'); onChange(); } else { Audio.play('error'); Toast.toast(r.reason); }
    });
    boostPanel.appendChild(instantBtn);
    container.appendChild(boostPanel);

    const refitPanel = U.el('div', 'panel');
    refitPanel.appendChild(U.el('div', 'panelTitle', '重構升級（壓力核心 ' + save.cores + '）'));
    D.REFIT_DEFS.forEach((def) => {
      const owned = save.refits.includes(def.id);
      const row = U.el('div', 'refitRow' + (owned ? ' refitOwned' : ''));
      row.appendChild(U.el('span', 'refitName', (owned ? '✔ ' : '') + def.name));
      row.appendChild(U.el('span', 'refitDesc', def.desc));
      if (!owned) {
        const canAfford = save.cores >= def.cost;
        const buyBtn = U.el('button', 'smallBtn' + (canAfford ? '' : ' disabled'), def.cost + ' 核心');
        U.onTap(buyBtn, () => {
          if (save.cores < def.cost) { Audio.play('error'); Toast.toast('壓力核心不足'); return; }
          save.cores -= def.cost;
          save.refits.push(def.id);
          Audio.play('upgrade');
          FX.popButton(buyBtn);
          onChange();
        });
        row.appendChild(buyBtn);
      }
      refitPanel.appendChild(row);
    });
    container.appendChild(refitPanel);

    const achPanel = U.el('div', 'panel');
    achPanel.appendChild(U.el('div', 'panelTitle', '成就（' + save.achievements.length + ' / ' + D.ACHIEVEMENT_DEFS.length + '）　珍珠 ' + save.pearls));
    D.ACHIEVEMENT_DEFS.forEach((a) => {
      const done = save.achievements.includes(a.id);
      const row = U.el('div', 'achRow' + (done ? ' achDone' : ''));
      row.appendChild(U.el('span', '', (done ? '✔ ' : '☐ ') + a.name));
      row.appendChild(U.el('span', 'achDesc', a.desc));
      achPanel.appendChild(row);
    });
    container.appendChild(achPanel);

    const statsPanel = U.el('div', 'panel');
    statsPanel.appendChild(U.el('div', 'panelTitle', '統計'));
    const s = save.stats;
    const lines = [
      '累計螢光：' + U.formatNum(s.totalGlowEarned || 0),
      '累計點擊：' + (s.totalTaps || 0),
      '累計壓力核心：' + (s.totalCoresEarned || 0),
      '收錄生物：' + Object.keys(save.bestiary).length + ' / ' + D.CREATURE_DEFS.length,
      '轉生次數：' + save.prestigeCount,
      '遊玩時間：' + Math.floor((s.playSeconds || 0) / 60) + ' 分鐘'
    ];
    lines.forEach((line) => statsPanel.appendChild(U.el('div', 'subHint', line)));
    statsPanel.appendChild(U.el('div', 'subHint', '《潛燈》DEEPLIGHT v1.1　·　更多設定請點頂欄齒輪圖示'));
    container.appendChild(statsPanel);
  }

  window.App.UI.SurfaceScreen = { render };
})();
