/* ============================================================================
 * hullSkinDefs.js — 潛燈號外觀（hull skin）：純裝飾的收集/個人化系統，不影響任何
 * 數值。每個外觀就是把 hull sprite 的色鍵重新對應到別的調色盤顏色，解鎖條件綁在
 * 玩家自然會經過的進度節點上（第一次轉生、締結協約/盟約、抵達 endgame 深度），
 * 當作一條長線的收藏/炫耀 hook。選定的外觀套用在潛航畫面的潛燈號本體與潛航護照
 * 分享圖卡上。
 *
 * 必須在 sprites.js 之後載入——這裡直接複製 SPRITES.hull 的網格、重新上色，
 * 生成 SPRITES['hull_<id>'] 供 pixelRenderer 用既有的 drawSprite 畫出來，
 * 完全不需要改動 renderer 或 sprites.js。
 * ==========================================================================*/
(function () {
  const D = window.App.Data;

  // colors：把 hull 網格裡的色鍵換成別的色鍵（沒列到的鍵維持原樣，例如 BORDER）。
  const HULL_SKIN_DEFS = [
    { id: 'default', name: '初始塗裝', desc: '潛燈號出廠的金銅色塗裝。', unlock: function () { return true; }, colors: null },
    { id: 'foam', name: '暮光藍', desc: '解鎖：史上最大深度達 4000m', unlock: function (s) { return (s.maxDepthEver || 0) >= 4000; },
      colors: { HULL: 'FOAM', HULL2: 'W2', GLOW: 'BLUE', GLOW2: 'FOAM' } },
    { id: 'crimson', name: '緋紅', desc: '解鎖：完成第一次重返海面', unlock: function (s) { return (s.prestigeCount || 0) >= 1; },
      colors: { HULL: 'RED', HULL2: 'BORDER', GLOW: 'AMBER', GLOW2: 'PEARL' } },
    { id: 'violet', name: '印記紫', desc: '解鎖：締結深淵協約', unlock: function (s) { return (s.covenantCount || 0) >= 1; },
      colors: { HULL: 'VIOLET', HULL2: 'BORDER', GLOW: 'PEARL', GLOW2: 'PEARL' } },
    { id: 'abyss', name: '永夜靛', desc: '解鎖：締結永夜盟約', unlock: function (s) { return (s.pactCount || 0) >= 1; },
      colors: { HULL: 'BLUE', HULL2: 'W3', GLOW: 'GLOW', GLOW2: 'FOAM' } },
    { id: 'gold', name: '薪火金', desc: '解鎖：史上最大深度達歸墟（2900000m）', unlock: function (s) { return (s.maxDepthEver || 0) >= 2900000; },
      colors: { HULL: 'AMBER', HULL2: 'HULL', GLOW: 'PEARL', GLOW2: 'AMBER' } }
  ];

  // 依色鍵對應複製 hull 網格，生成各外觀的 sprite。empty cell 原樣保留。
  const baseHull = D.SPRITES && D.SPRITES.hull;
  if (baseHull) {
    HULL_SKIN_DEFS.forEach(function (skin) {
      if (!skin.colors) return; // default 直接用原本的 SPRITES.hull
      const remap = skin.colors;
      const grid = baseHull.grid.map(function (rowArr) {
        return rowArr.map(function (key) { return key && remap[key] ? remap[key] : key; });
      });
      D.SPRITES['hull_' + skin.id] = { w: baseHull.w, h: baseHull.h, colors: baseHull.colors, grid: grid };
    });
  }

  function hullSkinById(id) { return HULL_SKIN_DEFS.find(function (s) { return s.id === id; }); }

  /** 回傳目前存檔選定外觀對應的 sprite id（找不到或未解鎖就退回 'hull'）。 */
  function hullSpriteIdFor(save) {
    const id = save && save.hullSkin;
    if (!id || id === 'default') return 'hull';
    const spriteId = 'hull_' + id;
    return D.SPRITES[spriteId] ? spriteId : 'hull';
  }

  D.HULL_SKIN_DEFS = HULL_SKIN_DEFS;
  D.hullSkinById = hullSkinById;
  D.hullSpriteIdFor = hullSpriteIdFor;
})();
