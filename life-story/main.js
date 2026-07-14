let selectedRoutes = [];
let selectedTraits = [];
let selectedStyle = "warm";
let selectedLength = 500;
let lastInputs = null;
let lastActs = null;

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickRandomN(arr, n) {
  const pool = arr.slice();
  const picked = [];
  for (let i = 0; i < n && pool.length > 0; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    picked.push(pool.splice(idx, 1)[0]);
  }
  return picked;
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function renderCountrySelect() {
  const select = document.getElementById("country-select");
  select.innerHTML = COUNTRIES.map((c) => `<option value="${c}">${c}</option>`).join("");
  select.addEventListener("change", () => {
    document.getElementById("country-custom").classList.toggle("hidden", select.value !== "其他");
  });
}

function renderLengthSelect() {
  const select = document.getElementById("length-select");
  select.innerHTML = LENGTH_OPTIONS.map((len) => `<option value="${len}">${len} 字</option>`).join("");
  select.addEventListener("change", () => {
    selectedLength = parseInt(select.value, 10);
  });
}

function renderChips(containerId, options, selectedList, single) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";
  options.forEach((opt) => {
    const label = typeof opt === "string" ? opt : opt.label;
    const value = typeof opt === "string" ? opt : opt.id;
    const chip = document.createElement("div");
    chip.className = "chip";
    chip.textContent = label;
    chip.dataset.value = value;
    chip.addEventListener("click", () => {
      if (single) {
        selectedList.length = 0;
        selectedList.push(value);
        container.querySelectorAll(".chip").forEach((c) => c.classList.remove("selected"));
        chip.classList.add("selected");
      } else {
        const idx = selectedList.indexOf(value);
        if (idx >= 0) {
          selectedList.splice(idx, 1);
          chip.classList.remove("selected");
        } else {
          selectedList.push(value);
          chip.classList.add("selected");
        }
      }
    });
    container.appendChild(chip);
  });
}

function buildContext(inputs) {
  const c = inputs.customNames;
  return {
    given: "我",
    year: inputs.year,
    country: inputs.country,
    father: c.father || pickRandom(NAME_POOLS.father),
    mother: c.mother || pickRandom(NAME_POOLS.mother),
    fatherTrait: pickRandom(FATHER_TRAITS),
    motherTrait: pickRandom(MOTHER_TRAITS),
    siblingRelation: pickRandom(SIBLING_RELATIONS),
    sibling: pickRandom(NAME_POOLS.sibling),
    friend: c.friend || pickRandom(NAME_POOLS.friend),
    lover: pickRandom(NAME_POOLS.lover),
    mentor: c.mentor || pickRandom(NAME_POOLS.mentor),
    enemy: c.enemy || pickRandom(ENEMY_NAMES),
    villain: c.villain || pickRandom(VILLAIN_NAMES),
    protectedPhrase: buildProtectedPhrase(inputs.routes),
  };
}

const ROUTE_LABELS = ROUTES.reduce((map, r) => ((map[r.id] = r.label), map), {});

function conflictCountForLength(length) {
  if (length >= 3000) return CONFLICT_SCENES.length;
  if (length >= 1500) return 3;
  if (length >= 1000) return 2;
  return 1;
}

function buildFillerText(style, given, targetGap) {
  const fullPool = STYLE_FILLERS[style];
  let queue = shuffle(fullPool);
  const lines = [];
  let length = 0;
  let lastLine = null;
  let iterations = 0;
  while (length < targetGap && iterations < 500) {
    if (queue.length === 0) {
      queue = shuffle(fullPool);
      if (lastLine && queue.length > 1 && queue[0](given) === lastLine) {
        [queue[0], queue[1]] = [queue[1], queue[0]];
      }
    }
    const fn = queue.shift();
    const line = fn(given);
    lines.push(line);
    length += line.length;
    lastLine = line;
    iterations++;
  }
  return lines.join("");
}

