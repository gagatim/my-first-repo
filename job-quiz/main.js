let currentQuestion = 0;
let scores = {};

function showScreen(id) {
  document.querySelectorAll(".screen").forEach((el) => el.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

function startQuiz() {
  currentQuestion = 0;
  scores = {};
  showScreen("screen-quiz");
  renderQuestion();
}

function renderQuestion() {
  const q = QUESTIONS[currentQuestion];
  document.getElementById("question-text").textContent = q.text;

  const progressPct = (currentQuestion / QUESTIONS.length) * 100;
  document.getElementById("progress-fill").style.width = `${progressPct}%`;
  document.getElementById("progress-text").textContent = `第 ${currentQuestion + 1} / ${QUESTIONS.length} 題`;

  const list = document.getElementById("option-list");
  list.innerHTML = "";
  q.options.forEach((opt) => {
    const btn = document.createElement("button");
    btn.className = "option-btn";
    btn.textContent = opt.text;
    btn.addEventListener("click", () => selectOption(opt));
    list.appendChild(btn);
  });
}

function selectOption(opt) {
  scores[opt.axis] = (scores[opt.axis] || 0) + 2;
  currentQuestion++;
  if (currentQuestion >= QUESTIONS.length) {
    renderResult();
  } else {
    renderQuestion();
  }
}

function scoreProfession(profession) {
  let total = 0;
  Object.keys(profession.axes).forEach((axis) => {
    total += profession.axes[axis] * (scores[axis] || 0);
  });
  return total;
}

function renderResult() {
  const ranked = PROFESSIONS
    .map((p) => ({ profession: p, score: scoreProfession(p) }))
    .sort((a, b) => b.score - a.score);

  const top = ranked[0].profession;
  const tier = TIER_LABELS[top.tier];

  const card = document.getElementById("result-card");
  card.innerHTML = `
    <div class="result-emoji">${top.emoji}</div>
    <div class="result-tier" style="color:${tier.color}">${tier.label}</div>
    <div class="result-name">${top.name}</div>
    <div class="result-tagline">${top.tagline}</div>
    <p class="result-desc">${top.desc}</p>
    <p class="result-match">💡 ${top.match}</p>
  `;

  const secondaryList = document.getElementById("secondary-list");
  secondaryList.innerHTML = "";
  ranked.slice(1, 4).forEach(({ profession }) => {
    const item = document.createElement("div");
    item.className = "secondary-item";
    item.innerHTML = `
      <span class="secondary-emoji">${profession.emoji}</span>
      <span class="secondary-name">${profession.name}</span>
      <span class="secondary-tagline">${profession.tagline}</span>
    `;
    secondaryList.appendChild(item);
  });

  showScreen("screen-result");
}

function renderTierList() {
  const container = document.getElementById("tierlist-content");
  container.innerHTML = "";
  ["t1", "t2", "other"].forEach((tierKey) => {
    const tier = TIER_LABELS[tierKey];
    const group = document.createElement("div");
    group.className = "tier-group";
    group.innerHTML = `<h3 style="color:${tier.color}">${tier.label}</h3>`;
    const row = document.createElement("div");
    row.className = "tier-row";
    PROFESSIONS.filter((p) => p.tier === tierKey).forEach((p) => {
      const chip = document.createElement("div");
      chip.className = "tier-chip";
      chip.innerHTML = `<span class="tier-chip-emoji">${p.emoji}</span><span>${p.name}</span><span class="tier-chip-tagline">${p.tagline}</span>`;
      row.appendChild(chip);
    });
    group.appendChild(row);
    container.appendChild(group);
  });
}

function showTierList() {
  renderTierList();
  showScreen("screen-tierlist");
}

document.getElementById("start-btn").addEventListener("click", startQuiz);
document.getElementById("tierlist-btn").addEventListener("click", showTierList);
document.getElementById("tierlist-btn-2").addEventListener("click", showTierList);
document.getElementById("back-btn").addEventListener("click", () => showScreen("screen-intro"));
document.getElementById("retry-btn").addEventListener("click", () => showScreen("screen-intro"));
