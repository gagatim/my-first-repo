const SAVE_KEY = "trpg_save_v1";

let game = null;
let selectedClassId = null;
let battle = null;
let dialogueQueue = [];
let dialogueOnComplete = null;
let activeShopTab = "weapon";

function saveGame() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(game));
}

function normalizeGame(g) {
  if (g.gold === undefined) g.gold = 0;
  if (g.ascendCount === undefined) g.ascendCount = 0;
  if (!g.inventory) g.inventory = { weapons: {}, armors: {}, potions: {}, materials: {} };
  if (!g.inventory.weapons) g.inventory.weapons = {};
  if (!g.inventory.armors) g.inventory.armors = {};
  if (!g.inventory.potions) g.inventory.potions = {};
  if (!g.inventory.materials) g.inventory.materials = {};
  if (!g.equipped) g.equipped = { weapon: null, armor: null };
  if (!g.purchasedSkills) g.purchasedSkills = [];
  if (!g.bonusStats) g.bonusStats = { atk: 0, def: 0, hp: 0, mp: 0, spd: 0 };
  if (!g.statBoostCounts) g.statBoostCounts = { atk: 0, def: 0, hp: 0, mp: 0, spd: 0 };
  if (g.unlockedTier === undefined) {
    const oldIndex = g.storyIndex || 0;
    g.unlockedTier = Math.min(7, oldIndex);
    const loops = Math.floor(oldIndex / 8);
    g.tierClears = new Array(8).fill(0).map((_, i) => (i < g.unlockedTier ? loops + 1 : loops));
    g.tierDialogueShown = new Array(8).fill(false).map((_, i) => i < g.unlockedTier || oldIndex > 0);
  }
  if (!g.tierClears) g.tierClears = new Array(8).fill(0);
  if (!g.tierDialogueShown) g.tierDialogueShown = new Array(8).fill(false);
  return g;
}

function loadGame() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return null;
  try {
    return normalizeGame(JSON.parse(raw));
  } catch (e) {
    return null;
  }
}

