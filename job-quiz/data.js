// 《禁閉逃殺》職業心理測驗 - 資料
// 職業強度分級與部分技能描述整理自玩家社群資訊；未附詳細數值的職業，
// 描述以其職業意象／角色調性呈現，實際技能請以遊戲內公告為準。

const TIER_LABELS = {
  t1: { label: "T1 強度", color: "#e0533d" },
  t2: { label: "T2 強度", color: "#c9a24b" },
  other: { label: "其他已知職業", color: "#7a8a9a" },
};

// 七個人格傾向軸：
// combat 戰鬥／正面對抗　stealth 潛行／謹慎　social 社交／手腕
// resource 資源／理性規劃　chaos 衝動／不按牌理　support 奉獻／照顧他人
// control 掌控／秩序
const PROFESSIONS = [
  {
    id: "undertaker",
    name: "入殮師",
    tier: "t1",
    emoji: "⚰️",
    tagline: "後期越打越強",
    desc: "戰鬥節奏越往後越屬於你。前期低調蟄伏，不搶鋒頭，等局勢進入後期，你反而越打越猛，是那種笑到最後的狠角色。",
    match: "你不畏懼直視危險與死亡，習慣在混亂中保持冷靜，越到絕境反而越沉得住氣。這種「後發制人」的性格，正是入殮師最致命的地方。",
    axes: { combat: 2, stealth: 2, control: 1 },
  },
  {
    id: "chemist",
    name: "化學家",
    tier: "t1",
    emoji: "🧪",
    tagline: "既能布毒也能防毒",
    desc: "一手好牌握在手裡——既能對敵人下毒布局，也能替自己和隊友解毒防身，攻防一體，幾乎沒有明顯弱點。",
    match: "你做事講求precision（精準），喜歡把風險算進計畫裡，既想保護自己也想留一手反制對方。攻防兼備的化學家，正合你的理性腦。",
    axes: { resource: 2, combat: 1, control: 2 },
  },
  {
    id: "matchmaker",
    name: "月老",
    tier: "t1",
    emoji: "💘",
    tagline: "牽線佈局的隱藏強者",
    desc: "作為天生的牽線者，你總能看穿人與人之間微妙的關係，替自己和隊友創造有利的連結與資訊網，在關鍵時刻一線牽動全局。",
    match: "你對人際關係特別敏銳，總能看出誰跟誰處得來、誰跟誰有心結，並懂得利用這層資訊布局。月老的強，強在你早就看穿了全場。",
    axes: { social: 3, support: 2 },
  },
  {
    id: "tycoon",
    name: "富豪",
    tier: "t2",
    emoji: "💰",
    tagline: "開局自帶三根不佔負重的金條",
    desc: "你天生自帶資源優勢，開局就握著三根不佔負重的金條，不用犧牲行動力就能擁有雄厚本錢，資源調度是你穩贏的底氣。",
    match: "你相信資源就是安全感，習慣未雨綢繆、手裡永遠留一手籌碼。富豪的贏，贏在起跑點就比別人多了選項。",
    axes: { resource: 3, social: 1 },
  },
  {
    id: "mercenary",
    name: "雇傭兵",
    tier: "t2",
    emoji: "🔫",
    tagline: "武器技能不佔負重",
    desc: "武器與技能完全不佔負重，讓你能輕裝上陣、全力輸出，是團隊裡最直接、最不囉唆的戰鬥主力。",
    match: "你喜歡直來直往，遇到問題傾向正面解決而不是繞路。行動力全點在戰鬥上的雇傭兵，就是你風格的延伸。",
    axes: { combat: 3, control: 1 },
  },
  {
    id: "maniac",
    name: "狂徒",
    tier: "t2",
    emoji: "🔪",
    tagline: "越亂越如魚得水",
    desc: "你討厭被規則綁住，憑一股衝勁和狠勁殺出重圍。局面越混亂、越沒有章法，你反而打得越順手。",
    match: "你做決定常常靠直覺而不是精算，喜歡打破常規、不按牌理出牌。狂徒的失控感，其實正是你骨子裡的自由。",
    axes: { chaos: 3, combat: 2 },
  },
  {
    id: "trucker",
    name: "貨車司機",
    tier: "t2",
    emoji: "🚚",
    tagline: "路線與時機的掌握者",
    desc: "你對路線、時機與距離有種本能的掌握，總能在最恰當的時刻把自己和資源穩穩送到該去的地方，是隊伍裡低調卻不可或缺的存在。",
    match: "你做事講究規劃與節奏，不喜歡橫衝直撞，寧可穩穩地把每一步走到位。貨車司機的穩，就是你的生存哲學。",
    axes: { stealth: 2, resource: 2, control: 1 },
  },
  {
    id: "mutant",
    name: "基因怪人",
    tier: "other",
    emoji: "🧬",
    tagline: "不穩定卻爆發力驚人",
    desc: "你的身體裡藏著連自己都說不準的變數，看似不穩定，卻也因此擁有意想不到的爆發力，是一種高風險高回報的存在。",
    match: "你不排斥未知與冒險，甚至覺得「不可預測」才有趣。基因怪人的暴走感，某種程度上就是你性格裡壓抑不住的那一面。",
    axes: { chaos: 2, combat: 2, stealth: 1 },
  },
  {
    id: "enforcer",
    name: "秩序者",
    tier: "other",
    emoji: "⚖️",
    tagline: "在混亂中建立框架",
    desc: "你相信規則存在是有道理的，總能在混亂中率先建立起局面的框架，讓自己和隊友掌握主動權，而不是被局勢牽著走。",
    match: "遇到失控的場面，你的本能是先建立秩序而不是加入混亂。秩序者的掌控欲，其實是你對「安全感」的另一種詮釋。",
    axes: { control: 3, combat: 1, social: 1 },
  },
  {
    id: "thief",
    name: "怪盜",
    tier: "other",
    emoji: "🎭",
    tagline: "神不知鬼不覺地拿到手",
    desc: "你享受在別人眼皮子底下神不知鬼不覺地把東西拿到手，潛行、開鎖、巧取是你的拿手好戲，比起硬碰硬更愛智取。",
    match: "比起正面衝突，你更享受用巧勁解決問題，喜歡「神不知鬼不覺」帶來的成就感。怪盜的優雅，就是你做事的方式。",
    axes: { stealth: 3, social: 2 },
  },
  {
    id: "doctor",
    name: "醫生",
    tier: "other",
    emoji: "🩺",
    tagline: "團隊撐到最後的關鍵",
    desc: "你的存在讓隊伍安心，總是把別人的傷勢與情緒照顧擺在第一位，即使不站在最前線，卻是團隊能撐到最後的關鍵。",
    match: "你天生容易注意到別人的狀態，習慣把照顧他人放在自己前面。醫生的溫柔與堅韌，正是你性格裡最珍貴的部分。",
    axes: { support: 3, resource: 1 },
  },
  {
    id: "tamer",
    name: "馴獸師",
    tier: "other",
    emoji: "🐾",
    tagline: "穩定收益、越滾越大",
    desc: "可獲得屬性加點，每回合都有穩定的卡牌收益。你擅長長期經營，不追求一時爆發，而是靠著穩定積累在持久戰中越滾越大。",
    match: "你相信「穩紮穩打」比「一步登天」更可靠，喜歡看得見的長期回報。馴獸師的細水長流，正對你的胃口。",
    axes: { resource: 2, support: 2, control: 1 },
  },
  {
    id: "bartender",
    name: "調酒師",
    tier: "other",
    emoji: "🍸",
    tagline: "社交場上總佔上風",
    desc: "你懂得怎麼讓氣氛對自己有利——喝酒對你毫無負面效果，技能還能讓對手棄置道具，社交場合裡你總能不著痕跡地佔到便宜。",
    match: "你擅長在輕鬆的互動裡悄悄掌握節奏，讓別人卸下防備。調酒師的高明，在於連削弱對手都能做得像請客一樣自然。",
    axes: { social: 2, support: 2, chaos: 1 },
  },
  {
    id: "hacker",
    name: "駭客",
    tier: "other",
    emoji: "💻",
    tagline: "暗處決定全局走向的操盤手",
    desc: "可以封鎖房間、遠端控毒，收益穩定且影響全局；近期更新後又新增了暗影吸血、順位卡交易等調整，操作空間更大。",
    match: "你喜歡在幕後掌握資訊與系統，不需要站到台前也能左右結果。駭客的存在感，就藏在你不動聲色的每一步佈局裡。",
    axes: { stealth: 2, control: 2, resource: 1 },
  },
];

