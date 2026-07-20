/* ============================================================================
 * pactScreen.js — 「盟約」分頁：永夜盟約（第三層轉生）狀態與盟約樹（4 分支 × 3
 * 階）。門檻比深淵協約更高，見 balance.js 的 PACT_* 常數。
 * ==========================================================================*/
(function () {
  const U = window.App.Utils;
  const D = window.App.Data;
  const Pact = window.App.Systems.Pact;
  const Toast = window.App.UI.Toast;
  const Audio = window.App.Systems.Audio;
  const FX = window.App.UI.FX;
  const Modals = window.App.UI.Modals;

  const BRANCH_NAMES = { echo: '星塵回聲', anchor2: '永夜壓艙', tide2: '虛空潮汐', compass: '星海羅盤' };

  function renderBranch(container, save, branch, onChange) {
    const panel = U.el('div', 'panel');
    panel.appendChild(U.el('div', 'panelTitle', BRANCH_NAMES[branch]));
    D.pactsForBranch(branch).forEach((def) => {
      const owned = save.nightPactNodes.includes(def.id);
      const branchNodes = D.pactsForBranch(branch);
      const idx = branchNodes.findIndex((n) => n.id === def.id);
      const lockedByPrereq = idx > 0 && !save.nightPactNodes.includes(branchNodes[idx - 1].id);
      const row = U.el('div', 'refitRow' + (owned ? ' refitOwned' : ''));
      const nameEl = U.el('span', 'refitName tapDetail', (owned ? '✔ ' : '') + def.name);
      U.onTap(nameEl, () => window.App.UI.NodeDetailModal.open(def, '夜輝'));
      row.appendChild(nameEl);
      row.appendChild(U.el('span', 'refitDesc', def.desc));
      if (!owned) {
        if (lockedByPrereq) {
          row.appendChild(U.el('span', 'maxedHint', '需先購買上一階'));
        } else {
          const canAfford = save.nightshards >= def.cost;
          const buyBtn = U.el('button', 'smallBtn' + (canAfford ? '' : ' disabled'), def.cost + ' 夜輝');
          U.onTap(buyBtn, () => {
            const r = Pact.buyNode(save, def.id);
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
    infoPanel.appendChild(U.el('div', 'panelTitle', '永夜盟約（已完成 ' + save.pactCount + ' 次）'));
    infoPanel.appendChild(U.el('div', 'subHint', '夜輝：' + save.nightshards));
    const eligible = Pact.eligible(save);
    if (!eligible) {
      const B = D.BALANCE;
      infoPanel.appendChild(U.el('div', 'lockedHint',
        '門檻：深淵協約 ' + B.PACT_MIN_COVENANT_COUNT + ' 次以上，且史上最大深度達 ' + U.formatNum(B.PACT_MIN_DEPTH) + ' 公尺'));
      infoPanel.appendChild(U.el('div', 'subHint',
        '目前：深淵協約 ' + save.covenantCount + ' 次／史上最大深度 ' + Math.floor(save.maxDepthEver) + ' m'));
    } else {
      const preview = Pact.previewNightshards(save);
      infoPanel.appendChild(U.el('div', 'subHint', '締結盟約可獲得夜輝：' + preview));
      infoPanel.appendChild(U.el('div', 'subHint', '締結後會連同協約層一起清空（核心／重構／印記／印記點數），盟約樹本身永久保留'));
      const btn = U.el('button', 'prestigeBtn', '締結永夜盟約');
      U.onTap(btn, () => {
        Modals.showConfirm('締結永夜盟約會清空深淵印記與印記點數（除非已點「傳承」），確定嗎？', () => {
          const r = Pact.enact(save);
          if (r.ok) {
            Audio.play('prestige');
            FX.shake(document.getElementById('screens'), 6, 400);
            Toast.toast('締結永夜盟約！獲得 ' + r.gained + ' 顆夜輝');
            onChange();
          } else { Audio.play('error'); Toast.toast(r.reason); }
        }, { title: '締結永夜盟約', confirmLabel: '締結' });
      });
      infoPanel.appendChild(btn);
    }
    container.appendChild(infoPanel);

    renderBranch(container, save, 'echo', onChange);
    renderBranch(container, save, 'anchor2', onChange);
    renderBranch(container, save, 'tide2', onChange);
    renderBranch(container, save, 'compass', onChange);
  }

  window.App.UI.PactScreen = { render };
})();