function showScreen(id) {
  document.querySelectorAll(".screen").forEach((el) => el.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
}

function expToNext(level) {
  return Math.floor(10 * level + 20);
}

function findItem(list, id) {
  return list.find((x) => x.id === id);
}

function computeStats(g) {
  const cls = CLASSES[g.classId];
  const lvl = g.level;
  const mult = 1 + g.ascendCount * 0.15;
  let maxHp = Math.round((cls.base.hp + cls.growth.hp * (lvl - 1)) * mult) + g.bonusStats.hp;
  let maxMp = Math.round((cls.base.mp + cls.growth.mp * (lvl - 1)) * mult) + g.bonusStats.mp;
  let atk = Math.round((cls.base.atk + cls.growth.atk * (lvl - 1)) * mult) + g.bonusStats.atk;
  let def = Math.round((cls.base.def + cls.growth.def * (lvl - 1)) * mult) + g.bonusStats.def;
  let spd = Math.round((cls.base.spd + cls.growth.spd * (lvl - 1)) * mult) + g.bonusStats.spd;

  if (g.equipped.weapon && g.inventory.weapons[g.equipped.weapon]) {
    const w = findItem(WEAPONS, g.equipped.weapon);
    const lvl2 = g.inventory.weapons[g.equipped.weapon].enhanceLevel;
    atk += Math.round(w.atk * (1 + lvl2 * 0.15));
  }
  if (g.equipped.armor && g.inventory.armors[g.equipped.armor]) {
    const a = findItem(ARMORS, g.equipped.armor);
    const lvl2 = g.inventory.armors[g.equipped.armor].enhanceLevel;
    def += Math.round(a.def * (1 + lvl2 * 0.15));
  }
  return { maxHp, maxMp, atk, def, spd };
}

function hasSkillUnlocked(skill) {
  return game.level >= skill.unlockLevel || game.purchasedSkills.includes(skill.id);
}

/* ---------- Character creation ---------- */

function renderClassOptions() {
  const container = document.getElementById("class-options");
  container.innerHTML = "";
  Object.values(CLASSES).forEach((cls) => {
    const card = document.createElement("div");
    card.className = "class-card";
    card.innerHTML = `
      <div class="emoji">${cls.emoji}</div>
      <div>
        <div class="class-name">${cls.name}</div>
        <div class="class-desc">${cls.desc}</div>
        <div class="class-desc">HP ${cls.base.hp} · 攻 ${cls.base.atk} · 防 ${cls.base.def} · 速 ${cls.base.spd}</div>
      </div>
    `;
    card.addEventListener("click", () => {
      selectedClassId = cls.id;
      document.querySelectorAll(".class-card").forEach((c) => c.classList.remove("selected"));
      card.classList.add("selected");
      updateCreateButton();
    });
    container.appendChild(card);
  });
}

function updateCreateButton() {
  const name = document.getElementById("name-input").value.trim();
  document.getElementById("create-btn").disabled = !(name && selectedClassId);
}

function createNewGame(name, classId) {
  game = {
    name,
    classId,
    level: 1,
    exp: 0,
    ascendCount: 0,
    gold: 300,
    unlockedTier: 0,
    tierClears: new Array(8).fill(0),
    tierDialogueShown: new Array(8).fill(false),
    inventory: { weapons: {}, armors: {}, potions: {}, materials: {} },
    equipped: { weapon: null, armor: null },
    purchasedSkills: [],
    bonusStats: { atk: 0, def: 0, hp: 0, mp: 0, spd: 0 },
    statBoostCounts: { atk: 0, def: 0, hp: 0, mp: 0, spd: 0 },
  };
  saveGame();
}

/* ---------- Menu ---------- */

function renderMenu() {
  const cls = CLASSES[game.classId];
  const stats = computeStats(game);
  document.getElementById("menu-emoji").textContent = cls.emoji;
  const stars = game.ascendCount > 0 ? " " + "★".repeat(game.ascendCount) : "";
  document.getElementById("menu-name").textContent = `${game.name}${stars}`;
  document.getElementById("menu-class").textContent = `${cls.name} · Lv.${game.level}`;
  document.getElementById("menu-hp-bar").style.width = "100%";
  document.getElementById("menu-hp-text").textContent = `${stats.maxHp}/${stats.maxHp}`;
  document.getElementById("menu-mp-bar").style.width = "100%";
  document.getElementById("menu-mp-text").textContent = `${stats.maxMp}/${stats.maxMp}`;
  const need = expToNext(game.level);
  const pct = game.level >= 100 ? 100 : Math.min(100, (game.exp / need) * 100);
  document.getElementById("menu-exp-bar").style.width = `${pct}%`;
  document.getElementById("menu-exp-text").textContent = game.level >= 100 ? "MAX" : `${game.exp}/${need}`;
  document.getElementById("menu-stats").innerHTML = `
    <div>攻擊 ${stats.atk}</div>
    <div>防禦 ${stats.def}</div>
    <div>速度 ${stats.spd}</div>
    <div>轉升次數 ${game.ascendCount}</div>
  `;
  document.getElementById("menu-gold-text").textContent = `💰 金幣：${game.gold}`;
  document.getElementById("ascend-btn").classList.toggle("hidden", game.level < 100);
  document.getElementById("skills-panel").classList.add("hidden");
}

function renderSkillsPanel() {
  const cls = CLASSES[game.classId];
  const panel = document.getElementById("skills-panel");
  panel.innerHTML = cls.skills
    .map((skill) => {
      const unlocked = hasSkillUnlocked(skill);
      const canBuy = !unlocked && skill.price > 0 && game.gold >= skill.price;
      let extra = "";
      if (!unlocked) {
        extra = skill.price > 0
          ? `<button class="buy-skill-btn" data-skill="${skill.id}" ${canBuy ? "" : "disabled"}>💰 花費 ${skill.price} 金幣直接學會</button>`
          : `<span class="locked">Lv.${skill.unlockLevel} 解鎖</span>`;
      }
      return `
        <div class="skill-item ${unlocked ? "" : "locked"}">
          <div class="skill-name">${unlocked ? "" : "🔒 "}${skill.name}${unlocked ? ` · MP ${skill.mpCost}` : ""}</div>
          <div class="skill-desc">${skill.desc}</div>
          ${extra}
        </div>
      `;
    })
    .join("");
  panel.querySelectorAll(".buy-skill-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const skillId = btn.dataset.skill;
      const skill = cls.skills.find((s) => s.id === skillId);
      if (game.gold < skill.price) return;
      game.gold -= skill.price;
      game.purchasedSkills.push(skillId);
      saveGame();
      renderMenu();
      renderSkillsPanel();
      document.getElementById("skills-panel").classList.remove("hidden");
    });
  });
}

/* ---------- Stage select ---------- */

function renderStageSelect() {
  const container = document.getElementById("stage-list");
  container.innerHTML = "";
  for (let tier = 0; tier <= game.unlockedTier; tier++) {
    const m = MONSTERS[tier];
    const clears = game.tierClears[tier];
    const scale = 1 + clears * 0.18;
    const row = document.createElement("div");
    row.className = "stage-row";
    row.innerHTML = `
      <div class="stage-emoji">${m.emoji}</div>
      <div class="stage-info">
        <div class="stage-name">${m.name}</div>
        <div class="stage-sub">已擊敗 ${clears} 次 · 強度 x${scale.toFixed(2)} · HP ${Math.round(m.hp * scale)}</div>
      </div>
      <button class="challenge-btn" data-tier="${tier}">挑戰</button>
    `;
    container.appendChild(row);
  }
  container.querySelectorAll(".challenge-btn").forEach((btn) => {
    btn.addEventListener("click", () => challengeTier(parseInt(btn.dataset.tier, 10)));
  });
}

function challengeTier(tier) {
  const isFirstTime = !game.tierDialogueShown[tier];
  if (isFirstTime) {
    game.tierDialogueShown[tier] = true;
    saveGame();
    playDialogue(STORY[tier].pre, () => startBattle(tier, isFirstTime));
  } else {
    startBattle(tier, isFirstTime);
  }
}

/* ---------- Story dialogue ---------- */

