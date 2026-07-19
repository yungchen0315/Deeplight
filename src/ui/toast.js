/* ============================================================================
 * toast.js — 畫面底部短暫提示訊息（購買失敗原因、成就解鎖等）。同時觸發多則
 * 成就/里程碑時（例如一鍵買滿模組跨過好幾個持有數門檻），不排隊限制的話會在
 * 畫面上疊出一長串 toast 蓋住其他 UI，所以這裡限制「同時最多顯示 N 則」，其餘
 * 進佇列，前面的訊息淡出後才依序補上。
 * ==========================================================================*/
(function () {
  const U = window.App.Utils;
  const MAX_VISIBLE = 3;
  const SHOW_MS = 2200;
  const FADE_MS = 300;

  let visibleCount = 0;
  const queue = [];

  function displayNext() {
    if (visibleCount >= MAX_VISIBLE || queue.length === 0) return;
    const message = queue.shift();
    const box = document.getElementById('toastBox');
    if (!box) return;
    visibleCount += 1;
    const node = U.el('div', 'toastMsg', message);
    box.appendChild(node);
    requestAnimationFrame(() => node.classList.add('toastShow'));
    setTimeout(() => {
      node.classList.remove('toastShow');
      setTimeout(() => {
        node.remove();
        visibleCount -= 1;
        displayNext();
      }, FADE_MS);
    }, SHOW_MS);
  }

  function toast(message) {
    queue.push(message);
    displayNext();
  }

  window.App.UI.Toast = { toast };
})();
