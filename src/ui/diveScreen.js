/* ============================================================================
 * diveScreen.js — 「潛航」主畫面：海域場景、點擊採光、路過生物點擊收集、
 * 錨點閘門按鈕、誘光進度條、珍珠加護面板、每日任務入口、金燈魚事件、週末活動
 * 橫幅。生物用個別 canvas sprite + CSS transition 橫向漂過畫面，不用單一大
 * canvas 手刻動畫迴圈，較不容易出現碰撞判定錯誤。
 * ==========================================================================*/
(function () {
  const U = window.App.Utils;
  const D = window.App.Data;
  const PR = window.App.UI.PixelRenderer;
  const Econ = window.App.Systems.Economy;
  const Descent = window.App.Systems.Descent;
  const Creature = window.App.Systems.Creature;
  const Quest = window.App.Systems.Quest;
  const Golden = window.App.Systems.Golden;
  const Event = window.App.Systems.Event;
  const Modals = window.App.UI.Modals;
  const Toast = window.App.UI.Toast;
  const Audio = window.App.Systems.Audio;
  const FX = window.App.UI.FX;

  let sceneEl = null;
  let hudRefs = null;
  let spawnTimeoutId = null;
  let saveRef = null;
  let onChangeRef = null;
  let active = false;
  let lastZoneId = null;
  let goldenActive = false;
  let weekendShown = false;

  function render(container, save, onChange) {
    saveRef = save;
    onChangeRef = onChange;
    active = true;
    lastZoneId = null;
    goldenActive = false;
    weekendShown = false;
    U.clearNode(container);

    const scene = U.el('div', 'diveScene');
    sceneEl = scene;
    container.appendChild(scene);

    // 海洋雪：固定數量的漂浮粒子，CSS 動畫各自隨機延遲/速度。
    for (let i = 0; i < 14; i++) {
      const snow = U.el('div', 'oceanSnow');
      snow.style.left = Math.random() * 100 + '%';
      snow.style.animationDelay = (Math.random() * 8) + 's';
      snow.style.animationDuration = (6 + Math.random() * 6) + 's';
      scene.appendChild(snow);
    }

    // 燈暈：3 圈同心方環，半徑依螢光/秒對數映射（不用平滑漸層，維持像素感）。
    const haloWrap = U.el('div', 'haloWrap');
    for (let i = 0; i < 3; i++) haloWrap.appendChild(U.el('div', 'haloRing haloRing' + i));
    scene.appendChild(haloWrap);

    // 潛燈號本體。
    const hullWrap = U.el('div', 'hullWrap');
    hullWrap.appendChild(PR.spriteCanvasEl('hull', 4));
    scene.appendChild(hullWrap);

    // 待領取的離線生物徽章。
    const pendingBadge = U.el('div', 'pendingBadge');
    scene.appendChild(pendingBadge);
    U.onTap(pendingBadge, () => claimPending());

    // 錨點閘門按鈕。
    const gateBtn = U.el('button', 'gateBtn', '');
    scene.appendChild(gateBtn);
    U.onTap(gateBtn, () => passGate());

    // 深度尺 + 海域名稱。
    const depthLabel = U.el('div', 'depthLabel', '');
    scene.appendChild(depthLabel);

    // 誘光進度條：累積點擊次數，滿了強制刷一隻生物。
    const lureWrap = U.el('div', 'lureWrap');
    const lureFill = U.el('div', 'lureFill');
    lureWrap.appendChild(lureFill);
    lureWrap.appendChild(U.el('div', 'lureIcon', '🐟'));
    scene.appendChild(lureWrap);

    // 每日任務入口。
    const questBtn = U.el('button', 'questBtn', '📋');
    scene.appendChild(questBtn);
    U.onTap(questBtn, () => openQuestModal());

    // 珍珠加護按鈕。
    const boostBtn = U.el('button', 'pearlBoostBtn', '');
    scene.appendChild(boostBtn);
    U.onTap(boostBtn, () => usePearlBoost());

    // 活動橫幅（週末大遷徙／季節活動），實際文字由 tick() 依當下狀態決定。
    const weekendBanner = U.el('div', 'weekendBanner', '');
    scene.appendChild(weekendBanner);

    hudRefs = { haloWrap, pendingBadge, gateBtn, depthLabel, lureFill, boostBtn, questBtn, weekendBanner };

    // 點擊水域＝手動採光（點在生物/按鈕上時各自的 handler 會 stopPropagation）。
    U.onTap(scene, (e) => {
      Audio.unlock(saveRef);
      if (e && e.target && e.target.closest && (e.target.closest('.creatureSprite') || e.target.closest('.gateBtn') || e.target.closest('.pendingBadge') || e.target.closest('.pearlBoostBtn') || e.target.closest('.questBtn'))) return;
      tapWater(e);
    });

    scheduleSpawn();
    tick(save);

    if (!save.tutorial.done) {
      save.tutorial.done = true;
      Modals.showWelcome();
    }
  }

  function tapWater(e) {
    const result = Econ.applyTap(saveRef);
    Audio.play('tap');
    let xPct = 45 + Math.random() * 10, yPct = 50 + Math.random() * 10;
    if (e && sceneEl && e.clientX !== undefined) {
      const rect = sceneEl.getBoundingClientRect();
      if (rect.width) { xPct = ((e.clientX - rect.left) / rect.width) * 100; yPct = ((e.clientY - rect.top) / rect.height) * 100; }
    }
    FX.popNumber(sceneEl, xPct, yPct, '+' + U.formatNum(result.amount));
    if (result.lureTriggered) forceSpawnSoon();
    if (onChangeRef) onChangeRef();
  }

  function forceSpawnSoon() {
    if (spawnTimeoutId) clearTimeout(spawnTimeoutId);
    spawnTimeoutId = setTimeout(spawnCreature, 250);
  }

  function scheduleSpawn() {
    if (!active) return;
    const delay = Creature.nextSpawnDelayMs(saveRef);
    spawnTimeoutId = setTimeout(spawnCreature, delay);
  }

  function collectOnScreenCreature(def, wrap, collectedRef) {
    if (collectedRef.done) return;
    collectedRef.done = true;
    const result = Creature.collect(saveRef, def.id);
    const wrapRect = wrap.getBoundingClientRect();
    const sceneRect = sceneEl.getBoundingClientRect();
    const xPct = sceneRect.width ? ((wrapRect.left + wrapRect.width / 2 - sceneRect.left) / sceneRect.width) * 100 : 50;
    const yPct = sceneRect.height ? ((wrapRect.top + wrapRect.height / 2 - sceneRect.top) / sceneRect.height) * 100 : 50;
    wrap.remove();
    if (result.ok) {
      Audio.play(def.rare ? 'rare' : 'collect');
      FX.popNumber(sceneEl, xPct, yPct, '+' + U.formatNum(result.burst), 'popBig');
      FX.burst(sceneEl, xPct, yPct, def.rare ? 'VIOLET' : 'GLOW2', def.rare ? 16 : 10);
      Toast.toast('+' + U.formatNum(result.burst) + ' 螢光' + (result.gotSample ? '　+1 樣本' : '') + (result.gotPearl ? '　+1 珍珠' : ''));
      if (result.isFirst) { Audio.play('discovery'); Modals.showDiscoveryCard(def); }
      checkAchievements();
      if (onChangeRef) onChangeRef();
    }
  }

  function spawnCreature() {
    if (!active || !sceneEl) return;
    const def = Creature.rollSpecies(saveRef);
    if (!def) { scheduleSpawn(); return; }
    const scale = 3;
    const wrap = U.el('div', 'creatureSprite' + (def.rare ? ' creatureRare' : ''));
    wrap.appendChild(FX.isReduced() ? PR.spriteCanvasEl(def.icon, scale) : PR.animatedSpriteCanvasEl(def.icon, scale));
    const topPct = 20 + Math.random() * 45;
    wrap.style.top = topPct + '%';
    const goingRight = Math.random() < 0.5;
    wrap.style.left = goingRight ? '-15%' : '110%';
    sceneEl.appendChild(wrap);

    const lifespanMs = 9000 + Math.random() * 3000;
    requestAnimationFrame(() => {
      wrap.style.transition = 'left ' + (lifespanMs / 1000) + 's linear';
      wrap.style.left = goingRight ? '110%' : '-15%';
    });

    const collectedRef = { done: false };
    U.onTap(wrap, () => collectOnScreenCreature(def, wrap, collectedRef));

    const eff = Econ.computeEffects(saveRef);
    if (eff.autoCollect) {
      setTimeout(() => collectOnScreenCreature(def, wrap, collectedRef), D.BALANCE.AUTO_COLLECT_DELAY_MS / eff.autoSpeedMult);
    }

    const timeoutId = setTimeout(() => { if (!collectedRef.done) wrap.remove(); }, lifespanMs + 200);
    wrap.addEventListener('transitionend', () => { clearTimeout(timeoutId); if (!collectedRef.done) wrap.remove(); });

    scheduleSpawn();
  }

  function spawnGolden() {
    if (!active || !sceneEl || goldenActive) return;
    goldenActive = true;
    const wrap = U.el('div', 'creatureSprite creatureGolden');
    wrap.appendChild(PR.spriteCanvasEl('c_golden', 3));
    const topPct = 20 + Math.random() * 45;
    wrap.style.top = topPct + '%';
    const goingRight = Math.random() < 0.5;
    wrap.style.left = goingRight ? '-15%' : '110%';
    sceneEl.appendChild(wrap);

    const lifespanMs = D.BALANCE.GOLDEN_LIFESPAN_MS;
    requestAnimationFrame(() => {
      wrap.style.transition = 'left ' + (lifespanMs / 1000) + 's linear';
      wrap.style.left = goingRight ? '110%' : '-15%';
    });

    let caught = false;
    function missGolden() {
      if (caught) return;
      goldenActive = false;
      Golden.scheduleNext(saveRef);
      wrap.remove();
    }
    U.onTap(wrap, () => {
      if (caught) return;
      caught = true;
      wrap.remove();
      openGoldenChoiceModal();
    });
    const timeoutId = setTimeout(missGolden, lifespanMs + 200);
    wrap.addEventListener('transitionend', () => { clearTimeout(timeoutId); missGolden(); });
  }

  function openGoldenChoiceModal() {
    const choices = Golden.rollChoices();
    Modals.showModal((box, close) => {
      box.appendChild(U.el('div', 'modalTitle', '捕獲金燈魚！'));
      box.appendChild(U.el('div', 'modalLine', '選擇一項限時增益：'));
      choices.forEach((def) => {
        const btn = U.el('button', 'modalBtn goldenChoiceBtn', def.label);
        U.onTap(btn, () => {
          const r = Golden.applyBuff(saveRef, def.id);
          saveRef.stats.totalGoldenCaught = (saveRef.stats.totalGoldenCaught || 0) + 1;
          Golden.scheduleNext(saveRef);
          goldenActive = false;
          close();
          Audio.play('rare');
          if (r.gained) Toast.toast('+' + U.formatNum(r.gained) + ' 螢光');
          else Toast.toast('已套用：' + def.label);
          checkAchievements();
          if (onChangeRef) onChangeRef();
        });
        box.appendChild(btn);
      });
    });
  }

  function openQuestModal() {
    Quest.ensureToday(saveRef);
    Modals.showModal((box, close) => {
      box.appendChild(U.el('div', 'modalTitle', '每日任務'));
      saveRef.quests.items.forEach((item) => {
        const tpl = D.questTemplateById(item.tplId);
        if (!tpl) return;
        const progress = Quest.progressFor(saveRef, item);
        const done = Quest.isDone(saveRef, item);
        const row = U.el('div', 'questRow' + (item.claimed ? ' questClaimed' : ''));
        row.appendChild(U.el('div', 'questLabel', (item.claimed ? '✔ ' : '') + tpl.label + '（' + Math.floor(progress) + ' / ' + item.target + tpl.unit + '）'));
        const barWrap = U.el('div', 'questBarWrap');
        const bar = U.el('div', 'questBarFill');
        bar.style.width = (Math.min(1, progress / item.target) * 100) + '%';
        barWrap.appendChild(bar);
        row.appendChild(barWrap);
        if (!item.claimed) {
          const btn = U.el('button', 'smallBtn' + (done ? '' : ' disabled'), '領取 · ' + tpl.reward + ' SP');
          U.onTap(btn, () => {
            const r = Quest.claim(saveRef, item.tplId);
            if (r.ok) {
              Audio.play('daily'); FX.popButton(btn);
              Toast.toast('任務完成：+' + r.reward + ' 樣本' + (r.bonus ? '　全部完成 +' + r.bonus + ' 珍珠' : ''));
              if (onChangeRef) onChangeRef();
              close(); openQuestModal();
            } else { Audio.play('error'); Toast.toast(r.reason); }
          });
          row.appendChild(btn);
        }
        box.appendChild(row);
      });
      const closeBtn = U.el('button', 'modalBtn', '關閉');
      U.onTap(closeBtn, close);
      box.appendChild(closeBtn);
    });
  }

  function claimPending() {
    const result = Creature.claimPending(saveRef);
    if (!result.ok) { Toast.toast(result.reason || '沒有待領取的生物'); return; }
    Audio.play('collect');
    FX.popNumber(sceneEl, 50, 30, '+' + U.formatNum(result.burst), 'popBig');
    Toast.toast('+' + U.formatNum(result.burst) + ' 螢光' + (result.gotSample ? '　+1 樣本' : '') + (result.gotPearl ? '　+1 珍珠' : ''));
    if (result.isFirst) { Audio.play('discovery'); Modals.showDiscoveryCard(result.def); }
    checkAchievements();
    if (onChangeRef) onChangeRef();
    tick(saveRef);
  }

  function passGate() {
    const result = Descent.passGate(saveRef);
    if (!result.ok) { Audio.play('error'); Toast.toast(result.reason); return; }
    Audio.play('gate');
    FX.shake(document.getElementById('screens'), 4, 250);
    FX.burst(sceneEl, 50, 50, 'AMBER', 24);
    Toast.toast('已加固艙體，進入「' + result.zone.name + '」');
    if (onChangeRef) onChangeRef();
    tick(saveRef);
  }

  function usePearlBoost() {
    const result = Econ.buyPearlBoost(saveRef);
    if (!result.ok) { Audio.play('error'); Toast.toast(result.reason); return; }
    Audio.play('upgrade');
    FX.popButton(hudRefs.boostBtn);
    Toast.toast('珍珠加護 +' + D.BALANCE.PEARL_BOOST_HOURS + ' 小時（全產量 x' + D.BALANCE.PEARL_BOOST_MULT + '）');
    if (onChangeRef) onChangeRef();
  }

  function checkAchievements() {
    const newly = window.App.Systems.Achievement.checkAchievements(saveRef);
    newly.forEach((a) => { Audio.play('achievement'); Toast.toast('成就解鎖：' + a.name + (a.pearl ? '　+' + a.pearl + ' 珍珠' : '')); });
  }

  /** 由 bootstrap 每個 tick 呼叫，只更新數字/樣式，不重建生物節點（避免打斷 CSS transition）。 */
  function tick(save) {
    if (!active || !hudRefs) return;
    saveRef = save;
    const gps = Econ.glowPerSec(save);
    const radius = 24 + 8 * Math.log10(1 + gps);
    hudRefs.haloWrap.querySelectorAll('.haloRing').forEach((ring, i) => {
      const r = radius + i * 14;
      ring.style.width = (r * 2) + 'px';
      ring.style.height = (r * 2) + 'px';
      ring.style.marginLeft = (-r) + 'px';
      ring.style.marginTop = (-r) + 'px';
    });

    hudRefs.pendingBadge.textContent = save.pendingCreatures > 0 ? ('🔔 ' + save.pendingCreatures) : '';
    hudRefs.pendingBadge.style.display = save.pendingCreatures > 0 ? 'block' : 'none';

    const zone = D.zoneForDepth(save.depth) || D.ZONE_DEFS[0];
    sceneEl.style.background = D.PALETTE[zone.bg];
    sceneEl.style.filter = zone.filterHue ? ('hue-rotate(' + zone.filterHue + 'deg)') : '';
    hudRefs.depthLabel.textContent = Math.floor(save.depth) + ' m　' + zone.name;
    if (zone.id !== lastZoneId) { lastZoneId = zone.id; Audio.setAmbientZone(zone.id); }

    if (Descent.atGate(save)) {
      const cost = Descent.gateCost(save);
      const ready = save.glow >= cost;
      // 「可負擔」不只靠顏色區分（色盲不友善），加固艙體按鈕文字前面也會多一個 ✓。
      hudRefs.gateBtn.textContent = (ready ? '✓ ' : '') + '加固艙體 · ' + U.formatNum(cost) + ' 螢光';
      hudRefs.gateBtn.style.display = 'block';
      hudRefs.gateBtn.classList.toggle('gateBtnReady', ready);
    } else {
      hudRefs.gateBtn.style.display = 'none';
    }

    const lureFraction = (save.tapLureProgress % D.BALANCE.TAPS_PER_LURE) / D.BALANCE.TAPS_PER_LURE;
    hudRefs.lureFill.style.width = (lureFraction * 100) + '%';

    const remainMs = (save.boostUntil || 0) - Date.now();
    if (remainMs > 0) {
      hudRefs.boostBtn.textContent = '⚡ 加護中 ' + Math.ceil(remainMs / 60000) + 'm';
      hudRefs.boostBtn.classList.add('boostActive');
    } else {
      hudRefs.boostBtn.textContent = '🔮 珍珠加護 (' + save.pearls + ')';
      hudRefs.boostBtn.classList.remove('boostActive');
    }
    hudRefs.boostBtn.classList.toggle('disabled', save.pearls < 1 && remainMs <= 0);

    // 活動橫幅：季節活動優先於週末大遷徙（比較稀有、值得優先讓玩家看到）。
    const seasonal = Event.currentSeasonalEvent();
    const bannerText = seasonal ? seasonal.banner : (Event.isWeekend() ? '🎉 週末大遷徙：生物出現速度 x2' : null);
    if (bannerText) {
      hudRefs.weekendBanner.textContent = bannerText;
      if (!weekendShown) { weekendShown = true; hudRefs.weekendBanner.classList.add('weekendBannerShow'); }
    } else if (weekendShown) {
      weekendShown = false;
      hudRefs.weekendBanner.classList.remove('weekendBannerShow');
    }

    if (!goldenActive && Golden.dueToSpawn(save)) spawnGolden();
  }

  function deactivate() {
    active = false;
    if (spawnTimeoutId) clearTimeout(spawnTimeoutId);
    spawnTimeoutId = null;
  }

  window.App.UI.DiveScreen = { render, tick, deactivate, forceSpawnSoon };
})();
