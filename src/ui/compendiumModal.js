/* ============================================================================
 * compendiumModal.js — 「遊戲說明」彈窗：把 compendiumDefs.js 的內容渲染成可
 * 捲動的參考手冊，由設定彈窗的「遊戲說明」按鈕開啟。
 * ==========================================================================*/
(function () {
  const U = window.App.Utils;
  const D = window.App.Data;

  function open() {
    const overlay = document.getElementById('modalOverlay');
    U.clearNode(overlay);
    const box = U.el('div', 'modalBox compendiumBox');
    function close() { overlay.style.display = 'none'; U.clearNode(overlay); }

    box.appendChild(U.el('div', 'modalTitle', '遊戲說明'));
    const scroll = U.el('div', 'compendiumScroll');
    D.COMPENDIUM_SECTIONS.forEach((section) => {
      const sectionEl = U.el('div', 'compendiumSection');
      sectionEl.appendChild(U.el('div', 'compendiumSectionTitle', section.title));
      section.lines.forEach((line) => sectionEl.appendChild(U.el('div', 'compendiumLine', line)));
      scroll.appendChild(sectionEl);
    });
    box.appendChild(scroll);

    const closeBtn = U.el('button', 'modalBtn', '關閉');
    U.onTap(closeBtn, close);
    box.appendChild(closeBtn);

    overlay.appendChild(box);
    overlay.style.display = 'flex';
  }

  window.App.UI.CompendiumModal = { open };
})();
