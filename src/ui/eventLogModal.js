/* ============================================================================
 * eventLogModal.js — 顯示 eventLogSystem 記錄的重大事件時間軸，由設定彈窗的
 * 「事件紀錄」按鈕開啟，最新的事件排在最上面。
 * ==========================================================================*/
(function () {
  const U = window.App.Utils;
  const EventLog = window.App.Systems.EventLog;

  function formatTime(ts) {
    const d = new Date(ts);
    return d.getFullYear() + '/' + String(d.getMonth() + 1).padStart(2, '0') + '/' + String(d.getDate()).padStart(2, '0') +
      ' ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  }

  function open(save) {
    const overlay = document.getElementById('modalOverlay');
    U.clearNode(overlay);
    const box = U.el('div', 'modalBox compendiumBox');
    function close() { overlay.style.display = 'none'; U.clearNode(overlay); }

    box.appendChild(U.el('div', 'modalTitle', '事件紀錄'));
    const scroll = U.el('div', 'compendiumScroll');
    const entries = EventLog.recent(save);
    if (entries.length === 0) {
      scroll.appendChild(U.el('div', 'subHint', '還沒有任何重大事件——去下潛、轉生、解成就看看吧。'));
    } else {
      entries.forEach((entry) => {
        const row = U.el('div', 'eventLogRow');
        row.appendChild(U.el('div', 'eventLogTime', formatTime(entry.ts)));
        row.appendChild(U.el('div', 'eventLogMessage', entry.message));
        scroll.appendChild(row);
      });
    }
    box.appendChild(scroll);

    const closeBtn = U.el('button', 'modalBtn', '關閉');
    U.onTap(closeBtn, close);
    box.appendChild(closeBtn);

    overlay.appendChild(box);
    overlay.style.display = 'flex';
  }

  window.App.UI.EventLogModal = { open };
})();
