// AI 心理分析引擎
// 說明：這是一個在瀏覽器端運作的規則式生成引擎，會根據抽到的牌、
// 牌陣位置、正逆位、牌與牌之間的關係，以及你輸入的問題所屬的主題，
// 組合出一段客製化的心理分析文字。
// 它不會呼叫任何外部 AI 服務，因此不需要 API 金鑰，也不會把你的資料傳到任何地方。

const POSITION_LENS = {
  guide: (t) => `今天想對你說的是：${t}`,
  past: (t) => `這段過去的經歷，反映出：${t}`,
  present: (t) => `此刻的你，正處於：${t}`,
  future: (t) => `接下來的趨勢，傾向於：${t}`,
  body: (t) => `在身體與行動的層面，${t}`,
  mind: (t) => `在思緒與情緒的層面，${t}`,
  spirit: (t) => `在內在價值與靈性的層面，${t}`,
  you: (t) => `你內心真正的感受可能是：${t}`,
  other: (t) => `對方此刻的心境，可能是：${t}`,
  bond: (t) => `這段關係接下來的走向：${t}`,
  situation: (t) => `目前的處境是：${t}`,
  help: (t) => `能為你帶來助力的是：${t}`,
  obstacle: (t) => `需要留意的阻礙是：${t}`,
  advice: (t) => `給你的建議是：${t}`,
  outcome: (t) => `順著這個方向走下去，可能的結果是：${t}`,
};

// 問題主題偵測：依關鍵字判斷提問屬於哪個生活領域，讓分析能貼著問題走
const QUESTION_CATEGORIES = [
  { key: "love", label: "感情關係", patterns: ["感情", "愛情", "對象", "喜歡", "戀愛", "另一半", "分手", "曖昧", "復合", "追", "告白"] },
  { key: "career", label: "工作與事業", patterns: ["工作", "事業", "職涯", "升遷", "面試", "老闆", "同事", "轉職", "創業", "考試", "唸書", "讀書"] },
  { key: "family", label: "家庭", patterns: ["家人", "家庭", "父母", "媽媽", "爸爸", "親子", "小孩"] },
  { key: "friend", label: "人際關係", patterns: ["朋友", "友情", "人際", "同學", "室友"] },
  { key: "money", label: "財務", patterns: ["錢", "財務", "投資", "理財", "存錢", "花費"] },
  { key: "self", label: "自我成長與人生方向", patterns: ["自己", "自我", "成長", "方向", "決定", "選擇", "人生", "未來"] },
];

// 牌陣中特別值得互相對照的位置組合
const PAIR_RULES = {
  timeline3: [{ a: "past", b: "future", frame: "「過去」與「未來」" }],
  mindbody3: [{ a: "body", b: "spirit", frame: "「身」與「靈」" }],
  relationship3: [{ a: "you", b: "other", frame: "「你的心」與「對方的心」" }],
  star5: [
    { a: "obstacle", b: "advice", frame: "「阻礙」與「建議」" },
    { a: "situation", b: "outcome", frame: "「現況」與「可能結果」" },
  ],
};

// 關鍵字延伸句型：有偵測到問題主題 / 沒有主題時，各準備多種說法輪流使用，避免每張牌都念同一套模板
const DEEP_DIVE_WITH_CATEGORY = [
  (kw, cat) => `放回「${cat}」來看，「${kw}」很可能是這個位置上最不能忽略的線索——它未必是全部答案，但值得你多留意一下。`,
  (kw, cat) => `對照到「${cat}」這件事，「${kw}」這個關鍵字，或許正說中了你心裡某個還沒整理清楚的部分。`,
  (kw, cat) => `如果把這張牌套進「${cat}」的處境，「${kw}」幾乎是它在對你眨眼的地方——先別急著解讀，感受一下它是不是有點眼熟。`,
  (kw, cat) => `就「${cat}」而言，這裡的重點在「${kw}」：它可能不是問題本身，而是問題底下更根本的那一層。`,
  (kw, cat) => `扣回「${cat}」，「${kw}」這個線索值得停留久一點——通常一張牌會被抽到這個位置，不是巧合。`,
  (kw, cat) => `從「${cat}」的角度切入，「${kw}」是這張牌想遞給你的關鍵字，剩下的解讀，交給你自己最誠實的直覺。`,
];

