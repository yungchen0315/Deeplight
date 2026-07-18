/* ============================================================================
 * topBar.js — 頂欄常駐狀態：螢光總量/秒、深度、樣本、核心、珍珠、加護倒數、
 * 設定齒輪按鈕。
 * ==========================================================================*/
(function () {
  const U = window.App.Utils;
  const Econ = window.App.Systems.Economy;
  const PR = window.App.UI.PixelRenderer;

  let gearBound = false;

  function ensureGearButton(onOpenSettings) {
    if (gearBound) return;
    gearBound = true;
    const bar = document.getElementById('topBar');
    if (!bar) return;
    const btn = U.el('button', 'gearBtn');
    btn.appendChild(PR.spriteCanvasEl('icon_gear', 2));
    bar.appendChild(btn);
    U.onTap(btn, () => onOpenSettings());
  }

  function refresh(save) {
    const gps = Econ.glowPerSec(save);
    document.getElementById('topGlow').textContent = U.formatNum(save.glow);
    document.getElementById('topGlowRate').textContent = U.formatRate(gps) + '/s';
    document.getElementById('topDepth').textContent = Math.floor(save.depth) + ' m';
    document.getElementById('topSamples').textContent = save.samples;

    const coresEl = document.getElementById('topCores');
    if (coresEl) coresEl.textContent = save.cores;
    const pearlsEl = document.getElementById('topPearls');
    if (pearlsEl) pearlsEl.textContent = save.pearls;

    const boostEl = document.getElementById('topBoost');
    if (boostEl) {
      const remainMs = (save.boostUntil || 0) - Date.now();
      if (remainMs > 0) {
        const mins = Math.ceil(remainMs / 60000);
        const h = Math.floor(mins / 60), m = mins % 60;
        boostEl.textContent = '⚡x2 ' + (h > 0 ? h + 'h' : '') + m + 'm';
        boostEl.style.display = 'inline-flex';
      } else {
        boostEl.style.display = 'none';
      }
    }
  }

  window.App.UI.TopBar = { refresh, ensureGearButton };
})();
