/* ============================================================================
 * balance.js — 全遊戲數值常數的唯一真相源。調參只改這裡，不要在 systems 裡
 * 散落魔法數字。對應企劃書第 3~6 節的公式，v1.1 追加深淵帶／主動遊玩調整。
 * ==========================================================================*/
(function () {
  const BALANCE = {
    // 模組成本成長率：cost(n) = baseCost * MODULE_COST_GROWTH^n（n = 目前持有數）。
    MODULE_COST_GROWTH: 1.15,
    // 模組升級：持有數達到門檻時解鎖一次 x2 產量升級，費用 = baseCost * 對應倍率。
    MODULE_UPGRADE_THRESHOLDS: [10, 25, 50, 100, 200],
    MODULE_UPGRADE_COST_MULTIPLIERS: [50, 500, 5000, 50000, 600000],
    MODULE_UPGRADE_PROD_MULT: 2, // 每買一階，該模組單體產量再 x2（可疊乘）

    // 壓載升級：descentRate = BALLAST_BASE_RATE + BALLAST_RATE_PER_LEVEL * level。
    // cost(level) = BALLAST_BASE_COST * BALLAST_COST_GROWTH^(level-1)，level 從 1 起算下一級費用。
    BALLAST_BASE_RATE: 3, // m/min，level 0（未升級）
    BALLAST_RATE_PER_LEVEL: 2,
    BALLAST_BASE_COST: 150,
    BALLAST_COST_GROWTH: 3,
    BALLAST_MAX_LEVEL: 12,

    // 離線進度：全速時窗 + 半速時窗，超過兩者總和不再累積（絕對上限另外夾限）。
    OFFLINE_FULL_HOURS: 8,
    OFFLINE_HALF_HOURS: 16,
    OFFLINE_ABSOLUTE_CAP_HOURS: 48,
    OFFLINE_MIN_SECONDS: 10, // 低於此秒數不彈報告、不結算（避免切分頁瞬間觸發）

    // 轉生（重返海面）：需求最低深度、核心結算公式。
    PRESTIGE_MIN_DEPTH: 2000,
    PRESTIGE_DEPTH_DIVISOR: 400,
    PRESTIGE_EXPONENT: 1.15,
    CORE_PRODUCTION_BONUS_PCT: 10, // 每顆壓力核心 +10% 全螢光產量（乘法疊加，重構可覆寫更高值）

    // 點擊：手動點擊水域＝目前每秒產量的一個固定比例（有下限），讓點擊在任何階段都有意義。
    CLICK_TAP_GPS_FRACTION: 0.25,
    CLICK_TAP_MIN: 1,
    TAPS_PER_LURE: 60, // 累積 N 次點擊，強制立即刷一隻路過生物（誘光進度條）

    CREATURE_SPAWN_INTERVAL_MS: [18000, 40000], // 路過生物出現間隔隨機範圍
    AMBIENT_FLAVOR_INTERVAL_MS: [50000, 100000], // 潛航畫面環境觀測記錄出現間隔隨機範圍
    AMBIENT_FLAVOR_SHOW_MS: 6000, // 環境觀測記錄單則顯示時長
    CREATURE_SAMPLE_DROP_CHANCE: 0.25, // 非首次遇見時，額外掉落樣本的機率
    CREATURE_BURST_SECONDS: 30, // 點擊生物獲得「N 秒產量」的爆發獎勵（研究可延長）
    CREATURE_RARE_CHANCE: 0.15, // 生物生成時抽到稀有種的機率（該海域稀有種存在時才生效）

    CREATURE_MISSED_INTERVAL_MS: 2 * 3600 * 1000, // 離線每滿 2 小時記一次「錯過的生物」
    CREATURE_MISSED_QUEUE_CAP: 5,

    PEARL_BOOST_MULT: 2, // 珍珠加護：全產量倍率
    PEARL_BOOST_HOURS: 4, // 每次消耗 1 珍珠延長的時數（可疊加）
    PEARL_BOOST_MAX_AHEAD_HOURS: 8, // 加護時數距今上限，避免囤積後一次全開
    PEARL_INSTANT_COST: 3, // 消耗 3 珍珠：立即獲得數小時的產量
    PEARL_INSTANT_HOURS: 4,

    DAILY_CYCLE_LENGTH: 7,

    // 深淵協約（第二層轉生）：解鎖門檻、印記換算公式。
    COVENANT_MIN_PRESTIGE_COUNT: 5,
    COVENANT_MIN_DEPTH: 11000,
    COVENANT_SIGIL_DIVISOR: 20,
    COVENANT_SIGIL_EXPONENT: 0.5, // floor(sqrt(累積壓力核心 / divisor))

    // 圖鑑星級：目擊次數達到門檻升星，每星 +0.5% 全產量（取代 v1.1 的扁平 +2%/種）。
    BESTIARY_STAR_THRESHOLDS: [1, 5, 15, 40, 100],
    BESTIARY_STAR_PROD_PCT: 0.5,

    // 金燈魚：主動遊玩期間限定的稀有快速生物，點擊後二選一強力短效增益。
    GOLDEN_SPAWN_INTERVAL_MS: [600000, 1200000], // 10~20 分鐘
    GOLDEN_LIFESPAN_MS: 4000,
    GOLDEN_PROD_MULT: 7,
    GOLDEN_PROD_SECONDS: 77,
    GOLDEN_INSTANT_MINUTES: 15,
    GOLDEN_DESCENT_MULT: 5,
    GOLDEN_DESCENT_SECONDS: 120,
    GOLDEN_PEARL_AMOUNT: 1,
    GOLDEN_GATE_MULT: 0.5,
    GOLDEN_GATE_SECONDS: 90,

    // 深淵訊號殘片：全遊戲最稀有的隨機事件，比金燈魚更少見。只在 zone 3（深淵帶）
    // 以後才可能出現，且全部收集齊後就不再出現（見 signalSystem.js dueToSpawn）。
    SIGNAL_MIN_ZONE: 3,
    SIGNAL_SPAWN_INTERVAL_MS: [1200000, 2400000], // 20~40 分鐘
    SIGNAL_LIFESPAN_MS: 7000,
    SIGNAL_PEARL_REWARD: 1,

    // 每日任務：3 題／天，從範本池決定性抽取（依日期字串 seed，不需要伺服器）。
    QUEST_COUNT_PER_DAY: 3,
    QUEST_ALL_DONE_PEARL: 1,

    // 週末活動：本地時間週六日，生物出現間隔減半。
    WEEKEND_SPAWN_INTERVAL_MULT: 0.5,

    // 自動化重構（深淵協約印記樹解鎖）。
    AUTO_COLLECT_DELAY_MS: 3000,

    // 永夜盟約（第三層轉生）：解鎖門檻、夜輝換算公式。
    PACT_MIN_COVENANT_COUNT: 3,
    PACT_MIN_DEPTH: 35000,
    PACT_NIGHTSHARD_DIVISOR: 50,
    PACT_NIGHTSHARD_EXPONENT: 0.5, // floor(sqrt(累積賺過的深淵印記 / divisor))

    // 存檔備份提醒：存檔只在本機瀏覽器，定期提示玩家匯出備份，避免換裝置/清瀏覽器
    // 資料時整份進度消失卻毫無防備。
    BACKUP_REMINDER_INTERVAL_MS: 14 * 24 * 3600 * 1000,
    BACKUP_REMINDER_MIN_DEPTH: 1000,

    AUTOSAVE_INTERVAL_MS: 10000,
    TICK_INTERVAL_MS: 250
  };

  window.App.Data.BALANCE = BALANCE;
})();
