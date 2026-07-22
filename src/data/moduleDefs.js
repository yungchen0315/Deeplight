/* ============================================================================
 * moduleDefs.js — 24 種發光模組（企劃書第 4b 節 + v1.1~Phase7 擴充）。cost(n)
 * 與升級節點的計算交給 economySystem，這裡只放靜態資料。lore 是模組詳細彈窗
 * （moduleDetailModal.js）顯示的風味文字，純敘事用途，不影響任何數值。
 * ==========================================================================*/
(function () {
  const MODULE_DEFS = [
    { id: 'jelly', name: '燈籠水母', icon: 'mod_jelly', baseCost: 15, baseProd: 0.1, unlockDepth: 0,
      lore: '潛燈號最早馴養的發光生物。牠們對電解質很敏感，只要用微弱電流引導，就會乖乖聚在艙外的柵欄裡持續發光。' },
    { id: 'moss', name: '光苔板', icon: 'mod_moss', baseCost: 100, baseProd: 1, unlockDepth: 0,
      lore: '從艙壁培養皿裡長出的共生藻類，附著在金屬板上就能穩定生長。不需要餵食，只要偶爾補充礦物質。' },
    { id: 'buoy', name: '迴聲浮標', icon: 'mod_buoy', baseCost: 1100, baseProd: 8, unlockDepth: 100,
      lore: '漂浮在潛燈號周圍的小型聲納浮標，靠回聲定位捕捉微弱生物光的反射，再轉換成可用的螢光能量。' },
    { id: 'coral', name: '螢光珊瑚架', icon: 'mod_coral', baseCost: 12000, baseProd: 47, unlockDepth: 250,
      lore: '人工嫁接的珊瑚骨架，移植了深海螢光菌落。比起原生珊瑚生長快得多，代價是骨架比較脆弱。' },
    { id: 'vent', name: '熱泉導管', icon: 'mod_vent', baseCost: 130000, baseProd: 260, unlockDepth: 700,
      lore: '接上附近熱泉噴口的導管，把地熱能量轉換成穩定電力，順便帶動一批耐熱發光菌落。' },
    { id: 'whalefall', name: '鯨落生態圈', icon: 'mod_whalefall', baseCost: 1400000, baseProd: 1400, unlockDepth: 1200,
      lore: '一整套依附在鯨落殘骸上的微生態系——從食骨蟲到硫化菌，一層層構成深海裡少見的能量密集區。' },
    { id: 'lure', name: '深淵燈籠陣', icon: 'mod_lure', baseCost: 16000000, baseProd: 8000, unlockDepth: 3000,
      lore: '仿照鮟鱇魚釣竿設計的人工誘餌陣列，同時吸引獵物與收集牠們路過時反射的光。' },
    { id: 'reactor', name: '熱液反應爐', icon: 'mod_reactor', baseCost: 180000000, baseProd: 45000, unlockDepth: 5000,
      lore: '直接鑽進熱泉噴口核心的小型反應爐，把滾燙的礦物流轉換成潛燈號至今最強大的單一能量來源。' },
    { id: 'pillar', name: '虛淵光柱', icon: 'mod_pillar', baseCost: 2000000000, baseProd: 500000, unlockDepth: 9000,
      lore: '不知道是誰、在什麼年代立起的巨大光柱，內部構造遠超潛燈號的科技水準，只能小心翼翼地接上纜線借光。' },
    { id: 'whaletemple', name: '古鯨聖殿', icon: 'mod_whaletemple', baseCost: 24000000000, baseProd: 2800000, unlockDepth: 14000,
      lore: '巨大鯨骨堆疊成的神殿狀結構，骨縫間長滿了發光菌絲，彷彿有什麼儀式曾經在這裡反覆進行。' },
    { id: 'voidbeacon', name: '虛無燈塔', icon: 'mod_voidbeacon', baseCost: 3.5e11, baseProd: 3.2e7, unlockDepth: 23000,
      lore: '在完全無光的深度自己會發光的柱狀構造，沒有人知道它的能量從哪來，只知道接上潛燈號的線路後，產出遠超預期。' },
    { id: 'starcore', name: '星塵核心', icon: 'mod_starcore', baseCost: 5e12, baseProd: 2.1e8, unlockDepth: 30000,
      lore: '核心切面帶著奇異的結晶紋路，很像墜落海底的隕石碎片。是目前所知能量密度最高的天然礦石。' },
    { id: 'plainlight', name: '平原光帶', icon: 'mod_plainlight', baseCost: 7e13, baseProd: 5e9, unlockDepth: 40000,
      lore: '沿著深海平原鋪設的長條發光帶，靠著平原地形毫無遮蔽的優勢，把方圓幾公里的微光都收集起來。' },
    { id: 'seismocore', name: '震波核心', icon: 'mod_seismocore', baseCost: 9e14, baseProd: 3.5e10, unlockDepth: 48000,
      lore: '利用海床震動發電的裝置，深海平原偶發的地質活動被轉換成穩定的螢光輸出。' },
    { id: 'ventforge', name: '熱泉鍛爐', icon: 'mod_ventforge', baseCost: 1.2e16, baseProd: 2.4e11, unlockDepth: 60000,
      lore: '架設在熱泉噴口正上方的巨型鍛爐狀結構，滾燙的礦物流直接沖刷過發光核心，效率高得驚人也危險得驚人。' },
    { id: 'magmaheart', name: '岩漿之心', icon: 'mod_magmaheart', baseCost: 1.5e17, baseProd: 1.6e12, unlockDepth: 70000,
      lore: '潛燈號目前技術能承受的最極限能量來源，直接連接地殼裂縫下方的岩漿庫。艙壁溫度計在這裡幾乎要爆表。' },
    { id: 'riftcrystal', name: '裂谷晶簇', icon: 'mod_riftcrystal', baseCost: 2e18, baseProd: 8e12, unlockDepth: 85000,
      lore: '沿著海底裂谷邊緣生長的巨大結晶簇，斷面能看到一圈圈螢光年輪，像是隨著裂谷擴張一年年累積下來的。' },
    { id: 'voidforge', name: '虛空熔爐', icon: 'mod_voidforge', baseCost: 3e19, baseProd: 6e13, unlockDepth: 105000,
      lore: '架在裂谷最深處的巨型熔爐狀構造，爐口對著地殼最薄弱的裂縫，把地心深處滲出的能量硬生生鍛造成螢光。' },
    { id: 'abyssnode', name: '遺跡節點', icon: 'mod_abyssnode', baseCost: 4.5e20, baseProd: 4e14, unlockDepth: 135000,
      lore: '先驅遺跡外圍散落的規則幾何構造之一，接上線路後開始穩定輸出——不知道原本的用途是什麼，但它顯然還在正常運作。' },
    { id: 'voidheart', name: '虛空之心', icon: 'mod_voidheart', baseCost: 7e21, baseProd: 3e15, unlockDepth: 165000,
      lore: '遺跡最深處的核心構造，比任何其他節點都更龐大也更古老。接上纜線的瞬間，整艘潛燈號的燈光同步閃爍了一下——彷彿它「認出」了什麼。' },
    { id: 'echospire', name: '回音尖塔', icon: 'mod_echospire', baseCost: 1e23, baseProd: 2e16, unlockDepth: 215000,
      lore: '矗立在迴廊入口的尖塔狀構造，表面刻痕會把聲納回波放大再送回去——難怪先前的聲納訊號穿過通道後，久久沒有回音，原來只是被這裡「延遲」了。' },
    { id: 'originlens', name: '起源透鏡', icon: 'mod_originlens', baseCost: 1.5e24, baseProd: 1.4e17, unlockDepth: 270000,
      lore: '迴廊深處一面巨大的透鏡狀結構，看過去的畫面總是慢半拍、又帶著奇異的重影。工程日誌懷疑，它折射的可能不只是光。' },
    { id: 'cityrelay', name: '都市中繼站', icon: 'mod_cityrelay', baseCost: 2.2e25, baseProd: 1e18, unlockDepth: 345000,
      lore: '迴廊盡頭那片黑暗的另一側，是一整座沉睡的城市——這座中繼站矗立在市郊，接上線路後開始傳輸一種規律得像廣播的能量訊號。' },
    { id: 'awakencore', name: '甦醒核心', icon: 'mod_awakencore', baseCost: 3.3e26, baseProd: 7e18, unlockDepth: 440000,
      lore: '城市中心那座巨大核心構造，接上纜線的瞬間整片城市的燈光同步亮了一下又暗下去——像是在打盹的巨獸被輕輕碰了一下肩膀。' }
  ];

  function moduleById(id) { return MODULE_DEFS.find((m) => m.id === id); }

  window.App.Data.MODULE_DEFS = MODULE_DEFS;
  window.App.Data.moduleById = moduleById;
})();
