/* ============================================================================
 * fx.js — 畫面回饋層：數字彈出、像素粒子爆發、畫面震動。所有函式在「減少動態」
 * 開啟時（設定或系統偏好）直接 no-op，不畫任何動畫。純視覺，不含遊戲規則。
 * ==========================================================================*/
(function () {
  const U = window.App.Utils;
  const D = window.App.Data;

  let reduced = false;

  function syncSettings(save) {
    const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    reduced = !!(save.settings.reducedMotion || prefersReduced);
  }

  /** 在 container 內指定百分比座標彈出一個文字（螢光獲得量等），往上飄並淡出。 */
  function popNumber(container, xPct, yPct, text, cls) {
    if (!container) return;
    if (reduced) return;
    const node = U.el('div', 'popNum' + (cls ? ' ' + cls : ''), text);
    node.style.left = xPct + '%';
    node.style.top = yPct + '%';
    container.appendChild(node);
    setTimeout(() => node.remove(), 750);
  }

  /** 在 container 內指定百分比座標炸開 count 個像素色塊，色鍵取自 PALETTE。 */
  function burst(container, xPct, yPct, colorKey, count) {
    if (!container) return;
    if (reduced) { return; }
    const color = D.PALETTE[colorKey] || D.PALETTE.GLOW;
    const rect = container.getBoundingClientRect();
    const originX = (xPct / 100) * rect.width;
    const originY = (yPct / 100) * rect.height;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const dist = 18 + Math.random() * 26;
      const dx = Math.cos(angle) * dist;
      const dy = Math.sin(angle) * dist;
      const p = document.createElement('div');
      p.className = 'fxParticle';
      p.style.left = originX + 'px';
      p.style.top = originY + 'px';
      p.style.background = color;
      p.style.setProperty('--dx', dx + 'px');
      p.style.setProperty('--dy', dy + 'px');
      container.appendChild(p);
      setTimeout(() => p.remove(), 650);
    }
  }

  /** 對任意元素（通常是 #screens）套用短暫震動；intensity 為位移像素。 */
  function shake(target, intensity, ms) {
    if (!target) return;
    if (reduced) return;
    target.style.setProperty('--shakeAmt', intensity + 'px');
    target.classList.remove('fxShake');
    // 強制 reflow 讓同一個 class 可以重新觸發動畫。
    void target.offsetWidth;
    target.classList.add('fxShake');
    setTimeout(() => target.classList.remove('fxShake'), ms);
  }

  /** 按鈕成功操作時的輕量回饋（縮放彈跳），呼叫端自行決定何時加上。 */
  function popButton(el) {
    if (!el || reduced) return;
    el.classList.remove('btnPop');
    void el.offsetWidth;
    el.classList.add('btnPop');
  }

  window.App.UI.FX = { syncSettings, popNumber, burst, shake, popButton };
})();
