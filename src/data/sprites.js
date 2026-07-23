/* ============================================================================
 * sprites.js — 全部像素圖資料。每張 sprite 是一個 w×h 的色鍵網格（值為
 * PALETTE 的 key 字串，null 表示透明），在載入時用幾何輔助函式建構一次，
 * 之後由 ui/pixelRenderer.js 純粹讀取繪製，不重算。
 * 動畫：需要 2 幀交替的 sprite 額外提供 frame1（第二幀），沒有則靜態。
 * ==========================================================================*/
(function () {
  function makeGrid(w, h) { return Array.from({ length: h }, () => new Array(w).fill(null)); }
  function setPx(g, x, y, c) { const h = g.length, w = g[0].length; if (y >= 0 && y < h && x >= 0 && x < w) g[y][x] = c; }
  function rect(g, x, y, w, h, c) { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) setPx(g, x + i, y + j, c); }
  function circle(g, cx, cy, r, c) { for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) if (x * x + y * y <= r * r + 0.6) setPx(g, cx + x, cy + y, c); }
  function ellipse(g, cx, cy, rx, ry, c) { for (let y = -ry; y <= ry; y++) for (let x = -rx; x <= rx; x++) if ((x * x) / (rx * rx) + (y * y) / (ry * ry) <= 1) setPx(g, cx + x, cy + y, c); }
  function hline(g, x, y, len, c) { for (let i = 0; i < len; i++) setPx(g, x + i, y, c); }
  function vline(g, x, y, len, c) { for (let i = 0; i < len; i++) setPx(g, x, y + i, c); }
  function dots(g, pts, c) { pts.forEach(([x, y]) => setPx(g, x, y, c)); }
  function clone(g) { return g.map((row) => row.slice()); }

  const SPRITES = {};

  /* ---------------------------------------------------------------- 核心 */

  SPRITES.hull = (() => {
    const w = 24, h = 24;
    const g = makeGrid(w, h);
    // 圓角膠囊船身，底部陰影，頂部纜繩接點，正面舷窗，下方探照燈斗。
    ellipse(g, 12, 11, 8, 7, 'HULL');
    rect(g, 4, 11, 16, 6, 'HULL');
    ellipse(g, 12, 16, 8, 5, 'HULL2');
    rect(g, 4, 13, 16, 3, 'HULL2');
    vline(g, 12, 0, 4, 'BORDER');
    rect(g, 9, 8, 6, 5, 'GLOW2');
    rect(g, 10, 9, 4, 3, 'GLOW');
    rect(g, 9, 19, 6, 4, 'HULL2');
    rect(g, 10, 20, 4, 3, 'GLOW');
    return { w, h, colors: ['HULL', 'HULL2', 'BORDER', 'GLOW', 'GLOW2'], grid: g };
  })();

  function iconSprite(build) {
    const w = 8, h = 8;
    const g = makeGrid(w, h);
    build(g);
    return { w, h, grid: g };
  }

  SPRITES.icon_glow = iconSprite((g) => {
    dots(g, [[3, 0], [4, 0], [2, 1], [5, 1], [1, 2], [6, 2], [1, 3], [6, 3], [1, 4], [6, 4], [2, 5], [5, 5], [3, 6], [4, 6]], 'GLOW');
    rect(g, 3, 3, 2, 2, 'GLOW2');
  });
  SPRITES.icon_sample = iconSprite((g) => {
    rect(g, 3, 0, 2, 2, 'BORDER');
    vline(g, 2, 2, 4, 'BORDER'); vline(g, 5, 2, 4, 'BORDER');
    rect(g, 2, 4, 4, 2, 'AMBER');
    hline(g, 2, 6, 4, 'BORDER');
  });
  SPRITES.icon_core = iconSprite((g) => {
    dots(g, [[3, 0], [4, 0]], 'VIOLET');
    rect(g, 2, 1, 4, 5, 'VIOLET');
    dots(g, [[3, 6], [4, 6]], 'VIOLET');
    dots(g, [[2, 2], [3, 1]], 'PEARL');
  });
  SPRITES.icon_pearl = iconSprite((g) => {
    circle(g, 4, 4, 3, 'PEARL');
    dots(g, [[3, 2]], 'TEXT');
  });
  SPRITES.icon_anchor = iconSprite((g) => {
    hline(g, 2, 1, 4, 'BORDER');
    vline(g, 4, 1, 5, 'BORDER');
    dots(g, [[2, 5], [6, 5], [2, 6], [6, 6], [3, 6], [5, 6]], 'BORDER');
  });

  /* ------------------------------------------------------------ 模組圖示 */

  function modSprite(build) {
    const w = 16, h = 16;
    const g = makeGrid(w, h);
    build(g);
    return { w, h, grid: g };
  }

  SPRITES.mod_jelly = modSprite((g) => {
    ellipse(g, 8, 4, 5, 3, 'PINK');
    rect(g, 3, 4, 10, 2, 'PINK');
    for (let t = 0; t < 3; t++) { vline(g, 5 + t * 3, 7, 3, 'PINK'); vline(g, 5 + t * 3, 11, 2, 'PINK'); }
    dots(g, [[8, 4]], 'GLOW2');
  });
  SPRITES.mod_moss = modSprite((g) => {
    rect(g, 2, 5, 12, 7, 'BORDER');
    dots(g, [[4, 7], [7, 6], [10, 8], [5, 9], [9, 10], [12, 7], [3, 10], [11, 9]], 'GLOW');
  });
  SPRITES.mod_buoy = modSprite((g) => {
    circle(g, 7, 6, 4, 'HULL');
    ellipse(g, 7, 11, 3, 3, 'HULL2');
    dots(g, [[12, 4], [13, 5], [12, 6]], 'FOAM');
    dots(g, [[13, 7], [14, 8], [13, 9]], 'FOAM');
  });
  SPRITES.mod_coral = modSprite((g) => {
    vline(g, 4, 6, 8, 'PINK'); vline(g, 8, 4, 10, 'PINK'); vline(g, 12, 7, 7, 'PINK');
    hline(g, 3, 6, 2, 'PINK'); hline(g, 7, 4, 2, 'PINK'); hline(g, 11, 7, 2, 'PINK');
    dots(g, [[4, 5], [8, 3], [12, 6]], 'GLOW');
  });
  SPRITES.mod_vent = modSprite((g) => {
    const g2 = g;
    // 錐形煙囪。
    for (let row = 0; row < 8; row++) { const width = 10 - row; hline(g2, 8 - Math.floor(width / 2), 14 - row, width, row < 2 ? 'BORDER' : 'INK'); }
    dots(g2, [[7, 4], [8, 2], [9, 5]], 'RED');
    dots(g2, [[8, 0], [7, 1]], 'AMBER');
  });
  SPRITES.mod_whalefall = modSprite((g) => {
    for (let i = 0; i < 5; i++) { const cx = 2 + i * 3; ellipse(g, cx, 8, 2, 5, 'DIM'); }
    dots(g, [[3, 8], [7, 7], [11, 9]], 'GLOW');
  });
  SPRITES.mod_lure = modSprite((g) => {
    [3, 8, 13].forEach((cx) => {
      vline(g, cx, 6, 8, 'BORDER');
      circle(g, cx, 5, 2, 'AMBER');
      dots(g, [[cx, 5]], 'GLOW2');
    });
  });
  SPRITES.mod_reactor = modSprite((g) => {
    ellipse(g, 8, 9, 6, 5, 'PANEL2');
    circle(g, 8, 9, 3, 'VIOLET');
    dots(g, [[8, 9], [7, 8]], 'PEARL');
    dots(g, [[3, 13], [5, 14], [11, 14], [13, 13]], 'RED');
  });
  SPRITES.mod_pillar = modSprite((g) => {
    vline(g, 8, 1, 14, 'VIOLET');
    for (let y = 1; y < 15; y += 3) dots(g, [[6, y], [10, y]], 'PEARL');
    circle(g, 8, 1, 2, 'GLOW2');
  });
  SPRITES.mod_whaletemple = modSprite((g) => {
    ellipse(g, 8, 10, 7, 4, 'HULL2');
    for (let x = 2; x <= 14; x += 3) vline(g, x, 6, 5, 'BORDER');
    dots(g, [[4, 8], [8, 7], [12, 8]], 'VIOLET');
  });
  SPRITES.mod_voidbeacon = modSprite((g) => {
    circle(g, 8, 5, 4, 'PEARL');
    circle(g, 8, 5, 2, 'INK');
    vline(g, 8, 9, 6, 'BORDER');
    dots(g, [[5, 14], [8, 15], [11, 14]], 'BORDER');
  });
  SPRITES.mod_starcore = modSprite((g) => {
    circle(g, 8, 8, 5, 'INK');
    circle(g, 8, 8, 2, 'GLOW2');
    dots(g, [[8, 1], [1, 8], [15, 8], [8, 15], [3, 3], [13, 3], [3, 13], [13, 13]], 'PEARL');
  });
  SPRITES.mod_plainlight = modSprite((g) => {
    hline(g, 1, 8, 14, 'BORDER');
    for (let x = 2; x < 15; x += 3) dots(g, [[x, 7], [x, 9]], 'GLOW');
  });
  SPRITES.mod_seismocore = modSprite((g) => {
    circle(g, 8, 8, 6, 'DIM');
    for (let r = 2; r <= 4; r += 2) circle(g, 8, 8, r, null);
    dots(g, [[8, 8], [8, 4], [8, 12], [4, 8], [12, 8]], 'AMBER');
  });
  SPRITES.mod_ventforge = modSprite((g) => {
    for (let row = 0; row < 10; row++) { const w = 12 - row; hline(g, 8 - Math.floor(w / 2), 14 - row, w, row < 3 ? 'RED' : 'INK'); }
    dots(g, [[7, 3], [8, 1], [9, 4]], 'AMBER');
  });
  SPRITES.mod_magmaheart = modSprite((g) => {
    circle(g, 8, 8, 6, 'INK');
    circle(g, 8, 8, 3, 'RED');
    dots(g, [[8, 8], [7, 7]], 'AMBER');
  });
  SPRITES.mod_riftcrystal = modSprite((g) => {
    for (let t = 0; t < 4; t++) vline(g, 4 + t * 3, 3 + (t % 2) * 2, 11 - (t % 2) * 2, 'VIOLET');
    dots(g, [[4, 4], [7, 6], [10, 5], [13, 7]], 'PEARL');
  });
  SPRITES.mod_voidforge = modSprite((g) => {
    rect(g, 3, 5, 10, 8, 'INK');
    hline(g, 4, 6, 8, 'BORDER');
    circle(g, 8, 10, 3, 'VIOLET');
    dots(g, [[8, 10], [7, 9]], 'GLOW2');
  });
  SPRITES.mod_abyssnode = modSprite((g) => {
    for (let t = 0; t < 4; t++) { const a = (t / 4) * Math.PI * 2; vline(g, Math.round(8 + Math.cos(a) * 5), Math.round(8 + Math.sin(a) * 5) - 1, 2, 'PANEL2'); }
    rect(g, 6, 6, 4, 4, 'BORDER');
    dots(g, [[7, 7], [9, 9]], 'GLOW2');
  });
  SPRITES.mod_voidheart = modSprite((g) => {
    circle(g, 8, 8, 6, 'INK');
    circle(g, 8, 8, 4, 'VIOLET');
    circle(g, 8, 8, 1, 'PEARL');
    dots(g, [[8, 1], [8, 15], [1, 8], [15, 8]], 'GLOW2');
  });
  SPRITES.mod_echospire = modSprite((g) => {
    for (let row = 0; row < 12; row++) { const w = 8 - Math.floor(row / 3); hline(g, 8 - Math.floor(w / 2), 15 - row, w, 'PANEL2'); }
    for (let r = 2; r <= 6; r += 2) circle(g, 8, 2, r, null);
    dots(g, [[8, 2], [8, 0]], 'GLOW2');
  });
  SPRITES.mod_originlens = modSprite((g) => {
    circle(g, 8, 8, 7, 'BORDER');
    circle(g, 8, 8, 5, 'PANEL2');
    circle(g, 8, 8, 2, 'PEARL');
    dots(g, [[6, 6], [10, 10]], 'GLOW2');
  });
  SPRITES.mod_cityrelay = modSprite((g) => {
    rect(g, 6, 2, 4, 12, 'HULL2');
    for (let y = 3; y <= 11; y += 3) { hline(g, 3, y, 3, 'BORDER'); hline(g, 10, y, 3, 'BORDER'); }
    dots(g, [[8, 2], [8, 1]], 'GLOW2');
  });
  SPRITES.mod_awakencore = modSprite((g) => {
    ellipse(g, 8, 9, 7, 6, 'PANEL2');
    for (let x = 3; x <= 13; x += 2) vline(g, x, 3, 3, 'BORDER');
    circle(g, 8, 9, 3, 'AMBER');
    dots(g, [[8, 9]], 'GLOW2');
  });
  SPRITES.mod_whisperbuoy = modSprite((g) => {
    for (let i = 0; i < 3; i++) { const cx = 3 + i * 5; circle(g, cx, 5, 2, 'HULL'); vline(g, cx, 7, 6, 'BORDER'); }
    dots(g, [[3, 5], [8, 5], [13, 5]], 'GLOW2');
  });
  SPRITES.mod_riftheart = modSprite((g) => {
    circle(g, 8, 8, 7, 'INK');
    circle(g, 8, 8, 4, 'VIOLET');
    circle(g, 8, 8, 1, 'PEARL');
    for (let r = 0; r < 4; r++) { const a = (r / 4) * Math.PI * 2; dots(g, [[Math.round(8 + Math.cos(a) * 6), Math.round(8 + Math.sin(a) * 6)]], 'GLOW2'); }
  });
  SPRITES.mod_sourceanchor = modSprite((g) => {
    hline(g, 3, 2, 10, 'BORDER'); vline(g, 8, 2, 11, 'BORDER');
    dots(g, [[3, 11], [12, 11], [3, 12], [12, 12], [5, 12], [10, 12]], 'PANEL2');
    dots(g, [[8, 2]], 'GLOW2');
  });
  SPRITES.mod_sourceheart = modSprite((g) => {
    circle(g, 8, 8, 7, 'VIOLET');
    circle(g, 8, 8, 5, 'INK');
    circle(g, 8, 8, 2, 'PEARL');
    dots(g, [[8, 1], [8, 15], [1, 8], [15, 8], [3, 3], [13, 13]], 'GLOW2');
  });
  SPRITES.mod_farshorelamp = modSprite((g) => {
    ellipse(g, 8, 6, 5, 4, 'FOAM');
    ellipse(g, 8, 10, 3, 5, 'BORDER');
    dots(g, [[6, 5], [10, 7]], 'GLOW2');
  });
  SPRITES.mod_farshorecore = modSprite((g) => {
    for (let x = 2; x <= 14; x++) for (let y = 2; y <= 14; y++) if (((x - 8) * (x - 8) + (y - 8) * (y - 8)) <= 36 && Math.random() < 0.6) setPx(g, x, y, 'PANEL2');
    dots(g, [[8, 8]], 'PEARL');
  });
  SPRITES.mod_guixulamp = modSprite((g) => {
    // 順流的燈：光暈偏向下方（水流方向），下半亮、上半暗。
    ellipse(g, 8, 7, 4, 3, 'BORDER');
    ellipse(g, 8, 11, 5, 4, 'FOAM');
    dots(g, [[8, 14], [6, 13], [10, 13]], 'GLOW2');
  });
  SPRITES.mod_guixucore = modSprite((g) => {
    // 漩渦核心：一圈圈往中心收束的螺旋點陣。
    for (let a = 0; a < 26; a++) { const r = 6 - a * 0.22; const ang = a * 0.9; setPx(g, Math.round(8 + Math.cos(ang) * r), Math.round(8 + Math.sin(ang) * r), 'PANEL2'); }
    dots(g, [[8, 8]], 'PEARL');
  });
  SPRITES.mod_torchlamp = modSprite((g) => {
    // 信標燈：燈體在上，往下投射一道逐漸展開的光束。
    ellipse(g, 8, 4, 4, 3, 'AMBER');
    dots(g, [[8, 4]], 'FOAM');
    for (let y = 7; y <= 14; y++) { const w = y - 6; for (let x = 8 - Math.floor(w / 2); x <= 8 + Math.floor(w / 2); x++) if (Math.random() < 0.7) setPx(g, x, y, 'GLOW2'); }
  });
  SPRITES.mod_torchcore = modSprite((g) => {
    // 傳遞核心：中心亮點，把能量往下方送出的點流。
    circle(g, 8, 6, 3, 'AMBER');
    dots(g, [[8, 6]], 'PEARL');
    dots(g, [[8, 9], [7, 11], [9, 11], [8, 13], [8, 15]], 'GLOW2');
  });

  /* -------------------------------------------------------------- 生物 */

  function creatureSprite(w, h, build) {
    const g = makeGrid(w, h);
    build(g);
    return { w, h, grid: g };
  }

  /** 第二幀（游動時的擺尾/擺鰭變化）。只有少數幾種路過生物有，diveScreen 靠
   *  sprite.frame1 是否存在決定要不要用兩幀交替動畫呈現。 */
  function frame1(w, h, build) {
    const g = makeGrid(w, h);
    build(g);
    return g;
  }

  SPRITES.c_moonjelly = creatureSprite(16, 16, (g) => {
    ellipse(g, 8, 5, 6, 4, 'FOAM');
    for (let x = 3; x <= 13; x += 2) for (let y = 2; y <= 8; y += 2) if (Math.random() < 0.4) setPx(g, x, y, null);
    for (let t = 0; t < 4; t++) vline(g, 4 + t * 3, 9, 5, 'FOAM');
    dots(g, [[8, 4]], 'GLOW2');
  });
  SPRITES.c_moonjelly.frame1 = frame1(16, 16, (g) => {
    ellipse(g, 8, 5, 6, 4, 'FOAM');
    for (let x = 3; x <= 13; x += 2) for (let y = 2; y <= 8; y += 2) if (Math.random() < 0.4) setPx(g, x, y, null);
    for (let t = 0; t < 4; t++) vline(g, 5 + t * 3, 9, 4, 'FOAM');
    dots(g, [[8, 4]], 'GLOW2');
  });
  SPRITES.c_sardine = creatureSprite(24, 16, (g) => {
    const rows = [3, 5, 8, 10, 6, 12, 4];
    rows.forEach((y, i) => { const x = 2 + i * 3; rect(g, x, y, 3, 1, 'BLUE'); setPx(g, x - 1, y, 'DIM'); });
  });
  SPRITES.c_sardine.frame1 = frame1(24, 16, (g) => {
    const rows = [4, 6, 7, 9, 7, 11, 5];
    rows.forEach((y, i) => { const x = 2 + i * 3; rect(g, x, y, 3, 1, 'BLUE'); setPx(g, x - 1, y, 'DIM'); });
  });
  SPRITES.c_turtle = creatureSprite(16, 16, (g) => {
    ellipse(g, 8, 8, 6, 4, 'HULL2');
    dots(g, [[5, 6], [8, 6], [11, 6], [5, 10], [8, 10], [11, 10]], 'BORDER');
    rect(g, 1, 8, 3, 2, 'DIM');
    rect(g, 12, 8, 3, 2, 'DIM');
    rect(g, 6, 3, 4, 2, 'DIM');
  });
  SPRITES.c_sunfish = creatureSprite(16, 16, (g) => {
    circle(g, 8, 8, 6, 'BLUE');
    rect(g, 7, 0, 2, 3, 'BLUE');
    rect(g, 7, 13, 2, 3, 'BLUE');
    dots(g, [[10, 6]], 'VIOLET');
  });
  SPRITES.c_hatchet = creatureSprite(16, 16, (g) => {
    for (let row = 0; row < 10; row++) { const width = 12 - Math.abs(row - 4); rect(g, 8 - Math.floor(width / 2), 3 + row, width, 1, 'INK'); }
    dots(g, [[5, 9], [7, 10], [9, 10], [11, 9]], 'GLOW');
    dots(g, [[9, 5]], 'PEARL');
  });
  SPRITES.c_hatchet.frame1 = frame1(16, 16, (g) => {
    for (let row = 0; row < 10; row++) { const width = 12 - Math.abs(row - 4); rect(g, 8 - Math.floor(width / 2), 3 + row, width, 1, 'INK'); }
    dots(g, [[6, 10], [8, 9], [10, 9], [12, 10]], 'GLOW');
    dots(g, [[9, 5]], 'PEARL');
  });
  SPRITES.c_krill = creatureSprite(16, 16, (g) => {
    const pts = [[4, 4], [7, 3], [9, 5], [6, 6], [8, 7], [10, 8], [5, 9], [7, 10], [9, 11], [6, 12], [8, 5], [11, 6]];
    dots(g, pts, 'PINK');
  });
  SPRITES.c_siphon = creatureSprite(24, 8, (g) => {
    for (let i = 0; i < 6; i++) { ellipse(g, 2 + i * 4, 4, 2, 3, i % 2 === 0 ? 'FOAM' : 'PINK'); }
  });
  SPRITES.c_vampsquid = creatureSprite(16, 16, (g) => {
    ellipse(g, 8, 5, 5, 4, 'INK');
    for (let t = 0; t < 8; t++) setPx(g, 3 + t, 9, 'INK');
    dots(g, [[5, 4], [11, 4]], 'RED');
  });
  SPRITES.c_angler = creatureSprite(16, 16, (g) => {
    ellipse(g, 9, 9, 6, 5, 'INK');
    dots(g, [[5, 12], [7, 13], [9, 12]], 'PEARL');
    vline(g, 12, 4, 5, 'INK');
    dots(g, [[13, 3]], 'GLOW2');
  });
  SPRITES.c_angler.frame1 = frame1(16, 16, (g) => {
    ellipse(g, 9, 9, 6, 5, 'INK');
    dots(g, [[5, 12], [7, 13], [9, 12]], 'PEARL');
    vline(g, 12, 5, 5, 'INK');
    dots(g, [[12, 4]], 'GLOW2');
  });
  SPRITES.c_gulper = creatureSprite(24, 8, (g) => {
    for (let i = 0; i < 18; i++) { const y = 4 + Math.round(Math.sin(i / 3) * 1.5); setPx(g, i, y, 'INK'); }
    ellipse(g, 20, 4, 3, 3, 'INK');
    dots(g, [[19, 4]], 'RED');
    dots(g, [[0, 4]], 'GLOW');
  });
  SPRITES.c_isopod = creatureSprite(16, 16, (g) => {
    ellipse(g, 8, 8, 6, 5, 'DIM');
    for (let x = 3; x <= 13; x += 2) vline(g, x, 4, 8, 'BORDER');
    dots(g, [[2, 7], [2, 9], [14, 7], [14, 9]], 'BORDER');
    dots(g, [[6, 6], [10, 6]], 'AMBER');
  });
  SPRITES.c_barreleye = creatureSprite(16, 16, (g) => {
    ellipse(g, 9, 8, 6, 4, 'INK');
    for (let x = 4; x <= 8; x++) for (let y = 5; y <= 11; y++) if ((x + y) % 2 === 0) setPx(g, x, y, 'FOAM');
    dots(g, [[5, 7], [5, 9]], 'GLOW');
  });
  SPRITES.c_dragonfish = creatureSprite(24, 8, (g) => {
    for (let i = 0; i < 20; i++) { const y = 4 + Math.round(Math.sin(i / 4) * 2); setPx(g, 1 + i, y, 'INK'); }
    dots(g, [[3, 6], [8, 5], [13, 6], [18, 5]], 'GLOW');
    dots(g, [[21, 4]], 'RED');
  });
  SPRITES.c_dragonfish.frame1 = frame1(24, 8, (g) => {
    for (let i = 0; i < 20; i++) { const y = 4 + Math.round(Math.sin(i / 4 + 1) * 2); setPx(g, 1 + i, y, 'INK'); }
    dots(g, [[3, 5], [8, 6], [13, 5], [18, 6]], 'GLOW');
    dots(g, [[21, 4]], 'RED');
  });
  SPRITES.c_seapig = creatureSprite(16, 16, (g) => {
    ellipse(g, 8, 9, 6, 5, 'PINK');
    dots(g, [[4, 13], [6, 14], [10, 14], [12, 13], [5, 6], [11, 6]], 'DIM');
    dots(g, [[6, 7], [10, 7]], 'INK');
  });
  SPRITES.c_ghostshark = creatureSprite(24, 16, (g) => {
    ellipse(g, 11, 8, 9, 4, 'DIM');
    rect(g, 9, 2, 2, 5, 'DIM');
    for (let x = 2; x <= 20; x += 3) hline(g, x, 8, 2, 'BORDER');
    dots(g, [[6, 6]], 'FOAM');
  });
  SPRITES.c_giantsquid = creatureSprite(16, 24, (g) => {
    ellipse(g, 8, 6, 5, 5, 'HULL2');
    dots(g, [[6, 5]], 'PEARL');
    for (let t = 0; t < 8; t++) vline(g, 2 + t * 1.7 | 0, 11, 12 - (t % 3), 'HULL2');
  });
  SPRITES.c_lanternoctopus = creatureSprite(16, 16, (g) => {
    ellipse(g, 8, 6, 5, 4, 'VIOLET');
    for (let t = 0; t < 6; t++) vline(g, 3 + t * 2, 9, 5 + (t % 2), 'VIOLET');
    dots(g, [[8, 3], [8, 4]], 'GLOW2');
  });
  SPRITES.c_glasssquid = creatureSprite(16, 16, (g) => {
    ellipse(g, 8, 7, 4, 6, 'FOAM');
    for (let x = 5; x <= 11; x++) for (let y = 2; y <= 12; y++) if ((x + y) % 3 === 0) setPx(g, x, y, null);
    dots(g, [[8, 5]], 'INK');
  });
  SPRITES.c_styxeel = creatureSprite(24, 8, (g) => {
    for (let i = 0; i < 22; i++) { const y = 4 + Math.round(Math.sin(i / 3.2) * 2.4); setPx(g, 1 + i, y, 'DIM'); }
    dots(g, [[2, 2]], 'RED');
  });
  SPRITES.c_ancientjelly = creatureSprite(16, 16, (g) => {
    ellipse(g, 8, 5, 6, 4, 'PEARL');
    for (let t = 0; t < 5; t++) vline(g, 4 + t * 2, 8, 6, 'PEARL');
    dots(g, [[8, 4], [6, 5], [10, 5]], 'VIOLET');
  });
  SPRITES.c_voidray = creatureSprite(24, 16, (g) => {
    ellipse(g, 12, 8, 11, 4, 'INK');
    for (let x = 10; x <= 20; x++) setPx(g, x, 8 + Math.round(Math.sin((x - 10) / 3) * 3), 'INK');
    dots(g, [[6, 7], [18, 7]], 'GLOW');
  });
  SPRITES.c_echoworm = creatureSprite(16, 16, (g) => {
    for (let i = 0; i < 12; i++) { const y = 4 + Math.round(Math.sin(i / 2) * 4); setPx(g, 2 + i, y, 'FOAM'); }
    dots(g, [[2, 4]], 'RED');
  });
  SPRITES.c_starfish_abyssal = creatureSprite(16, 16, (g) => {
    dots(g, [[8, 1], [8, 2], [8, 3], [3, 8], [4, 8], [5, 8], [13, 8], [12, 8], [11, 8], [8, 13], [8, 12], [8, 11], [8, 8]], 'VIOLET');
  });
  SPRITES.c_leviathan = creatureSprite(24, 16, (g) => {
    ellipse(g, 12, 8, 11, 6, 'INK');
    dots(g, [[4, 6], [20, 6]], 'RED');
    for (let x = 3; x <= 21; x += 3) dots(g, [[x, 12]], 'GLOW2');
  });
  SPRITES.c_plainskate = creatureSprite(24, 16, (g) => {
    ellipse(g, 12, 8, 10, 5, 'DIM');
    vline(g, 12, 13, 3, 'DIM');
    dots(g, [[8, 7], [16, 7]], 'INK');
  });
  SPRITES.c_plainskate.frame1 = frame1(24, 16, (g) => {
    ellipse(g, 12, 7, 10, 4, 'DIM');
    vline(g, 12, 12, 3, 'DIM');
    dots(g, [[8, 6], [16, 6]], 'INK');
  });
  SPRITES.c_nodulecrab = creatureSprite(16, 16, (g) => {
    ellipse(g, 8, 9, 6, 4, 'HULL2');
    dots(g, [[3, 7], [13, 7], [2, 9], [14, 9]], 'BORDER');
    dots(g, [[6, 8], [10, 8], [8, 10]], 'DIM');
  });
  SPRITES.c_ghostfish = creatureSprite(16, 16, (g) => {
    ellipse(g, 8, 8, 6, 3, 'FOAM');
    dots(g, [[8, 8]], 'GLOW2');
  });
  SPRITES.c_silenthunter = creatureSprite(24, 16, (g) => {
    ellipse(g, 12, 8, 11, 4, 'DIM');
    for (let x = 2; x <= 22; x += 4) hline(g, x, 8, 2, 'INK');
    dots(g, [[19, 6], [19, 10]], 'RED');
  });
  SPRITES.c_ventshrimp = creatureSprite(16, 16, (g) => {
    ellipse(g, 8, 8, 5, 3, 'PINK');
    dots(g, [[4, 7], [12, 7]], 'AMBER');
    for (let t = 0; t < 4; t++) vline(g, 5 + t * 2, 11, 3, 'PINK');
  });
  SPRITES.c_tubeworm = creatureSprite(16, 16, (g) => {
    for (let i = 0; i < 5; i++) vline(g, 2 + i * 3, 2, 12, i % 2 === 0 ? 'PINK' : 'FOAM');
    dots(g, [[2, 2], [5, 2], [8, 2], [11, 2], [14, 2]], 'RED');
  });
  SPRITES.c_magmaeel = creatureSprite(24, 8, (g) => {
    for (let i = 0; i < 20; i++) { const y = 4 + Math.round(Math.sin(i / 3) * 2); setPx(g, 1 + i, y, 'AMBER'); }
    dots(g, [[2, 3]], 'RED');
  });
  SPRITES.c_abyssalphoenix = creatureSprite(24, 16, (g) => {
    ellipse(g, 10, 8, 7, 4, 'AMBER');
    for (let t = 0; t < 6; t++) vline(g, 15 + t, 6 + (t % 3), 3, 'RED');
    dots(g, [[7, 7]], 'GLOW2');
  });

  SPRITES.c_riftworm = creatureSprite(20, 12, (g) => {
    for (let t = 0; t < 14; t++) setPx(g, 2 + t, 6 + Math.round(Math.sin(t / 2) * 2), 'DIM');
    dots(g, [[16, 6], [17, 5]], 'GLOW');
  });
  SPRITES.c_chasmray = creatureSprite(24, 16, (g) => {
    ellipse(g, 12, 8, 10, 5, 'BORDER');
    ellipse(g, 12, 8, 6, 3, 'PANEL2');
    dots(g, [[6, 6], [18, 6]], 'GLOW2');
  });
  SPRITES.c_faultjelly = creatureSprite(16, 16, (g) => {
    ellipse(g, 8, 5, 6, 4, 'VIOLET');
    for (let t = 0; t < 3; t++) vline(g, 5 + t * 3, 7, 5, 'VIOLET');
    dots(g, [[8, 4]], 'PEARL');
  });
  SPRITES.c_abyssking = creatureSprite(28, 20, (g) => {
    ellipse(g, 14, 10, 12, 7, 'INK');
    ellipse(g, 14, 10, 8, 4, 'PANEL2');
    dots(g, [[9, 8], [19, 8]], 'RED');
    for (let t = 0; t < 5; t++) vline(g, 5 + t * 4, 15, 3, 'DIM');
  });

  SPRITES.c_ruincrab = creatureSprite(16, 16, (g) => {
    ellipse(g, 8, 9, 6, 4, 'PANEL2');
    hline(g, 5, 9, 6, 'BORDER');
    dots(g, [[2, 7], [14, 7], [2, 11], [14, 11]], 'BORDER');
    dots(g, [[6, 8], [10, 8]], 'GLOW2');
  });
  SPRITES.c_signaljelly = creatureSprite(16, 16, (g) => {
    ellipse(g, 8, 5, 6, 4, 'VIOLET');
    dots(g, [[5, 4], [8, 3], [11, 4], [8, 6]], 'PEARL');
    for (let t = 0; t < 4; t++) vline(g, 4 + t * 3, 8, 6, 'VIOLET');
    dots(g, [[8, 4]], 'GLOW2');
  });
  SPRITES.c_signaljelly.frame1 = frame1(16, 16, (g) => {
    ellipse(g, 8, 5, 6, 4, 'VIOLET');
    dots(g, [[5, 4], [8, 3], [11, 4]], 'PEARL');
    for (let t = 0; t < 4; t++) vline(g, 5 + t * 3, 8, 5, 'VIOLET');
    dots(g, [[8, 4]], 'GLOW2');
  });
  SPRITES.c_echosentinel = creatureSprite(16, 16, (g) => {
    rect(g, 5, 3, 6, 10, 'PANEL2');
    hline(g, 4, 5, 8, 'BORDER');
    hline(g, 4, 10, 8, 'BORDER');
    dots(g, [[7, 7], [9, 7]], 'GLOW2');
  });
  SPRITES.c_precursorshade = creatureSprite(28, 20, (g) => {
    ellipse(g, 14, 10, 12, 8, 'INK');
    for (let x = 4; x <= 24; x++) for (let y = 3; y <= 17; y++) if ((x + y) % 4 === 0) setPx(g, x, y, 'DIM');
    dots(g, [[9, 8], [19, 8]], 'VIOLET');
    dots(g, [[14, 4], [14, 16]], 'PEARL');
  });

  SPRITES.c_echowalker = creatureSprite(24, 8, (g) => {
    for (let i = 0; i < 18; i++) { const y = 4 + Math.round(Math.sin(i / 5) * 1.2); setPx(g, 1 + i, y, 'DIM'); }
    dots(g, [[3, 4], [9, 4], [15, 4]], 'GLOW2');
  });
  SPRITES.c_echowalker.frame1 = frame1(24, 8, (g) => {
    for (let i = 0; i < 18; i++) { const y = 4 + Math.round(Math.sin(i / 5 + 0.6) * 1.2); setPx(g, 1 + i, y, 'DIM'); }
    dots(g, [[4, 4], [10, 4], [16, 4]], 'GLOW2');
  });
  SPRITES.c_corridorwatcher = creatureSprite(16, 16, (g) => {
    circle(g, 8, 8, 6, 'BORDER');
    circle(g, 8, 8, 4, null);
    circle(g, 8, 8, 2, 'GLOW2');
  });
  SPRITES.c_silentstalker = creatureSprite(24, 16, (g) => {
    for (let x = 4; x <= 20; x++) for (let y = 5; y <= 11; y++) if ((x + y) % 3 === 0) setPx(g, x, y, 'DIM');
    dots(g, [[8, 7], [16, 7]], 'FOAM');
  });
  SPRITES.c_origineye = creatureSprite(28, 20, (g) => {
    ellipse(g, 14, 10, 13, 9, 'PANEL2');
    circle(g, 14, 10, 6, 'INK');
    circle(g, 14, 10, 3, 'VIOLET');
    dots(g, [[14, 10]], 'PEARL');
    dots(g, [[6, 6], [22, 6], [6, 14], [22, 14]], 'GLOW2');
  });

  SPRITES.c_stoneguardian = creatureSprite(16, 24, (g) => {
    rect(g, 4, 2, 8, 6, 'DIM');
    rect(g, 3, 8, 10, 12, 'DIM');
    dots(g, [[6, 4], [10, 4]], 'RED');
    for (let x = 4; x <= 12; x += 2) for (let y = 8; y <= 19; y += 3) setPx(g, x, y, 'BORDER');
  });
  SPRITES.c_echodweller = creatureSprite(16, 24, (g) => {
    ellipse(g, 8, 6, 4, 5, 'FOAM');
    rect(g, 5, 10, 6, 12, 'FOAM');
    dots(g, [[6, 5], [10, 5]], 'INK');
  });
  SPRITES.c_echodweller.frame1 = frame1(16, 24, (g) => {
    ellipse(g, 8, 6, 4, 5, 'FOAM');
    rect(g, 6, 10, 6, 12, 'FOAM');
    dots(g, [[6, 5], [10, 5]], 'INK');
  });
  SPRITES.c_citypatrol = creatureSprite(20, 16, (g) => {
    ellipse(g, 10, 8, 8, 5, 'BORDER');
    rect(g, 8, 3, 4, 4, 'PANEL2');
    dots(g, [[10, 5]], 'RED');
    dots(g, [[4, 8], [16, 8]], 'GLOW2');
  });
  SPRITES.c_theawakened = creatureSprite(32, 24, (g) => {
    ellipse(g, 16, 12, 15, 10, 'INK');
    ellipse(g, 16, 12, 9, 6, 'PANEL2');
    dots(g, [[10, 9], [22, 9]], 'RED');
    for (let t = 0; t < 6; t++) vline(g, 4 + t * 5, 19, 4 - (t % 2), 'DIM');
  });

  SPRITES.c_whisperingshoal = creatureSprite(24, 16, (g) => {
    const rows = [4, 6, 9, 11, 7, 13];
    rows.forEach((y, i) => { const x = 2 + i * 3; rect(g, x, y, 3, 1, 'BLUE'); setPx(g, x - 1, y, 'GLOW2'); });
  });
  SPRITES.c_whisperingshoal.frame1 = frame1(24, 16, (g) => {
    const rows = [5, 7, 8, 12, 6, 12];
    rows.forEach((y, i) => { const x = 2 + i * 3; rect(g, x, y, 3, 1, 'BLUE'); setPx(g, x - 1, y, 'GLOW2'); });
  });
  SPRITES.c_riftsentinel = creatureSprite(16, 16, (g) => {
    circle(g, 8, 8, 6, 'DIM');
    circle(g, 8, 8, 3, null);
    dots(g, [[8, 2], [8, 14], [2, 8], [14, 8]], 'BORDER');
  });
  SPRITES.c_echohunter = creatureSprite(24, 8, (g) => {
    for (let i = 0; i < 20; i++) { const y = 4 + Math.round(Math.sin(i / 3.5) * 2); setPx(g, 1 + i, y, 'DIM'); }
    dots(g, [[2, 2]], 'GLOW2');
  });
  SPRITES.c_thewhisperer = creatureSprite(28, 28, (g) => {
    for (let x = 4; x <= 24; x++) for (let y = 4; y <= 24; y++) if (((x - 14) * (x - 14) + (y - 14) * (y - 14)) <= 144 && Math.random() < 0.5) setPx(g, x, y, 'VIOLET');
    dots(g, [[14, 14]], 'PEARL');
  });

  SPRITES.c_sourceswarm = creatureSprite(20, 16, (g) => {
    const pts = [[3, 4], [6, 3], [9, 5], [5, 7], [8, 8], [11, 9], [4, 10], [7, 11], [10, 12], [13, 6], [14, 10], [16, 8]];
    dots(g, pts, 'GLOW2');
  });
  SPRITES.c_chasmwanderer = creatureSprite(24, 8, (g) => {
    for (let i = 0; i < 20; i++) { const y = 4 + Math.round(Math.sin(i / 4.5) * 2.5); setPx(g, 1 + i, y, 'DIM'); }
    dots(g, [[2, 2], [21, 5]], 'VIOLET');
  });
  SPRITES.c_sourceguardian = creatureSprite(20, 24, (g) => {
    rect(g, 5, 2, 10, 8, 'PANEL2');
    rect(g, 4, 10, 12, 13, 'PANEL2');
    dots(g, [[8, 5], [12, 5]], 'GLOW2');
    for (let x = 5; x <= 14; x += 3) for (let y = 11; y <= 21; y += 3) setPx(g, x, y, 'BORDER');
  });
  SPRITES.c_thesource = creatureSprite(32, 28, (g) => {
    ellipse(g, 16, 14, 15, 13, 'INK');
    for (let x = 2; x <= 30; x++) for (let y = 2; y <= 26; y++) if (((x - 16) * (x - 16) + (y - 14) * (y - 14)) <= 169 && Math.random() < 0.35) setPx(g, x, y, 'VIOLET');
    circle(g, 16, 14, 5, 'PANEL2');
    circle(g, 16, 14, 2, 'PEARL');
    dots(g, [[6, 8], [26, 8], [6, 20], [26, 20]], 'GLOW2');
  });

  SPRITES.c_farshoredrifter = creatureSprite(20, 20, (g) => {
    for (let x = 3; x <= 17; x++) for (let y = 3; y <= 17; y++) if (((x - 10) * (x - 10) + (y - 10) * (y - 10)) <= 49 && Math.random() < 0.4) setPx(g, x, y, 'FOAM');
    dots(g, [[10, 10]], 'GLOW2');
  });
  SPRITES.c_mirrorfish = creatureSprite(24, 8, (g) => {
    for (let i = 0; i < 20; i++) { const y = 4 + Math.round(Math.sin(i / 3) * 2); setPx(g, 1 + i, y, 'PEARL'); }
    dots(g, [[2, 3], [21, 5]], 'BORDER');
  });
  SPRITES.c_mirrorfish.frame1 = frame1(24, 8, (g) => {
    for (let i = 0; i < 20; i++) { const y = 4 + Math.round(Math.sin(i / 3 + 0.5) * 2); setPx(g, 1 + i, y, 'PEARL'); }
    dots(g, [[2, 3], [21, 5]], 'BORDER');
  });
  SPRITES.c_thresholdkeeper = creatureSprite(16, 20, (g) => {
    rect(g, 4, 2, 8, 16, 'BORDER');
    rect(g, 5, 3, 6, 14, 'PANEL2');
    dots(g, [[6, 8], [10, 8], [6, 13], [10, 13]], 'GLOW2');
  });
  SPRITES.c_thewatcher = creatureSprite(32, 20, (g) => {
    ellipse(g, 16, 10, 15, 9, 'PANEL2');
    circle(g, 9, 10, 4, 'INK'); circle(g, 9, 10, 2, 'PEARL');
    circle(g, 23, 10, 4, 'INK'); circle(g, 23, 10, 2, 'PEARL');
    dots(g, [[9, 10], [23, 10]], 'VIOLET');
    dots(g, [[16, 4], [16, 16]], 'GLOW2');
  });
  SPRITES.c_refluxdrifter = creatureSprite(22, 14, (g) => {
    // 拖著一條被水流拉長尾跡的漂游者。
    ellipse(g, 15, 7, 5, 4, 'FOAM');
    for (let i = 0; i < 12; i++) setPx(g, 10 - i, 7 + Math.round(Math.sin(i / 2)), 'BORDER');
    dots(g, [[16, 6], [14, 8]], 'GLOW2');
  });
  SPRITES.c_ringswimmer = creatureSprite(18, 18, (g) => {
    // 環狀生物：一圈亮環。
    for (let a = 0; a < 32; a++) setPx(g, Math.round(9 + Math.cos(a / 32 * 6.28) * 7), Math.round(9 + Math.sin(a / 32 * 6.28) * 7), 'FOAM');
    dots(g, [[9, 2], [9, 16], [2, 9], [16, 9]], 'GLOW2');
  });
  SPRITES.c_guixusentinel = creatureSprite(18, 22, (g) => {
    // 比門檻守衛更巨大、更老的守望者輪廓。
    rect(g, 3, 2, 12, 18, 'BORDER');
    rect(g, 4, 3, 10, 16, 'PANEL2');
    dots(g, [[7, 7], [11, 7]], 'PEARL');
    dots(g, [[6, 13], [9, 15], [12, 13]], 'GLOW2');
  });
  SPRITES.c_returninglight = creatureSprite(20, 20, (g) => {
    // 歸光：跟 hull 探照燈同款的光暈——一圈圈方環＋中心亮點，鏡像收束。
    circle(g, 10, 10, 6, 'BORDER');
    circle(g, 10, 10, 4, 'FOAM');
    circle(g, 10, 10, 2, 'PEARL');
    dots(g, [[10, 1], [10, 19], [1, 10], [19, 10], [4, 4], [16, 16], [4, 16], [16, 4]], 'GLOW2');
  });
  SPRITES.c_emberdrifter = creatureSprite(20, 16, (g) => {
    ellipse(g, 10, 8, 5, 4, 'BORDER');
    dots(g, [[7, 6], [12, 7], [9, 10], [13, 9], [6, 9]], 'AMBER');
    dots(g, [[10, 8]], 'GLOW2');
  });
  SPRITES.c_lightdrawfish = creatureSprite(22, 10, (g) => {
    // 游在光束前方領路的魚：魚體在左，後方拖著一道光束。
    ellipse(g, 5, 5, 3, 2, 'FOAM');
    dots(g, [[3, 5]], 'AMBER');
    for (let x = 9; x <= 20; x++) if (Math.random() < 0.6) setPx(g, x, 5 + (x % 2 === 0 ? 0 : (x % 4 === 1 ? -1 : 1)), 'GLOW2');
  });
  SPRITES.c_torchsentinel = creatureSprite(16, 20, (g) => {
    // 守望者：捧著一小簇光，望向下方。
    rect(g, 5, 4, 6, 14, 'PANEL2');
    dots(g, [[8, 2], [7, 3], [9, 3]], 'AMBER');
    dots(g, [[8, 2]], 'FOAM');
    dots(g, [[7, 9], [9, 9], [8, 13]], 'GLOW2');
  });
  SPRITES.c_thesuccessor = creatureSprite(20, 22, (g) => {
    // 後來者：跟歸光/hull 同款的光暈，但正在上升——下方拖著一小段上升尾跡。
    circle(g, 10, 8, 6, 'BORDER');
    circle(g, 10, 8, 4, 'FOAM');
    circle(g, 10, 8, 2, 'PEARL');
    dots(g, [[10, 0], [1, 8], [19, 8], [4, 2], [16, 2]], 'GLOW2');
    dots(g, [[10, 16], [9, 19], [11, 19], [10, 21]], 'AMBER');
  });

  /* -------------------------------------------------------------- 介面圖示 */

  SPRITES.icon_gear = iconSprite((g) => {
    dots(g, [[3, 0], [4, 0], [0, 3], [0, 4], [7, 3], [7, 4], [3, 7], [4, 7]], 'DIM');
    circle(g, 4, 4, 2, 'DIM');
    setPx(g, 4, 4, 'PANEL2');
  });
  SPRITES.icon_boost = iconSprite((g) => {
    dots(g, [[4, 0], [3, 1], [4, 1], [2, 2], [3, 2], [4, 3], [3, 4], [2, 5], [3, 5], [4, 5], [3, 6], [2, 7]], 'AMBER');
  });
  SPRITES.icon_sigil_light = iconSprite((g) => {
    circle(g, 4, 4, 3, 'AMBER');
    dots(g, [[4, 1], [4, 7], [1, 4], [7, 4]], 'GLOW2');
  });
  SPRITES.icon_sigil_anchor = iconSprite((g) => {
    hline(g, 2, 1, 4, 'BORDER'); vline(g, 4, 1, 5, 'BORDER');
    dots(g, [[2, 5], [6, 5], [2, 6], [6, 6], [3, 6], [5, 6]], 'BLUE');
  });
  SPRITES.icon_sigil_tide = iconSprite((g) => {
    for (let x = 0; x < 8; x++) { const y = 4 + Math.round(Math.sin(x / 1.3) * 2); setPx(g, x, y, 'FOAM'); }
  });

  /* -------------------------------------------------------------- 金燈魚 */

  SPRITES.c_golden = creatureSprite(16, 16, (g) => {
    ellipse(g, 8, 9, 6, 5, 'HULL');
    dots(g, [[4, 12], [6, 13], [10, 13]], 'AMBER');
    vline(g, 11, 4, 5, 'HULL');
    dots(g, [[12, 3]], 'GLOW2');
    dots(g, [[6, 8], [10, 8]], 'INK');
  });

  /* 深淵訊號殘片：刻意畫成尖銳的幾何線條而非生物輪廓，讓它一眼看上去就「不屬於
   * 這裡」——不是有機生物，是某種規律的、人工的東西。 */
  SPRITES.c_signal = creatureSprite(16, 16, (g) => {
    hline(g, 2, 8, 12, 'VIOLET');
    vline(g, 8, 2, 12, 'VIOLET');
    for (let i = 0; i < 4; i++) { setPx(g, 4 + i * 3, 4 + i * 2, 'PEARL'); setPx(g, 4 + i * 3, 12 - i * 2, 'PEARL'); }
    circle(g, 8, 8, 2, 'GLOW2');
  });

  window.App.Data.SPRITES = SPRITES;
})();
