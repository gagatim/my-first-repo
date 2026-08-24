// 禁閉逃殺 - 遊戲資料
const FACILITY_NAME = "無光禁閉所";

const IDENTITIES = [
  {
    id: "hacker",
    name: "凌薇",
    role: "駭客",
    emoji: "🖥️",
    desc: "曾駭入政府系統的地下高手，被以「危害安全」之名關進來。擅長電子鎖與監控系統。",
    stats: { stamina: 45, sanity: 55, skill: 65 },
    tag: "hack",
    tagBonus: 15,
    item: "usb_drive",
  },
  {
    id: "soldier",
    name: "岳楓",
    role: "特種兵",
    emoji: "🪖",
    desc: "退役特種部隊隊員，在一次任務中目睹了設施的秘密而遭滅口式關押。體力驚人，但夜裡總被噩夢糾纏。",
    stats: { stamina: 70, sanity: 40, skill: 50 },
    tag: "combat",
    tagBonus: 15,
    item: "knife",
  },
  {
    id: "journalist",
    name: "何思漾",
    role: "隨隊記者",
    emoji: "📷",
    desc: "追查禁閉所醜聞的自由記者，潛入採訪時被識破抓捕。口才與觀察力是她僅存的武器。",
    stats: { stamina: 50, sanity: 65, skill: 55 },
    tag: "social",
    tagBonus: 10,
    item: "camera",
  },
  {
    id: "medic",
    name: "沈聿安",
    role: "醫護兵",
    emoji: "💉",
    desc: "曾在戰地救人無數的軍醫，因拒絕執行「處置」命令而被囚。冷靜的雙手仍能救人一命。",
    stats: { stamina: 55, sanity: 55, skill: 58 },
    tag: "medical",
    tagBonus: 15,
    item: "medkit_pro",
    healBonus: 1.5,
  },
];

const ITEMS = {
  usb_drive: { name: "駭客隨身碟", emoji: "💾", desc: "存有破解工具，處理電子鎖時更有把握。", key: true },
  knife: { name: "戰術匕首", emoji: "🔪", desc: "近身戰鬥時的可靠依仗。", key: true },
  camera: { name: "相機", emoji: "📷", desc: "記錄下設施罪證的相機，或許能改變結局。", key: true },
  medkit_pro: { name: "高級醫療包", emoji: "🩺", desc: "專業急救裝備，恢復效果更好。", consumable: true, effect: { stamina: 45 } },
  medkit: { name: "急救包", emoji: "🩹", desc: "簡易醫療用品，可恢復體力。", consumable: true, effect: { stamina: 30 } },
  sedative: { name: "鎮定劑", emoji: "💊", desc: "壓下瘋狂的邊緣，恢復精神。", consumable: true, effect: { sanity: 25 } },
  energy_bar: { name: "能量棒", emoji: "🍫", desc: "撐過飢餓的最後一點糧食。", consumable: true, effect: { stamina: 15 } },
  multitool: { name: "多功能工具", emoji: "🛠️", desc: "撬鎖剪線都靠它。", key: true },
  flashlight: { name: "手電筒", emoji: "🔦", desc: "在黑暗管道中看清前路。", key: true },
  evidence_files: { name: "機密檔案", emoji: "📁", desc: "設施內部的黑暗紀錄。", key: true },
};

