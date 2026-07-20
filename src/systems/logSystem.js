/* ============================================================================
 * logSystem.js — 潛航日誌解鎖檢查，跟 achievementSystem.js 同一套「掃過所有
 * 定義、還沒解鎖且條件成立就解鎖」的模式，只是這裡沒有珍珠獎勵，純敘事用途。
 * ==========================================================================*/
(function () {
  const D = window.App.Data;

  /** @returns {LogDef[]} 這次呼叫新解鎖的日誌條目（供 UI 彈 toast）。 */
  function checkEntries(save) {
    const newly = [];
    D.LOG_DEFS.forEach((entry) => {
      if (save.captainLog.unlockedIds.includes(entry.id)) return;
      if (entry.condition(save)) {
        save.captainLog.unlockedIds.push(entry.id);
        window.App.Systems.EventLog.log(save, '潛航日誌更新：' + entry.title);
        newly.push(entry);
      }
    });
    return newly;
  }

  window.App.Systems.Log = { checkEntries };
})();
