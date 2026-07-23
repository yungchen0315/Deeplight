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
  const BeginnerQuest = window.App.Systems.BeginnerQuest;
  const VoyageGoal = window.App.Systems.VoyageGoal;
  const Golden = window.App.Systems.Golden;
  const Signal = window.App.Systems.Signal;
  const Event = window.App.Systems.Event;
  const Modals = window.App.UI.Modals;
  const Toast = window.App.UI.Toast;
  const Audio = window.App.Systems.Audio;
  const FX = window.App.UI.FX;

  let sceneEl = null;
  let hudRefs = null;
  let spawnTimeoutId = null;
  let flavorTimeoutId = null;
  let saveRef = null;
  let onChangeRef = null;
  let active = false;
  let lastZoneId = null;
  let goldenActive = false;
  let signalActive = false;
  let weekendShown = false;
  let goldenMissFn = null;
  let signalMissFn = null;
  let lastGoalId = null;
  // 誘光進度條的強制刷新（forceSpawnSoon）跟聲納脈衝（forceSpawnSonar）共用同一個
  // spawnTimeoutId 排程位置——同一時間只會有「下一隻要刷新的生物」這一件事，兩邊都只
  // 是「現在就刷新」的請求。如果各自把稀有加成直接綁進 setTimeout 的 closure 裡，
  // 後呼叫的那邊會直接覆蓋前者，等於玩家已經花掉聲納冷卻卻拿不到稀有加成。改成一個
  // 共用的「待生效加成」，由實際觸發的那次 spawnCreature 讀取並清空，兩邊誰先觸發
  // 都不會遺漏加成。
  let pendingRareBonusMult = 1;

  function render(container, save, onChange) {
    saveRef = save;
    onChangeRef = onChange;
    active = true;
    lastZoneId = null;
    goldenActive = false;
    signalActive = false;
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
    hullWrap.appendChild(PR.spriteCanvasEl(D.hullSpriteIdFor(save), 4));
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

    // 聲納脈衝：主動技能，冷卻好了就能按，立即強制刷一隻生物且稀有機率加成——
    // 給玩家一個「自己決定節奏」的主動選擇，不是只能等路過生物隨機出現或狂點水面。
    const sonarBtn = U.el('button', 'sonarBtn', '📡');
    scene.appendChild(sonarBtn);
    U.onTap(sonarBtn, () => triggerSonar());

    // 珍珠加護按鈕。
    const boostBtn = U.el('button', 'pearlBoostBtn', '');
    scene.appendChild(boostBtn);
    U.onTap(boostBtn, () => usePearlBoost());

    // 活動橫幅（週末大遷徙／季節活動），實際文字由 tick() 依當下狀態決定。
    const weekendBanner = U.el('div', 'weekendBanner', '');
    scene.appendChild(weekendBanner);

    // 環境觀測記錄：純氣氛的一行字，跟數值無關，見 scheduleFlavor()。
    const flavorLine = U.el('div', 'diveFlavorLine', '');
    scene.appendChild(flavorLine);

    // 航路目標：底部常駐橫幅，永遠告訴玩家「接下來最該做的一件事」，實際文字由
    // tick() 依當下存檔狀態算出（見 voyageGoalSystem.js）。
    const goalBanner = U.el('div', 'voyageGoal');
    const goalText = U.el('div', 'voyageGoalText');
    goalBanner.appendChild(goalText);
    const goalBarWrap = U.el('div', 'voyageGoalBar');
    const goalFill = U.el('div', 'voyageGoalFill');
    goalBarWrap.appendChild(goalFill);
    goalBanner.appendChild(goalBarWrap);
    scene.appendChild(goalBanner);

    hudRefs = { haloWrap, pendingBadge, gateBtn, depthLabel, lureFill, boostBtn, questBtn, weekendBanner, flavorLine, sonarBtn, goalBanner, goalText, goalFill, goalBarWrap };
    lastGoalId = null;

    // 點擊水域＝手動採光（點在生物/按鈕上時各自的 handler 會 stopPropagation）。
    U.onTap(scene, (e) => {
      Audio.unlock(saveRef);
      if (e && e.target && e.target.closest && (e.target.closest('.creatureSprite') || e.target.closest('.gateBtn') || e.target.closest('.pendingBadge') || e.target.closest('.pearlBoostBtn') || e.target.closest('.questBtn'))) return;
      tapWater(e);
    });

    scheduleSpawn();
    scheduleFlavor();
    tick(save);

    if (!save.tutorial.done) {
      save.tutorial.done = true;
      Modals.showWelcome();
    }
  }

  let lastTapAt = 0;

  /** 手動點擊水域有最短間隔限制（見 balance.js CLICK_TAP_COOLDOWN_MS）：獎勵是「目前
   *  每秒產量的一個比例」，沒有冷卻的話單純狂點滑鼠／觸控就能無上限疊加，等同繞過
   *  整條放置節奏——冷卻時間內的多餘點擊直接忽略（不給獎勵也不給音效/特效回饋），
   *  逼近冷卻速率點擊時，實際每秒收益趨近一個固定倍率，而不是無限。 */
  function tapWater(e) {
    const now = Date.now();
    if (now - lastTapAt < D.BALANCE.CLICK_TAP_COOLDOWN_MS) return;
    lastTapAt = now;
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

  /** 環境觀測記錄：跟路過生物完全獨立的一條計時器，純氣氛、不影響任何數值，
   *  依目前海域深度決定文字語氣梯度（見 ambientFlavorDefs.js）。 */
  function scheduleFlavor() {
    if (!active) return;
    const B = D.BALANCE;
    const [min, max] = B.AMBIENT_FLAVOR_INTERVAL_MS;
    flavorTimeoutId = setTimeout(showFlavor, U.randomInt(min, max));
  }

  function showFlavor() {
    if (!active || !hudRefs) { scheduleFlavor(); return; }
    const tier = D.flavorTierForZone(saveRef.currentZone);
    const pool = D.AMBIENT_FLAVOR_TIERS[tier];
    const line = U.choice(pool);
    const el = hudRefs.flavorLine;
    el.textContent = line;
    el.classList.add('diveFlavorShow');
    setTimeout(() => el.classList.remove('diveFlavorShow'), D.BALANCE.AMBIENT_FLAVOR_SHOW_MS);
    scheduleFlavor();
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
    const rareBonusMult = pendingRareBonusMult;
    pendingRareBonusMult = 1;
    const def = Creature.rollSpecies(saveRef, rareBonusMult);
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

    let resolved = false;
    function missGolden() {
      if (resolved) return;
      resolved = true;
      clearTimeout(timeoutId);
      goldenMissFn = null;
      goldenActive = false;
      Golden.scheduleNext(saveRef);
      wrap.remove();
    }
    const timeoutId = setTimeout(missGolden, lifespanMs + 200);
    goldenMissFn = missGolden;
    U.onTap(wrap, () => {
      if (resolved) return;
      resolved = true;
      clearTimeout(timeoutId);
      goldenMissFn = null;
      wrap.remove();
      openGoldenChoiceModal();
    });
    wrap.addEventListener('transitionend', missGolden);
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

  /** 深淵訊號殘片：全遊戲最稀有的隨機事件，動作跟金燈魚幾乎一樣（漂過畫面、點擊
   *  收集），但視覺/音效刻意做得「不自然」，且收集後開的是解碼卡片而不是選擇彈窗。 */
  function spawnSignal() {
    if (!active || !sceneEl || signalActive) return;
    signalActive = true;
    const wrap = U.el('div', 'creatureSprite creatureSignal');
    wrap.appendChild(PR.spriteCanvasEl('c_signal', 3));
    const topPct = 20 + Math.random() * 45;
    wrap.style.top = topPct + '%';
    const goingRight = Math.random() < 0.5;
    wrap.style.left = goingRight ? '-15%' : '110%';
    sceneEl.appendChild(wrap);

    const lifespanMs = D.BALANCE.SIGNAL_LIFESPAN_MS;
    requestAnimationFrame(() => {
      wrap.style.transition = 'left ' + (lifespanMs / 1000) + 's linear';
      wrap.style.left = goingRight ? '110%' : '-15%';
    });

    let resolved = false;
    function missSignal() {
      if (resolved) return;
      resolved = true;
      clearTimeout(timeoutId);
      signalMissFn = null;
      signalActive = false;
      Signal.scheduleNext(saveRef);
      wrap.remove();
    }
    const timeoutId = setTimeout(missSignal, lifespanMs + 200);
    signalMissFn = missSignal;
    U.onTap(wrap, () => {
      if (resolved) return;
      resolved = true;
      clearTimeout(timeoutId);
      signalMissFn = null;
      wrap.remove();
      const r = Signal.collect(saveRef);
      signalActive = false;
      Signal.scheduleNext(saveRef);
      if (!r.ok) return;
      Audio.play('signal');
      checkAchievements();
      openSignalModal(r.def, r.justCompleted);
      if (onChangeRef) onChangeRef();
    });
    wrap.addEventListener('transitionend', missSignal);
  }

  function openSignalModal(def, justCompleted) {
    Modals.showModal((box, close) => {
      box.appendChild(U.el('div', 'modalTitle', '深淵訊號殘片'));
      box.appendChild(U.el('div', 'modalLine signalFragmentText', def.text));
      box.appendChild(U.el('div', 'subHint', '（' + saveRef.signalFragments.length + ' / ' + D.SIGNAL_FRAGMENT_DEFS.length + '，+' + D.BALANCE.SIGNAL_PEARL_REWARD + ' 珍珠）'));
      if (justCompleted) {
        box.appendChild(U.el('div', 'compendiumLine bestiaryLore', '——所有殘片都收集齊了。潛航日誌裡多了一篇新的條目，去看看吧。'));
      }
      const btn = U.el('button', 'modalBtn', '關閉');
      U.onTap(btn, close);
      box.appendChild(btn);
    });
  }

  function openQuestModal() {
    Quest.ensureToday(saveRef);
    Modals.showModal((box, close) => {
      if (!BeginnerQuest.allClaimed(saveRef)) {
        box.appendChild(U.el('div', 'modalTitle', '新手任務'));
        D.BEGINNER_QUEST_DEFS.forEach((tpl) => {
          const claimed = BeginnerQuest.isClaimed(saveRef, tpl.id);
          const progress = BeginnerQuest.progressFor(saveRef, tpl);
          const done = BeginnerQuest.isDone(saveRef, tpl);
          const row = U.el('div', 'questRow' + (claimed ? ' questClaimed' : ''));
          row.appendChild(U.el('div', 'questLabel', (claimed ? '✔ ' : '') + tpl.label + '（' + Math.floor(progress) + ' / ' + tpl.target + tpl.unit + '）'));
          const barWrap = U.el('div', 'questBarWrap');
          const bar = U.el('div', 'questBarFill');
          bar.style.width = (Math.min(1, progress / tpl.target) * 100) + '%';
          barWrap.appendChild(bar);
          row.appendChild(barWrap);
          if (!claimed) {
            const rewardLabel = '領取 · ' + tpl.rewardSamples + ' 樣本' + (tpl.rewardPearls ? ' +' + tpl.rewardPearls + ' 珍珠' : '');
            const btn = U.el('button', 'smallBtn' + (done ? '' : ' disabled'), rewardLabel);
            U.onTap(btn, () => {
              const r = BeginnerQuest.claim(saveRef, tpl.id);
              if (r.ok) {
                Audio.play('daily'); FX.popButton(btn);
                Toast.toast('新手任務完成：+' + r.rewardSamples + ' 樣本' + (r.rewardPearls ? '　+' + r.rewardPearls + ' 珍珠' : ''));
                if (onChangeRef) onChangeRef();
                close(); openQuestModal();
              } else { Audio.play('error'); Toast.toast(r.reason); }
            });
            row.appendChild(btn);
          }
          box.appendChild(row);
        });
        box.appendChild(U.el('div', 'settingsSep'));
      }
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
    // 第一次抵達某片海域：放一個一次性的慶祝彈窗（值得記住的進度里程碑）；
    // 之後轉生重玩經過同一片海域，就只留一行 toast，不再打斷節奏。
    if (result.firstTime) Modals.showZoneReached(result.zone);
    else Toast.toast('已加固艙體，進入「' + result.zone.name + '」');
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

    hudRefs.questBtn.classList.toggle('hasBadge', BeginnerQuest.claimableCount(save) > 0);

    // 用 currentZone（而非 zoneForDepth(depth)）取得目前海域：depth 到達錨點時會
    // 精準等於 anchorDepth，zoneForDepth 的 `depth < anchorDepth` 判斷在這個邊界值
    // 會跨到下一海域，導致還沒付過路費就先顯示下一海域的名稱/背景。
    const zone = D.zoneById(save.currentZone) || D.ZONE_DEFS[0];
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
      hudRefs.boostBtn.textContent = '🔮 珍珠加護 (' + U.formatNum(save.pearls) + ')';
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
    if (!signalActive && Signal.dueToSpawn(save)) spawnSignal();

    const sonarRemainMs = (save.nextSonarAt || 0) - Date.now();
    if (sonarRemainMs > 0) {
      hudRefs.sonarBtn.textContent = Math.ceil(sonarRemainMs / 1000) + 's';
      hudRefs.sonarBtn.classList.add('disabled');
    } else {
      hudRefs.sonarBtn.textContent = '📡';
      hudRefs.sonarBtn.classList.remove('disabled');
    }

    updateVoyageGoal(save);
  }

  /** 更新底部航路目標橫幅：文字＋進度條，目標 id 變了（＝上一個目標達成）時閃一下。 */
  function updateVoyageGoal(save) {
    if (!VoyageGoal || !hudRefs || !hudRefs.goalBanner) return;
    const goal = VoyageGoal.currentGoal(save);
    if (!goal) { hudRefs.goalBanner.style.display = 'none'; return; }
    hudRefs.goalBanner.style.display = 'block';

    let suffix = '';
    if (goal.progress) {
      const p = goal.progress;
      const remaining = Math.max(0, p.target - p.current);
      const showNum = p.unit === ' 樣本' || p.unit === ' 種' || p.unit === ' 節'
        ? Math.floor(p.current) + ' / ' + p.target + p.unit
        : '還差 ' + U.formatNum(remaining) + (p.unit === ' m' ? ' m' : p.unit);
      suffix = '（' + showNum + '）';
    }
    hudRefs.goalText.innerHTML = '';
    hudRefs.goalText.appendChild(U.el('span', 'goalPrefix', '🧭 航路目標　'));
    hudRefs.goalText.appendChild(document.createTextNode(goal.text));
    if (suffix) hudRefs.goalText.appendChild(U.el('span', 'goalProg', '　' + suffix));

    if (goal.progress && goal.progress.target > 0) {
      hudRefs.goalBarWrap.style.display = 'block';
      hudRefs.goalFill.style.width = (Math.min(1, goal.progress.current / goal.progress.target) * 100) + '%';
    } else {
      hudRefs.goalBarWrap.style.display = 'none';
    }

    if (lastGoalId !== null && lastGoalId !== goal.id && (!FX || !FX.isReduced())) {
      hudRefs.goalBanner.classList.remove('goalAdvanced');
      // 重新觸發動畫：強制 reflow 後再加 class。
      void hudRefs.goalBanner.offsetWidth;
      hudRefs.goalBanner.classList.add('goalAdvanced');
    }
    lastGoalId = goal.id;
  }

  /** 聲納脈衝：主動技能，冷卻好了隨時可按，立即強制刷新一隻生物（無視正常的隨機
   *  間隔）且那一次的稀有機率有加成——給玩家一個自己可以控制節奏的主動選擇，跟
   *  「誘光進度條」（被動累積點擊次數換來的強制刷新）是兩套獨立的機制。 */
  function triggerSonar() {
    const now = Date.now();
    if ((saveRef.nextSonarAt || 0) > now) return;
    saveRef.nextSonarAt = now + D.BALANCE.SONAR_COOLDOWN_MS;
    saveRef.stats.totalSonarUses = (saveRef.stats.totalSonarUses || 0) + 1;
    pendingRareBonusMult = Math.max(pendingRareBonusMult, D.BALANCE.SONAR_RARE_BONUS_MULT);
    Audio.play('gate');
    FX.popButton(hudRefs.sonarBtn);
    forceSpawnSonar();
    if (onChangeRef) onChangeRef();
  }

  function forceSpawnSonar() {
    if (spawnTimeoutId) clearTimeout(spawnTimeoutId);
    spawnTimeoutId = setTimeout(spawnCreature, 200);
  }

  function deactivate() {
    active = false;
    if (spawnTimeoutId) clearTimeout(spawnTimeoutId);
    spawnTimeoutId = null;
    if (flavorTimeoutId) clearTimeout(flavorTimeoutId);
    flavorTimeoutId = null;
    // 導航離開時立即結算還在畫面上的金燈魚/訊號殘片，而不是留著計時器在背景繼續
    // 跑：避免玩家切回潛航畫面時 render() 重置 goldenActive/signalActive，卻讓舊
    // instance 的計時器晚點才觸發、事後又呼叫一次 scheduleNext 把新 instance 剛
    // 排好的時間覆蓋掉。
    if (goldenMissFn) goldenMissFn();
    if (signalMissFn) signalMissFn();
  }

  window.App.UI.DiveScreen = { render, tick, deactivate, forceSpawnSoon };
})();
