/* ============================================================================
 * researchScreen.js — 「研究」分頁：研究列表（線性解鎖）+ 深淵圖鑑 4 欄網格（含星級）。
 * ==========================================================================*/
(function () {
  const U = window.App.Utils;
  const D = window.App.Data;
  const PR = window.App.UI.PixelRenderer;
  const Research = window.App.Systems.Research;
  const Econ = window.App.Systems.Economy;
  const Toast = window.App.UI.Toast;
  const Audio = window.App.Systems.Audio;
  const FX = window.App.UI.FX;

  function render(container, save, onChange) {
    U.clearNode(container);

    const panel = U.el('div', 'panel');
    panel.appendChild(U.el('div', 'panelTitle', '研究（樣本 ' + save.samples + '）'));
    D.RESEARCH_DEFS.forEach((def) => {
      const done = save.research.includes(def.id);
      const row = U.el('div', 'researchRow' + (done ? ' researchDone' : ''));
      row.appendChild(U.el('span', 'researchName', (done ? '✔ ' : '') + def.name));
      row.appendChild(U.el('span', 'researchDesc', def.desc));
      if (!done) {
        const check = Research.canBuy(save, def.id);
        const btn = U.el('button', 'smallBtn' + (check.ok ? '' : ' disabled'), def.cost + ' SP');
        U.onTap(btn, () => {
          const r = Research.buy(save, def.id);
          if (r.ok) { Audio.play('upgrade'); FX.popButton(btn); onChange(); } else { Audio.play('error'); Toast.toast(r.reason); }
        });
        row.appendChild(btn);
      }
      panel.appendChild(row);
    });
    container.appendChild(panel);

    const bestiaryPanel = U.el('div', 'panel');
    const bestiaryCount = Object.keys(save.bestiary).length;
    let starTotal = 0;
    Object.keys(save.bestiary).forEach((id) => { starTotal += Econ.bestiaryStarLevel(save.bestiary[id].seen || 0); });
    bestiaryPanel.appendChild(U.el('div', 'panelTitle',
      '深淵圖鑑（' + bestiaryCount + ' / ' + D.CREATURE_DEFS.length + '）　圖鑑加成：+' + (starTotal * D.BALANCE.BESTIARY_STAR_PROD_PCT).toFixed(1) + '%'));
    const grid = U.el('div', 'bestiaryGrid');
    D.CREATURE_DEFS.forEach((def) => {
      const seen = save.bestiary[def.id];
      const cell = U.el('div', 'bestiaryCell' + (seen ? '' : ' bestiaryUnknown'));
      if (seen) {
        cell.appendChild(PR.spriteCanvasEl(def.icon, 2));
        cell.appendChild(U.el('div', 'bestiaryName', def.name + (def.rare ? ' ★' : '')));
        const starLvl = Econ.bestiaryStarLevel(seen.seen || 0);
        const maxStar = D.BALANCE.BESTIARY_STAR_THRESHOLDS.length;
        cell.appendChild(U.el('div', 'bestiarySeen', '目擊 ' + seen.seen + ' 次'));
        cell.appendChild(U.el('div', 'bestiaryStars', '★'.repeat(starLvl) + '☆'.repeat(maxStar - starLvl)));
        U.onTap(cell, () => window.App.UI.BestiaryDetailModal.open(def, seen));
      } else {
        cell.appendChild(U.el('div', 'bestiaryUnknownMark', '?'));
      }
      grid.appendChild(cell);
    });
    bestiaryPanel.appendChild(grid);
    container.appendChild(bestiaryPanel);
  }

  window.App.UI.ResearchScreen = { render };
})();
