const SAVE_KEY = "trpg_save_v1";

let game = null;
let selectedClassId = null;
let battle = null;
let dialogueQueue = [];
let dialogueOnComplete = null;

function saveGame() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(game));
}

function loadGame() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
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

function computeStats(g) {
  const cls = CLASSES[g.classId];
  const lvl = g.level;
  const mult = 1 + g.ascendCount * 0.15;
  return {
    maxHp: Math.round((cls.base.hp + cls.growth.hp * (lvl - 1)) * mult),
    maxMp: Math.round((cls.base.mp + cls.growth.mp * (lvl - 1)) * mult),
    atk: Math.round((cls.base.atk + cls.growth.atk * (lvl - 1)) * mult),
    def: Math.round((cls.base.def + cls.growth.def * (lvl - 1)) * mult),
    spd: Math.round((cls.base.spd + cls.growth.spd * (lvl - 1)) * mult),
  };
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
      const locked = game.level < skill.unlockLevel;
      return `
        <div class="skill-item ${locked ? "locked" : ""}">
          <div class="skill-name">${locked ? "🔒 " : ""}${skill.name}${locked ? `（Lv.${skill.unlockLevel} 解鎖）` : ` · MP ${skill.mpCost}`}</div>
          <div class="skill-desc">${skill.desc}</div>
        </div>
      `;
    })
    .join("");
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

function startStoryStage() {
  const stageIndex = game.storyIndex;
  const stage = STORY[stageIndex % STORY.length];
  playDialogue(stage.pre, () => startBattle(stageIndex));
}

function startBattle(stageIndex) {
  const loopCount = Math.floor(stageIndex / MONSTERS.length);
  const baseMonster = MONSTERS[stageIndex % MONSTERS.length];
  const scale = 1 + loopCount * 0.35;
  const monster = {
    name: loopCount > 0 ? `${baseMonster.name}（強化 x${loopCount + 1}）` : baseMonster.name,
    emoji: baseMonster.emoji,
    maxHp: Math.round(baseMonster.hp * scale),
    hp: Math.round(baseMonster.hp * scale),
    atk: Math.round(baseMonster.atk * scale),
    def: Math.round(baseMonster.def * scale),
    spd: Math.round(baseMonster.spd * scale),
    exp: Math.round(baseMonster.exp * scale),
    gold: Math.round(baseMonster.gold * scale),
  };
  const stats = computeStats(game);
  battle = {
    stageIndex,
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
  document.getElementById("flee-btn").disabled = disabled;
}

function doPlayerAction(action) {
  if (battle.over) return;
  document.getElementById("battle-skill-list").classList.add("hidden");
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

function onVictory() {
  log(`🎉 你打倒了 ${battle.monster.name}！`);
  const stageIndex = battle.stageIndex;
  const expGain = battle.monster.exp;
  const goldGain = battle.monster.gold;
  game.gold += goldGain;
  log(`獲得 ${expGain} EXP、${goldGain} 金幣！`);
  gainExp(expGain);
  game.storyIndex = stageIndex + 1;
  saveGame();

  document.getElementById("battle-actions").classList.add("hidden");
  document.getElementById("battle-skill-list").classList.add("hidden");
  const continueBtn = document.getElementById("battle-continue-btn");
  continueBtn.textContent = "繼續 ▶";
  continueBtn.classList.remove("hidden");
  continueBtn.onclick = () => {
    const stage = STORY[stageIndex % STORY.length];
    playDialogue(stage.post, () => {
      showScreen("screen-menu");
      renderMenu();
    });
  };
}

function onDefeat() {
  log(`💀 你被 ${battle.monster.name} 擊敗了……`);
  saveGame();
  document.getElementById("battle-actions").classList.add("hidden");
  document.getElementById("battle-skill-list").classList.add("hidden");
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
    const locked = game.level < skill.unlockLevel;
    const insufficientMp = battle.player.mp < skill.mpCost;
    const btn = document.createElement("button");
    btn.disabled = locked || insufficientMp || battle.over;
    btn.textContent = locked ? `🔒 ${skill.name}（Lv.${skill.unlockLevel} 解鎖）` : `${skill.name}（MP ${skill.mpCost}）— ${skill.desc}`;
    if (!locked) {
      btn.addEventListener("click", () => doPlayerAction({ type: "skill", skill, forcedFirst: !!skill.forcedFirst }));
    }
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
    game = {
      name,
      classId: selectedClassId,
      level: 1,
      exp: 0,
      ascendCount: 0,
      gold: 0,
      storyIndex: 0,
    };
    saveGame();
    showScreen("screen-menu");
    renderMenu();
  });

  document.getElementById("adventure-btn").addEventListener("click", startStoryStage);

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
    if (list.classList.contains("hidden")) {
      renderSkillList();
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
