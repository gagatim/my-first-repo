let selectedSpread = null;
let shuffledDeck = [];
let draws = [];

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function showScreen(id) {
  document.querySelectorAll(".screen").forEach((el) => el.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

function renderSpreadGrid() {
  const grid = document.getElementById("spread-grid");
  SPREADS.forEach((spread) => {
    const item = document.createElement("div");
    item.className = "spread-item";
    item.dataset.spreadId = spread.id;
    item.innerHTML = `
      <div class="spread-icon">${spread.icon}</div>
      <div class="spread-name">${spread.name}</div>
      <div class="spread-desc">${spread.desc}</div>
      <div class="spread-count">${spread.positions.length} 張牌</div>
    `;
    item.addEventListener("click", () => onSpreadSelected(spread, item));
    grid.appendChild(item);
  });
}

function onSpreadSelected(spread, itemEl) {
  selectedSpread = spread;
  document.querySelectorAll(".spread-item").forEach((el) => el.classList.remove("selected"));
  itemEl.classList.add("selected");
  document.getElementById("start-btn").disabled = false;
}

function startDraw() {
  shuffledDeck = shuffle(TAROT_DECK).map((card) => ({
    card,
    orientation: Math.random() < 0.25 ? "rev" : "up",
  }));
  draws = [];

  document.getElementById("draw-instruction").textContent =
    `請依序點擊牌堆，抽出 ${selectedSpread.positions.length} 張牌：${selectedSpread.positions.map((p) => p.label).join("、")}`;

  renderPositionSlots();
  document.getElementById("view-result-btn").classList.add("hidden");
  document.getElementById("deck-pile").classList.remove("depleted");
  showScreen("screen-draw");
}

function renderPositionSlots() {
  const container = document.getElementById("position-slots");
  container.innerHTML = "";
  selectedSpread.positions.forEach((position) => {
    const slot = document.createElement("div");
    slot.className = "card slot";
    slot.dataset.positionKey = position.key;
    slot.innerHTML = `
      <div class="card-inner">
        <div class="card-face card-back-face"></div>
        <div class="card-face card-front-face">
          <img class="card-img" alt="">
          <div class="orientation-badge"></div>
        </div>
      </div>
      <div class="slot-label">${position.label}</div>
    `;
    container.appendChild(slot);
  });
}

function drawNextCard() {
  if (draws.length >= selectedSpread.positions.length) return;
  if (shuffledDeck.length === 0) return;

  const position = selectedSpread.positions[draws.length];
  const drawn = shuffledDeck.pop();
  draws.push({ card: drawn.card, orientation: drawn.orientation, position });

  const slot = document.querySelector(`.slot[data-position-key="${position.key}"]`);
  const img = slot.querySelector(".card-img");
  img.src = drawn.card.img;
  img.alt = drawn.card.name;
  if (drawn.orientation === "rev") img.classList.add("reversed");

  const badge = slot.querySelector(".orientation-badge");
  badge.textContent = drawn.orientation === "up" ? "正位" : "逆位";
  badge.classList.add(drawn.orientation === "up" ? "up" : "rev");

  requestAnimationFrame(() => slot.classList.add("flipped"));

  if (draws.length >= selectedSpread.positions.length) {
    document.getElementById("deck-pile").classList.add("depleted");
    setTimeout(() => {
      document.getElementById("view-result-btn").classList.remove("hidden");
    }, 500);
  }
}

function renderResult() {
  const container = document.getElementById("result-cards");
  container.innerHTML = "";
  draws.forEach((draw) => {
    const { card, orientation, position } = draw;
    const item = document.createElement("div");
    item.className = "result-card";
    item.innerHTML = `
      <div class="result-position">${position.label}</div>
      <img class="result-img ${orientation === "rev" ? "reversed" : ""}" src="${card.img}" alt="${card.name}">
      <div class="result-name">${card.name}</div>
      <div class="result-subtitle">${card.subtitle} ・ ${orientation === "up" ? "正位" : "逆位"}</div>
      <div class="result-keywords">${card.keywords[orientation].join(" ・ ")}</div>
      <p class="result-text">${card.text[orientation]}</p>
    `;
    container.appendChild(item);
  });

  document.getElementById("analysis-output").classList.add("hidden");
  document.getElementById("analysis-output").innerHTML = "";
  document.getElementById("analysis-btn").classList.remove("hidden");
  showScreen("screen-result");
}

function runAnalysis() {
  const question = document.getElementById("question-input").value;
  const paragraphs = generateAnalysis(selectedSpread, draws, question);
  const output = document.getElementById("analysis-output");
  output.innerHTML = paragraphs.map((p) => `<p>${p}</p>`).join("");
  output.classList.remove("hidden");
  document.getElementById("analysis-btn").classList.add("hidden");
  output.scrollIntoView({ behavior: "smooth", block: "center" });
}

function resetApp() {
  selectedSpread = null;
  shuffledDeck = [];
  draws = [];
  document.querySelectorAll(".spread-item").forEach((el) => el.classList.remove("selected"));
  document.getElementById("start-btn").disabled = true;
  document.getElementById("question-input").value = "";
  showScreen("screen-intro");
}

renderSpreadGrid();
document.getElementById("start-btn").addEventListener("click", startDraw);
document.getElementById("deck-pile").addEventListener("click", drawNextCard);
document.getElementById("view-result-btn").addEventListener("click", renderResult);
document.getElementById("analysis-btn").addEventListener("click", runAnalysis);
document.getElementById("retry-btn").addEventListener("click", resetApp);
