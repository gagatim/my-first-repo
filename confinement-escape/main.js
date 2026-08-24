// 禁閉逃殺 - 遊戲邏輯
const SAVE_KEY = "confinementEscapeSave";

let state = null;

const screens = {
  title: document.getElementById("screen-title"),
  create: document.getElementById("screen-create"),
  game: document.getElementById("screen-game"),
  transition: document.getElementById("screen-transition"),
  ending: document.getElementById("screen-ending"),
};

function showScreen(name) {
  Object.values(screens).forEach((s) => s.classList.add("hidden"));
  screens[name].classList.remove("hidden");
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function clampStats() {
  state.stamina = clamp(Math.round(state.stamina), 0, 100);
  state.sanity = clamp(Math.round(state.sanity), 0, 100);
  state.danger = clamp(Math.round(state.danger), 0, 100);
}

function saveGame() {
  if (state) localStorage.setItem(SAVE_KEY, JSON.stringify(state));
}

function clearSave() {
  localStorage.removeItem(SAVE_KEY);
}

function loadSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

// ---------- Title screen ----------

const continueBtn = document.getElementById("continue-btn");
if (loadSave()) continueBtn.classList.remove("hidden");

document.getElementById("new-game-btn").addEventListener("click", () => {
  clearSave();
  showScreen("create");
  renderIdentityList();
});

continueBtn.addEventListener("click", () => {
  state = loadSave();
  if (!state) {
    showScreen("create");
    renderIdentityList();
    return;
  }
  showScreen("game");
  renderCurrentStep();
});

// ---------- Identity selection ----------

let selectedIdentity = null;

function renderIdentityList() {
  const list = document.getElementById("identity-list");
  list.innerHTML = "";
  IDENTITIES.forEach((idn) => {
    const card = document.createElement("div");
    card.className = "identity-card";
    card.dataset.id = idn.id;
    const item = ITEMS[idn.item];
    card.innerHTML = `
      <div class="emoji">${idn.emoji}</div>
      <div>
        <div class="id-name">${idn.name}</div>
        <div class="id-role">${idn.role}</div>
        <div class="id-desc">${idn.desc}</div>
        <div class="id-stats">體力 ${idn.stats.stamina} ・ 精神 ${idn.stats.sanity} ・ 技巧 ${idn.stats.skill} ・ 初始道具：${item.emoji} ${item.name}</div>
      </div>`;
    card.addEventListener("click", () => {
      selectedIdentity = idn.id;
      document.querySelectorAll(".identity-card").forEach((c) => c.classList.remove("selected"));
      card.classList.add("selected");
      document.getElementById("create-btn").disabled = false;
    });
    list.appendChild(card);
  });
}

document.getElementById("create-btn").addEventListener("click", () => {
  if (!selectedIdentity) return;
  startNewGame(selectedIdentity);
});

function startNewGame(identityId) {
  const idn = IDENTITIES.find((i) => i.id === identityId);
  state = {
    identityId: idn.id,
    name: idn.name,
    role: idn.role,
    emoji: idn.emoji,
    stamina: idn.stats.stamina,
    sanity: idn.stats.sanity,
    skill: idn.stats.skill,
    tag: idn.tag,
    tagBonus: idn.tagBonus,
    healBonus: idn.healBonus || 1,
    danger: 10,
    inventory: {},
    inventoryOrder: [],
    flags: { hasAlly: false },
    floorIndex: 0,
    eventQueue: [],
    eventIndex: -1,
    stage: "floor-intro",
    finaleStageIndex: 0,
    finaleFailCount: 0,
    pendingOutcomeText: null,
    pendingIsForced: false,
  };
  addItem(idn.item);
  showScreen("game");
  saveGame();
  renderCurrentStep();
}

// ---------- Inventory ----------

function addItem(id) {
  state.inventory[id] = (state.inventory[id] || 0) + 1;
  if (!state.inventoryOrder.includes(id)) state.inventoryOrder.push(id);
}

function removeItem(id) {
  if (!state.inventory[id]) return;
  state.inventory[id] -= 1;
  if (state.inventory[id] <= 0) {
    delete state.inventory[id];
    state.inventoryOrder = state.inventoryOrder.filter((x) => x !== id);
  }
}

function hasItem(id) {
  return !!state.inventory[id];
}

const invPanel = document.getElementById("inventory-panel");
document.getElementById("inventory-toggle-btn").addEventListener("click", () => {
  invPanel.classList.toggle("hidden");
  if (!invPanel.classList.contains("hidden")) renderInventory();
});

function renderInventory() {
  invPanel.innerHTML = "";
  if (state.inventoryOrder.length === 0) {
    invPanel.innerHTML = '<p class="inv-empty">背包空空如也</p>';
    return;
  }
  state.inventoryOrder.forEach((id) => {
    const item = ITEMS[id];
    const count = state.inventory[id];
    const row = document.createElement("div");
    row.className = "inv-item";
    const canUse = item.consumable;
    row.innerHTML = `
      <div class="inv-emoji">${item.emoji}</div>
      <div style="flex:1">
        <div class="inv-name">${item.name} ${count > 1 ? "x" + count : ""}</div>
        <div class="inv-desc">${item.desc}</div>
      </div>`;
    if (canUse) {
      const btn = document.createElement("button");
      btn.textContent = "使用";
      btn.style.width = "auto";
      btn.style.margin = "0";
      btn.addEventListener("click", () => useItem(id));
      row.appendChild(btn);
    }
    invPanel.appendChild(row);
  });
}

function useItem(id) {
  const item = ITEMS[id];
  if (!item.consumable) return;
  const bonus = id.indexOf("medkit") === 0 || id === "medkit_pro" || id === "sedative" ? state.healBonus : 1;
  if (item.effect.stamina) state.stamina += item.effect.stamina * bonus;
  if (item.effect.sanity) state.sanity += item.effect.sanity * bonus;
  removeItem(id);
  clampStats();
  updateStatusBar();
  renderInventory();
  saveGame();
}

// ---------- Status bar ----------

function updateStatusBar() {
  document.getElementById("bar-stamina").style.width = state.stamina + "%";
  document.getElementById("text-stamina").textContent = state.stamina + "/100";
  document.getElementById("bar-sanity").style.width = state.sanity + "%";
  document.getElementById("text-sanity").textContent = state.sanity + "/100";
  document.getElementById("bar-danger").style.width = state.danger + "%";
  document.getElementById("text-danger").textContent = state.danger + "/100";
  const floorName = state.stage === "finale" || state.floorIndex >= FLOORS.length ? FINALE.name : FLOORS[state.floorIndex].name;
  document.getElementById("floor-tag").textContent = `📍 ${FACILITY_NAME}｜${floorName}`;
}

// ---------- Check / effects ----------

function getCheckTag(event, choice) {
  if (choice.check.tag) return choice.check.tag;
  if (choice.check.tagMatch) return event.tag;
  return null;
}

function computeChance(check, effectiveTag) {
  let base = 60 + (state.skill - 50) - (check.difficulty || 0);
  if (effectiveTag && state.tag === effectiveTag) base += state.tagBonus;
  return clamp(Math.round(base), 10, 95);
}

function applyOutcome(outcome) {
  if (!outcome) return;
  const eff = outcome.effects || {};
  if (eff.stamina) state.stamina += eff.stamina;
  if (eff.sanity) state.sanity += eff.sanity;
  if (eff.danger) state.danger += eff.danger;
  if (outcome.addItem) addItem(outcome.addItem);
  if (outcome.setFlag) Object.assign(state.flags, outcome.setFlag);
  clampStats();
}

// ---------- Floor / event flow ----------

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildFloorQueue(floor) {
  const picks = shuffle(floor.pool).slice(0, 3);
  return [...picks, floor.keycardEvent];
}

function renderCurrentStep() {
  updateStatusBar();
  if (state.stage === "floor-intro") {
    renderFloorIntro();
  } else if (state.stage === "floor-event") {
    renderEvent(currentFloorEvent());
  } else if (state.stage === "finale-intro") {
    renderFinaleIntro();
  } else if (state.stage === "finale-event") {
    renderEvent(FINALE.stages[state.finaleStageIndex]);
  }
}

function currentFloorEvent() {
  return state.eventQueue[state.eventIndex];
}

function renderFloorIntro() {
  const floor = FLOORS[state.floorIndex];
  showScreen("transition");
  document.getElementById("transition-title").textContent = floor.name;
  document.getElementById("transition-text").textContent = floor.intro;
  document.getElementById("transition-continue-btn").onclick = () => {
    state.eventQueue = buildFloorQueue(floor);
    state.eventIndex = 0;
    state.stage = "floor-event";
    showScreen("game");
    saveGame();
    renderEvent(currentFloorEvent());
  };
}

function renderFinaleIntro() {
  showScreen("transition");
  document.getElementById("transition-title").textContent = FINALE.name;
  document.getElementById("transition-text").textContent = FINALE.intro;
  document.getElementById("transition-continue-btn").onclick = () => {
    state.finaleStageIndex = 0;
    state.stage = "finale-event";
    showScreen("game");
    saveGame();
    renderEvent(FINALE.stages[0]);
  };
}

function renderEvent(event) {
  updateStatusBar();
  invPanel.classList.add("hidden");
  document.getElementById("story-title").textContent = event.title;
  document.getElementById("story-text").textContent = event.text;
  document.getElementById("story-continue-btn").classList.add("hidden");

  const list = document.getElementById("choice-list");
  list.innerHTML = "";
  event.choices.forEach((choice) => {
    if (choice.requiresItem && !hasItem(choice.requiresItem)) return;
    const btn = document.createElement("button");
    btn.className = "choice-btn";
    let label = choice.text;
    if (choice.check) {
      const tag = getCheckTag(event, choice);
      const chance = computeChance(choice.check, tag);
      label += `<span class="choice-chance">成功率 ${chance}%</span>`;
    }
    btn.innerHTML = label;
    btn.addEventListener("click", () => handleChoice(event, choice));
    list.appendChild(btn);
  });
}

function handleChoice(event, choice) {
  if (choice.consumeItem) removeItem(choice.consumeItem);

  let outcome;
  let wasFail = false;
  if (choice.check) {
    const tag = getCheckTag(event, choice);
    const chance = computeChance(choice.check, tag);
    const roll = Math.random() * 100;
    if (roll < chance) {
      outcome = choice.success;
    } else {
      outcome = choice.fail;
      wasFail = true;
    }
  } else {
    outcome = {
      text: choice.resultText,
      effects: choice.effects,
      addItem: choice.addItem,
      setFlag: choice.setFlag,
    };
  }

  applyOutcome(outcome);
  if (state.stage === "finale-event") {
    state.finaleFailCount = wasFail ? state.finaleFailCount + 1 : 0;
  }

  document.getElementById("choice-list").innerHTML = "";
  document.getElementById("story-text").textContent = outcome.text;
  document.getElementById("story-continue-btn").classList.remove("hidden");
  document.getElementById("story-continue-btn").onclick = advance;
  updateStatusBar();
  saveGame();
}

function handleGameOverIfNeeded() {
  if (state.stamina <= 0) {
    goToEnding("exhausted");
    return true;
  }
  if (state.sanity <= 0) {
    goToEnding("madness");
    return true;
  }
  if (state.stage === "finale-event" && state.finaleFailCount >= 2) {
    goToEnding("caught");
    return true;
  }
  return false;
}

function resolveForcedEncounter() {
  const chance = computeChance({ difficulty: 8 }, "combat");
  const roll = Math.random() * 100;
  let text;
  if (roll < chance) {
    state.danger = 30;
    state.stamina -= 15;
    text = "獵犬的腳步聲逼近，你屏息隱入陰影，驚險地避開了搜索。";
  } else {
    state.danger = 60;
    state.stamina -= 30;
    state.sanity -= 10;
    text = "你被獵犬發現了！一番驚險的纏鬥後你總算脫身，但代價不小。";
  }
  clampStats();
  document.getElementById("story-title").textContent = "⚠️ 強制遭遇";
  document.getElementById("story-text").textContent = text;
  document.getElementById("choice-list").innerHTML = "";
  document.getElementById("story-continue-btn").classList.remove("hidden");
  document.getElementById("story-continue-btn").onclick = advanceAfterForced;
  updateStatusBar();
  saveGame();
}

function advanceAfterForced() {
  moveToNextEvent();
}

function advance() {
  if (handleGameOverIfNeeded()) return;
  if (state.danger >= 100) {
    resolveForcedEncounter();
    return;
  }
  moveToNextEvent();
}

function moveToNextEvent() {
  if (state.stage === "floor-event") {
    state.eventIndex += 1;
    if (state.eventIndex < state.eventQueue.length) {
      state.stage = "floor-event";
      saveGame();
      renderEvent(currentFloorEvent());
    } else {
      state.floorIndex += 1;
      if (state.floorIndex < FLOORS.length) {
        state.stage = "floor-intro";
        saveGame();
        renderFloorIntro();
      } else {
        state.stage = "finale-intro";
        saveGame();
        renderFinaleIntro();
      }
    }
  } else if (state.stage === "finale-event") {
    state.finaleStageIndex += 1;
    if (state.finaleStageIndex < FINALE.stages.length) {
      saveGame();
      renderEvent(FINALE.stages[state.finaleStageIndex]);
    } else {
      goToEnding(determineEnding());
    }
  }
}

function determineEnding() {
  const hasEvidence = hasItem("evidence_files") || hasItem("camera");
  if (hasEvidence && state.sanity >= 40) return "perfect";
  if (state.flags.hasAlly) return "ally";
  return "quiet";
}

// ---------- Ending ----------

function goToEnding(id) {
  clearSave();
  const ending = ENDINGS[id];
  showScreen("ending");
  document.getElementById("ending-emoji").textContent = ending.emoji;
  document.getElementById("ending-title").textContent = ending.title;
  document.getElementById("ending-text").textContent = ending.text;
  const idn = IDENTITIES.find((i) => i.id === state.identityId);
  document.getElementById("ending-summary").innerHTML = `
    <p>身份：${idn.emoji} ${state.name}（${idn.role}）</p>
    <p>最終體力：${state.stamina} ・ 最終精神：${state.sanity}</p>
    <p>攜帶物品：${state.inventoryOrder.map((i) => ITEMS[i].emoji + ITEMS[i].name).join("、") || "無"}</p>
  `;
}

document.getElementById("restart-btn").addEventListener("click", () => {
  state = null;
  selectedIdentity = null;
  clearSave();
  document.getElementById("continue-btn").classList.add("hidden");
  showScreen("title");
});