const DEEP_DIVE_GENERIC = [
  (kws) => `「${kws}」是這張牌在這個位置上最核心的提示，值得你停留一下，想想它對應到生活中的哪個畫面。`,
  (kws) => `這裡的關鍵字是「${kws}」——先別急著套進特定的事件，讓它先在心裡沉澱一下再說。`,
  (kws) => `「${kws}」這幾個字，或許比整段牌義更值得你記住，之後回頭看，常常會發現特別準的就是這裡。`,
  (kws) => `留意「${kws}」這個關鍵字，它可能是這張牌想讓你優先看見的部分。`,
];

const REFLECTION_PROMPTS = [
  "留一點時間問問自己：這些牌所反映的情境，此刻的我最想聽見的是什麼？",
  "如果這副牌是一面鏡子，它照出的是我心裡哪一個還沒被說出口的想法？",
  "在讀完這段分析後，有沒有哪一句話，讓你心裡「咯噔」了一下？那通常就是最值得深入的地方。",
  "試著把這次的牌陣，當作一次和自己的對話，而不是對未來的預言。",
  "這些牌沒有標準答案，真正的答案，一直都在你自己心裡。",
];

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function detectCategory(question) {
  if (!question || !question.trim()) return null;
  const text = question.trim();
  for (const cat of QUESTION_CATEGORIES) {
    if (cat.patterns.some((p) => text.includes(p))) return cat;
  }
  return null;
}

function findDraw(draws, key) {
  return draws.find((d) => d.position.key === key);
}

// 依牌陣定義的位置組合，比較兩張牌的正逆位與屬性，產生對照句
function buildPairInsights(spread, draws) {
  const rules = PAIR_RULES[spread.id];
  if (!rules) return [];

  return rules.map((rule) => {
    const drawA = findDraw(draws, rule.a);
    const drawB = findDraw(draws, rule.b);
    if (!drawA || !drawB) return null;

    const sameOrientation = drawA.orientation === drawB.orientation;
    const bothMajor = drawA.card.arcana === "major" && drawB.card.arcana === "major";
    const sameSuit = drawA.card.suit && drawA.card.suit === drawB.card.suit;

    let insight;
    if (sameSuit) {
      insight = `兩張牌同屬「${drawA.card.subtitle.split("・")[1]}」的能量，代表這個主題目前相當一致，你在這件事上的狀態並不矛盾，只是需要被更清楚地看見。`;
    } else if (sameOrientation && drawA.orientation === "up") {
      insight = `兩張牌都是正位，顯示這兩端目前是彼此呼應、方向一致的，這是一個相對穩定、可以順勢而為的組合。`;
    } else if (sameOrientation && drawA.orientation === "rev") {
      insight = `兩張牌都是逆位，暗示這兩端目前都卡著類似的阻力，也許問題不在其中一邊，而是有一個更底層、兩邊共通的癥結需要先被處理。`;
    } else if (bothMajor) {
      insight = `一正一逆、且都是大阿爾克那，代表這兩端存在明顯的落差或轉折——事情正在這兩個位置之間，經歷一次不小的翻轉。`;
    } else {
      insight = `一正一逆的組合，顯示這兩端目前並不同步，中間可能有一個你還沒意識到、或還沒說出口的落差。`;
    }

    return `${rule.frame}這一組對照來看：${insight}`;
  }).filter(Boolean);
}