function playDialogue(lines, onComplete) {
  dialogueQueue = lines.slice();
  dialogueOnComplete = onComplete;
  showScreen("screen-dialogue");
  advanceDialogue();
}

function advanceDialogue() {
  if (dialogueQueue.length === 0) {
    const cb = dialogueOnComplete;
    dialogueOnComplete = null;
    if (cb) cb();
    return;
  }
  const line = dialogueQueue.shift();
  document.getElementById("dialogue-speaker").textContent = line.speaker;
  document.getElementById("dialogue-text").textContent = line.text;
}

/* ---------- Shop ---------- */

function goldLine() {
  return `💰 目前金幣：${game.gold}`;
}

function renderShop() {
  document.getElementById("shop-gold-text").textContent = goldLine();
  document.querySelectorAll("#shop-tabs button").forEach((b) => b.classList.toggle("selected", b.dataset.tab === activeShopTab));
  const list = document.getElementById("shop-list");
  list.innerHTML = "";

  if (activeShopTab === "weapon") {
    WEAPONS.forEach((w) => {
      const owned = !!game.inventory.weapons[w.id];
      list.appendChild(shopRow(w.emoji, w.name, `攻擊力 +${w.atk}`, w.price, owned, () => buyWeapon(w.id)));
    });
  } else if (activeShopTab === "armor") {
    ARMORS.forEach((a) => {
      const owned = !!game.inventory.armors[a.id];
      list.appendChild(shopRow(a.emoji, a.name, `防禦力 +${a.def}`, a.price, owned, () => buyArmor(a.id)));
    });
  } else if (activeShopTab === "potion") {
    POTIONS.forEach((p) => {
      const qty = game.inventory.potions[p.id] || 0;
      list.appendChild(shopRow(p.emoji, `${p.name}（持有 ${qty}）`, p.desc, p.price, false, () => buyPotion(p.id)));
    });
  } else if (activeShopTab === "material") {
    MATERIALS.forEach((m) => {
      const qty = game.inventory.materials[m.id] || 0;
      list.appendChild(shopRow(m.emoji, `${m.name}（持有 ${qty}）`, m.desc, m.price, false, () => buyMaterial(m.id)));
    });
  } else if (activeShopTab === "statboost") {
    STAT_BOOSTS.forEach((s) => {
      const count = game.statBoostCounts[s.id] || 0;
      const price = Math.round(s.basePrice * (1 + count * 0.5));
      list.appendChild(shopRow(s.emoji, `${s.name}（已購買 ${count} 次）`, s.desc, price, false, () => buyStatBoost(s.id)));
    });
  } else if (activeShopTab === "skill") {
    const cls = CLASSES[game.classId];
    cls.skills
      .filter((s) => s.price > 0)
      .forEach((skill) => {
        const unlocked = hasSkillUnlocked(skill);
        list.appendChild(shopRow("📘", skill.name, skill.desc, skill.price, unlocked, () => buySkill(skill.id)));
      });
  } else if (activeShopTab === "bundle") {
    BUNDLES.forEach((b) => {
      list.appendChild(shopRow(b.emoji, b.name, b.desc, b.price, false, () => buyBundle(b.id)));
    });
  }
}

function shopRow(emoji, name, desc, price, owned, onBuy) {
  const row = document.createElement("div");
  row.className = "shop-row";
  const canAfford = game.gold >= price;
  row.innerHTML = `
    <div class="shop-emoji">${emoji}</div>
    <div class="shop-info">
      <div class="shop-name">${name}</div>
      <div class="shop-desc">${desc}</div>
    </div>
    <button class="shop-buy-btn" ${owned || !canAfford ? "disabled" : ""}>${owned ? "已擁有" : `💰 ${price}`}</button>
  `;
  if (!owned) {
    row.querySelector(".shop-buy-btn").addEventListener("click", onBuy);
  }
  return row;
}

function buyWeapon(id) {
  const w = findItem(WEAPONS, id);
  if (game.gold < w.price || game.inventory.weapons[id]) return;
  game.gold -= w.price;
  game.inventory.weapons[id] = { enhanceLevel: 0 };
  if (!game.equipped.weapon) game.equipped.weapon = id;
  saveGame();
  renderShop();
}

function buyArmor(id) {
  const a = findItem(ARMORS, id);
  if (game.gold < a.price || game.inventory.armors[id]) return;
  game.gold -= a.price;
  game.inventory.armors[id] = { enhanceLevel: 0 };
  if (!game.equipped.armor) game.equipped.armor = id;
  saveGame();
  renderShop();
}

function buyPotion(id) {
  const p = findItem(POTIONS, id);
  if (game.gold < p.price) return;
  game.gold -= p.price;
  game.inventory.potions[id] = (game.inventory.potions[id] || 0) + 1;
  saveGame();
  renderShop();
}

function buyMaterial(id) {
  const m = findItem(MATERIALS, id);
  if (game.gold < m.price) return;
  game.gold -= m.price;
  game.inventory.materials[id] = (game.inventory.materials[id] || 0) + 1;
  saveGame();
  renderShop();
}