const QUESTIONS = [
  {
    text: "深夜獨自走在陌生的巷子，突然聽到身後有腳步聲逼近，你會？",
    options: [
      { text: "迅速鑽進暗處，觀察情況再說", axis: "stealth" },
      { text: "轉身直接面對，準備應戰", axis: "combat" },
      { text: "假裝講電話，順口說出附近地標引開注意", axis: "social" },
      { text: "快速盤算附近哪裡人多、能求助", axis: "resource" },
    ],
  },
  {
    text: "朋友之間吵架，你通常扮演什麼角色？",
    options: [
      { text: "負責緩頰，幫雙方找台階下", axis: "support" },
      { text: "直接分析誰對誰錯，講求邏輯是非", axis: "control" },
      { text: "看戲不太介入，混亂之中自有生存空間", axis: "chaos" },
      { text: "找出雙方共同利益，居中撮合", axis: "social" },
    ],
  },
  {
    text: "如果手上突然有一筆意外之財，你會？",
    options: [
      { text: "存起來，分散配置，穩健增值", axis: "resource" },
      { text: "拿去買裝備、武裝自己", axis: "combat" },
      { text: "請客交朋友，擴大人脈", axis: "social" },
      { text: "捐一部分，幫助有需要的人", axis: "support" },
    ],
  },
  {
    text: "團隊合作時，你最享受的角色是？",
    options: [
      { text: "衝在最前面的先鋒", axis: "combat" },
      { text: "幕後規劃全局的軍師", axis: "control" },
      { text: "負責照顧隊友狀態的後勤", axis: "support" },
      { text: "遊走各方打探情報的耳目", axis: "stealth" },
    ],
  },
  {
    text: "面對不合理的規則或體制，你的態度是？",
    options: [
      { text: "找到漏洞，悄悄鑽過去就好", axis: "stealth" },
      { text: "我行我素，規則本來就是拿來打破的", axis: "chaos" },
      { text: "想辦法從內部改革，建立更好的秩序", axis: "control" },
      { text: "靠交情跟溝通，幫自己爭取例外", axis: "social" },
    ],
  },
  {
    text: "你理想中的假期是？",
    options: [
      { text: "說走就走，去一個沒去過的地方探險", axis: "chaos" },
      { text: "規劃好詳細行程，準時完成每個景點", axis: "resource" },
      { text: "跟一大群朋友熱熱鬧鬧出遊", axis: "social" },
      { text: "待在家照顧植物或寵物，享受平靜", axis: "support" },
    ],
  },
  {
    text: "危險逼近的瞬間，你的第一反應是？",
    options: [
      { text: "冷靜評估，正面迎擊解決問題", axis: "combat" },
      { text: "憑直覺行動，管不了那麼多", axis: "chaos" },
      { text: "先觀察環境，找出最安全的退路", axis: "stealth" },
      { text: "想辦法拖住對方，替其他人爭取時間", axis: "support" },
    ],
  },
  {
    text: "身邊的人通常怎麼形容你？",
    options: [
      { text: "很難被看透，總有一手別人猜不到的牌", axis: "stealth" },
      { text: "講義氣、靠得住", axis: "support" },
      { text: "很會來事，到哪裡都吃得開", axis: "social" },
      { text: "有點瘋，做事不按牌理出牌", axis: "chaos" },
    ],
  },
  {
    text: "做重要決定時，你最看重的是？",
    options: [
      { text: "精準計算得失，理性至上", axis: "resource" },
      { text: "跟隨直覺與當下的情緒", axis: "chaos" },
      { text: "團隊或身邊人的感受", axis: "support" },
      { text: "是否符合原則與秩序", axis: "control" },
    ],
  },
  {
    text: "如果要形容自己在絕境中的樣子，你覺得是？",
    options: [
      { text: "越危險反而越冷靜致命", axis: "combat" },
      { text: "悄悄潛伏，等待最好的時機", axis: "stealth" },
      { text: "靠一張嘴化解危機", axis: "social" },
      { text: "犧牲自己也要保護重要的人", axis: "support" },
    ],
  },
];