const FLOORS = [
  {
    id: "b1",
    name: "B1 拘留區",
    intro: "鐵門在你身後鎖死。走廊的日光燈忽明忽滅，遠處傳來規律的腳步聲——巡邏還沒結束。",
    keycard: "keycard_b1",
    keycardEvent: {
      id: "b1_key",
      title: "監控室的鑰匙卡",
      text: "值班室的窗口透出微光，一張鑰匙卡就掛在門邊的掛鉤上，但值班員的座位似乎還是溫的。",
      tag: "hack",
      choices: [
        {
          text: "趁隙潛入偷取",
          check: { difficulty: 10 },
          success: { text: "你屏住呼吸，指尖精準地摘下鑰匙卡，值班員始終沒有回頭。", effects: { danger: 5 } },
          fail: { text: "掛鉤發出輕響，你慌忙抓起卡片奪門而出，警鈴的紅光在身後亮起。", effects: { stamina: -10, danger: 25 } },
        },
        {
          text: "撬開備用配電箱切斷電源",
          check: { difficulty: 5, tagMatch: true },
          success: { text: "電路短路，值班室陷入黑暗，你輕鬆取走鑰匙卡。", effects: { danger: 10 } },
          fail: { text: "你被電流狠狠麻了一下，警報還是被觸發了。", effects: { stamina: -15, danger: 20 } },
        },
      ],
    },
    pool: [
      {
        id: "b1_1",
        title: "走廊上的呻吟",
        text: "一名囚服女子倒在牆角，手臂上有新鮮的針孔痕跡，她微弱地向你伸出手。",
        tag: "medical",
        choices: [
          {
            text: "上前查看傷勢",
            check: { difficulty: 0 },
            success: { text: "你替她包紮，她塞給你一片藏起來的能量棒作為答謝。", effects: {}, addItem: "energy_bar" },
            fail: { text: "巡邏的腳步聲越來越近，你只能匆忙撤離，心裡滿是愧疚。", effects: { sanity: -8 } },
          },
          { text: "悄悄繞過，保存體力", effects: { sanity: -6, danger: 3 }, resultText: "你別過頭快步離開，那道求救的目光烙進了你的記憶。" },
        ],
      },
      {
        id: "b1_2",
        title: "通風口的微光",
        text: "牆角一處通風口的柵欄鬆動了，裡頭似乎能繞開下一段有監視器的走廊。",
        tag: "hack",
        choices: [
          {
            text: "鑽入通風管道",
            check: { difficulty: 5 },
            success: { text: "你悄無聲息地穿過管道，成功避開了整段監控。", effects: { danger: -10, stamina: -5 } },
            fail: { text: "管壁塌陷發出巨響，你狼狽地跌回走廊。", effects: { stamina: -12, danger: 15 } },
          },
          { text: "無視它，走大路", effects: { danger: 5 }, resultText: "你選擇了看似安全、實則更顯眼的正規路線。" },
        ],
      },
      {
        id: "b1_3",
        title: "儲物櫃的鎖",
        text: "一排置物櫃靠牆而立，其中一格的鎖頭鏽跡斑斑，似乎能撬開。",
        tag: "hack",
        choices: [
          {
            text: "撬開鎖頭",
            check: { difficulty: 8 },
            success: { text: "櫃子裡是前一位「住客」留下的急救包，你收好備用。", effects: {}, addItem: "medkit" },
            fail: { text: "鎖頭崩斷時發出刺耳金屬聲，驚動了附近的巡邏員。", effects: { danger: 18 } },
          },
          { text: "不冒險，直接離開", effects: {}, resultText: "你決定不節外生枝，繼續前進。" },
        ],
      },
      {
        id: "b1_4",
        title: "監視器死角",
        text: "天花板的攝影機規律地左右轉動，你必須抓準時機衝過這段死路。",
        tag: "combat",
        choices: [
          {
            text: "計算節奏衝刺通過",
            check: { difficulty: 6 },
            success: { text: "你精準地卡在鏡頭轉向的瞬間衝了過去。", effects: { stamina: -8 } },
            fail: { text: "你慢了半拍，鏡頭的紅燈在你身後亮起。", effects: { stamina: -10, danger: 20 } },
          },
          { text: "耐心等待更長的空檔", effects: { stamina: -3 }, resultText: "你多等了幾分鐘，換來一次更安全的通過。" },
        ],
      },
      {
        id: "b1_5",
        title: "廣播裡的低語",
        text: "天花板的廣播忽然切換成雜訊，隱約夾雜著一句「他們知道你在找什麼」。",
        tag: "social",
        choices: [
          {
            text: "冷靜分析，這只是心理戰",
            check: { difficulty: 4 },
            success: { text: "你穩住心神，看穿了這不過是動搖士氣的伎倆。", effects: { sanity: -2 } },
            fail: { text: "那句話像釘子一樣扎進腦海，你久久無法平復。", effects: { sanity: -15 } },
          },
          { text: "摀住耳朵，加快腳步", effects: { sanity: -8, stamina: -3 }, resultText: "你幾乎是跑著離開了那片區域。" },
        ],
      },
    ],
  },
  {
    id: "b2",
    name: "B2 實驗區",
    intro: "空氣裡飄著消毒水與焦味混合的氣息。牆上的標語寫著「合作是唯一的出路」，字跡卻被人用指甲刮花。",
    keycard: "keycard_b2",
    keycardEvent: {
      id: "b2_key",
      title: "生體鎖與培養艙",
      text: "下一道門需要「合法住客」的生體驗證，控制台旁一具培養艙裡漂浮著模糊的人形。",
      tag: "medical",
      choices: [
        {
          text: "利用培養艙的殘留數據破解驗證",
          check: { difficulty: 10, tagMatch: true },
          success: { text: "你冷靜地讀取殘留生體訊號，騙過了驗證系統。", effects: { sanity: -5, danger: 5 } },
          fail: { text: "系統判定異常，警報短促地響了兩聲又停下——但你知道，有人已經被通知了。", effects: { sanity: -12, danger: 25 } },
        },
        {
          text: "暴力破壞控制面板",
          check: { difficulty: 6, tag: "combat" },
          success: { text: "你一拳砸碎控制面板，門鎖在火花中彈開。", effects: { stamina: -10 } },
          fail: { text: "面板電擊反噬，你痛得跪倒在地，警報大作。", effects: { stamina: -20, danger: 30 } },
        },
      ],
    },
    pool: [
      {
        id: "b2_1",
        title: "顫抖的少女",
        text: "一名瘦弱的女孩蜷縮在實驗桌下，看到你時眼神充滿戒備，「妳……也是被抓來的？」",
        tag: "social",
        choices: [
          {
            text: "留下來安撫她，帶她一起走",
            check: { difficulty: 3 },
            success: {
              text: "她漸漸放鬆下來，緊緊跟在你身邊——你多了一個同伴，也多了一份牽掛。",
              effects: { stamina: -15, sanity: 10 },
              setFlag: { hasAlly: true },
            },
            fail: { text: "她驚慌地推開你逃走了，消失在轉角，你只能獨自嘆息。", effects: { sanity: -10 } },
          },
          { text: "沒有時間，獨自離開", effects: { sanity: -10 }, resultText: "你狠下心轉身離開，那雙眼睛的驚恐揮之不去。" },
        ],
      },
      {
        id: "b2_2",
        title: "藥品櫃",
        text: "一整排藥品櫃整齊排列，標籤上寫著陌生的代號，其中一瓶被貼上手寫的「安全」字條。",
        tag: "medical",
        choices: [
          {
            text: "取走標記安全的藥劑",
            check: { difficulty: 4, tagMatch: true },
            success: { text: "你辨認出這是鎮定劑，小心收進口袋。", effects: {}, addItem: "sedative" },
            fail: { text: "你猶豫太久，巡邏的燈光已經掃了過來，只能空手撤離。", effects: { danger: 10 } },
          },
          { text: "不信任任何標籤，直接離開", effects: {}, resultText: "在這種地方，你不敢輕信任何字條。" },
        ],
      },
      {
        id: "b2_3",
        title: "焊死的通風管",
        text: "一段通風管被人用鐵板焊死，旁邊散落著工具箱的碎片。",
        tag: "hack",
        choices: [
          {
            text: "用隨身工具拆解鐵板",
            check: { difficulty: 8 },
            success: { text: "你耐心撬開焊點，管道另一端通向一條安靜的捷徑。", effects: { danger: -8, stamina: -10 } },
            fail: { text: "鐵板應聲掉落，巨大聲響在空曠的走廊迴盪。", effects: { stamina: -8, danger: 20 } },
          },
          { text: "撿起工具箱碎片備用", effects: {}, resultText: "你順手撿起一把堪用的螺絲起子。", addItem: "multitool" },
        ],
      },
      {
        id: "b2_4",
        title: "觀察窗後的眼睛",
        text: "一面單向玻璃後似乎有人影晃動，你無法確定對方是否也看得見你。",
        tag: "combat",
        choices: [
          {
            text: "貼牆快速通過",
            check: { difficulty: 5 },
            success: { text: "你壓低身形貼著牆根溜了過去，玻璃後的人影沒有反應。", effects: { stamina: -6 } },
            fail: { text: "腳步聲觸發了警報，玻璃後傳來刺耳的敲擊聲。", effects: { sanity: -10, danger: 22 } },
          },
          { text: "繞遠路完全避開", effects: { stamina: -10 }, resultText: "你選擇多花體力，換取一次安穩的擦身而過。" },
        ],
      },
      {
        id: "b2_5",
        title: "檔案室的誘惑",
        text: "半掩的門內是一間檔案室，抽屜上貼著「機密」封條，這或許正是揭發設施的關鍵證據。",
        tag: "social",
        choices: [
          {
            text: "冒險潛入拍下檔案",
            check: { difficulty: 9 },
            success: { text: "你迅速翻拍完幾份文件，指尖都在發抖——這些足以定罪。", effects: { danger: 15 }, addItem: "evidence_files" },
            fail: { text: "警報器毫無預警地響起，你只能空手逃離現場。", effects: { stamina: -10, danger: 25 } },
          },
          { text: "太危險了，放棄", effects: {}, resultText: "你按捺住好奇心，選擇繼續趕路。" },
        ],
      },
    ],
  },
  {
    id: "b3",
    name: "B3 監控中心 / 通風管道",
    intro: "牆上密密麻麻的螢幕播放著全所的畫面——包括你自己。出口就在頭頂上方的機房夾層裡。",
    keycard: "keycard_b3",
    keycardEvent: {
      id: "b3_key",
      title: "最後的主控台",
      text: "主控台掌握著整棟設施的門禁系統，只要拿到主控密卡，逃生通道就會為你敞開。",
      tag: "hack",
      choices: [
        {
          text: "潛入操作室竊取密卡",
          check: { difficulty: 12, tagMatch: true },
          success: { text: "你的手指在鍵盤上飛舞，密卡從讀卡機彈出的瞬間，你幾乎不敢呼吸。", effects: { danger: 10 } },
          fail: { text: "系統鎖死並發出全所警報，紅光染紅了整條走廊。", effects: { stamina: -15, sanity: -10, danger: 35 } },
        },
        {
          text: "強行拔除電源逼系統斷電重啟",
          check: { difficulty: 7, tag: "combat" },
          success: { text: "整棟設施陷入短暫黑暗，你趁機摸走密卡。", effects: { stamina: -10 } },
          fail: { text: "備用電源立刻啟動，警報聲震耳欲聾。", effects: { stamina: -12, danger: 30 } },
        },
      ],
    },
    pool: [
      {
        id: "b3_1",
        title: "獵殺者的腳步",
        text: "遠處傳來沉重而規律的腳步聲——那是專門獵捕逃跑者的守衛，「獵犬」。",
        tag: "combat",
        choices: [
          {
            text: "屏息躲進陰影",
            check: { difficulty: 7 },
            success: { text: "你緊貼牆壁一動不動，獵犬的腳步聲漸漸遠去。", effects: {} },
            fail: { text: "獵犬猛地轉頭望向你藏身之處，你只能拔腿狂奔。", effects: { stamina: -18, danger: 20 } },
          },
          { text: "利用手電筒引開注意力", requiresItem: "flashlight", effects: { danger: -10 }, resultText: "你將手電筒扔向遠處，腳步聲跟著轉向離去。" },
        ],
      },
      {
        id: "b3_2",
        title: "夾層裡的手電筒",
        text: "天花板夾層縫隙中卡著一支手電筒，看起來還能使用。",
        tag: "hack",
        choices: [
          {
            text: "爬上去取下手電筒",
            check: { difficulty: 5 },
            success: { text: "你成功取下手電筒，黑暗的路途總算多了一絲光亮。", effects: {}, addItem: "flashlight" },
            fail: { text: "你踩空跌落，摔得不輕。", effects: { stamina: -12 } },
          },
          { text: "不值得冒險，放棄", effects: {}, resultText: "你決定不浪費體力去拿。" },
        ],
      },
      {
        id: "b3_3",
        title: "廣播中的求救",
        text: "監控室的廣播突然插播了一段雜亂的求救聲，像是另一名逃亡者。",
        tag: "social",
        choices: [
          {
            text: "循聲繞路查看",
            check: { difficulty: 6 },
            success: { text: "你找到一名受傷的逃亡者，交換情報後他塞給你一片能量棒便消失在黑暗中。", effects: {}, addItem: "energy_bar" },
            fail: { text: "那只是誘捕用的錄音陷阱，你差點掉進警衛的包圍圈。", effects: { stamina: -10, danger: 20 } },
          },
          { text: "不理會，這種地方沒有信任", effects: { sanity: -5 }, resultText: "你壓下一絲愧疚，繼續朝出口前進。" },
        ],
      },
      {
        id: "b3_4",
        title: "崩潰的邊緣",
        text: "長時間的高壓與黑暗開始侵蝕你的意志，眼角餘光總覺得有什麼東西在跟著你。",
        tag: "medical",
        choices: [
          {
            text: "深呼吸，強迫自己冷靜",
            check: { difficulty: 5 },
            success: { text: "你按住發顫的雙手，重新找回一絲清明。", effects: { sanity: 8 } },
            fail: { text: "恐慌如潮水般湧來，你花了好一陣子才能重新站起。", effects: { sanity: -15, stamina: -5 } },
          },
          { text: "服用隨身鎮定劑", requiresItem: "sedative", effects: { sanity: 20 }, consumeItem: "sedative", resultText: "藥效讓你的心跳漸漸平緩下來。" },
        ],
      },
      {
        id: "b3_5",
        title: "最後的岔路",
        text: "眼前分成兩條路：一條寬敞明亮但監視器密布，一條狹窄黑暗卻幾乎沒有巡邏痕跡。",
        tag: "hack",
        choices: [
          {
            text: "走黑暗小路",
            check: { difficulty: 6 },
            success: { text: "黑暗中你摸索前行，成功避開了所有監視。", effects: { danger: -12, stamina: -8 } },
            fail: { text: "你在黑暗中撞倒了雜物,發出的聲響驚動了附近巡邏。", effects: { stamina: -10, danger: 18 } },
          },
          { text: "走明亮大路，賭巡邏員剛好不在", effects: { danger: 12 }, resultText: "你加快腳步穿過明亮的走廊，心臟幾乎要跳出胸口。" },
        ],
      },
    ],
  },
];

