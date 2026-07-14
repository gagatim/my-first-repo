let selectedRoutes = [];
let selectedTraits = [];
let selectedStyle = "warm";
let selectedLength = 500;
let lastInputs = null;

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
  return {
    given: inputs.given,
    year: inputs.year,
    country: inputs.country,
    father: pickRandom(NAME_POOLS.father),
    mother: pickRandom(NAME_POOLS.mother),
    fatherTrait: pickRandom(FATHER_TRAITS),
    motherTrait: pickRandom(MOTHER_TRAITS),
    siblingRelation: pickRandom(SIBLING_RELATIONS),
    sibling: pickRandom(NAME_POOLS.sibling),
    friend: pickRandom(NAME_POOLS.friend),
    lover: pickRandom(NAME_POOLS.lover),
    mentor: pickRandom(NAME_POOLS.mentor),
  };
}

function generateStory(inputs) {
  const ctx = buildContext(inputs);
  const config = LENGTH_CONFIG[inputs.length];
  const paragraphs = [];

  let opening = `${inputs.year}年，${inputs.fullName}出生於${inputs.country}。`;
  opening += PERSONALITY_LINES[inputs.personality](inputs.given);
  if (inputs.traits.length > 0) {
    opening += `個性${inputs.traits.join("、")}的${inputs.given}，從小便展現出與眾不同的一面。`;
  }
  paragraphs.push(opening);

  const chapterPicks = pickRandomN(GENERIC_CHAPTERS, config.chapters);
  chapterPicks.forEach((fn) => paragraphs.push(fn(ctx.given)));

  const order = ["nation", "family", "friend", "love"];
  order.forEach((routeId) => {
    if (inputs.routes.includes(routeId)) {
      const scenes = ROUTE_SCENES[routeId][inputs.role].slice(0, config.scenes);
      paragraphs.push(scenes.map((fn) => fn(ctx)).join(""));
    }
  });

  const mentorPicks = pickRandomN(MENTOR_LINES, config.mentorLines);
  paragraphs.push(mentorPicks.map((fn) => fn(ctx.given, ctx.mentor)).join(""));

  if (config.reflection) {
    paragraphs.push(REFLECTION_LINES[inputs.style](ctx.given));
  }

  const target = inputs.length;
  const fillers = STYLE_FILLERS[inputs.style];
  let currentLength = paragraphs.join("").length;
  let safety = 200;
  while (currentLength < target * 0.85 && safety > 0) {
    const line = pickRandom(fillers)(ctx.given);
    paragraphs.push(line);
    currentLength += line.length;
    safety--;
  }

  paragraphs.push(STYLE_TRANSITIONS[inputs.style](ctx.given));
  paragraphs.push(pickRandom(STYLE_ENDINGS[inputs.style])(ctx.given));

  return paragraphs.join("");
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
  };
}

function renderStory(inputs) {
  const text = generateStory(inputs);
  document.getElementById("story-output").textContent = text;
  document.getElementById("char-count").textContent = `（共 ${text.length} 字）`;
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
    const text = document.getElementById("story-output").textContent;
    navigator.clipboard.writeText(text).then(() => {
      const btn = document.getElementById("copy-btn");
      const original = btn.textContent;
      btn.textContent = "已複製！";
      setTimeout(() => (btn.textContent = original), 1500);
    });
  });
});