function buyStatBoost(id) {
  const s = findItem(STAT_BOOSTS, id);
  const count = game.statBoostCounts[id] || 0;
  const price = Math.round(s.basePrice * (1 + count * 0.5));
  if (game.gold < price) return;
  game.gold -= price;
  game.bonusStats[s.stat] += s.amount;
  game.statBoostCounts[id] = count + 1;
  saveGame();
  renderShop();
}

function buySkill(id) {
  const cls = CLASSES[game.classId];
  const skill = cls.skills.find((s) => s.id === id);
  if (hasSkillUnlocked(skill) || game.gold < skill.price) return;
  game.gold -= skill.price;
  game.purchasedSkills.push(id);
  saveGame();
  renderShop();
}

function buyBundle(id) {
  const b = findItem(BUNDLES, id);
  if (game.gold < b.price) return;
  game.gold -= b.price;
  if (b.contains.potions) {
    Object.entries(b.contains.potions).forEach(([pid, qty]) => {
      game.inventory.potions[pid] = (game.inventory.potions[pid] || 0) + qty;
    });
  }
  if (b.contains.materials) {
    Object.entries(b.contains.materials).forEach(([mid, qty]) => {
      game.inventory.materials[mid] = (game.inventory.materials[mid] || 0) + qty;
    });
  }
  saveGame();
  renderShop();
}

/* ---------- Inventory / Equipment ---------- */

function renderInventory() {
  document.getElementById("enhance-panel").classList.add("hidden");

  const weaponRow = document.getElementById("equipped-weapon");
  if (game.equipped.weapon) {
    const w = findItem(WEAPONS, game.equipped.weapon);
    const lvl = game.inventory.weapons[game.equipped.weapon].enhanceLevel;
    weaponRow.innerHTML = `${w.emoji} ${w.name} +${lvl}（攻擊 +${Math.round(w.atk * (1 + lvl * 0.15))}）
      <button data-type="weapon" data-id="${w.id}" class="enhance-open-btn">🔧 強化</button>`;
  } else {
    weaponRow.textContent = "（未裝備武器）";
  }

  const armorRow = document.getElementById("equipped-armor");
  if (game.equipped.armor) {
    const a = findItem(ARMORS, game.equipped.armor);
    const lvl = game.inventory.armors[game.equipped.armor].enhanceLevel;
    armorRow.innerHTML = `${a.emoji} ${a.name} +${lvl}（防禦 +${Math.round(a.def * (1 + lvl * 0.15))}）
      <button data-type="armor" data-id="${a.id}" class="enhance-open-btn">🔧 強化</button>`;
  } else {
    armorRow.textContent = "（未裝備防具）";
  }

  const weaponsContainer = document.getElementById("owned-weapons");
  weaponsContainer.innerHTML = "";
  Object.keys(game.inventory.weapons).forEach((id) => {
    const w = findItem(WEAPONS, id);
    const lvl = game.inventory.weapons[id].enhanceLevel;
    const equipped = game.equipped.weapon === id;
    const row = document.createElement("div");
    row.className = "shop-row";
    row.innerHTML = `
      <div class="shop-emoji">${w.emoji}</div>
      <div class="shop-info">
        <div class="shop-name">${w.name} +${lvl}</div>
        <div class="shop-desc">攻擊力 +${Math.round(w.atk * (1 + lvl * 0.15))}</div>
      </div>
      <button ${equipped ? "disabled" : ""}>${equipped ? "裝備中" : "裝備"}</button>
    `;
    if (!equipped) row.querySelector("button").addEventListener("click", () => { game.equipped.weapon = id; saveGame(); renderInventory(); });
    weaponsContainer.appendChild(row);
  });

  const armorsContainer = document.getElementById("owned-armors");
  armorsContainer.innerHTML = "";
  Object.keys(game.inventory.armors).forEach((id) => {
    const a = findItem(ARMORS, id);
    const lvl = game.inventory.armors[id].enhanceLevel;
    const equipped = game.equipped.armor === id;
    const row = document.createElement("div");
    row.className = "shop-row";
    row.innerHTML = `
      <div class="shop-emoji">${a.emoji}</div>
      <div class="shop-info">
        <div class="shop-name">${a.name} +${lvl}</div>
        <div class="shop-desc">防禦力 +${Math.round(a.def * (1 + lvl * 0.15))}</div>
      </div>
      <button ${equipped ? "disabled" : ""}>${equipped ? "裝備中" : "裝備"}</button>
    `;
    if (!equipped) row.querySelector("button").addEventListener("click", () => { game.equipped.armor = id; saveGame(); renderInventory(); });
    armorsContainer.appendChild(row);
  });

  const consumables = document.getElementById("owned-consumables");
  const lines = [];
  POTIONS.forEach((p) => {
    const qty = game.inventory.potions[p.id] || 0;
    if (qty > 0) lines.push(`${p.emoji} ${p.name} x${qty}`);
  });
  MATERIALS.forEach((m) => {
    const qty = game.inventory.materials[m.id] || 0;
    if (qty > 0) lines.push(`${m.emoji} ${m.name} x${qty}`);
  });
  consumables.innerHTML = lines.length ? lines.map((l) => `<div>${l}</div>`).join("") : "（沒有藥水或材料）";

  document.querySelectorAll(".enhance-open-btn").forEach((btn) => {
    btn.addEventListener("click", () => openEnhancePanel(btn.dataset.type, btn.dataset.id));
  });
}

