/* ============================================================================
 * nodeDetailModal.js — 研究／重構／印記／盟約節點共用的詳細彈窗：名稱、效果
 * 描述、成本、風味文字（各自 defs 檔案的 lore）。跟 moduleDetailModal.js／
 * bestiaryDetailModal.js 是同一套「點名稱看細節」的設計語言。
 * ==========================================================================*/
(function () {
  const U = window.App.Utils;
  const Modals = window.App.UI.Modals;

  /** def: { name, desc, cost }；costLabel 例如 'SP'／'核心'／'印記'／'夜輝'。 */
  function open(def, costLabel) {
    Modals.showModal((box, close) => {
      box.appendChild(U.el('div', 'modalTitle', def.name));
      box.appendChild(U.el('div', 'modalLine', def.desc));
      box.appendChild(U.el('div', 'modalLine', '成本：' + def.cost + ' ' + costLabel));
      if (def.lore) box.appendChild(U.el('div', 'compendiumLine bestiaryLore', def.lore));
      const btn = U.el('button', 'modalBtn', '關閉');
      U.onTap(btn, close);
      box.appendChild(btn);
    });
  }

  window.App.UI.NodeDetailModal = { open };
})();
