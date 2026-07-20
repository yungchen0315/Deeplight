/* ============================================================================
 * bottomNav.js — 底部 6 鍵導覽，切換分頁容器的可見狀態，含每日簽到未領取的
 * 紅點提示與切換音效。
 * ==========================================================================*/
(function () {
  function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  function bindNav(onSwitch) {
    const Audio = window.App.Systems.Audio;
    document.querySelectorAll('#bottomNav .navBtn').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (Audio) Audio.play('nav');
        const screenId = btn.dataset.screen;
        document.querySelectorAll('.screen').forEach((s) => s.classList.remove('activeScreen'));
        const target = document.getElementById('screen' + capitalize(screenId));
        if (target) target.classList.add('activeScreen');
        document.querySelectorAll('#bottomNav .navBtn').forEach((b) => b.classList.toggle('navActive', b === btn));
        onSwitch(screenId);
      });
    });
  }

  /** 依每日簽到是否可領取，切換「海面」分頁按鈕上的紅點。 */
  function refreshBadges(save) {
    const Daily = window.App.Systems.Daily;
    const surfaceBtn = document.querySelector('#bottomNav .navBtn[data-screen="surface"]');
    if (surfaceBtn) surfaceBtn.classList.toggle('navHasBadge', Daily.canClaim(save));
  }

  window.App.UI.BottomNav = { bindNav, refreshBadges };
})();
