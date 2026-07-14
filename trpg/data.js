const CLASSES = {
  hero: {
    id: "hero",
    name: "英雄",
    emoji: "🦸",
    desc: "數值均衡，攻守兼備的萬能戰士。",
    base: { hp: 100, mp: 30, atk: 15, def: 12, spd: 10 },
    growth: { hp: 8, mp: 2, atk: 2, def: 1.5, spd: 1 },
    skills: [
      { id: "power_strike", name: "猛擊", unlockLevel: 1, price: 0, mpCost: 5, power: 1.8, desc: "對敵人造成 1.8 倍傷害" },
      { id: "rally", name: "鼓舞", unlockLevel: 10, price: 1500, mpCost: 10, heal: 0.2, desc: "恢復 20% 最大 HP" },
      { id: "hero_wrath", name: "英雄之怒", unlockLevel: 30, price: 4500, mpCost: 20, power: 3.0, desc: "對敵人造成 3.0 倍傷害" },
    ],
  },
  ranger: {
    id: "ranger",
    name: "遊俠",
    emoji: "🏹",
    desc: "速度與攻擊力優異，但防禦較弱。",
    base: { hp: 80, mp: 40, atk: 18, def: 8, spd: 16 },
    growth: { hp: 6, mp: 3, atk: 2.5, def: 1, spd: 1.5 },
    skills: [
      { id: "multishot", name: "連射", unlockLevel: 1, price: 0, mpCost: 5, power: 1.0, hits: 2, desc: "連續射擊 2 次，每次 1.0 倍傷害" },
      { id: "quick_shot", name: "急速射擊", unlockLevel: 10, price: 1500, mpCost: 8, power: 1.5, forcedFirst: true, desc: "1.5 倍傷害，必定優先出手" },
      { id: "hunters_mark", name: "獵人絕技", unlockLevel: 30, price: 4500, mpCost: 15, power: 2.2, defBreak: 0.3, desc: "2.2 倍傷害，並降低敵人防禦" },
    ],
  },
  counter: {
    id: "counter",
    name: "反擊戰士",
    emoji: "🛡️",
    desc: "高防禦，擅長反擊敵人的攻擊。",
    base: { hp: 120, mp: 20, atk: 12, def: 18, spd: 8 },
    growth: { hp: 10, mp: 1.5, atk: 1.5, def: 2, spd: 0.8 },
    counterChance: 0.25,
    skills: [
      { id: "shield_bash", name: "盾擊", unlockLevel: 1, price: 0, mpCost: 5, power: 1.3, spdDebuff: true, desc: "1.3 倍傷害，並降低敵人速度" },
      { id: "counter_stance", name: "反擊姿態", unlockLevel: 10, price: 1500, mpCost: 10, stance: true, desc: "本回合必定反擊，並減少 50% 受到的傷害" },
      { id: "armor_break", name: "破甲反擊", unlockLevel: 30, price: 4500, mpCost: 18, power: 2.0, ignoreDef: 0.5, desc: "2.0 倍傷害，無視 50% 敵人防禦" },
    ],
  },
};