function openEnhancePanel(type, id) {
  const panel = document.getElementById("enhance-panel");
  const isWeapon = type === "weapon";
  const def = findItem(isWeapon ? WEAPONS : ARMORS, id);
  const entry = isWeapon ? game.inventory.weapons[id] : game.inventory.armors[id];
  const level = entry.enhanceLevel;
  const maxed = level >= ENHANCE_MAX_LEVEL;
  const cost = enhanceCost(level);
  const rate = ENHANCE_SUCCESS_RATE[Math.min(level, ENHANCE_SUCCESS_RATE.length - 1)];
  const stabilizerQty = game.inventory.materials.stabilizer || 0;
  const guaranteeQty = game.inventory.materials.guarantee_scroll || 0;

  panel.classList.remove("hidden");
  panel.innerHTML = `
    <h3>${def.emoji} ${def.name} 強化（目前 +${level}）</h3>
    ${maxed
      ? `<p>已達最高強化等級！</p>`
      : `
        <p>下一級：+${level + 1} · 花費 ${cost} 金幣 · 成功率 ${Math.round(rate * 100)}%</p>
        <label><input type="checkbox" id="use-stabilizer" ${stabilizerQty ? "" : "disabled"}> 使用安定符（持有 ${stabilizerQty}，失敗不降級）</label><br>
        <label><input type="checkbox" id="use-guarantee" ${guaranteeQty ? "" : "disabled"}> 使用100%成功卷軸（持有 ${guaranteeQty}，必定成功）</label><br>
        <button id="do-enhance-btn" ${game.gold >= cost ? "" : "disabled"}>強化（金幣：${game.gold}）</button>
      `}
    <button id="close-enhance-btn">關閉</button>
  `;

  if (!maxed) {
    document.getElementById("do-enhance-btn").addEventListener("click", () => {
      doEnhance(type, id);
    });
  }
  document.getElementById("close-enhance-btn").addEventListener("click", () => {
    panel.classList.add("hidden");
  });
}

function doEnhance(type, id) {
  const isWeapon = type === "weapon";
  const entry = isWeapon ? game.inventory.weapons[id] : game.inventory.armors[id];
  const level = entry.enhanceLevel;
  const cost = enhanceCost(level);
  if (game.gold < cost) return;

  const useGuarantee = document.getElementById("use-guarantee").checked && (game.inventory.materials.guarantee_scroll || 0) > 0;
  const useStabilizer = !useGuarantee && document.getElementById("use-stabilizer").checked && (game.inventory.materials.stabilizer || 0) > 0;

  game.gold -= cost;
  const rate = ENHANCE_SUCCESS_RATE[Math.min(level, ENHANCE_SUCCESS_RATE.length - 1)];
  const success = useGuarantee || Math.random() < rate;

  if (useGuarantee) game.inventory.materials.guarantee_scroll--;
  else if (useStabilizer) game.inventory.materials.stabilizer--;

  if (success) {
    entry.enhanceLevel++;
  } else if (!useStabilizer) {
    entry.enhanceLevel = Math.max(0, entry.enhanceLevel - 1);
  }

  saveGame();
  renderInventory();
  openEnhancePanel(type, id);
}

/* ---------- Battle ---------- */

function clearLog() {
  document.getElementById("battle-log").innerHTML = "";
}

function log(msg) {
  const el = document.getElementById("battle-log");
  const p = document.createElement("p");
  p.textContent = msg;
  el.appendChild(p);
  el.scrollTop = el.scrollHeight;
  while (el.children.length > 40) el.removeChild(el.firstChild);
}

function startBattle(tier, showPostDialogue) {
  const baseMonster = MONSTERS[tier];
  const clears = game.tierClears[tier];
  const scale = 1 + clears * 0.18;
  const monster = {
    name: clears > 0 ? `${baseMonster.name}（強度 x${scale.toFixed(2)}）` : baseMonster.name,
    emoji: baseMonster.emoji,
    maxHp: Math.round(baseMonster.hp * scale),
    hp: Math.round(baseMonster.hp * scale),
    atk: Math.round(baseMonster.atk * scale),
    def: Math.round(baseMonster.def * scale),
    spd: Math.round(baseMonster.spd * scale),
    exp: Math.round(baseMonster.exp * scale),
    gold: Math.round(baseMonster.gold * scale),
    drops: baseMonster.drops,
  };
  const stats = computeStats(game);
  battle = {
    tier,
    showPostDialogue,
    monster,
    player: { maxHp: stats.maxHp, hp: stats.maxHp, maxMp: stats.maxMp, mp: stats.maxMp, atk: stats.atk, def: stats.def, spd: stats.spd },
    playerStance: false,
    monsterSpdMult: 1,
    monsterDefMult: 1,
    over: false,
  };
  clearLog();
  log(`⚔️ ${monster.name} 出現了！`);
  showScreen("screen-battle");
  document.getElementById("battle-actions").classList.remove("hidden");
  document.getElementById("battle-skill-list").classList.add("hidden");
  document.getElementById("battle-potion-list").classList.add("hidden");
  document.getElementById("battle-continue-btn").classList.add("hidden");
  setActionsDisabled(false);
  renderBattle();
}

