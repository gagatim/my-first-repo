const CLASSES = {
  hero: {
    id: "hero",
    name: "英雄",
    emoji: "🦸",
    desc: "數值均衡，攻守兼備的萬能戰士。",
    base: { hp: 100, mp: 30, atk: 15, def: 12, spd: 10 },
    growth: { hp: 8, mp: 2, atk: 2, def: 1.5, spd: 1 },
    skills: [
      { id: "power_strike", name: "猛擊", unlockLevel: 1, mpCost: 5, power: 1.8, desc: "對敵人造成 1.8 倍傷害" },
      { id: "rally", name: "鼓舞", unlockLevel: 10, mpCost: 10, heal: 0.2, desc: "恢復 20% 最大 HP" },
      { id: "hero_wrath", name: "英雄之怒", unlockLevel: 30, mpCost: 20, power: 3.0, desc: "對敵人造成 3.0 倍傷害" },
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
      { id: "multishot", name: "連射", unlockLevel: 1, mpCost: 5, power: 1.0, hits: 2, desc: "連續射擊 2 次，每次 1.0 倍傷害" },
      { id: "quick_shot", name: "急速射擊", unlockLevel: 10, mpCost: 8, power: 1.5, forcedFirst: true, desc: "1.5 倍傷害，必定優先出手" },
      { id: "hunters_mark", name: "獵人絕技", unlockLevel: 30, mpCost: 15, power: 2.2, defBreak: 0.3, desc: "2.2 倍傷害，並降低敵人防禦" },
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
      { id: "shield_bash", name: "盾擊", unlockLevel: 1, mpCost: 5, power: 1.3, spdDebuff: true, desc: "1.3 倍傷害，並降低敵人速度" },
      { id: "counter_stance", name: "反擊姿態", unlockLevel: 10, mpCost: 10, stance: true, desc: "本回合必定反擊，並減少 50% 受到的傷害" },
      { id: "armor_break", name: "破甲反擊", unlockLevel: 30, mpCost: 18, power: 2.0, ignoreDef: 0.5, desc: "2.0 倍傷害，無視 50% 敵人防禦" },
    ],
  },
};

const MONSTERS = [
  { name: "史萊姆", emoji: "🟢", hp: 40, atk: 8, def: 3, spd: 5, exp: 20, gold: 10 },
  { name: "哥布林", emoji: "👺", hp: 60, atk: 12, def: 5, spd: 8, exp: 32, gold: 16 },
  { name: "野狼", emoji: "🐺", hp: 70, atk: 15, def: 4, spd: 14, exp: 42, gold: 20 },
  { name: "骷髏兵", emoji: "💀", hp: 90, atk: 16, def: 10, spd: 7, exp: 55, gold: 26 },
  { name: "巨型蜘蛛", emoji: "🕷️", hp: 110, atk: 18, def: 8, spd: 12, exp: 68, gold: 32 },
  { name: "石巨人", emoji: "🗿", hp: 160, atk: 20, def: 18, spd: 4, exp: 85, gold: 40 },
  { name: "暗黑騎士", emoji: "🐴", hp: 190, atk: 26, def: 16, spd: 10, exp: 105, gold: 50 },
  { name: "巨龍", emoji: "🐉", hp: 280, atk: 32, def: 20, spd: 11, exp: 150, gold: 80 },
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
      { speaker: "長老", text: "難以置信，你竟然打倒了巨龍！" },
      { speaker: "旁白", text: "傳說將會流傳下去，但你的冒險還沒有結束……" },
    ],
  },
  {
    pre: [{ speaker: "旁白", text: "更強大的敵人不斷出現，無盡的試煉開始了。" }],
    post: [{ speaker: "旁白", text: "又一場勝利，繼續前進吧。" }],
  },
];
