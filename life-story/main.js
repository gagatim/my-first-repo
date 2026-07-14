let selectedRoutes = [];
let selectedTraits = [];
let selectedStyle = "warm";
let lastInputs = null;

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function renderCountrySelect() {
  const select = document.getElementById("country-select");
  select.innerHTML = COUNTRIES.map((c) => `<option value="${c}">${c}</option>`).join("");
  select.addEventListener("change", () => {
    document.getElementById("country-custom").classList.toggle("hidden", select.value !== "其他");
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
    name: inputs.name,
    year: inputs.year,
    country: inputs.country,
    father: pickRandom(NAME_POOLS.father),
    mother: pickRandom(NAME_POOLS.mother),
    sibling: pickRandom(NAME_POOLS.sibling),
    friend: pickRandom(NAME_POOLS.friend),
    lover: pickRandom(NAME_POOLS.lover),
    mentor: pickRandom(NAME_POOLS.mentor),
  };
}

function generateStory(inputs) {
  const ctx = buildContext(inputs);
  const paragraphs = [];

  let opening = `${inputs.year}年，${inputs.name}出生於${inputs.country}。`;
  opening += PERSONALITY_LINES[inputs.personality](inputs.name);
  if (inputs.traits.length > 0) {
    opening += `個性${inputs.traits.join("、")}的${inputs.name}，從小便展現出與眾不同的一面。`;
  }
  paragraphs.push(opening);

  const order = ["nation", "family", "friend", "love"];
  order.forEach((routeId) => {
    if (inputs.routes.includes(routeId)) {
      paragraphs.push(ROUTE_TEMPLATES[routeId][inputs.role](ctx));
    }
  });

  paragraphs.push(pickRandom(MENTOR_LINES)(inputs.name, ctx.mentor));
  paragraphs.push(STYLE_TRANSITIONS[inputs.style](inputs.name));
  paragraphs.push(pickRandom(STYLE_ENDINGS[inputs.style])(inputs.name));

  return paragraphs.join("");
}

function readInputs() {
  const name = document.getElementById("name-input").value.trim();
  const year = document.getElementById("year-input").value.trim();
  const countrySelect = document.getElementById("country-select").value;
  const country = countrySelect === "其他" ? document.getElementById("country-custom").value.trim() : countrySelect;
  const role = document.querySelector('input[name="role"]:checked').value;
  const personality = document.querySelector('input[name="personality"]:checked').value;

  if (!name || !year || !country || selectedRoutes.length === 0 || !selectedStyle) return null;

  return {
    name,
    year,
    country,
    role,
    personality,
    traits: selectedTraits.slice(),
    routes: selectedRoutes.slice(),
    style: selectedStyle,
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
      alert("請填寫姓名、出生年份、國家，並至少選擇一項情感路線。");
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