function renderBattle() {
  const cls = CLASSES[game.classId];
  document.getElementById("battle-player-emoji").textContent = cls.emoji;
  document.getElementById("battle-player-name").textContent = `${game.name} Lv.${game.level}`;
  document.getElementById("battle-player-hp").style.width = `${Math.max(0, (battle.player.hp / battle.player.maxHp) * 100)}%`;
  document.getElementById("battle-player-mp").style.width = `${Math.max(0, (battle.player.mp / battle.player.maxMp) * 100)}%`;
  document.getElementById("battle-monster-emoji").textContent = battle.monster.emoji;
  document.getElementById("battle-monster-name").textContent = battle.monster.name;
  document.getElementById("battle-monster-hp").style.width = `${Math.max(0, (battle.monster.hp / battle.monster.maxHp) * 100)}%`;
}

function calcDamage(atk, def, power, variance) {
  power = power === undefined ? 1 : power;
  variance = variance === undefined ? true : variance;
  let raw = atk * power - def * 0.5;
  raw = Math.max(1, raw);
  if (variance) raw *= 0.9 + Math.random() * 0.2;
  return Math.round(raw);
}

function playerAttack() {
  const dmg = calcDamage(battle.player.atk, battle.monster.def * battle.monsterDefMult);
  battle.monster.hp = Math.max(0, battle.monster.hp - dmg);
  log(`你對 ${battle.monster.name} 造成了 ${dmg} 點傷害！`);
}

function playerUseSkill(skill) {
  battle.player.mp -= skill.mpCost;
  if (skill.heal) {
    const healAmt = Math.round(battle.player.maxHp * skill.heal);
    battle.player.hp = Math.min(battle.player.maxHp, battle.player.hp + healAmt);
    log(`你使用了${skill.name}，恢復了 ${healAmt} 點 HP！`);
    return;
  }
  if (skill.stance) {
    battle.playerStance = true;
    log(`你擺出了${skill.name}的架勢，準備反擊！`);
    return;
  }
  let effectiveDef = battle.monster.def * battle.monsterDefMult;
  if (skill.ignoreDef) effectiveDef *= 1 - skill.ignoreDef;
  const hits = skill.hits || 1;
  let total = 0;
  for (let i = 0; i < hits; i++) {
    total += calcDamage(battle.player.atk, effectiveDef, skill.power);
  }
  battle.monster.hp = Math.max(0, battle.monster.hp - total);
  log(`你使用了${skill.name}，對 ${battle.monster.name} 造成了 ${total} 點傷害！`);
  if (skill.defBreak) {
    battle.monsterDefMult *= 1 - skill.defBreak;
    log(`${battle.monster.name} 的防禦力下降了！`);
  }
  if (skill.spdDebuff) {
    battle.monsterSpdMult *= 0.8;
    log(`${battle.monster.name} 的速度下降了！`);
  }
}

function usePotion(potionId) {
  if (battle.over) return;
  const qty = game.inventory.potions[potionId] || 0;
  if (qty <= 0) return;
  const p = findItem(POTIONS, potionId);
  game.inventory.potions[potionId] = qty - 1;
  if (p.type === "hp") {
    const amt = Math.round(battle.player.maxHp * p.restore);
    battle.player.hp = Math.min(battle.player.maxHp, battle.player.hp + amt);
    log(`你使用了${p.name}，恢復了 ${amt} 點 HP！`);
  } else {
    const amt = Math.round(battle.player.maxMp * p.restore);
    battle.player.mp = Math.min(battle.player.maxMp, battle.player.mp + amt);
    log(`你使用了${p.name}，恢復了 ${amt} 點 MP！`);
  }
  saveGame();
  document.getElementById("battle-potion-list").classList.add("hidden");
  renderBattle();
  setActionsDisabled(true);
  setTimeout(() => {
    monsterTurn();
    renderBattle();
    if (!checkBattleEnd()) setActionsDisabled(false);
  }, 600);
}

function monsterTurn() {
  if (battle.over || battle.monster.hp <= 0) return;
  const cls = CLASSES[game.classId];
  let dmg = calcDamage(battle.monster.atk, battle.player.def);
  let countered = false;
  if (battle.playerStance) {
    dmg = Math.round(dmg * 0.5);
    countered = true;
  } else if (cls.counterChance && Math.random() < cls.counterChance) {
    countered = true;
  }
  battle.player.hp = Math.max(0, battle.player.hp - dmg);
  log(`${battle.monster.name} 攻擊了你，造成 ${dmg} 點傷害！`);
  if (countered) {
    const counterDmg = Math.round(battle.player.atk * 0.5);
    battle.monster.hp = Math.max(0, battle.monster.hp - counterDmg);
    log(`⚡ 你發動反擊，對 ${battle.monster.name} 造成了 ${counterDmg} 點傷害！`);
  }
  battle.playerStance = false;
}

