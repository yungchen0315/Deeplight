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
  const B = window.App.Data.BALANCE;

  let save;
  let currentScreenId = 'dive';
  let lastTickAt;
  let lastSaveAt;

  function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  function applySettings() {
    U.setNumberFormat(save.settings.numberFormat);
    FX.syncSettings(save);
    Audio.syncSettings(save);
    document.body.classList.toggle('highContrast', !!save.settings.highContrast);
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
    if ((result.autoBoughtModule || result.autoGatedZone) && currentScreenId !== 'dive') renderScreen(currentScreenId);
    Hint.checkHints(save).forEach((msg) => window.App.UI.Toast.toast(msg));
    if (now - lastSaveAt >= B.AUTOSAVE_INTERVAL_MS) { Save.save(save); lastSaveAt = now; }
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
    if (isNewSave) Save.save(save);

    setInterval(loopTick, B.TICK_INTERVAL_MS);

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        Save.save(save);
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

    window.addEventListener('beforeunload', () => Save.save(save));

    registerServiceWorker();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