function generateStory(inputs) {
  const ctx = buildContext(inputs);
  const config = LENGTH_CONFIG[inputs.length];
  const acts = [];
  const hasRoute = (id) => inputs.routes.includes(id);

  let opening = `我是${inputs.fullName}，${inputs.year}年出生於${inputs.country}。`;
  opening += PERSONALITY_LINES[inputs.personality](ctx.given);
  if (inputs.traits.length > 0) {
    opening += `個性${inputs.traits.join("、")}的${ctx.given}，從小便展現出與眾不同的一面。`;
  }
  if (hasRoute("family")) {
    opening += ROUTE_SCENES.family[inputs.role][0](ctx);
  }
  acts.push({ title: "序幕・起點", text: opening });

  const growthParts = [];
  if (config.chapters > 0) {
    const chapterPicks = pickRandomN(GENERIC_CHAPTERS, config.chapters);
    growthParts.push(...chapterPicks.map((fn) => fn(ctx.given)));
  }
  if (hasRoute("family")) {
    growthParts.push(...ROUTE_SCENES.family[inputs.role].slice(1, config.scenes).map((fn) => fn(ctx)));
  }
  if (hasRoute("friend")) {
    growthParts.push(ROUTE_SCENES.friend[inputs.role][0](ctx));
  }
  if (growthParts.length > 0) {
    acts.push({ title: "成長歲月", text: growthParts.join("") });
  }

  const mentorPicks = MENTOR_LINES.slice(0, config.mentorLines);
  acts.push({ title: "恩師引路", text: mentorPicks.map((fn) => fn(ctx.given, ctx.mentor)).join("") });

  const trialParts = [];
  if (hasRoute("nation")) {
    trialParts.push(...ROUTE_SCENES.nation[inputs.role].slice(0, config.scenes).map((fn) => fn(ctx)));
  }
  trialParts.push(...CONFLICT_SCENES.slice(0, conflictCountForLength(inputs.length)).map((fn) => fn(ctx)));
  if (hasRoute("friend")) {
    trialParts.push(...ROUTE_SCENES.friend[inputs.role].slice(1, config.scenes).map((fn) => fn(ctx)));
  }
  acts.push({ title: "命運與考驗", text: trialParts.join("") });

  if (hasRoute("love")) {
    const loveScenes = ROUTE_SCENES.love[inputs.role].slice(0, config.scenes);
    acts.push({ title: "心之所向", text: loveScenes.map((fn) => fn(ctx)).join("") });
  }

  if (config.bridges > 0 && inputs.routes.length >= 2) {
    const pairKeys = [];
    for (let i = 0; i < inputs.routes.length; i++) {
      for (let j = i + 1; j < inputs.routes.length; j++) {
        const key = [inputs.routes[i], inputs.routes[j]].sort().join(",");
        if (BRIDGE_LINES[key]) pairKeys.push(key);
      }
    }
    const chosenBridges = pickRandomN(pairKeys, config.bridges);
    if (chosenBridges.length > 0) {
      acts.push({ title: "命運交織", text: chosenBridges.map((key) => BRIDGE_LINES[key](ctx.given)).join("") });
    }
  }

  const target = inputs.length;
  let currentLength = acts.reduce((sum, a) => sum + a.text.length, 0);
  const gap = target * 0.85 - currentLength;
  if (gap > 0) {
    const fillerText = buildFillerText(inputs.style, ctx.given, gap);
    if (fillerText) acts.push({ title: "日常剪影", text: fillerText });
  }

  let epilogue = "";
  if (config.reflection) epilogue += REFLECTION_LINES[inputs.style](ctx.given);
  epilogue += STYLE_TRANSITIONS[inputs.style](ctx.given);
  epilogue += pickRandom(STYLE_ENDINGS[inputs.style])(ctx.given);
  acts.push({ title: "尾聲", text: epilogue });

  return acts;
}

function readInputs() {
  const surname = document.getElementById("surname-input").value.trim();
  const given = document.getElementById("given-input").value.trim();
  const year = document.getElementById("year-input").value.trim();
  const countrySelect = document.getElementById("country-select").value;
  const country = countrySelect === "其他" ? document.getElementById("country-custom").value.trim() : countrySelect;
  const role = document.querySelector('input[name="role"]:checked').value;
  const personality = document.querySelector('input[name="personality"]:checked').value;

  if (!surname || !given || !year || !country || selectedRoutes.length === 0 || !selectedStyle) return null;

  return {
    fullName: surname + given,
    given,
    year,
    country,
    role,
    personality,
    traits: selectedTraits.slice(),
    routes: selectedRoutes.slice(),
    style: selectedStyle,
    length: selectedLength,
    customNames: {
      father: document.getElementById("custom-father").value.trim(),
      mother: document.getElementById("custom-mother").value.trim(),
      friend: document.getElementById("custom-friend").value.trim(),
      mentor: document.getElementById("custom-mentor").value.trim(),
      enemy: document.getElementById("custom-enemy").value.trim(),
      villain: document.getElementById("custom-villain").value.trim(),
    },
  };
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function renderStory(inputs) {
  const acts = generateStory(inputs);
  lastActs = acts;

  const container = document.getElementById("story-output");
  container.innerHTML = acts
    .map(
      (act, i) => `
        <div class="act">
          <div class="act-title"><span class="act-num">第${i + 1}幕</span>${escapeHtml(act.title)}</div>
          <p class="act-text">${escapeHtml(act.text)}</p>
        </div>
      `
    )
    .join("");

  const totalLen = acts.reduce((sum, a) => sum + a.text.length, 0);
  document.getElementById("char-count").textContent = `（共 ${totalLen} 字）`;
  document.getElementById("result-section").classList.remove("hidden");
  document.getElementById("result-section").scrollIntoView({ behavior: "smooth", block: "start" });
}

window.addEventListener("load", () => {
  renderCountrySelect();
  renderLengthSelect();
  renderChips("routes-container", ROUTES, selectedRoutes, false);
  renderChips("traits-container", TRAIT_OPTIONS, selectedTraits, false);
  renderChips("style-container", STYLES, [selectedStyle], true);
  document.querySelectorAll("#style-container .chip").forEach((c) => {
    if (c.dataset.value === selectedStyle) c.classList.add("selected");
    c.addEventListener("click", () => {
      selectedStyle = c.dataset.value;
    });
  });

  document.getElementById("generate-btn").addEventListener("click", () => {
    const inputs = readInputs();
    if (!inputs) {
      alert("請填寫姓、名、出生年份、國家，並至少選擇一項情感路線。");
      return;
    }
    lastInputs = inputs;
    renderStory(inputs);
  });

  document.getElementById("regenerate-btn").addEventListener("click", () => {
    if (!lastInputs) return;
    renderStory(lastInputs);
  });

  document.getElementById("copy-btn").addEventListener("click", () => {
    if (!lastActs) return;
    const text = lastActs.map((act, i) => `【第${i + 1}幕・${act.title}】\n${act.text}`).join("\n\n");
    navigator.clipboard.writeText(text).then(() => {
      const btn = document.getElementById("copy-btn");
      const original = btn.textContent;
      btn.textContent = "已複製！";
      setTimeout(() => (btn.textContent = original), 1500);
    });
  });
});
