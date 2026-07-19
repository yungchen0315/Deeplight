/* ============================================================================
 * covenantScreen.js — 「協約」分頁：深淵協約（第二層轉生）狀態與印記樹（3 分支
 * × 4 階＋3 個自動化節點）。門檻比一般轉生更高，見 balance.js 的 COVENANT_* 常數。
 * ==========================================================================*/
(function () {
  const U = window.App.Utils;
  const D = window.App.Data;
  const PR = window.App.UI.PixelRenderer;
  const Covenant = window.App.Systems.Covenant;
  const Toast = window.App.UI.Toast;
  const Audio = window.App.Systems.Audio;
  const FX = window.App.UI.FX;

  const BRANCH_META = {
    light: { name: '光之脈', icon: 'icon_sigil_light' },
    anchor: { name: '深之錨', icon: 'icon_sigil_anchor' },
    tide: { name: '潮之息', icon: 'icon_sigil_tide' }
  };

  function renderBranch(container, save, branch, onChange) {
    const panel = U.el('div', 'panel');
    const titleRow = U.el('div', 'panelTitleRow');
    const titleWrap = U.el('div', 'sigilBranchTitle');
    titleWrap.appendChild(PR.spriteCanvasEl(BRANCH_META[branch].icon, 2));
    titleWrap.appendChild(U.el('span', '', BRANCH_META[branch].name));
    titleRow.appendChild(titleWrap);
    panel.appendChild(titleRow);

    D.sigilsForBranch(branch).forEach((def) => {
      const owned = save.sigils.includes(def.id);
      const lockedByPrereq = def.requires && !save.sigils.includes(def.requires);
      const row = U.el('div', 'refitRow' + (owned ? ' refitOwned' : ''));
      row.appendChild(U.el('span', 'refitName', (owned ? '✔ ' : '') + def.name));
      row.appendChild(U.el('span', 'refitDesc', def.desc));
      if (!owned) {
        if (lockedByPrereq) {
          row.appendChild(U.el('span', 'maxedHint', '需先購買上一階'));
        } else {
          const canAfford = save.sigilPoints >= def.cost;
          const buyBtn = U.el('button', 'smallBtn' + (canAfford ? '' : ' disabled'), def.cost + ' 印記');
          U.onTap(buyBtn, () => {
            const r = Covenant.buySigil(save, def.id);
            if (r.ok) { Audio.play('upgrade'); FX.popButton(buyBtn); onChange(); } else { Audio.play('error'); Toast.toast(r.reason); }
          });
          row.appendChild(buyBtn);
        }
      }
      panel.appendChild(row);
    });
    container.appendChild(panel);
  }

  function render(container, save, onChange) {
    U.clearNode(container);

    const infoPanel = U.el('div', 'panel');
    infoPanel.appendChild(U.el('div', 'panelTitle', '深淵協約（已完成 ' + save.covenantCount + ' 次）'));
    infoPanel.appendChild(U.el('div', 'subHint', '深淵印記：' + save.sigilPoints));
    const eligible = Covenant.eligible(save);
    if (!eligible) {
      const B = D.BALANCE;
      infoPanel.appendChild(U.el('div', 'lockedHint',
        '門檻：轉生 ' + B.COVENANT_MIN_PRESTIGE_COUNT + ' 次以上，且史上最大深度達 ' + U.formatNum(B.COVENANT_MIN_DEPTH) + ' 公尺'));
      infoPanel.appendChild(U.el('div', 'subHint',
        '目前：轉生 ' + save.prestigeCount + ' 次／史上最大深度 ' + Math.floor(save.maxDepthEver) + ' m'));
    } else {
      const preview = Covenant.previewSigilPoints(save);
      infoPanel.appendChild(U.el('div', 'subHint', '締結協約可獲得深淵印記：' + preview));
      infoPanel.appendChild(U.el('div', 'subHint', '締結後會清空本輪進度、壓力核心與重構升級（印記與印記樹永久保留）'));
      const btn = U.el('button', 'prestigeBtn', '締結深淵協約');
      U.onTap(btn, () => {
        if (!window.confirm('締結深淵協約會清空壓力核心與重構升級，確定嗎？')) return;
        const r = Covenant.enact(save);
        if (r.ok) {
          Audio.play('prestige');
          FX.shake(document.getElementById('screens'), 6, 400);
          Toast.toast('締結深淵協約！獲得 ' + r.gained + ' 顆深淵印記');
          onChange();
        } else { Audio.play('error'); Toast.toast(r.reason); }
      });
      infoPanel.appendChild(btn);
    }
    container.appendChild(infoPanel);

    renderBranch(container, save, 'light', onChange);
    renderBranch(container, save, 'anchor', onChange);
    renderBranch(container, save, 'tide', onChange);
  }

  window.App.UI.CovenantScreen = { render };
})();