// draws: [{ card, orientation: 'up' | 'rev', position: { key, label } }, ...]
function generateAnalysis(spread, draws, question) {
  const paragraphs = [];
  const category = detectCategory(question);
  const trimmedQuestion = question && question.trim();

  // 開場
  if (trimmedQuestion) {
    const catLine = category ? `這聽起來與「${category.label}」有關。` : "";
    paragraphs.push(
      `關於你提出的提問「${trimmedQuestion}」，${catLine}這次使用的是「${spread.name}」牌陣，一共抽出了 ${draws.length} 張牌。以下的分析，會把每張牌的原型意義放進它所在的位置脈絡中，並盡量扣回你的問題本身，提供給你作為自我覺察的參考，而不是絕對的定論。`
    );
  } else {
    paragraphs.push(
      `這次使用的是「${spread.name}」牌陣，一共抽出了 ${draws.length} 張牌。以下的分析，是把每張牌的原型意義放進它所在的位置脈絡中重新解讀，提供給你作為自我覺察的參考，而不是絕對的定論。`
    );
  }

  // 逐張牌深入解讀：位置意義 + 牌義 + 關鍵字延伸（扣回問題主題，句型輪流變化避免重複）
  draws.forEach((draw, idx) => {
    const { card, orientation, position } = draw;
    const orientLabel = orientation === "up" ? "正位" : "逆位";
    const text = card.text[orientation];
    const lens = POSITION_LENS[position.key] || ((t) => t);
    const keywords = card.keywords[orientation];
    const primaryKeyword = keywords[0];

    let deepDive;
    if (category) {
      const template = DEEP_DIVE_WITH_CATEGORY[idx % DEEP_DIVE_WITH_CATEGORY.length];
      deepDive = template(primaryKeyword, category.label);
    } else {
      const template = DEEP_DIVE_GENERIC[idx % DEEP_DIVE_GENERIC.length];
      deepDive = template(keywords.slice(0, 2).join("、"));
    }

    paragraphs.push(
      `【${position.label}】${card.name}（${orientLabel}）—— ${lens(text)}${deepDive}`
    );
  });

  // 位置對照分析（例如過去/未來、阻礙/建議）
  buildPairInsights(spread, draws).forEach((insight) => paragraphs.push(insight));

  // 大阿爾克那 / 小阿爾克那 比例
  const majorCount = draws.filter((d) => d.card.arcana === "major").length;
  const minorCount = draws.length - majorCount;
  if (draws.length > 1) {
    if (majorCount > minorCount) {
      paragraphs.push(
        "這次抽到的牌以大阿爾克那為主，代表你正站在一個攸關重要人生課題的轉折點上——這些牌談的往往不是雞毛蒜皮的小事，而是值得你認真面對、慢慢消化的核心主題。"
      );
    } else if (minorCount > 0 && majorCount === 0) {
      paragraphs.push(
        "這次抽到的牌全部來自小阿爾克那，顯示這更多與你近期具體的生活情境、日常行動與感受有關，是現階段可以實際著手調整的部分。"
      );
    }
  }

  // 逆位比例
  if (draws.length > 1) {
    const revCount = draws.filter((d) => d.orientation === "rev").length;
    const revRatio = revCount / draws.length;
    if (revRatio >= 0.6) {
      paragraphs.push(
        "牌陣中逆位牌偏多，這通常暗示著內在有些阻塞、猶豫，或是尚未被整合的課題，是提醒你放慢腳步、多花點時間向內審視的訊號。"
      );
    } else if (revRatio === 0) {
      paragraphs.push(
        "這次抽到的牌全部為正位，能量的流動相對順暢，代表你目前具備足夠的資源與清晰度去面對眼前的課題。"
      );
    }
  }

  // 元素／花色主題（只在小阿爾克那有出現時）
  const suitCounts = {};
  draws.forEach((d) => {
    if (d.card.suit) suitCounts[d.card.suit] = (suitCounts[d.card.suit] || 0) + 1;
  });
  const suitEntries = Object.entries(suitCounts).sort((a, b) => b[1] - a[1]);
  if (suitEntries.length > 0 && suitEntries[0][1] >= 2) {
    const suitNames = { wands: "權杖（火）", cups: "聖杯（水）", swords: "寶劍（風）", pentacles: "錢幣（土）" };
    const suitThemes = {
      wands: "行動力、熱情與創造力",
      cups: "情感、關係與直覺",
      swords: "思維、溝通與真相",
      pentacles: "現實、資源與物質安全感",
    };
    const dominant = suitEntries[0][0];
    paragraphs.push(
      `牌陣中${suitNames[dominant]}的能量特別突出，顯示「${suitThemes[dominant]}」是這段時期對你而言特別核心的主題。`
    );
  }

  // 回到問題本身的總結（只在有輸入問題時出現）
  if (trimmedQuestion) {
    const priorityKeys = ["outcome", "advice", "bond", "future", "spirit", "guide"];
    const keyPosition = priorityKeys.map((k) => findDraw(draws, k)).find(Boolean) || draws[draws.length - 1];
    const kw = keyPosition.card.keywords[keyPosition.orientation][0];
    paragraphs.push(
      `回到你最初的問題「${trimmedQuestion}」——如果只能抓住一個重點，那大概會落在【${keyPosition.position.label}】的${keyPosition.card.name}上：關鍵字是「${kw}」。這張牌沒有直接給你答案，但它指出了一個方向——真正的決定，還是要回到你自己對這件事最誠實的感覺。`
    );
  }

  // 結語與反思提問
  paragraphs.push(pickRandom(REFLECTION_PROMPTS));

  return paragraphs;
}
