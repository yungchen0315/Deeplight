/* ============================================================================
 * signalDefs.js — 深淵訊號殘片：全遊戲最稀有的隨機事件，比金燈魚更少見，只在
 * 深淵帶（zone 3）以後才可能出現。每次收集到「不重複」的一段殘片，8 段全部收集
 * 齊全後，潛航日誌會自動解鎖一篇特殊的終章條目（見 logDefs.js 的 log_signal_all）。
 * 這是貫穿整個遊戲、跟深度數字無關的一條懸念線——文字本身依序讀下來會拼出一句
 * 完整訊息，故意寫得比模組/生物 lore 更破碎、更慢才連貫，模擬「訊號正在被逐步
 * 解碼」的感覺。
 * ==========================================================================*/
(function () {
  const SIGNAL_FRAGMENT_DEFS = [
    { id: 'sig1', order: 1, text: '……〔訊號嚴重失真，只能辨識出一段規律的脈衝〕……' },
    { id: 'sig2', order: 2, text: '……脈衝的間隔精準得不像自然現象，比較像是——計數？' },
    { id: 'sig3', order: 3, text: '……解碼出第一個穩定片段：「……仍在……運轉……」' },
    { id: 'sig4', order: 4, text: '……「……已經……很久……沒有……回應……」' },
    { id: 'sig5', order: 5, text: '……訊號來源不只一個。深淵裡至少還有其他三處，正發送著同樣的頻率。' },
    { id: 'sig6', order: 6, text: '……「……我們……還在……這裡……等待……」' },
    { id: 'sig7', order: 7, text: '……終於拼出一句完整的話：「如果你聽得到這段訊號，代表你已經潛得比我們還深。」' },
    { id: 'sig8', order: 8, text: '……最後一段訊號附帶一組座標，比潛燈號目前記錄過的任何深度都更深——遠遠超過裂谷深淵的盡頭。' }
  ];

  function signalById(id) { return SIGNAL_FRAGMENT_DEFS.find((s) => s.id === id); }
  function signalsInOrder() { return SIGNAL_FRAGMENT_DEFS.slice().sort((a, b) => a.order - b.order); }

  window.App.Data.SIGNAL_FRAGMENT_DEFS = SIGNAL_FRAGMENT_DEFS;
  window.App.Data.signalById = signalById;
  window.App.Data.signalsInOrder = signalsInOrder;
})();
