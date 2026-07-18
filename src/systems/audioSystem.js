/* ============================================================================
 * audioSystem.js — 全部音效／環境音都是 Web Audio 即時合成，沒有任何音檔資產。
 * AudioContext 要等第一次使用者手勢才建立（瀏覽器政策），故 init() 掛在 body 的
 * 一次性 pointerdown 上。settings.sound / settings.ambient 由 syncSettings 套用。
 * ==========================================================================*/
(function () {
  let ctx = null;
  let masterGain, sfxGain, ambientGain;
  let ambientNodes = null;
  let ambientPingTimeoutId = null;
  let currentZoneId = 0;
  let soundOn = true;
  let ambientOn = true;
  let started = false;

  function ensureContext() {
    if (ctx) return ctx;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    ctx = new Ctx();
    masterGain = ctx.createGain();
    masterGain.gain.value = 1;
    masterGain.connect(ctx.destination);
    sfxGain = ctx.createGain();
    sfxGain.gain.value = soundOn ? 0.5 : 0;
    sfxGain.connect(masterGain);
    ambientGain = ctx.createGain();
    ambientGain.gain.value = ambientOn ? 0.25 : 0;
    ambientGain.connect(masterGain);
    return ctx;
  }

  /** 產生一段白噪音 AudioBuffer，供水流底噪／通過閘門的噪音爆發共用。 */
  function noiseBuffer(seconds) {
    const len = Math.max(1, Math.floor(ctx.sampleRate * seconds));
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    return buf;
  }

  function tone(freq, type, dur, gainValue, delay) {
    if (!ctx) return;
    const t0 = ctx.currentTime + (delay || 0);
    const osc = ctx.createOscillator();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, t0);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gainValue || 0.3, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g); g.connect(sfxGain);
    osc.start(t0); osc.stop(t0 + dur + 0.02);
    return osc;
  }

  function sweep(f0, f1, type, dur, gainValue, delay) {
    if (!ctx) return;
    const t0 = ctx.currentTime + (delay || 0);
    const osc = ctx.createOscillator();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(f0, t0);
    osc.frequency.exponentialRampToValueAtTime(f1, t0 + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gainValue || 0.3, t0 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g); g.connect(sfxGain);
    osc.start(t0); osc.stop(t0 + dur + 0.02);
  }

  function noiseBurst(dur, gainValue, delay) {
    if (!ctx) return;
    const t0 = ctx.currentTime + (delay || 0);
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer(dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(gainValue || 0.2, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(g); g.connect(sfxGain);
    src.start(t0);
  }

  const PENTATONIC = [523.25, 659.25, 783.99, 880, 1046.5];

  const SFX = {
    tap: () => sweep(880, 440, 'sine', 0.06, 0.22),
    buy: () => { tone(523, 'square', 0.05, 0.18, 0); tone(784, 'square', 0.05, 0.18, 0.05); },
    upgrade: () => { tone(523, 'triangle', 0.06, 0.22, 0); tone(659, 'triangle', 0.06, 0.22, 0.06); tone(784, 'triangle', 0.06, 0.22, 0.12); },
    collect: () => { for (let i = 0; i < 3; i++) tone(1200 + Math.random() * 600, 'triangle', 0.05, 0.16, i * 0.05); },
    rare: () => PENTATONIC.forEach((f, i) => tone(f, 'sine', 0.09, 0.22, i * 0.08)),
    discovery: () => { tone(1046.5, 'sine', 0.4, 0.22, 0); tone(1567.98, 'sine', 0.4, 0.14, 0); },
    gate: () => { sweep(80, 40, 'sawtooth', 0.6, 0.25, 0); noiseBurst(0.2, 0.15, 0); },
    prestige: () => { sweep(220, 880, 'sine', 1.2, 0.22, 0); noiseBurst(1.2, 0.08, 0); },
    achievement: () => { tone(1318.5, 'sine', 0.5, 0.2, 0); tone(2637, 'sine', 0.5, 0.09, 0); },
    error: () => tone(110, 'sine', 0.08, 0.2, 0),
    nav: () => tone(660, 'sine', 0.03, 0.14, 0),
    daily: () => { tone(1046, 'triangle', 0.06, 0.22, 0); tone(1318, 'triangle', 0.06, 0.22, 0.06); tone(1568, 'triangle', 0.06, 0.22, 0.12); }
  };

  function play(name) {
    if (!soundOn || !ctx) return;
    const fn = SFX[name];
    if (fn) fn();
  }

  const ZONE_LOWPASS = [500, 350, 220, 120, 120];
  const ZONE_PING = [660, 587, 523, 440, 440];

  function scheduleAmbientPing() {
    if (!ambientOn || !ctx || !ambientNodes) return;
    const delay = 20000 + Math.random() * 20000;
    ambientPingTimeoutId = setTimeout(() => {
      if (!ambientNodes) return;
      const t0 = ctx.currentTime;
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = ZONE_PING[currentZoneId] || 440;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.06, t0);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 2);
      osc.connect(g); g.connect(ambientGain);
      osc.start(t0); osc.stop(t0 + 2.1);
      scheduleAmbientPing();
    }, delay);
  }

  function startAmbient() {
    if (!ctx || ambientNodes) return;
    const drone1 = ctx.createOscillator(); drone1.type = 'sine'; drone1.frequency.value = 52;
    const drone2 = ctx.createOscillator(); drone2.type = 'sine'; drone2.frequency.value = 52.5;
    const droneGain = ctx.createGain(); droneGain.gain.value = 0.08;
    drone1.connect(droneGain); drone2.connect(droneGain); droneGain.connect(ambientGain);
    drone1.start(); drone2.start();

    const noiseSrc = ctx.createBufferSource();
    noiseSrc.buffer = noiseBuffer(4);
    noiseSrc.loop = true;
    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = ZONE_LOWPASS[currentZoneId] || 500;
    const noiseGain = ctx.createGain(); noiseGain.gain.value = 0.05;
    noiseSrc.connect(lowpass); lowpass.connect(noiseGain); noiseGain.connect(ambientGain);
    noiseSrc.start();

    ambientNodes = { drone1, drone2, droneGain, noiseSrc, lowpass, noiseGain };
    scheduleAmbientPing();
  }

  function stopAmbient() {
    if (!ambientNodes) return;
    try {
      ambientNodes.drone1.stop(); ambientNodes.drone2.stop(); ambientNodes.noiseSrc.stop();
    } catch (e) { /* already stopped */ }
    ambientNodes = null;
    if (ambientPingTimeoutId) clearTimeout(ambientPingTimeoutId);
    ambientPingTimeoutId = null;
  }

  /** 依目前海域調整環境音濾波器截止頻率／聲納音高，由 diveScreen 在海域改變時呼叫。 */
  function setAmbientZone(zoneId) {
    currentZoneId = zoneId;
    if (ambientNodes) ambientNodes.lowpass.frequency.setTargetAtTime(ZONE_LOWPASS[zoneId] || 500, ctx.currentTime, 0.5);
  }

  function syncSettings(save) {
    soundOn = !!save.settings.sound;
    ambientOn = !!save.settings.ambient;
    if (sfxGain) sfxGain.gain.value = soundOn ? 0.5 : 0;
    if (ambientGain) ambientGain.gain.value = ambientOn ? 0.25 : 0;
    if (ctx) {
      if (ambientOn && !ambientNodes) startAmbient();
      if (!ambientOn && ambientNodes) stopAmbient();
    }
  }

  /** 第一次使用者手勢時建立 AudioContext（瀏覽器政策要求），並依目前設定啟動環境音。 */
  function unlock(save) {
    if (started) return;
    started = true;
    ensureContext();
    if (ctx && ctx.state === 'suspended') ctx.resume();
    syncSettings(save);
  }

  window.App.Systems.Audio = { unlock, play, syncSettings, setAmbientZone };
})();
