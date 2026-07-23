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
    const priorVersion = saveGame.version || 1;
    // zonesSeen 回填必須在下面「用預設值補上缺欄位」之前做——否則 saveGame.zonesSeen
    // 會先被補成預設的 [0]，讓依 maxDepthEver 回填的邏輯永遠不執行，老玩家就會對早就
    // 經過的海域被連續彈出「抵達新海域」慶祝。
    if (!Array.isArray(saveGame.zonesSeen)) {
      const maxD = saveGame.maxDepthEver || 0;
      saveGame.zonesSeen = window.App.Data.ZONE_DEFS.filter((z) => z.minDepth <= maxD).map((z) => z.id);
    }
    Object.keys(def).forEach((k) => { if (saveGame[k] === undefined) saveGame[k] = def[k]; });
    if (!saveGame.modules) saveGame.modules = {};
    if (!saveGame.bestiary) saveGame.bestiary = {};
    if (!Array.isArray(saveGame.research)) saveGame.research = [];
    if (!Array.isArray(saveGame.refits)) saveGame.refits = [];
    if (!Array.isArray(saveGame.sigils)) saveGame.sigils = [];
    if (!Array.isArray(saveGame.nightPactNodes)) saveGame.nightPactNodes = [];
    if (!Array.isArray(saveGame.eventLog)) saveGame.eventLog = [];
    if (!Array.isArray(saveGame.achievements)) saveGame.achievements = [];
    if (!Array.isArray(saveGame.milestonesClaimed)) saveGame.milestonesClaimed = [];

    saveGame.stats = Object.assign({}, def.stats, saveGame.stats);
    saveGame.settings = Object.assign({}, def.settings, saveGame.settings);
    saveGame.daily = Object.assign({}, def.daily, saveGame.daily);
    saveGame.quests = Object.assign({}, def.quests, saveGame.quests);
    if (!Array.isArray(saveGame.quests.items)) saveGame.quests.items = [];
    saveGame.tutorial = Object.assign({}, def.tutorial, saveGame.tutorial);
    if (!Array.isArray(saveGame.tutorial.seenHints)) saveGame.tutorial.seenHints = [];
    saveGame.captainLog = Object.assign({}, def.captainLog, saveGame.captainLog);
    if (!Array.isArray(saveGame.captainLog.unlockedIds)) saveGame.captainLog.unlockedIds = [];
    if (!Array.isArray(saveGame.signalFragments)) saveGame.signalFragments = [];
    if (typeof saveGame.nextSignalAt !== 'number') saveGame.nextSignalAt = Date.now() + 900000;
    if (typeof saveGame.nextSonarAt !== 'number') saveGame.nextSonarAt = 0;
    saveGame.beginnerQuests = Object.assign({ claimed: [] }, saveGame.beginnerQuests);
    if (!Array.isArray(saveGame.beginnerQuests.claimed)) saveGame.beginnerQuests.claimed = [];

    if (typeof saveGame.tapLureProgress !== 'number') saveGame.tapLureProgress = 0;
    if (typeof saveGame.boostUntil !== 'number') saveGame.boostUntil = 0;
    if (saveGame.tempBuff === undefined) saveGame.tempBuff = null;
    if (typeof saveGame.nextGoldenAt !== 'number') saveGame.nextGoldenAt = Date.now() + 600000;
    if (typeof saveGame.covenantCount !== 'number') saveGame.covenantCount = 0;
    if (typeof saveGame.sigilPoints !== 'number') saveGame.sigilPoints = 0;
    if (typeof saveGame.nightshards !== 'number') saveGame.nightshards = 0;
    if (typeof saveGame.pactCount !== 'number') saveGame.pactCount = 0;
    if (typeof saveGame.nextBackupReminderAt !== 'number') {
      saveGame.nextBackupReminderAt = Date.now() + window.App.Data.BALANCE.BACKUP_REMINDER_INTERVAL_MS;
    }

    // 舊存檔（v1，無 tutorial 欄位、但已有進度）視為已看過教學，避免老玩家被重新導覽。
    if (priorVersion < 2 && saveGame.maxDepthEver > 0) saveGame.tutorial.done = true;

    saveGame.version = 3;
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
