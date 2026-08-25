// AI 心理分析引擎
// 說明：這是一個在瀏覽器端運作的規則式生成引擎，會根據抽到的牌、
// 牌陣位置、正逆位與牌與牌之間的關係，組合出一段客製化的心理分析文字。
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

// draws: [{ card, orientation: 'up' | 'rev', position: { key, label } }, ...]
function generateAnalysis(spread, draws, question) {
  const paragraphs = [];

  // 開場
  const questionLine = question && question.trim()
    ? `關於你提出的提問「${question.trim()}」，`
    : "";
  paragraphs.push(
    `${questionLine}這次使用的是「${spread.name}」牌陣，一共抽出了 ${draws.length} 張牌。以下的分析，是把每張牌的原型意義，放進它所在的位置脈絡中重新解讀，提供給你作為自我覺察的參考，而不是絕對的定論。`
  );

  // 逐張牌解讀
  draws.forEach((draw) => {
    const { card, orientation, position } = draw;
    const orientLabel = orientation === "up" ? "正位" : "逆位";
    const text = card.text[orientation];
    const lens = POSITION_LENS[position.key] || ((t) => t);
    paragraphs.push(
      `【${position.label}】${card.name}（${orientLabel}）—— ${lens(text)}`
    );
  });

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

  // 結語與反思提問
  paragraphs.push(pickRandom(REFLECTION_PROMPTS));

  return paragraphs;
}
