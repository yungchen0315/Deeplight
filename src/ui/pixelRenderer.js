/* ============================================================================
 * pixelRenderer.js — 把 data/sprites.js 的色鍵網格畫到 canvas 上，整數倍放大，
 * 關閉平滑避免糊化。純渲染，不含任何遊戲規則。
 * ==========================================================================*/
(function () {
  const PALETTE = window.App.Data.PALETTE;

  function setupPixelCanvas(canvas) {
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    return ctx;
  }

  /** 把一張 sprite 畫在 (x,y) 像素座標，scale 為整數放大倍率。 */
  function drawSprite(ctx, sprite, x, y, scale) {
    const { w, h, grid } = sprite;
    for (let row = 0; row < h; row++) {
      const gridRow = grid[row];
      for (let col = 0; col < w; col++) {
        const key = gridRow[col];
        if (!key) continue;
        ctx.fillStyle = PALETTE[key] || '#fff';
        ctx.fillRect(Math.round(x + col * scale), Math.round(y + row * scale), scale, scale);
      }
    }
  }

  function spriteSize(sprite, scale) { return { w: sprite.w * scale, h: sprite.h * scale }; }

  /** 建立一個小型 canvas 元素，直接畫上指定 sprite（供 UI 清單裡的小圖示使用）。 */
  function spriteCanvasEl(spriteId, scale) {
    const sprite = window.App.Data.SPRITES[spriteId];
    const canvas = document.createElement('canvas');
    canvas.className = 'pixelIcon';
    canvas.width = sprite.w * scale;
    canvas.height = sprite.h * scale;
    const ctx = setupPixelCanvas(canvas);
    drawSprite(ctx, sprite, 0, 0, scale);
    return canvas;
  }

  /** 跟 spriteCanvasEl 一樣，但如果該 sprite 有 frame1（第二幀），疊兩張 canvas
   *  用純 CSS steps() 動畫交替顯示，做出簡單的游動擺尾效果——不需要 JS 計時器，
   *  節點被移除時動畫自然跟著消失，沒有額外的清理負擔。沒有 frame1 的 sprite
   *  就直接退化成靜態的 spriteCanvasEl。 */
  function animatedSpriteCanvasEl(spriteId, scale) {
    const sprite = window.App.Data.SPRITES[spriteId];
    if (!sprite.frame1) return spriteCanvasEl(spriteId, scale);

    const wrap = document.createElement('div');
    wrap.className = 'spriteAnimWrap';
    wrap.style.width = (sprite.w * scale) + 'px';
    wrap.style.height = (sprite.h * scale) + 'px';

    const base = spriteCanvasEl(spriteId, scale);
    wrap.appendChild(base);

    const overlay = document.createElement('canvas');
    overlay.className = 'pixelIcon spriteFrame1';
    overlay.width = sprite.w * scale;
    overlay.height = sprite.h * scale;
    const ctx = setupPixelCanvas(overlay);
    drawSprite(ctx, { w: sprite.w, h: sprite.h, grid: sprite.frame1 }, 0, 0, scale);
    wrap.appendChild(overlay);

    return wrap;
  }

  window.App.UI.PixelRenderer = { setupPixelCanvas, drawSprite, spriteSize, spriteCanvasEl, animatedSpriteCanvasEl };
})();
