const COLORS = [
  { name: "紅色", hex: "#e74c3c" },
  { name: "橙色", hex: "#e67e22" },
  { name: "黃色", hex: "#f1c40f" },
  { name: "綠色", hex: "#2ecc71" },
  { name: "藍色", hex: "#3498db" },
  { name: "紫色", hex: "#9b59b6" },
  { name: "粉色", hex: "#ff8fab" },
  { name: "黑色", hex: "#2c3e50" },
  { name: "白色", hex: "#ecf0f1" },
  { name: "灰色", hex: "#95a5a6" },
];

const FORTUNES = [
  {
    level: "大吉",
    emoji: "🌟",
    weight: 15,
    message: "今天諸事順遂，把握機會大膽去做，好運會一直跟著你！",
    tips: "適合：告白、面試、開始新計畫",
  },
  {
    level: "小吉",
    emoji: "🍀",
    weight: 25,
    message: "整體運勢不錯，小小的好事會發生在你身邊。",
    tips: "適合：與朋友聚會、嘗試新事物",
  },
  {
    level: "平",
    emoji: "☁️",
    weight: 30,
    message: "今天運勢平平，維持平常心，一切照常進行就好。",
    tips: "適合：處理日常事務、休息充電",
  },
  {
    level: "小凶",
    emoji: "⚠️",
    weight: 20,
    message: "今天可能會遇到一些小狀況，做事前多想一步會比較保險。",
    tips: "適合：低調行事、避免衝動決定",
  },
  {
    level: "大凶",
    emoji: "🌧️",
    weight: 10,
    message: "今天諸事不宜，凡事小心謹慎，明天會更好的。",
    tips: "適合：待在家、避免重大決策",
  },
];

function hashString(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return Math.abs(hash);
}

function todayString() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function getFortune(colorName) {
  const seed = hashString(`${todayString()}-${colorName}`) % 100;

  let cumulative = 0;
  for (const fortune of FORTUNES) {
    cumulative += fortune.weight;
    if (seed < cumulative) {
      return fortune;
    }
  }
  return FORTUNES[FORTUNES.length - 1];
}

function renderColors() {
  const container = document.getElementById("colors");
  COLORS.forEach((color) => {
    const item = document.createElement("div");
    item.className = "color-item";

    const swatch = document.createElement("div");
    swatch.className = "color-swatch";
    swatch.style.backgroundColor = color.hex;
    swatch.addEventListener("click", () => onColorSelected(color, swatch));

    const label = document.createElement("div");
    label.className = "color-name";
    label.textContent = color.name;

    item.appendChild(swatch);
    item.appendChild(label);
    container.appendChild(item);
  });
}

function onColorSelected(color, swatchEl) {
  document
    .querySelectorAll(".color-swatch")
    .forEach((el) => el.classList.remove("selected"));
  swatchEl.classList.add("selected");

  const fortune = getFortune(color.name);
  showResult(color, fortune);
}

function showResult(color, fortune) {
  const resultSection = document.getElementById("result");
  document.getElementById("result-emoji").textContent = fortune.emoji;

  const levelEl = document.getElementById("result-level");
  levelEl.textContent = `${color.name} × ${fortune.level}`;
  levelEl.className = `result-level level-${fortune.level}`;

  document.getElementById("result-message").textContent = fortune.message;
  document.getElementById("result-tips").textContent = fortune.tips;

  resultSection.classList.remove("hidden");
  resultSection.scrollIntoView({ behavior: "smooth", block: "center" });
}

document.getElementById("retry-btn").addEventListener("click", () => {
  document.getElementById("result").classList.add("hidden");
  document
    .querySelectorAll(".color-swatch")
    .forEach((el) => el.classList.remove("selected"));
});

renderColors();
