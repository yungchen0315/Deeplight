/* ============================================================================
 * modals.js — 全螢幕彈窗：潛航報告（離線回訪）、新發現卡片（首次記錄生物）。
 * v1 只有這兩種模態層，其餘一律用 toast。
 * ==========================================================================*/
(function () {
  const U = window.App.Utils;
  const PR = window.App.UI.PixelRenderer;

  function showModal(buildContent) {
    const overlay = document.getElementById('modalOverlay');
    U.clearNode(overlay);
    const box = U.el('div', 'modalBox');
    function close() { overlay.style.display = 'none'; U.clearNode(overlay); }
    buildContent(box, close);
    overlay.appendChild(box);
    overlay.style.display = 'flex';
    return close;
  }

  function showOfflineReport(report, onClose) {
    const Audio = window.App.Systems.Audio;
    if (Audio) Audio.play('discovery');
    showModal((box, close) => {
      box.appendChild(U.el('div', 'modalTitle', '潛航報告'));
      box.appendChild(U.el('div', 'modalLine', '離線時間：' + U.formatDurationWords(report.elapsedMs)));
      box.appendChild(U.el('div', 'modalLine', '獲得螢光：+' + U.formatNum(report.glowGained)));
      box.appendChild(U.el('div', 'modalLine', '下潛深度：+' + Math.round(report.depthGained) + ' 公尺'));
      if (report.missedCount > 0) {
        box.appendChild(U.el('div', 'modalLine modalHighlight', '有 ' + report.missedCount + ' 隻生物趁你不在時游過，回潛航畫面點擊領取'));
      }
      const btn = U.el('button', 'modalBtn', '知道了');
      U.onTap(btn, () => { close(); if (onClose) onClose(); });
      box.appendChild(btn);
    });
  }

  function showDiscoveryCard(creatureDef, onClose) {
    showModal((box, close) => {
      box.appendChild(U.el('div', 'modalTitle', '新發現！'));
      const iconWrap = U.el('div', 'discoveryIconWrap');
      iconWrap.appendChild(PR.spriteCanvasEl(creatureDef.icon, 6));
      box.appendChild(iconWrap);
      box.appendChild(U.el('div', 'modalLine discoveryName', creatureDef.name + (creatureDef.rare ? '　★稀有' : '')));
      box.appendChild(U.el('div', 'modalLine', '已記錄進深淵圖鑑。多次目擊同一種生物會提升牠的圖鑑星級，永久增加全螢光產量'));
      const btn = U.el('button', 'modalBtn', '太好了');
      U.onTap(btn, () => { close(); if (onClose) onClose(); });
      box.appendChild(btn);
    });
  }

  /** 通用確認彈窗，取代原生 window.confirm——原生對話框在部分 WebView/TWA 包裝下
   *  樣式不一致、也打斷遊戲的沉浸感，統一用同一套 modal 樣式呈現。 */
  function showConfirm(message, onConfirm, opts) {
    opts = opts || {};
    showModal((box, close) => {
      box.appendChild(U.el('div', 'modalTitle', opts.title || '請確認'));
      box.appendChild(U.el('div', 'modalLine', message));
      const confirmBtn = U.el('button', 'modalBtn' + (opts.danger ? ' dangerBtn' : ''), opts.confirmLabel || '確定');
      U.onTap(confirmBtn, () => { close(); onConfirm(); });
      box.appendChild(confirmBtn);
      const cancelBtn = U.el('button', 'modalBtn', opts.cancelLabel || '取消');
      U.onTap(cancelBtn, () => { close(); if (opts.onCancel) opts.onCancel(); });
      box.appendChild(cancelBtn);
    });
  }

  const WELCOME_PAGES = [
    { title: '歡迎來到潛燈號', lines: ['你是深海觀測站「潛燈號」的站長。', '唯一的任務：不斷往下潛，越深越黑，你的燈就照得越亮。'], navHighlight: 'dive' },
    { title: '採集螢光', lines: ['點擊水域可以手動採集螢光。', '螢光是主要貨幣，用來購買發光模組——它們會自動、持續地產出螢光。'], navHighlight: 'modules' },
    { title: '路過的生物', lines: ['深海生物會不時游過畫面，點擊牠們有豐厚的爆發獎勵，', '首次記錄某種生物還會獲得「樣本」，可在「研究」頁換取永久強化。'], navHighlight: 'research' },
    { title: '重返海面', lines: ['潛得夠深後，可以在「海面」頁「重返海面」轉生，', '換取永久的壓力核心加成，下一輪就能潛得更深、更快。'], navHighlight: 'surface' }
  ];

  /** 依目前教學頁面在底部導覽對應的分頁按鈕上加一圈提示光框，讓玩家一眼看出
   *  「等一下該點哪裡」，而不用自己對照文字描述去找按鈕在哪。 */
  function setNavTutorialHighlight(screenId) {
    const FX = window.App.UI.FX;
    document.querySelectorAll('#bottomNav .navBtn').forEach((b) => {
      b.classList.remove('navTutorialHighlight', 'navTutorialPulse');
    });
    if (!screenId) return;
    const btn = document.querySelector('#bottomNav .navBtn[data-screen="' + screenId + '"]');
    if (!btn) return;
    btn.classList.add('navTutorialHighlight');
    if (!FX || !FX.isReduced()) btn.classList.add('navTutorialPulse');
  }

  function showWelcome(onDone) {
    let page = 0;
    function renderPage() {
      showModal((box, close) => {
        const p = WELCOME_PAGES[page];
        setNavTutorialHighlight(p.navHighlight);
        box.appendChild(U.el('div', 'modalTitle', p.title));
        p.lines.forEach((line) => box.appendChild(U.el('div', 'modalLine', line)));
        box.appendChild(U.el('div', 'subHint', (page + 1) + ' / ' + WELCOME_PAGES.length));
        const isLast = page === WELCOME_PAGES.length - 1;
        const btn = U.el('button', 'modalBtn', isLast ? '開始探索' : '下一步');
        U.onTap(btn, () => {
          close();
          if (isLast) { setNavTutorialHighlight(null); if (onDone) onDone(); return; }
          page += 1;
          renderPage();
        });
        box.appendChild(btn);
      });
    }
    renderPage();
  }

  window.App.UI.Modals = { showModal, showOfflineReport, showDiscoveryCard, showWelcome, showConfirm };
})();
