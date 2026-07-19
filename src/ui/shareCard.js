/* ============================================================================
 * shareCard.js — 「潛航護照」：把目前進度畫成一張可下載分享的圖卡，全部用 canvas
 * 手繪（沿用 sprites.js 的色鍵網格＋pixelRenderer 的繪製函式），沒有任何外部
 * 圖片資產。純視覺，不含遊戲規則；沒有伺服器、沒有社群 API，就是產生一個
 * PNG data URL 讓瀏覽器下載。
 * ==========================================================================*/
(function () {
  const D = window.App.Data;
  const U = window.App.Utils;
  const PR = window.App.UI.PixelRenderer;
  const Econ = window.App.Systems.Economy;

  const W = 720;
  const H = 960;

  function drawBackground(ctx) {
    ctx.fillStyle = D.PALETTE.INK;
    ctx.fillRect(0, 0, W, H);
    // 淡淡的同心光暈，呼應潛航畫面的視覺語言。
    ctx.strokeStyle = D.PALETTE.GLOW;
    for (let i = 0; i < 3; i++) {
      ctx.globalAlpha = 0.08 - i * 0.02;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(W / 2, 210, 90 + i * 60, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  function drawHeader(ctx, save) {
    ctx.fillStyle = D.PALETTE.AMBER;
    ctx.font = 'bold 40px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('潛燈 DEEPLIGHT', W / 2, 90);
    ctx.fillStyle = D.PALETTE.TEXT;
    ctx.font = '20px sans-serif';
    ctx.fillText('潛航護照', W / 2, 128);

    const hull = D.SPRITES.hull;
    const scale = 6;
    PR.drawSprite(ctx, hull, W / 2 - (hull.w * scale) / 2, 150, scale);
  }

  function statRow(ctx, x, y, label, value) {
    ctx.textAlign = 'left';
    ctx.fillStyle = D.PALETTE.DIM;
    ctx.font = '18px sans-serif';
    ctx.fillText(label, x, y);
    ctx.textAlign = 'right';
    ctx.fillStyle = D.PALETTE.GLOW;
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText(value, x + 480, y);
  }

  function drawStats(ctx, save) {
    const zone = D.zoneForDepth(save.depth) || D.ZONE_DEFS[0];
    const gps = Econ.glowPerSec(save);
    const starTotal = Object.keys(save.bestiary).reduce((sum, id) => sum + Econ.bestiaryStarLevel(save.bestiary[id].seen || 0), 0);
    const rows = [
      ['目前海域', zone.name],
      ['史上最大深度', Math.floor(save.maxDepthEver) + ' m'],
      ['每秒螢光產量', U.formatRate(gps) + '/s'],
      ['深淵圖鑑', Object.keys(save.bestiary).length + ' / ' + D.CREATURE_DEFS.length + '（★' + starTotal + '）'],
      ['轉生次數', String(save.prestigeCount)],
      ['深淵協約', String(save.covenantCount)],
      ['深淵印記', save.sigils.length + ' / ' + D.SIGIL_DEFS.length],
      ['成就', save.achievements.length + ' / ' + D.ACHIEVEMENT_DEFS.length],
      ['潛航紀錄', save.milestonesClaimed.length + ' / ' + D.MILESTONE_DEFS.length],
      ['累計遊玩時間', Math.floor((save.stats.playSeconds || 0) / 60) + ' 分鐘']
    ];
    let y = 420;
    const x = W / 2 - 240;
    rows.forEach((row) => { statRow(ctx, x, y, row[0], row[1]); y += 42; });
  }

  function drawBestiaryStrip(ctx, save) {
    const seenIds = Object.keys(save.bestiary);
    if (seenIds.length === 0) return;
    const sample = seenIds.slice(-6);
    const scale = 3;
    const gap = 16;
    const totalWidth = sample.reduce((w, id) => w + D.SPRITES[D.creatureById(id).icon].w * scale + gap, 0) - gap;
    let x = W / 2 - totalWidth / 2;
    const y = 860;
    sample.forEach((id) => {
      const def = D.creatureById(id);
      const sprite = D.SPRITES[def.icon];
      PR.drawSprite(ctx, sprite, x, y, scale);
      x += sprite.w * scale + gap;
    });
  }

  function drawFooter(ctx) {
    ctx.textAlign = 'center';
    ctx.fillStyle = D.PALETTE.DIM;
    ctx.font = '14px sans-serif';
    ctx.fillText('deeplight — 100% 離線可玩的深海放置遊戲', W / 2, 930);
  }

  /** 產生護照 PNG 並觸發瀏覽器下載，回傳 dataURL 供呼叫端另作他用（例如預覽）。 */
  function generateAndDownload(save) {
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    drawBackground(ctx);
    drawHeader(ctx, save);
    drawStats(ctx, save);
    drawBestiaryStrip(ctx, save);
    drawFooter(ctx);

    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = 'deeplight-潛航護照-' + Math.floor(save.maxDepthEver) + 'm.png';
    document.body.appendChild(a);
    a.click();
    a.remove();
    return dataUrl;
  }

  window.App.UI.ShareCard = { generateAndDownload };
})();