const MONSTERS = [
  { name: "史萊姆", emoji: "🟢", hp: 40, atk: 8, def: 3, spd: 5, exp: 20, gold: 10, drops: [{ id: "wood_sword", chance: 0.08 }, { id: "cloth_armor", chance: 0.08 }] },
  { name: "哥布林", emoji: "👺", hp: 60, atk: 12, def: 5, spd: 8, exp: 32, gold: 16, drops: [{ id: "wood_sword", chance: 0.06 }, { id: "cloth_armor", chance: 0.06 }] },
  { name: "野狼", emoji: "🐺", hp: 70, atk: 15, def: 4, spd: 14, exp: 42, gold: 20, drops: [{ id: "iron_sword", chance: 0.05 }, { id: "leather_armor", chance: 0.05 }] },
  { name: "骷髏兵", emoji: "💀", hp: 90, atk: 16, def: 10, spd: 7, exp: 55, gold: 26, drops: [{ id: "iron_sword", chance: 0.05 }, { id: "leather_armor", chance: 0.05 }] },
  { name: "巨型蜘蛛", emoji: "🕷️", hp: 110, atk: 18, def: 8, spd: 12, exp: 68, gold: 32, drops: [{ id: "silver_blade", chance: 0.04 }, { id: "iron_armor", chance: 0.04 }] },
  { name: "石巨人", emoji: "🗿", hp: 160, atk: 20, def: 18, spd: 4, exp: 85, gold: 40, drops: [{ id: "silver_blade", chance: 0.04 }, { id: "iron_armor", chance: 0.04 }] },
  { name: "暗黑騎士", emoji: "🐴", hp: 190, atk: 26, def: 16, spd: 10, exp: 105, gold: 50, drops: [{ id: "flame_sword", chance: 0.03 }, { id: "silver_armor", chance: 0.03 }] },
  { name: "巨龍", emoji: "🐉", hp: 280, atk: 32, def: 20, spd: 11, exp: 150, gold: 80, drops: [{ id: "dragon_slayer", chance: 0.02 }, { id: "dragon_armor", chance: 0.02 }] },
];

const STORY = [
  {
    pre: [
      { speaker: "旁白", text: "你踏上了成為傳說冒險者的道路。" },
      { speaker: "村長", text: "村子外面的史萊姆最近很囂張，能幫我們解決一下嗎？" },
    ],
    post: [{ speaker: "村長", text: "太感謝了！這是給你的獎勵。" }],
  },
  {
    pre: [{ speaker: "旅人", text: "前面的森林裡出現了哥布林部落，小心行動。" }],
    post: [{ speaker: "旅人", text: "做得好，森林總算安全了一些。" }],
  },
  {
    pre: [{ speaker: "獵人", text: "野狼群最近變得很兇猛，似乎在保護著什麼。" }],
    post: [{ speaker: "獵人", text: "辛苦了，牠們終於安分下來了。" }],
  },
  {
    pre: [{ speaker: "旁白", text: "古老的墓地裡，骷髏兵再度甦醒。" }],
    post: [{ speaker: "神官", text: "亡者已經回歸安息，感謝你的幫助。" }],
  },
  {
    pre: [{ speaker: "商人", text: "洞窟裡的巨型蜘蛛擋住了商隊的去路。" }],
    post: [{ speaker: "商人", text: "商路暢通了！這是一點謝禮。" }],
  },
  {
    pre: [{ speaker: "礦工", text: "礦坑深處的石巨人一直守著出口，我們出不去。" }],
    post: [{ speaker: "礦工", text: "終於可以回家了，太感謝你了！" }],
  },
  {
    pre: [{ speaker: "衛兵隊長", text: "暗黑騎士率領著不明軍隊逼近城鎮，拜託你了。" }],
    post: [{ speaker: "衛兵隊長", text: "城鎮保住了，你真是位英雄。" }],
  },
  {
    pre: [
      { speaker: "旁白", text: "傳說中的巨龍出現在山頂，牠是這片土地最大的威脅。" },
      { speaker: "長老", text: "這是最後的試煉，願你凱旋而歸。" },
    ],
    post: [
      { speaker: "長老", text: "難以置信，你竟然打倒了巨龍！傳說將會流傳下去，但你的冒險還沒有結束……" },
    ],
  },
];

const WEAPONS = [
  { id: "wood_sword", name: "木劍", emoji: "🗡️", atk: 5, price: 150 },
  { id: "iron_sword", name: "鐵劍", emoji: "⚔️", atk: 12, price: 500 },
  { id: "silver_blade", name: "銀刃", emoji: "🔪", atk: 22, price: 1500 },
  { id: "flame_sword", name: "炎劍", emoji: "🔥", atk: 35, price: 3800 },
  { id: "dragon_slayer", name: "屠龍劍", emoji: "🐲", atk: 55, price: 9000 },
];

