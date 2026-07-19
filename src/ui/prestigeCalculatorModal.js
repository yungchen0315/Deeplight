/* ============================================================================
 * prestigeCalculatorModal.js — 「轉生試算」：三層轉生的預期報酬速查表，幫玩家
 * 決定「要不要再撐一下再轉生」。全部用各系統抽出來的純函式算，不影響存檔。
 * ==========================================================================*/
(function () {
  const U = window.App.Utils;
  const D = window.App.Data;
  const Prestige = window.App.Systems.Prestige;
  const Covenant = window.App.Systems.Covenant;
  const Pact = window.App.Systems.Pact;

  function section(box, title, rows) {
    box.appendChild(U.el('div', 'compendiumSectionTitle calcSectionTitle', title));
    rows.forEach(([label, value]) => {
      const row = U.el('div', 'calcRow');
      row.appendChild(U.el('span', 'calcRowLabel', label));
      row.appendChild(U.el('span', 'calcRowValue', value));
      box.appendChild(row);
    });
  }

  function open(save) {
    const overlay = document.getElementById('modalOverlay');
    U.clearNode(overlay);
    const box = U.el('div', 'modalBox compendiumBox');
    function close() { overlay.style.display = 'none'; U.clearNode(overlay); }

    box.appendChild(U.el('div', 'modalTitle', '轉生試算'));
    const scroll = U.el('div', 'compendiumScroll');

    const coreRows = D.ZONE_DEFS
      .filter((z) => !z.comingSoon && z.anchorDepth >= D.BALANCE.PRESTIGE_MIN_DEPTH)
      .map((z) => [z.name + '（' + U.formatNum(z.anchorDepth) + 'm）通過後轉生', Prestige.coresForDepth(z.anchorDepth) + ' 核心']);
    section(scroll, '重返海面：潛到各海域錨點時的預估核心', coreRows);

    const curCores = (save.stats && save.stats.totalCoresEarned) || 0;
    const sigilRows = [0, 100, 500, 2000, 10000].map((extra) => {
      const total = curCores + extra;
      const label = extra === 0 ? '目前累積（' + U.formatNum(total) + ' 核心）' : '再賺 ' + U.formatNum(extra) + ' 核心（共 ' + U.formatNum(total) + '）';
      return [label, Covenant.sigilPointsForCores(total) + ' 印記'];
    });
    section(scroll, '深淵協約：累積壓力核心換算深淵印記', sigilRows);

    const curSigilPts = (save.stats && save.stats.totalSigilPointsEarned) || 0;
    const nightshardRows = [0, 10, 50, 200, 1000].map((extra) => {
      const total = curSigilPts + extra;
      const label = extra === 0 ? '目前累積（' + U.formatNum(total) + ' 印記）' : '再賺 ' + U.formatNum(extra) + ' 印記（共 ' + U.formatNum(total) + '）';
      return [label, Pact.nightshardsForSigilPoints(total) + ' 夜輝'];
    });
    section(scroll, '永夜盟約：累積深淵印記換算夜輝', nightshardRows);

    box.appendChild(scroll);
    const closeBtn = U.el('button', 'modalBtn', '關閉');
    U.onTap(closeBtn, close);
    box.appendChild(closeBtn);

    overlay.appendChild(box);
    overlay.style.display = 'flex';
  }

  window.App.UI.PrestigeCalculatorModal = { open };
})();
