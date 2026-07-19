/* ============================================================================
 * bestiaryDetailModal.js — 點擊圖鑑已記錄的生物格子時彈出的詳細卡片：放大版
 * sprite、星級、目擊次數、首次記錄時間、風味文字（creatureDefs.js 的 lore）。
 * ==========================================================================*/
(function () {
  const U = window.App.Utils;
  const D = window.App.Data;
  const PR = window.App.UI.PixelRenderer;
  const Econ = window.App.Systems.Economy;
  const Modals = window.App.UI.Modals;

  function formatDate(ts) {
    const d = new Date(ts);
    return d.getFullYear() + '/' + String(d.getMonth() + 1).padStart(2, '0') + '/' + String(d.getDate()).padStart(2, '0');
  }

  function open(creatureDef, seenRecord) {
    Modals.showModal((box, close) => {
      box.appendChild(U.el('div', 'modalTitle', creatureDef.name + (creatureDef.rare ? '　★稀有' : '')));
      const iconWrap = U.el('div', 'discoveryIconWrap');
      iconWrap.appendChild(PR.spriteCanvasEl(creatureDef.icon, 6));
      box.appendChild(iconWrap);

      const starLvl = Econ.bestiaryStarLevel(seenRecord.seen || 0);
      const maxStar = D.BALANCE.BESTIARY_STAR_THRESHOLDS.length;
      box.appendChild(U.el('div', 'modalLine modalHighlight', '★'.repeat(starLvl) + '☆'.repeat(maxStar - starLvl)));
      box.appendChild(U.el('div', 'modalLine', '目擊次數：' + seenRecord.seen));
      box.appendChild(U.el('div', 'modalLine', '首次記錄：' + formatDate(seenRecord.firstAt)));
      if (starLvl < maxStar) {
        const nextThreshold = D.BALANCE.BESTIARY_STAR_THRESHOLDS[starLvl];
        box.appendChild(U.el('div', 'subHint', '再目擊 ' + (nextThreshold - seenRecord.seen) + ' 次升至 ' + (starLvl + 1) + ' 星'));
      }
      if (creatureDef.lore) box.appendChild(U.el('div', 'compendiumLine bestiaryLore', creatureDef.lore));

      const btn = U.el('button', 'modalBtn', '關閉');
      U.onTap(btn, close);
      box.appendChild(btn);
    });
  }

  window.App.UI.BestiaryDetailModal = { open };
})();
