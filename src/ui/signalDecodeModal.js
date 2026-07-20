/* ============================================================================
 * signalDecodeModal.js — 「訊號解碼」彈窗：依序列出已收集的深淵訊號殘片全文，
 * 未收集的只顯示序號＋鎖頭，不暴雷。跟 captainLogModal.js 同一套設計語言，由
 * 設定彈窗的「訊號解碼」按鈕開啟。
 * ==========================================================================*/
(function () {
  const U = window.App.Utils;
  const D = window.App.Data;

  function open(save) {
    const overlay = document.getElementById('modalOverlay');
    U.clearNode(overlay);
    const box = U.el('div', 'modalBox compendiumBox');
    function close() { overlay.style.display = 'none'; U.clearNode(overlay); }

    const collected = save.signalFragments || [];
    box.appendChild(U.el('div', 'modalTitle', '訊號解碼（' + collected.length + ' / ' + D.SIGNAL_FRAGMENT_DEFS.length + '）'));
    box.appendChild(U.el('div', 'subHint', '深淵裡偶爾會漂來一段不屬於任何已知生物的訊號——收集齊全部殘片，看看它到底想說什麼。'));
    const scroll = U.el('div', 'compendiumScroll');
    D.signalsInOrder().forEach((def) => {
      const isCollected = collected.includes(def.id);
      const sectionEl = U.el('div', 'compendiumSection');
      sectionEl.appendChild(U.el('div', 'compendiumSectionTitle', '殘片 ' + def.order));
      sectionEl.appendChild(U.el('div', isCollected ? 'signalFragmentText' : 'subHint', isCollected ? def.text : '🔒 尚未收集'));
      scroll.appendChild(sectionEl);
    });
    box.appendChild(scroll);

    const closeBtn = U.el('button', 'modalBtn', '關閉');
    U.onTap(closeBtn, close);
    box.appendChild(closeBtn);

    overlay.appendChild(box);
    overlay.style.display = 'flex';
  }

  window.App.UI.SignalDecodeModal = { open };
})();
