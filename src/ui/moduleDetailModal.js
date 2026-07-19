/* ============================================================================
 * moduleDetailModal.js — 點擊模組列表的圖示或名稱時彈出的詳細卡片：放大版
 * sprite、解鎖深度、基礎成本／產量、風味文字（moduleDefs.js 的 lore）。
 * ==========================================================================*/
(function () {
  const U = window.App.Utils;
  const PR = window.App.UI.PixelRenderer;
  const Modals = window.App.UI.Modals;

  function open(def) {
    Modals.showModal((box, close) => {
      box.appendChild(U.el('div', 'modalTitle', def.name));
      const iconWrap = U.el('div', 'discoveryIconWrap');
      iconWrap.appendChild(PR.spriteCanvasEl(def.icon, 5));
      box.appendChild(iconWrap);
      box.appendChild(U.el('div', 'modalLine', '解鎖深度：' + (def.unlockDepth > 0 ? def.unlockDepth + ' m' : '開局即可用')));
      box.appendChild(U.el('div', 'modalLine', '基礎成本：' + U.formatNum(def.baseCost) + '　基礎產量：' + U.formatRate(def.baseProd) + '/s'));
      if (def.lore) box.appendChild(U.el('div', 'compendiumLine bestiaryLore', def.lore));
      const btn = U.el('button', 'modalBtn', '關閉');
      U.onTap(btn, close);
      box.appendChild(btn);
    });
  }

  window.App.UI.ModuleDetailModal = { open };
})();
