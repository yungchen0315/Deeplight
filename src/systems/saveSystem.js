/* ============================================================================
 * saveSystem.js — localStorage 讀寫＋版本遷移。存檔就是一個可直接
 * JSON.stringify/parse 的 SaveGame 物件（src/models/SaveGame.js）。
 * ==========================================================================*/
(function () {
  const SAVE_KEY = 'deeplight_save_v1'; // 沿用既有 key，靠 migrate() 就地升級欄位，不需要換 key。

  /** 補齊舊存檔／手動編輯遺漏的欄位，避免之後讀到 undefined 就拋例外。淺層物件逐欄位合併，
   *  避免舊存檔已有的 settings/stats 物件蓋掉新版才新增的子欄位。 */
  function migrate(saveGame) {
    const def = window.App.Models.createDefaultSave(Date.now());
    Object.keys(def).forEach((k) => { if (saveGame[k] === undefined) saveGame[k] = def[k]; });
    if (!saveGame.modules) saveGame.modules = {};
    if (!saveGame.bestiary) saveGame.bestiary = {};
    if (!Array.isArray(saveGame.research)) saveGame.research = [];
    if (!Array.isArray(saveGame.refits)) saveGame.refits = [];
    if (!Array.isArray(saveGame.achievements)) saveGame.achievements = [];

    saveGame.stats = Object.assign({}, def.stats, saveGame.stats);
    saveGame.settings = Object.assign({}, def.settings, saveGame.settings);
    saveGame.daily = Object.assign({}, def.daily, saveGame.daily);
    saveGame.tutorial = Object.assign({}, def.tutorial, saveGame.tutorial);
    if (!Array.isArray(saveGame.tutorial.seenHints)) saveGame.tutorial.seenHints = [];

    if (typeof saveGame.tapLureProgress !== 'number') saveGame.tapLureProgress = 0;
    if (typeof saveGame.boostUntil !== 'number') saveGame.boostUntil = 0;

    // 舊存檔（v1，無 tutorial 欄位、但已有進度）視為已看過教學，避免老玩家被重新導覽。
    if (saveGame.version < 2 && saveGame.maxDepthEver > 0) saveGame.tutorial.done = true;

    saveGame.version = 2;
    return saveGame;
  }

  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      return migrate(JSON.parse(raw));
    } catch (e) {
      return null;
    }
  }

  function save(saveGame) {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(saveGame));
      return true;
    } catch (e) {
      return false;
    }
  }

  function reset() {
    try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* ignore */ }
  }

  /** 匯出存檔為可分享的文字（base64 包 JSON）。 */
  function exportString(saveGame) {
    return btoa(unescape(encodeURIComponent(JSON.stringify(saveGame))));
  }

  /** 匯入文字並還原成合法存檔；格式錯誤或缺少關鍵欄位時回傳 null。 */
  function importString(text) {
    try {
      const json = decodeURIComponent(escape(atob(text.trim())));
      const parsed = JSON.parse(json);
      if (typeof parsed !== 'object' || parsed === null || typeof parsed.createdAt !== 'number') return null;
      return migrate(parsed);
    } catch (e) {
      return null;
    }
  }

  window.App.Systems.Save = { load, save, reset, exportString, importString, SAVE_KEY };
})();
