/* ============================================================================
 * captainLogModal.js — 「潛航日誌」彈窗：依時間順序列出 logDefs.js 的敘事條目，
 * 已解鎖的顯示全文，未解鎖的只顯示標題輪廓＋鎖頭，避免暴露劇透。由設定彈窗的
 * 「潛航日誌」按鈕開啟，跟 compendiumModal.js／eventLogModal.js 同一套「可捲動
 * 手冊」設計語言。
 * ==========================================================================*/
(function () {
  const U = window.App.Utils;
  const D = window.App.Data;

  function open(save) {
    const overlay = document.getElementById('modalOverlay');
    U.clearNode(overlay);
    const box = U.el('div', 'modalBox compendiumBox');
    function close() { overlay.style.display = 'none'; U.clearNode(overlay); }

    const unlocked = save.captainLog.unlockedIds;
    box.appendChild(U.el('div', 'modalTitle', '潛航日誌（' + unlocked.length + ' / ' + D.LOG_DEFS.length + '）'));
    const scroll = U.el('div', 'compendiumScroll');
    D.LOG_DEFS.forEach((entry) => {
      const isUnlocked = unlocked.includes(entry.id);
      const sectionEl = U.el('div', 'compendiumSection');
      sectionEl.appendChild(U.el('div', 'compendiumSectionTitle', isUnlocked ? entry.title : '🔒 尚未解鎖'));
      if (isUnlocked) sectionEl.appendChild(U.el('div', 'compendiumLine bestiaryLore', entry.body));
      scroll.appendChild(sectionEl);
    });
    box.appendChild(scroll);

    const closeBtn = U.el('button', 'modalBtn', '關閉');
    U.onTap(closeBtn, close);
    box.appendChild(closeBtn);

    overlay.appendChild(box);
    overlay.style.display = 'flex';
  }

  window.App.UI.CaptainLogModal = { open };
})();