function setActionsDisabled(disabled) {
  document.getElementById("attack-btn").disabled = disabled;
  document.getElementById("skill-menu-btn").disabled = disabled;
  document.getElementById("potion-menu-btn").disabled = disabled;
  document.getElementById("flee-btn").disabled = disabled;
}

function doPlayerAction(action) {
  if (battle.over) return;
  document.getElementById("battle-skill-list").classList.add("hidden");
  document.getElementById("battle-potion-list").classList.add("hidden");
  setActionsDisabled(true);

  const runPlayer = () => {
    if (action.type === "attack") playerAttack();
    else if (action.type === "skill") playerUseSkill(action.skill);
  };

  const monsterEffSpd = battle.monster.spd * battle.monsterSpdMult;
  const playerFirst = action.forcedFirst || battle.player.spd >= monsterEffSpd;

  const finish = () => {
    renderBattle();
    if (!checkBattleEnd()) setActionsDisabled(false);
  };

  if (playerFirst) {
    runPlayer();
    renderBattle();
    if (checkBattleEnd()) return;
    setTimeout(() => {
      monsterTurn();
      finish();
    }, 600);
  } else {
    monsterTurn();
    renderBattle();
    if (checkBattleEnd()) return;
    setTimeout(() => {
      runPlayer();
      finish();
    }, 600);
  }
}

function checkBattleEnd() {
  if (battle.monster.hp <= 0 && !battle.over) {
    battle.over = true;
    onVictory();
    return true;
  }
  if (battle.player.hp <= 0 && !battle.over) {
    battle.over = true;
    onDefeat();
    return true;
  }
  return false;
}

function gainExp(amount) {
  game.exp += amount;
  let leveledUp = false;
  while (game.level < 100 && game.exp >= expToNext(game.level)) {
    game.exp -= expToNext(game.level);
    game.level++;
    leveledUp = true;
  }
  if (game.level >= 100) game.exp = 0;
  if (leveledUp) log(`🆙 等級提升至 Lv.${game.level}！`);
}

function rollDrops(drops) {
  const dropped = [];
  drops.forEach((d) => {
    if (Math.random() < d.chance) dropped.push(d.id);
  });
  return dropped;
}

function onVictory() {
  log(`🎉 你打倒了 ${battle.monster.name}！`);
  const tier = battle.tier;
  const expGain = battle.monster.exp;
  const goldGain = battle.monster.gold;
  game.gold += goldGain;
  log(`獲得 ${expGain} EXP、${goldGain} 金幣！`);
  gainExp(expGain);

  const dropped = rollDrops(battle.monster.drops);
  dropped.forEach((itemId) => {
    const w = findItem(WEAPONS, itemId);
    if (w) {
      if (!game.inventory.weapons[itemId]) {
        game.inventory.weapons[itemId] = { enhanceLevel: 0 };
        log(`✨ 掉落了武器：${w.emoji} ${w.name}！`);
      } else {
        log(`✨ 掉落了武器：${w.emoji} ${w.name}（已擁有，自動轉換為 ${Math.round(w.price / 4)} 金幣）`);
        game.gold += Math.round(w.price / 4);
      }
      return;
    }
    const a = findItem(ARMORS, itemId);
    if (a) {
      if (!game.inventory.armors[itemId]) {
        game.inventory.armors[itemId] = { enhanceLevel: 0 };
        log(`✨ 掉落了防具：${a.emoji} ${a.name}！`);
      } else {
        log(`✨ 掉落了防具：${a.emoji} ${a.name}（已擁有，自動轉換為 ${Math.round(a.price / 4)} 金幣）`);
        game.gold += Math.round(a.price / 4);
      }
    }
  });

  game.tierClears[tier]++;
  if (tier === game.unlockedTier && game.unlockedTier < 7) game.unlockedTier++;
  saveGame();

  document.getElementById("battle-actions").classList.add("hidden");
  document.getElementById("battle-skill-list").classList.add("hidden");
  document.getElementById("battle-potion-list").classList.add("hidden");
  const continueBtn = document.getElementById("battle-continue-btn");
  continueBtn.textContent = "繼續 ▶";
  continueBtn.classList.remove("hidden");
  continueBtn.onclick = () => {
    if (battle.showPostDialogue) {
      playDialogue(STORY[tier].post, () => {
        showScreen("screen-menu");
        renderMenu();
      });
    } else {
      showScreen("screen-menu");
      renderMenu();
    }
  };
}

function onDefeat() {
  log(`💀 你被 ${battle.monster.name} 擊敗了……`);
  saveGame();
  document.getElementById("battle-actions").classList.add("hidden");
  document.getElementById("battle-skill-list").classList.add("hidden");
  document.getElementById("battle-potion-list").classList.add("hidden");
  const continueBtn = document.getElementById("battle-continue-btn");
  continueBtn.textContent = "返回主選單";
  continueBtn.classList.remove("hidden");
  continueBtn.onclick = () => {
    showScreen("screen-menu");
    renderMenu();
  };
}

