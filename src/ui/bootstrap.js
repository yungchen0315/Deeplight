/* ============================================================================
 * bootstrap.js — 進入點：讀檔／建立新存檔、離線結算、掛上畫面與導覽、
 * 啟動主迴圈（實測 dt tick + 定期自動存檔）、註冊 Service Worker。必須最後載入。
 * ==========================================================================*/
(function () {
  const Save = window.App.Systems.Save;
  const Models = window.App.Models;
  const GameLoop = window.App.Systems.GameLoop;
  const Offline = window.App.Systems.Offline;
  const Quest = window.App.Systems.Quest;
  const Hint = window.App.Systems.Hint;
  const Audio = window.App.Systems.Audio;
  const FX = window.App.UI.FX;
  const U = window.App.Utils;
  const Modals = window.App.UI.Modals;
  const SettingsModal = window.App.UI.SettingsModal;
  const TopBar = window.App.UI.TopBar;
  const BottomNav = window.App.UI.BottomNav;
  const DiveScreen = window.App.UI.DiveScreen;
  const ModulesScreen = window.App.UI.ModulesScreen;
  const ResearchScreen = window.App.UI.ResearchScreen;
  const SurfaceScreen = window.App.UI.SurfaceScreen;
  const CovenantScreen = window.App.UI.CovenantScreen;
  const PactScreen = window.App.UI.PactScreen;
  const B = window.App.Data.BALANCE;

  let save;
  let currentScreenId = 'dive';
  let lastTickAt;
  let lastSaveAt;
  let saveFailureWarned = false;

  function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  /** localStorage 可能因隱私瀏覽模式／儲存空間配額用盡而寫入失敗且不拋例外——
   *  Save.save() 遇到這種情況只會安靜回傳 false。之前完全沒有任何呼叫端檢查這個
   *  回傳值，代表玩家可能在完全沒有警告的情況下持續遊玩、卻從未真正存檔成功，
   *  分頁一關就整份進度消失。這裡只在第一次偵測到失敗時提示一次，避免每次自動
   *  存檔都彈一次 toast 洗版。 */
  function trySave() {
    const ok = Save.save(save);
    if (!ok && !saveFailureWarned) {
      saveFailureWarned = true;
      window.App.UI.Toast.toast('⚠️ 存檔失敗，目前進度可能無法保存，請確認瀏覽器儲存空間或隱私瀏覽設定');
    }
    return ok;
  }

  function applySettings() {
    U.setNumberFormat(save.settings.numberFormat);
    FX.syncSettings(save);
    Audio.syncSettings(save);
    document.body.classList.toggle('highContrast', !!save.settings.highContrast);
    document.body.classList.toggle('textScaleLarge', save.settings.textScale === 'large');
    document.body.classList.toggle('textScaleXLarge', save.settings.textScale === 'xlarge');
  }

  function renderScreen(screenId) {
    const container = document.getElementById('screen' + capitalize(screenId));
    if (!container) return;
    if (screenId === 'dive') {
      DiveScreen.render(container, save, () => { TopBar.refresh(save); BottomNav.refreshBadges(save); });
    } else {
      const onChange = () => { TopBar.refresh(save); BottomNav.refreshBadges(save); renderScreen(screenId); };
      if (screenId === 'modules') ModulesScreen.render(container, save, onChange);
      else if (screenId === 'research') ResearchScreen.render(container, save, onChange);
      else if (screenId === 'surface') SurfaceScreen.render(container, save, onChange);
      else if (screenId === 'covenant') CovenantScreen.render(container, save, onChange);
      else if (screenId === 'pact') PactScreen.render(container, save, onChange);
    }
  }

  function loopTick() {
    const now = Date.now();
    const dtMs = now - lastTickAt;
    lastTickAt = now;
    Quest.ensureToday(save, now);
    const result = GameLoop.tick(save, dtMs);
    TopBar.refresh(save);
    if (currentScreenId === 'dive') DiveScreen.tick(save);
    result.newAchievements.forEach((a) => {
      Audio.play('achievement');
      window.App.UI.Toast.toast('成就解鎖：' + a.name + (a.pearl ? '　+' + a.pearl + ' 珍珠' : ''));
    });
    if (result.autoTapped && result.lureTriggered && currentScreenId === 'dive') DiveScreen.forceSpawnSoon();
    if (result.autoGatedZone) {
      Audio.play('gate');
      window.App.UI.Toast.toast('自動通過閘門，進入「' + result.autoGatedZone.name + '」');
    }
    if (result.autoClaimedQuestCount > 0) {
      Audio.play('daily');
      window.App.UI.Toast.toast('自動領取了 ' + result.autoClaimedQuestCount + ' 個每日任務');
    }
    if ((result.autoBoughtModule || result.autoGatedZone || result.autoClaimedQuestCount > 0) && currentScreenId !== 'dive') renderScreen(currentScreenId);
    Hint.checkHints(save).forEach((msg) => window.App.UI.Toast.toast(msg));

    // 存檔備份提醒：只有真的玩出一點進度才提醒，避免對剛開始的新玩家碎碎念。
    if (save.maxDepthEver >= B.BACKUP_REMINDER_MIN_DEPTH && now >= (save.nextBackupReminderAt || 0)) {
      save.nextBackupReminderAt = now + B.BACKUP_REMINDER_INTERVAL_MS;
      window.App.UI.Toast.toast('💾 存檔只存在這台裝置，建議到設定頁匯出備份一下');
    }
    if (now - lastSaveAt >= B.AUTOSAVE_INTERVAL_MS) { trySave(); lastSaveAt = now; }
  }

  function registerServiceWorker() {
    if (!('serviceWorker' in navigator) || location.protocol === 'file:') return;
    navigator.serviceWorker.register('sw.js').catch(() => { /* 離線優先，註冊失敗不影響遊戲本體 */ });
  }

  function init() {
    const now = Date.now();
    save = Save.load();
    let offlineReport = null;
    let isNewSave = false;
    if (!save) {
      save = Models.createDefaultSave(now);
      isNewSave = true;
    } else {
      offlineReport = Offline.settle(save, now);
    }
    lastTickAt = now;
    lastSaveAt = now;

    applySettings();
    Quest.ensureToday(save, now);

    renderScreen(currentScreenId);
    TopBar.refresh(save);
    TopBar.ensureGearButton(() => SettingsModal.open(save, () => { applySettings(); TopBar.refresh(save); renderScreen(currentScreenId); }));
    BottomNav.refreshBadges(save);

    BottomNav.bindNav((screenId) => {
      if (currentScreenId === 'dive' && screenId !== 'dive') DiveScreen.deactivate();
      currentScreenId = screenId;
      renderScreen(screenId);
    });

    if (offlineReport) Modals.showOfflineReport(offlineReport);
    if (isNewSave) trySave();

    setInterval(loopTick, B.TICK_INTERVAL_MS);

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        trySave();
      } else {
        const n = Date.now();
        const report = Offline.settle(save, n);
        lastTickAt = n;
        if (report) {
          Modals.showOfflineReport(report);
          renderScreen(currentScreenId);
        }
        BottomNav.refreshBadges(save);
      }
    });

    window.addEventListener('beforeunload', () => trySave());

    registerServiceWorker();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