const ARMORS = [
  { id: "cloth_armor", name: "布甲", emoji: "👕", def: 4, price: 120 },
  { id: "leather_armor", name: "皮甲", emoji: "🦺", def: 9, price: 450 },
  { id: "iron_armor", name: "鐵甲", emoji: "🛡️", def: 18, price: 1400 },
  { id: "silver_armor", name: "銀甲", emoji: "✨", def: 30, price: 3600 },
  { id: "dragon_armor", name: "屠龍甲", emoji: "🐉", def: 48, price: 8500 },
];

const POTIONS = [
  { id: "hp_potion", name: "生命藥水", emoji: "🧪", type: "hp", restore: 0.4, price: 50, desc: "戰鬥中恢復 40% 最大 HP" },
  { id: "hp_potion_big", name: "高級生命藥水", emoji: "🍶", type: "hp", restore: 1.0, price: 180, desc: "戰鬥中恢復 100% 最大 HP" },
  { id: "mp_potion", name: "魔力藥水", emoji: "💧", type: "mp", restore: 0.5, price: 60, desc: "戰鬥中恢復 50% 最大 MP" },
  { id: "mp_potion_big", name: "高級魔力藥水", emoji: "🔷", type: "mp", restore: 1.0, price: 190, desc: "戰鬥中恢復 100% 最大 MP" },
];

const MATERIALS = [
  { id: "stabilizer", name: "安定符", emoji: "📜", price: 350, desc: "強化失敗時裝備不會降級（使用後消耗）" },
  { id: "guarantee_scroll", name: "100%成功卷軸", emoji: "🌟", price: 900, desc: "保證這次強化必定成功（使用後消耗）" },
];

const STAT_BOOSTS = [
  { id: "boost_atk", name: "攻擊藥劑", emoji: "💪", stat: "atk", amount: 1, basePrice: 250, desc: "永久提升 1 點基本攻擊力" },
  { id: "boost_def", name: "防禦藥劑", emoji: "🧱", stat: "def", amount: 1, basePrice: 250, desc: "永久提升 1 點基本防禦力" },
  { id: "boost_hp", name: "體力藥劑", emoji: "❤️", stat: "hp", amount: 5, basePrice: 300, desc: "永久提升 5 點基本 HP" },
  { id: "boost_mp", name: "魔力藥劑", emoji: "💠", stat: "mp", amount: 3, basePrice: 300, desc: "永久提升 3 點基本 MP" },
  { id: "boost_spd", name: "敏捷藥劑", emoji: "🌀", stat: "spd", amount: 1, basePrice: 280, desc: "永久提升 1 點基本速度" },
];

const BUNDLES = [
  {
    id: "starter_pack",
    name: "新手大禮包",
    emoji: "🎁",
    price: 400,
    desc: "生命藥水 x3、魔力藥水 x3",
    contains: { potions: { hp_potion: 3, mp_potion: 3 } },
  },
  {
    id: "enhance_pack",
    name: "強化大禮包",
    emoji: "🎀",
    price: 2200,
    desc: "安定符 x2、100%成功卷軸 x1",
    contains: { materials: { stabilizer: 2, guarantee_scroll: 1 } },
  },
  {
    id: "mega_pack",
    name: "冒險者豪華禮包",
    emoji: "🧧",
    price: 5000,
    desc: "生命藥水 x5、魔力藥水 x5、安定符 x3、100%成功卷軸 x1",
    contains: { potions: { hp_potion: 5, mp_potion: 5 }, materials: { stabilizer: 3, guarantee_scroll: 1 } },
  },
];

const ENHANCE_SUCCESS_RATE = [1.0, 1.0, 1.0, 1.0, 0.9, 0.9, 0.75, 0.6, 0.45, 0.3];
const ENHANCE_MAX_LEVEL = 10;

function enhanceCost(level) {
  return Math.round(80 * Math.pow(level + 1, 1.8));
}
