/* ============================================================================
 * sw.js — Service Worker：cache-first 離線快取。CACHE_NAME 每次發版遞增版本號，
 * activate 階段清掉舊快取。純靜態站台，沒有需要 network-first 的 API 呼叫。
 * ==========================================================================*/
const CACHE_NAME = 'deeplight-v1.4.0';

const PRECACHE_URLS = [
  './',
  'index.html',
  'css/style.css',
  'manifest.webmanifest',
  'icons/icon.svg',
  'icons/icon-maskable.svg',
  'src/utils/namespace.js',
  'src/utils/mathUtils.js',
  'src/utils/timeUtils.js',
  'src/utils/domUtils.js',
  'src/data/palette.js',
  'src/data/balance.js',
  'src/data/sprites.js',
  'src/data/zoneDefs.js',
  'src/data/moduleDefs.js',
  'src/data/researchDefs.js',
  'src/data/refitDefs.js',
  'src/data/sigilDefs.js',
  'src/data/pactDefs.js',
  'src/data/creatureDefs.js',
  'src/data/achievementDefs.js',
  'src/data/milestoneDefs.js',
  'src/data/questDefs.js',
  'src/data/goldenBuffDefs.js',
  'src/data/compendiumDefs.js',
  'src/data/logDefs.js',
  'src/data/ambientFlavorDefs.js',
  'src/models/SaveGame.js',
  'src/systems/saveSystem.js',
  'src/systems/eventLogSystem.js',
  'src/systems/economySystem.js',
  'src/systems/descentSystem.js',
  'src/systems/creatureSystem.js',
  'src/systems/researchSystem.js',
  'src/systems/prestigeSystem.js',
  'src/systems/covenantSystem.js',
  'src/systems/pactSystem.js',
  'src/systems/hintSystem.js',
  'src/systems/offlineSystem.js',
  'src/systems/achievementSystem.js',
  'src/systems/milestoneSystem.js',
  'src/systems/audioSystem.js',
  'src/systems/dailySystem.js',
  'src/systems/questSystem.js',
  'src/systems/eventSystem.js',
  'src/systems/goldenCreatureSystem.js',
  'src/systems/logSystem.js',
  'src/systems/gameLoopSystem.js',
  'src/ui/pixelRenderer.js',
  'src/ui/fx.js',
  'src/ui/toast.js',
  'src/ui/modals.js',
  'src/ui/settingsModal.js',
  'src/ui/compendiumModal.js',
  'src/ui/bestiaryDetailModal.js',
  'src/ui/eventLogModal.js',
  'src/ui/captainLogModal.js',
  'src/ui/prestigeCalculatorModal.js',
  'src/ui/moduleDetailModal.js',
  'src/ui/nodeDetailModal.js',
  'src/ui/topBar.js',
  'src/ui/bottomNav.js',
  'src/ui/diveScreen.js',
  'src/ui/modulesScreen.js',
  'src/ui/researchScreen.js',
  'src/ui/shareCard.js',
  'src/ui/surfaceScreen.js',
  'src/ui/covenantScreen.js',
  'src/ui/pactScreen.js',
  'src/ui/bootstrap.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return response;
      }).catch(() => cached);
    })
  );
});
