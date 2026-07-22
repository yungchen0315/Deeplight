/* ============================================================================
 * creatureDefs.js — 48 種深淵圖鑑生物（企劃書第 8 節 + v1.1~Phase7 擴充）。
 * 每海域 4 種，各含 1 稀有種。首次遇見必掉樣本，之後依 balance 機率掉落。lore
 * 是圖鑑詳細彈窗（bestiaryDetailModal.js）顯示的一小段風味文字，純敘事用途，
 * 不影響任何遊戲數值。
 * ==========================================================================*/
(function () {
  const CREATURE_DEFS = [
    // 透光帶
    { id: 'moonjelly', name: '月水母', icon: 'c_moonjelly', zone: 0, rare: false,
      lore: '透光帶最常見的住客，傘狀身體幾乎透明，只有邊緣泛著一圈微弱的螢光。牠們不主動攻擊，只是隨洋流漂浮，偶爾被潛燈號的燈暈吸引過來張望。' },
    { id: 'sardine', name: '沙丁魚群', icon: 'c_sardine', zone: 0, rare: false,
      lore: '成千上萬條銀色小魚組成的魚群，整齊得像一片會呼吸的金屬布。牠們對光線很敏感，燈暈一亮，魚群就會齊刷刷轉向。' },
    { id: 'turtle', name: '海龜', icon: 'c_turtle', zone: 0, rare: false,
      lore: '悠哉地划水而過的老海龜，殼上長了些藤壺，看起來已經在這片海域游了很多年。牠對潛燈號毫無興趣，連頭都懶得轉。' },
    { id: 'sunfish', name: '翻車魚', icon: 'c_sunfish', zone: 0, rare: true,
      lore: '體型龐大卻異常溫馴的翻車魚，喜歡側身躺在陽光灑落的水層曬「日光浴」。在透光帶遇見牠算是難得的運氣。' },
    // 暮光帶
    { id: 'hatchet', name: '斧頭魚', icon: 'c_hatchet', zone: 1, rare: false,
      lore: '扁平如刀刃的銀色身體，腹部一整排發光器對著下方，用來抵消從上方灑下的微光、避免被更深處的掠食者發現輪廓。' },
    { id: 'krill', name: '磷蝦雲', icon: 'c_krill', zone: 1, rare: false,
      lore: '密密麻麻的磷蝦聚成一團雲霧狀的群體，是暮光帶食物鏈最底層卻也最重要的一環。牠們微弱的生物光讓整片雲霧像會呼吸的星塵。' },
    { id: 'siphon', name: '管水母', icon: 'c_siphon', zone: 1, rare: false,
      lore: '看似一隻生物，其實是由無數個體組成的群落，每個個體各司其職——推進、捕食、消化，分工精密得像一台活的機器。' },
    { id: 'vampsquid', name: '吸血鬼烏賊', icon: 'c_vampsquid', zone: 1, rare: true,
      lore: '名字聽起來嚇人，其實個性膽小，遇到威脅只會把自己蜷成一團、露出滿佈發光器的內側斗篷，藉此嚇退對手。牠不吸血，只吃海雪。' },
    // 午夜帶
    { id: 'angler', name: '鮟鱇魚', icon: 'c_angler', zone: 2, rare: false,
      lore: '頭頂那根發光的釣竿其實是特化的背鰭棘，尖端的共生菌負責發光，專門引誘被光線吸引過來的小魚。潛燈號的燈暈對牠來說大概像是同行競爭對手。' },
    { id: 'gulper', name: '吞噬鰻', icon: 'c_gulper', zone: 2, rare: false,
      lore: '嘴巴大得不成比例，胃可以撐開吞下比自己還大的獵物——在食物稀少的午夜帶，遇到什麼都不能放過。' },
    { id: 'isopod', name: '大王具足蟲', icon: 'c_isopod', zone: 2, rare: false,
      lore: '長得像放大版的潮蟲，行動緩慢、外殼堅硬，靠著極低的代謝速率在幾乎沒有食物的深海撐上好幾個月不進食。' },
    { id: 'barreleye', name: '桶眼魚', icon: 'c_barreleye', zone: 2, rare: true,
      lore: '頭部是透明的，兩顆管狀的眼睛可以在透明頭殼裡朝上轉動，直接望穿頭頂、搜尋獵物在微光中投下的剪影。' },
    // 深淵帶
    { id: 'dragonfish', name: '黑龍魚', icon: 'c_dragonfish', zone: 3, rare: false,
      lore: '全身漆黑到幾乎能吸收所有光線，下顎一根發光的觸鬚是牠唯一的裝飾，也是誘捕獵物的餌。' },
    { id: 'seapig', name: '海豬', icon: 'c_seapig', zone: 3, rare: false,
      lore: '半透明、粉紅色，用一叢特化的管足在海床上緩慢爬行，靠濾食沉積在海底的有機碎屑維生，是深海清道夫。' },
    { id: 'ghostshark', name: '幽靈鯊', icon: 'c_ghostshark', zone: 3, rare: false,
      lore: '銀灰色的身體在燈暈邊緣一閃而過，動作安靜得幾乎沒有聲響，像海裡的傳說多於真實生物。' },
    { id: 'giantsquid', name: '大王烏賊', icon: 'c_giantsquid', zone: 3, rare: true,
      lore: '傳說中的深海巨怪，眼睛比人的頭還大，觸手上佈滿吸盤。目擊紀錄極其稀少，能記錄下牠，值得在艙壁上刻一筆。' },
    // 海溝幽域
    { id: 'lanternoctopus', name: '燈塔章魚', icon: 'c_lanternoctopus', zone: 4, rare: false,
      lore: '八隻腕足上各自長著一顆會發光的吸盤，游動時像一整排小燈籠在黑暗中搖曳，是這片海溝裡少見的「主動發光體」。' },
    { id: 'glasssquid', name: '玻璃烏賊', icon: 'c_glasssquid', zone: 4, rare: false,
      lore: '身體幾乎完全透明，內臟被壓縮進一小團不透光的組織裡，藏在視線死角，讓掠食者難以鎖定牠的輪廓。' },
    { id: 'styxeel', name: '冥河鰻', icon: 'c_styxeel', zone: 4, rare: false,
      lore: '細長如絲帶，通體慘白無眼，靠著側線感應水流變化捕食——在這個深度，視覺早就沒有用武之地了。' },
    { id: 'ancientjelly', name: '古神水母', icon: 'c_ancientjelly', zone: 4, rare: true,
      lore: '巨大、緩慢、通體珍珠白，觸手垂落如同神殿的簾幕。沒有人知道牠已經在這片海溝漂浮了多久。' },
    // 無光帶
    { id: 'voidray', name: '虛無魟', icon: 'c_voidray', zone: 5, rare: false,
      lore: '扁平的身體幾乎與周圍的黑暗融為一體，只有游動時翼緣邊際那一絲若有似無的螢光洩露牠的存在。' },
    { id: 'echoworm', name: '回聲蠕蟲', icon: 'c_echoworm', zone: 5, rare: false,
      lore: '靠身體兩側規律收縮發出的微弱聲波在海床上「聽」出地形與獵物位置，在這個深度，聲音比光更可靠。' },
    { id: 'starfish_abyssal', name: '深淵海星', icon: 'c_starfish_abyssal', zone: 5, rare: false,
      lore: '紫色的巨大海星，一動也不動地趴在海床上，可能一年只移動幾公尺——在無光帶，耐心是最划算的生存策略。' },
    { id: 'leviathan', name: '深淵巨獸', icon: 'c_leviathan', zone: 5, rare: true,
      lore: '沒有人能確定牠的真實大小，因為潛燈號的燈暈從來沒能把牠整個照亮過。目擊紀錄裡，只有一雙在黑暗中反光的紅色眼睛。' },
    // 深海平原
    { id: 'plainskate', name: '平原鰩', icon: 'c_plainskate', zone: 6, rare: false,
      lore: '扁平的身體貼著平坦的海床滑行，這片大平原一望無際，牠似乎永遠在尋找下一片沉積物豐富的區域。' },
    { id: 'nodulecrab', name: '結核蟹', icon: 'c_nodulecrab', zone: 6, rare: false,
      lore: '殼上長滿了海床礦物結核，走起路來喀啦作響，幾乎跟牠棲息的地質融為一體，是天然的偽裝高手。' },
    { id: 'ghostfish', name: '幽光魚', icon: 'c_ghostfish', zone: 6, rare: false,
      lore: '身體幾乎沒有色素、薄得透光，在平原上緩慢漂游，遠遠看只像一團模糊的光斑。' },
    { id: 'silenthunter', name: '寂靜獵手', icon: 'c_silenthunter', zone: 6, rare: true,
      lore: '在這片毫無遮蔽的平原上，牠演化出完全無聲的游動方式——連水流擾動都壓到最低，獵物往往到最後一刻才察覺牠的存在。' },
    // 熱泉海淵
    { id: 'ventshrimp', name: '熱泉蝦', icon: 'c_ventshrimp', zone: 7, rare: false,
      lore: '成群聚集在熱泉噴口周圍，靠背部特化的感光器偵測熱泉噴發的微光，在滾燙的礦物噴流邊緣討生活。' },
    { id: 'tubeworm', name: '管蟲叢', icon: 'c_tubeworm', zone: 7, rare: false,
      lore: '沒有嘴也沒有消化道，體內共生的細菌直接把熱泉噴出的化學物質轉換成能量——這裡的生態系不靠陽光，靠地熱運轉。' },
    { id: 'magmaeel', name: '熔岩鰻', icon: 'c_magmaeel', zone: 7, rare: false,
      lore: '皮膚演化出驚人的耐熱能力，能貼著熱泉噴口的邊緣游動而不受傷，橘紅色的體色是牠獨有的保護色。' },
    { id: 'abyssalphoenix', name: '深淵火鳥', icon: 'c_abyssalphoenix', zone: 7, rare: true,
      lore: '在熱泉的高溫水流中若隱若現，鰭緣的螢光隨水流搖曳如燃燒的羽翼，是這片灼熱深淵裡最不真實的一幕。' },
    // 裂谷深淵
    { id: 'riftworm', name: '裂谷蟲', icon: 'c_riftworm', zone: 8, rare: false,
      lore: '成串鑽進裂谷岩壁縫隙裡的細長生物，只露出頭部一圈發光觸鬍，感應著岩壁滲出的礦物質濃度。' },
    { id: 'chasmray', name: '深谷魟', icon: 'c_chasmray', zone: 8, rare: false,
      lore: '貼著裂谷邊緣滑翔的巨大魟魚，翼展幾乎橫跨整條裂縫，是這片海域少數敢直視潛燈號燈暈的生物。' },
    { id: 'faultjelly', name: '斷層水母', icon: 'c_faultjelly', zone: 8, rare: false,
      lore: '傘體隨著裂谷深處傳來的地質震動規律收縮，彷彿把整條裂谷的心跳都聽進了身體裡。' },
    { id: 'abyssking', name: '深淵之王', icon: 'c_abyssking', zone: 8, rare: true,
      lore: '傳說裂谷最深處住著一頭沒有生物學家能歸類的巨大掠食者，只有寥寥幾次目擊紀錄，每一次都只拍到一小段輪廓。' },
    // 先驅遺跡
    { id: 'ruincrab', name: '遺跡守衛蟹', icon: 'c_ruincrab', zone: 9, rare: false,
      lore: '外殼帶著明顯人工打磨的稜角，在遺跡結構之間巡邏似地來回走動，動作規律得不像單純覓食——更像是在「執行」什麼。' },
    { id: 'signaljelly', name: '訊號水母', icon: 'c_signaljelly', zone: 9, rare: false,
      lore: '傘體內部帶著規律閃爍的螢光脈衝，頻率跟深淵訊號殘片的節奏隱約對得上。沒有人確定牠是天然生物，還是遺跡系統的一部分。' },
    { id: 'echosentinel', name: '回聲哨兵', icon: 'c_echosentinel', zone: 9, rare: false,
      lore: '靜止懸浮在遺跡通道入口，只有聲納掃過時才會有反應——一圈微弱的回波，像是某種確認訊號的儀式，確認完畢後又恢復靜止。' },
    { id: 'precursorshade', name: '先驅之影', icon: 'c_precursorshade', zone: 9, rare: true,
      lore: '只在遺跡核心深處出現過幾次的巨大輪廓，探照燈掃過的瞬間就已經融入結構的陰影裡。留下的唯一線索，是牆面上一圈跟牠身形吻合的、明顯是「刻意留下」的凹痕。' },
    // 回音迴廊
    { id: 'echowalker', name: '回聲行者', icon: 'c_echowalker', zone: 10, rare: false,
      lore: '沿著迴廊牆面緩慢移動的細長生物，每走一步都會發出一聲跟自己動作完全同步的回音——分不清是牠在製造回音，還是回音在推著牠走。' },
    { id: 'corridorwatcher', name: '迴廊守望者', icon: 'c_corridorwatcher', zone: 10, rare: false,
      lore: '固定懸浮在通道某個定點的環狀生物，探照燈照過去牠也不會移動半分，只有中央那圈螢光會隨聲納脈衝同步明滅，像是在核對通行的是誰。' },
    { id: 'silentstalker', name: '靜默潛行者', icon: 'c_silentstalker', zone: 10, rare: false,
      lore: '全身沒有一絲多餘的擾動，游過迴廊時連儀表板最靈敏的水流感測器都量不到牠的存在，只有目視才能勉強捕捉到一道極淡的殘影。' },
    { id: 'origineye', name: '起源之眼', icon: 'c_origineye', zone: 10, rare: true,
      lore: '傳說迴廊盡頭有什麼東西一直「醒著」，只用一隻巨大的複眼觀察經過的一切。目擊紀錄裡，那隻眼睛從頭到尾沒有眨過一次，也沒有移開視線。' },
    // 沉眠都市
    { id: 'stoneguardian', name: '石化守衛', icon: 'c_stoneguardian', zone: 11, rare: false,
      lore: '矗立在城市街口一動也不動的巨大人形輪廓，表面覆滿礦物結晶，乍看像雕像——直到探照燈照過去的瞬間，它的「頭」緩緩轉了過來。' },
    { id: 'echodweller', name: '迴聲居民', icon: 'c_echodweller', zone: 11, rare: false,
      lore: '半透明的人形輪廓，沿著城市街道重複走著同一段路線，像是被困在某個已經結束很久的日常裡，對潛燈號的燈暈完全視而不見。' },
    { id: 'citypatrol', name: '都市巡邏者', icon: 'c_citypatrol', zone: 11, rare: false,
      lore: '沿著城市外圍規律巡邏的機械狀生物，路線精準得像是還在執行某種從未被取消的勤務。跟遺跡守衛蟹不同，牠會停下來「看」潛燈號幾秒才離開。' },
    { id: 'theawakened', name: '甦醒者', icon: 'c_theawakened', zone: 11, rare: true,
      lore: '只在甦醒核心亮起後才出現過的巨大輪廓，跟先驅之影、起源之眼都不一樣——牠不迴避、不靜止觀察，牠會主動朝探照燈的方向游過來。目擊紀錄到此為止。' }
  ];

  function creatureById(id) { return CREATURE_DEFS.find((c) => c.id === id); }
  function creaturesForZone(zoneId) { return CREATURE_DEFS.filter((c) => c.zone === zoneId); }

  window.App.Data.CREATURE_DEFS = CREATURE_DEFS;
  window.App.Data.creatureById = creatureById;
  window.App.Data.creaturesForZone = creaturesForZone;
})();
