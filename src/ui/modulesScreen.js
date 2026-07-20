/* ============================================================================
 * modulesScreen.js — 「模組」分頁：壓載升級 + 發光模組購買／升級列表，支援
 * x1／x10／xMax 批量購買。
 * ==========================================================================*/
(function () {
  const U = window.App.Utils;
  const D = window.App.Data;
  const PR = window.App.UI.PixelRenderer;
  const Econ = window.App.Systems.Economy;
  const Toast = window.App.UI.Toast;
  const Audio = window.App.Systems.Audio;
  const FX = window.App.UI.FX;

  let buyQty = 1; // 1 | 10 | 'max'，畫面切換分頁時重置，不存檔。

  function render(container, save, onChange) {
    U.clearNode(container);

    const eff = Econ.computeEffects(save);

    const ballastPanel = U.el('div', 'panel');
    ballastPanel.appendChild(U.el('div', 'panelTitle', '壓載系統'));
    const rate = Econ.descentRate(save);
    const ballastMax = Econ.effectiveBallastMax(save, eff);
    const row = U.el('div', 'ballastRow');
    row.appendChild(U.el('span', '', '下潛速度：' + rate.toFixed(1) + ' m/min（Lv.' + save.ballastLevel + '/' + ballastMax + '）'));
    const ballastCost = Econ.ballastCost(save, eff);
    if (ballastCost !== null) {
      const btn = U.el('button', 'smallBtn' + (save.glow < ballastCost ? ' disabled' : ''), '升級 · ' + U.formatNum(ballastCost));
      U.onTap(btn, () => {
        const r = Econ.buyBallast(save);
        if (r.ok) { Audio.play('buy'); FX.popButton(btn); onChange(); } else { Audio.play('error'); Toast.toast(r.reason); }
      });
      row.appendChild(btn);
    } else {
      row.appendChild(U.el('span', 'maxedHint', '已達最高等級'));
    }
    ballastPanel.appendChild(row);
    container.appendChild(ballastPanel);

    // 產量加成總覽：模組列表的「單體 X/s」已經套用這兩個倍率，這裡明確標出來，
    // 避免玩家自己心算「單體 × 持有數」卻對不上頂欄總產量。
    const zoneForMult = D.zoneById(save.currentZone) || D.ZONE_DEFS[0];
    const prodPanel = U.el('div', 'panel');
    prodPanel.appendChild(U.el('div', 'panelTitle', '目前產量加成'));
    prodPanel.appendChild(U.el('div', 'subHint',
      '海域倍率 ×' + U.formatNum(zoneForMult.mult) + '　全域加成 ×' + eff.allProdMult.toFixed(2) +
      '（下方「單體」數字已經套用這兩項，直接乘上持有數即為該模組目前對頂欄總產量的貢獻）'));
    container.appendChild(prodPanel);

    const listPanel = U.el('div', 'panel');
    const titleRow = U.el('div', 'panelTitleRow');
    titleRow.appendChild(U.el('div', 'panelTitle', '發光模組'));
    const qtyToggle = U.el('div', 'qtyToggle');
    [1, 10, 'max'].forEach((q) => {
      const b = U.el('button', 'qtyBtn' + (buyQty === q ? ' qtyActive' : ''), q === 'max' ? 'xMax' : 'x' + q);
      U.onTap(b, () => { buyQty = q; render(container, save, onChange); });
      qtyToggle.appendChild(b);
    });
    const buyAllBtn = U.el('button', 'qtyBtn', '一鍵買滿');
    U.onTap(buyAllBtn, () => {
      const r = Econ.buyAllAffordable(save);
      if (r.ok) {
        Audio.play('buy'); FX.popButton(buyAllBtn);
        Toast.toast('買了 ' + r.totalQty + ' 個模組，花費 ' + U.formatNum(r.totalCost) + ' 螢光');
        onChange();
      } else { Audio.play('error'); Toast.toast(r.reason); }
    });
    qtyToggle.appendChild(buyAllBtn);
    titleRow.appendChild(qtyToggle);
    listPanel.appendChild(titleRow);

    D.MODULE_DEFS.forEach((def) => {
      const state = save.modules[def.id] || { count: 0, upgradeTier: 0 };
      const locked = save.depth < def.unlockDepth && state.count === 0;
      if (locked) {
        listPanel.appendChild(U.el('div', 'moduleLockedHint', '深度達 ' + def.unlockDepth + 'm 解鎖：' + def.name));
        return;
      }

      const row = U.el('div', 'moduleRow');
      const infoWrap = U.el('div', 'moduleInfoWrap');
      infoWrap.appendChild(PR.spriteCanvasEl(def.icon, 2));
      const info = U.el('div', 'moduleInfo');
      info.appendChild(U.el('div', 'moduleName', def.name + '（持有 ' + state.count + '）'));
      const unitProd = Econ.effectiveModuleUnitProd(save, eff, def.id);
      info.appendChild(U.el('div', 'moduleSub', '單體 ' + U.formatRate(unitProd) + '/s'));
      infoWrap.appendChild(info);
      U.onTap(infoWrap, () => window.App.UI.ModuleDetailModal.open(def));
      row.appendChild(infoWrap);

      const qty = buyQty === 'max' ? Econ.maxAffordableQty(save, def.id) : buyQty;
      const cost = Econ.moduleCostForQty(save, def.id, qty || 1);
      const affordable = qty > 0 && save.glow >= cost;
      const label = (buyQty === 'max' ? 'x' + Math.max(qty, 0) + ' · ' : 'x' + buyQty + ' · ') + U.formatNum(cost);
      const buyBtn = U.el('button', 'smallBtn' + (affordable ? '' : ' disabled'), label);
      U.onTap(buyBtn, () => {
        const r = Econ.buyModule(save, def.id, buyQty);
        if (r.ok) { Audio.play('buy'); FX.popButton(buyBtn); onChange(); } else { Audio.play('error'); Toast.toast(r.reason); }
      });
      row.appendChild(buyBtn);
      listPanel.appendChild(row);

      const upgradeInfo = Econ.moduleUpgradeInfo(save, def.id, eff);
      if (upgradeInfo && upgradeInfo.unlocked) {
        const upRow = U.el('div', 'moduleUpgradeRow');
        upRow.appendChild(U.el('span', '', '升級 ×2 產量（' + (upgradeInfo.tier + 1) + '/' + D.BALANCE.MODULE_UPGRADE_THRESHOLDS.length + '）'));
        const upBtn = U.el('button', 'smallBtn' + (save.glow < upgradeInfo.cost ? ' disabled' : ''), U.formatNum(upgradeInfo.cost));
        U.onTap(upBtn, () => {
          const r = Econ.buyModuleUpgrade(save, def.id);
          if (r.ok) { Audio.play('upgrade'); FX.popButton(upBtn); onChange(); } else { Audio.play('error'); Toast.toast(r.reason); }
        });
        upRow.appendChild(upBtn);
        listPanel.appendChild(upRow);
      } else if (upgradeInfo && !upgradeInfo.unlocked) {
        listPanel.appendChild(U.el('div', 'moduleUpgradeHint', '持有 ' + upgradeInfo.threshold + ' 個解鎖下一階升級'));
      }
    });
    container.appendChild(listPanel);
  }

  window.App.UI.ModulesScreen = { render };
})();