function renderSkillList() {
  const cls = CLASSES[game.classId];
  const container = document.getElementById("battle-skill-list");
  container.innerHTML = "";
  cls.skills.forEach((skill) => {
    const unlocked = hasSkillUnlocked(skill);
    const insufficientMp = battle.player.mp < skill.mpCost;
    const btn = document.createElement("button");
    btn.disabled = !unlocked || insufficientMp || battle.over;
    btn.textContent = !unlocked ? `🔒 ${skill.name}（Lv.${skill.unlockLevel} 解鎖或商店購買）` : `${skill.name}（MP ${skill.mpCost}）— ${skill.desc}`;
    if (unlocked) {
      btn.addEventListener("click", () => doPlayerAction({ type: "skill", skill, forcedFirst: !!skill.forcedFirst }));
    }
    container.appendChild(btn);
  });
}

function renderPotionList() {
  const container = document.getElementById("battle-potion-list");
  container.innerHTML = "";
  const owned = POTIONS.filter((p) => (game.inventory.potions[p.id] || 0) > 0);
  if (owned.length === 0) {
    container.innerHTML = "<p>沒有藥水，先去商店買一些吧。</p>";
    return;
  }
  owned.forEach((p) => {
    const qty = game.inventory.potions[p.id];
    const btn = document.createElement("button");
    btn.disabled = battle.over;
    btn.textContent = `${p.emoji} ${p.name} x${qty} — ${p.desc}`;
    btn.addEventListener("click", () => usePotion(p.id));
    container.appendChild(btn);
  });
}

/* ---------- Event wiring ---------- */

window.addEventListener("load", () => {
  const loaded = loadGame();
  if (loaded) {
    game = loaded;
    showScreen("screen-menu");
    renderMenu();
  } else {
    renderClassOptions();
    showScreen("screen-create");
  }

  document.getElementById("name-input").addEventListener("input", updateCreateButton);

  document.getElementById("create-btn").addEventListener("click", () => {
    const name = document.getElementById("name-input").value.trim();
    if (!name || !selectedClassId) return;
    createNewGame(name, selectedClassId);
    showScreen("screen-menu");
    renderMenu();
  });

  document.getElementById("stage-select-btn").addEventListener("click", () => {
    renderStageSelect();
    showScreen("screen-stage-select");
  });
  document.getElementById("stage-back-btn").addEventListener("click", () => {
    showScreen("screen-menu");
    renderMenu();
  });

  document.getElementById("shop-btn").addEventListener("click", () => {
    renderShop();
    showScreen("screen-shop");
  });
  document.getElementById("shop-back-btn").addEventListener("click", () => {
    showScreen("screen-menu");
    renderMenu();
  });
  document.getElementById("shop-tabs").addEventListener("click", (e) => {
    if (e.target.tagName === "BUTTON") {
      activeShopTab = e.target.dataset.tab;
      renderShop();
    }
  });

  document.getElementById("inventory-btn").addEventListener("click", () => {
    renderInventory();
    showScreen("screen-inventory");
  });
  document.getElementById("inventory-back-btn").addEventListener("click", () => {
    showScreen("screen-menu");
    renderMenu();
  });

  document.getElementById("skills-btn").addEventListener("click", () => {
    const panel = document.getElementById("skills-panel");
    if (panel.classList.contains("hidden")) {
      renderSkillsPanel();
      panel.classList.remove("hidden");
    } else {
      panel.classList.add("hidden");
    }
  });

  document.getElementById("ascend-btn").addEventListener("click", () => {
    if (game.level < 100) return;
    if (!confirm("轉升會將等級重置為 1，但會永久提升基本素質，確定要轉升嗎？")) return;
    game.ascendCount++;
    game.level = 1;
    game.exp = 0;
    saveGame();
    renderMenu();
  });

  document.getElementById("reset-btn").addEventListener("click", () => {
    if (!confirm("確定要刪除目前的角色進度嗎？此動作無法復原。")) return;
    localStorage.removeItem(SAVE_KEY);
    location.reload();
  });

  document.getElementById("dialogue-next").addEventListener("click", advanceDialogue);

  document.getElementById("attack-btn").addEventListener("click", () => doPlayerAction({ type: "attack" }));

  document.getElementById("skill-menu-btn").addEventListener("click", () => {
    const list = document.getElementById("battle-skill-list");
    document.getElementById("battle-potion-list").classList.add("hidden");
    if (list.classList.contains("hidden")) {
      renderSkillList();
      list.classList.remove("hidden");
    } else {
      list.classList.add("hidden");
    }
  });

  document.getElementById("potion-menu-btn").addEventListener("click", () => {
    const list = document.getElementById("battle-potion-list");
    document.getElementById("battle-skill-list").classList.add("hidden");
    if (list.classList.contains("hidden")) {
      renderPotionList();
      list.classList.remove("hidden");
    } else {
      list.classList.add("hidden");
    }
  });

  document.getElementById("flee-btn").addEventListener("click", () => {
    if (battle.over) return;
    if (Math.random() < 0.5) {
      log("🏃 你成功逃跑了！");
      battle.over = true;
      showScreen("screen-menu");
      renderMenu();
    } else {
      log("🏃 逃跑失敗！");
      setActionsDisabled(true);
      monsterTurn();
      renderBattle();
      if (!checkBattleEnd()) setActionsDisabled(false);
    }
  });
});
