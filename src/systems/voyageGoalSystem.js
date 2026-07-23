/* ============================================================================
 * voyageGoalSystem.js — 航路目標：任何時刻都算出「玩家接下來最該做的一件事」，
 * 由潛航畫面底部的常駐橫幅顯示。這是純導引層——只讀取現有存檔狀態、指向既有系
 * 統（買模組／轉生／過閘門…），本身不發任何新獎勵，避免跟新手任務／每日任務／
 * 里程碑／成就的獎勵迴圈重疊。放置遊戲流失率最高的時刻是「不知道下一步要幹嘛」，
 * 這個常駐提示就是專門補這個洞。
 *
 * 設計原則：一次只顯示一個目標，依下列優先序回傳第一個「尚未完成」的目標；早期
 * 是逐步摸過核心玩法的引導，中後期則固定落在「潛到下一片海域」這個長線目標上，
 * 偶爾在剛解鎖三層轉生時插播一次「去試試看」。全部看完後給一句收束語。
 * ==========================================================================*/
(function () {
  const D = window.App.Data;
  const B = D.BALANCE;
  const Econ = window.App.Systems.Economy;

  function hasModules(save) {
    return Object.keys(save.modules).some((k) => save.modules[k] && save.modules[k].count > 0);
  }

  /** 嚴格比目前海域深一階、且不是「即將開放」預告牌的下一個真實海域；沒有則回 null。 */
  function nextRealZone(save) {
    return D.ZONE_DEFS.find((z) => z.id === save.currentZone + 1 && !z.comingSoon) || null;
  }

  function prog(current, target, unit) {
    return { current: Math.max(0, current), target: target, unit: unit || '' };
  }

  /**
   * @param {SaveGame} save
   * @returns {{id:string, text:string, nav?:string, progress?:{current:number,target:number,unit:string}}}
   *   永遠回傳一個目標物件（不會是 null）。progress 有值時 UI 會畫一條進度條。
   */
  function currentGoal(save) {
    const s = save.stats || {};

    // 1. 第一個發光模組：先確保玩家理解「自動產出」這件事。只在第一輪（還沒轉生過）
    //    當引導——轉生會把 save.modules 清空，若不加這個守衛，每次重返海面後老玩家都會
    //    被丟回「買第一個模組」的新手目標，蓋掉真正該有的「潛到下一片海域」長線目標。
    if (save.prestigeCount < 1 && !hasModules(save)) {
      const firstId = D.MODULE_DEFS[0].id;
      const cost = Econ.moduleCost(save, firstId);
      if (save.glow < cost) {
        return { id: 'g_earn_module', text: '點擊水域採集螢光，買下第一個發光模組', progress: prog(save.glow, cost, '') };
      }
      return { id: 'g_buy_module', text: '前往「模組」頁購買第一個發光模組，讓螢光自動產出', nav: 'modules' };
    }

    // 2. 第一隻生物：教玩家點擊路過生物。
    if ((s.totalCreaturesCollected || 0) < 1) {
      return { id: 'g_first_creature', text: '點擊路過的深海生物，收集第一隻進圖鑑' };
    }

    // 3. 第一個研究：把樣本花掉、理解永久強化。同樣只在第一輪引導——轉生會清空
    //    save.research，加守衛避免老玩家轉生後被丟回「完成第一個研究」的新手目標。
    if (save.prestigeCount < 1 && save.research.length < 1) {
      const cost = D.RESEARCH_DEFS[0].cost;
      if (save.samples < cost) {
        return { id: 'g_earn_research', text: '多收集生物取得樣本，完成第一個研究', progress: prog(save.samples, cost, ' 樣本') };
      }
      return { id: 'g_first_research', text: '前往「研究」頁完成第一個研究，換取永久強化', nav: 'research' };
    }

    // 4. 第一道閘門：進入第二片海域。
    if ((s.totalGatesPassed || 0) < 1) {
      const z0 = D.zoneById(0);
      return { id: 'g_first_gate', text: '潛至 ' + z0.anchorDepth + 'm 加固艙體，進入下一片海域', progress: prog(save.depth, z0.anchorDepth, ' m') };
    }

    // 5. 第一次轉生：三層轉生的第一層。
    if (save.prestigeCount < 1) {
      if (window.App.Systems.Prestige.eligible(save)) {
        return { id: 'g_first_prestige', text: '前往「海面」頁「重返海面」轉生，換取永久壓力核心加成', nav: 'surface' };
      }
      return { id: 'g_reach_prestige', text: '潛至 ' + B.PRESTIGE_MIN_DEPTH + 'm，解鎖「重返海面」轉生', progress: prog(save.maxDepthThisRun, B.PRESTIGE_MIN_DEPTH, ' m') };
    }

    // 6. 第一次深淵協約：只在玩家已經在協約軌道上（轉生次數達標）時才主動插播，
    //    否則交給下面的「潛到下一片海域」帶著玩家自然變深。
    if (save.covenantCount < 1) {
      if (window.App.Systems.Covenant.eligible(save)) {
        return { id: 'g_first_covenant', text: '前往「協約」頁締結深淵協約，開啟印記樹', nav: 'covenant' };
      }
      if (save.prestigeCount >= B.COVENANT_MIN_PRESTIGE_COUNT && save.maxDepthEver < B.COVENANT_MIN_DEPTH) {
        return { id: 'g_reach_covenant', text: '潛至 ' + B.COVENANT_MIN_DEPTH + 'm，解鎖深淵協約', progress: prog(save.maxDepthEver, B.COVENANT_MIN_DEPTH, ' m') };
      }
    }

    // 7. 第一次永夜盟約：同理，只在已締結過協約後才插播。
    if (save.pactCount < 1 && save.covenantCount >= 1) {
      if (window.App.Systems.Pact.eligible(save)) {
        return { id: 'g_first_pact', text: '前往「盟約」頁締結永夜盟約，開啟盟約樹', nav: 'pact' };
      }
      if (save.covenantCount >= B.PACT_MIN_COVENANT_COUNT && save.maxDepthEver < B.PACT_MIN_DEPTH) {
        return { id: 'g_reach_pact', text: '潛至 ' + B.PACT_MIN_DEPTH + 'm，解鎖永夜盟約', progress: prog(save.maxDepthEver, B.PACT_MIN_DEPTH, ' m') };
      }
    }

    // 8. 長線常駐目標：潛到下一片海域。
    const next = nextRealZone(save);
    if (next) {
      return { id: 'g_zone_' + next.id, text: '潛至 ' + next.anchorDepth + 'm，進入「' + next.name + '」', progress: prog(save.depth, next.anchorDepth, ' m') };
    }

    // 9. 已抵達目前版本最深海域——轉為蒐集/研究的收尾目標。
    const cur = D.zoneById(save.currentZone);
    const collected = Object.keys(save.bestiary).length;
    if (collected < D.CREATURE_DEFS.length) {
      return { id: 'g_collect_all', text: '已抵達目前最深的「' + (cur ? cur.name : '海域') + '」——蒐集每一種深海生物', progress: prog(collected, D.CREATURE_DEFS.length, ' 種') };
    }
    if (save.research.length < D.RESEARCH_DEFS.length) {
      return { id: 'g_finish_research', text: '完成研究樹剩下的所有節點', progress: prog(save.research.length, D.RESEARCH_DEFS.length, ' 節') };
    }
    return { id: 'g_done', text: '你已看遍目前版本的所有內容——感謝陪潛燈號潛到這裡 🌊' };
  }

  window.App.Systems.VoyageGoal = { currentGoal };
})();