const FINALE = {
  id: "b4",
  name: "B4 逃生閘口",
  intro: "主控密卡在你手中微微發燙。頭頂的閘口緩緩透出天光——那是你許久未見的、真正的陽光。",
  stages: [
    {
      id: "f1",
      title: "最後的警報",
      text: "密卡插入閘口讀卡機的瞬間，整棟設施響起刺耳的總警報，紅光染滿每一寸牆面。",
      tag: "hack",
      choices: [
        {
          text: "強行超載系統，逼閘口開啟",
          check: { difficulty: 10 },
          success: { text: "系統在冒煙中崩潰，閘口轟然開啟。", effects: { danger: 10 } },
          fail: { text: "超載失敗，你被反震的電流擊倒在地。", effects: { stamina: -20, danger: 15 } },
        },
        {
          text: "冷靜輸入備用開啟指令",
          check: { difficulty: 8, tagMatch: true },
          success: { text: "指令生效，厚重的閘門緩緩滑開一道縫隙。", effects: {} },
          fail: { text: "指令被拒絕，警報聲更加刺耳。", effects: { sanity: -10, danger: 15 } },
        },
      ],
    },
    {
      id: "f2",
      title: "獵犬的最後突襲",
      text: "沉重的腳步聲從走廊盡頭逼近——「獵犬」終於堵住了你的去路，牠的目光鎖定了你。",
      tag: "combat",
      choices: [
        {
          text: "正面迎戰，拚死一搏",
          check: { difficulty: 9 },
          success: { text: "你抓住破綻狠狠一擊，獵犬悶哼一聲倒地不起。", effects: { stamina: -15 } },
          fail: { text: "你被狠狠擊倒在地，掙扎著才勉強脫身。", effects: { stamina: -30, sanity: -10 } },
        },
        {
          text: "利用地形甩開追擊",
          check: { difficulty: 7 },
          success: { text: "你靈活地穿梭在管線之間，成功甩開了獵犬。", effects: { stamina: -10 } },
          fail: { text: "你被抓住手臂狠狠拽了回去，好不容易才掙脫。", effects: { stamina: -22, sanity: -8 } },
        },
      ],
    },
    {
      id: "f3",
      title: "閘口之外",
      text: "刺眼的天光灑落，冷風夾雜著自由的氣息撲面而來。你就快要出去了。",
      tag: "social",
      choices: [
        {
          text: "頭也不回地衝出去",
          check: { difficulty: 4 },
          success: { text: "你踏出了禁閉所的最後一步。", effects: {} },
          fail: { text: "腳下一個踉蹌，你摔在地上又爬了起來。", effects: { stamina: -10 } },
        },
      ],
    },
  ],
};

const ENDINGS = {
  perfect: {
    title: "破曉 · 真相昭然",
    emoji: "🌅",
    text: "你帶著相機與機密檔案衝出無光禁閉所，將設施的罪行公諸於世。這座吞噬了無數人的地方，終於在陽光下無所遁形。你不只逃了出來，還為所有沒能出來的人討回了公道。",
  },
  ally: {
    title: "並肩 · 不再孤身",
    emoji: "🤝",
    text: "你牽著身旁同伴的手衝出閘口，兩人癱坐在草地上大口喘氣，相視而笑。這場逃亡讓你失去了很多，卻也讓你明白，能活著走出來、且不是一個人，已是最大的幸運。",
  },
  quiet: {
    title: "生還 · 無人知曉",
    emoji: "🌫️",
    text: "你獨自一人逃出了無光禁閉所，沒有證據，沒有同伴，只有劫後餘生的沉默。你活下來了，但那些留在黑暗裡的人與事,將永遠是你心底的一道疤。",
  },
  exhausted: {
    title: "力竭 · 倒在終點前",
    emoji: "💀",
    text: "體力耗盡的你，終究沒能撐到閘口打開的那一刻。巡邏的腳步聲由遠而近,而你已經連抬起手指的力氣都沒有了。",
  },
  madness: {
    title: "崩潰 · 迷失在黑暗裡",
    emoji: "🌀",
    text: "無盡的恐懼終於吞沒了你的意識，你分不清眼前的走廊是現實還是幻覺，只能徒勞地在原地打轉，任由黑暗將你完全包裹。",
  },
  caught: {
    title: "捕獲 · 功虧一簣",
    emoji: "⛓️",
    text: "就在閘口之外的天光近在咫尺時，獵犬的手還是扣住了你的肩膀。厚重的鐵門在你眼前緩緩闔上，隔絕了外面的世界，也隔絕了你最後的希望。",
  },
};
