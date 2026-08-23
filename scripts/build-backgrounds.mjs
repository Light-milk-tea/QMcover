import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const INDEX = resolve("tmp-backgrounds/_index.json");
const OUT = resolve("src/data/avg-backgrounds.json");

/** 旧草稿 id，必须按文件名保住。 */
const LEGACY_BY_FILE = {
  "bg_arena_1.png": { id: "arena", name: "竞技场" },
  "bg_cave_2.png": { id: "mine", name: "矿坑" },
  "bg_wild_a.png": { id: "wild", name: "荒野" },
  "bg_desert_1.png": { id: "desert", name: "沙原" },
  "bg_cher_3.png": { id: "ruins", name: "废城" },
  "bg_battlefield.png": { id: "battlefield", name: "战场" },
  "bg_lungmen_n.png": { id: "lungmen-night", name: "龙门夜" },
  "bg_lmstreet_1.png": { id: "lungmen-street", name: "龙门街" },
  "bg_beach_1.png": { id: "beach", name: "海滩" },
  "bg_forest.png": { id: "forest", name: "密林" },
  "bg_coldforest.png": { id: "coldforest", name: "寒林" },
  "bg_snowconutry_1.png": { id: "snow", name: "雪乡" },
  "bg_thundercloud.png": { id: "thunder", name: "雷云" },
  "bg_village.png": { id: "village", name: "村落" },
  "bg_county_1.png": { id: "county", name: "乡野" },
  "bg_ruins_1.png": { id: "wreck", name: "废墟" },
  "bg_caveentrance.png": { id: "cave-mouth", name: "洞口" },
  "bg_motorway.png": { id: "motorway", name: "公路" },
  "bg_outcity_1.png": { id: "outcity", name: "城外" },
  "bg_ibcoastd.png": { id: "iberia-coast", name: "海蚀" },
  "bg_ibcoastn.png": { id: "bg_ibcoastn", name: "夜海岸" },
  "35_g11_yumendesert.png": { id: "yumen-desert", name: "玉门漠" },
  "37_g10_wildbattlefield.png": { id: "wild-war", name: "荒战" },
  "30_ex1_snowmount.png": { id: "snowmount", name: "雪山" },
  "40_g1_blackforest.png": { id: "blackforest", name: "黑林" },
  "27_g4_giantwall.png": { id: "giantwall", name: "巨墙" },
};

const TOKENS = {
  laterano: "拉特兰",
  victoria: "维多利亚",
  lungmen: "龙门",
  yumen: "玉门",
  siesta: "汐斯塔",
  rhodes: "罗德岛",
  columbia: "哥伦比亚",
  colombia: "哥伦比亚",
  trimount: "三山",
  rhine: "莱茵",
  kazimierz: "卡西米尔",
  iberia: "伊比利亚",
  sargon: "萨尔贡",
  ursus: "乌萨斯",
  kjerag: "谢拉格",
  sami: "萨米",
  samitribe: "萨米部落",
  samiresort: "萨米度假",
  blacksteel: "黑钢",
  glasgow: "格拉斯哥",
  durin: "杜林",
  yan: "炎国",
  street: "街",
  alley: "巷",
  square: "广场",
  park: "公园",
  village: "村",
  town: "镇",
  city: "城",
  desert: "沙漠",
  forest: "林",
  jungle: "丛林",
  wild: "荒野",
  battlefield: "战场",
  beach: "海滩",
  coast: "海岸",
  snow: "雪",
  cave: "洞穴",
  ruins: "废墟",
  indoor: "室内",
  outdoor: "室外",
  office: "办公室",
  room: "房间",
  hall: "大厅",
  corridor: "走廊",
  hotel: "旅馆",
  bar: "酒吧",
  church: "教堂",
  chapel: "礼拜堂",
  cathedral: "主教堂",
  lab: "实验室",
  laboratory: "实验室",
  warehouse: "仓库",
  prison: "监狱",
  jail: "牢房",
  school: "学校",
  library: "图书馆",
  rooftop: "屋顶",
  bridge: "桥",
  station: "车站",
  mine: "矿",
  mountain: "山",
  sea: "海",
  night: "夜",
  day: "昼",
  d: "昼",
  n: "夜",
  arena: "竞技场",
  manor: "庄园",
  temple: "寺庙",
  lighthouse: "灯塔",
  goldenboat: "黄金船",
  airship: "飞空艇",
  volcano: "火山",
  glacier: "冰川",
  swamp: "沼泽",
  oasis: "绿洲",
  farm: "农田",
  farmland: "农田",
  restaurant: "餐馆",
  market: "市场",
  supermarket: "超市",
  factory: "工厂",
  subway: "地铁",
  sewer: "下水道",
  stage: "舞台",
  lounge: "休息室",
  embassy: "使馆",
  cottage: "小屋",
  tent: "帐篷",
  bank: "银行",
  diner: "快餐店",
  brewery: "酒厂",
  greenhouse: "温室",
  monastery: "修道院",
  sanctuary: "圣所",
  cliff: "悬崖",
  lake: "湖",
  garden: "花园",
  fountain: "喷泉",
  reception: "接待",
  livingroom: "客厅",
  bedroom: "卧室",
  kitchen: "厨房",
  infirmary: "医务室",
  canteen: "食堂",
  barracks: "营房",
  warehouse: "仓库",
  command: "指挥室",
  observation: "瞭望",
  tower: "塔",
  wall: "墙",
  gate: "门",
  path: "小路",
  road: "路",
  railway: "铁路",
  dock: "码头",
  deck: "甲板",
  core: "核心",
  front: "前方",
  outside: "外",
  inside: "内",
  abandoned: "废弃",
  ruined: "损毁",
  burning: "燃烧",
  snowy: "雪",
  cloudy: "云",
  dusk: "黄昏",
  dawn: "黎明",
  black: "黑",
  white: "白",
};

/** 活动包数字 → 主要地名。文件名里有更明确地名时再被关键词覆盖。 */
const EVENT_PLACE = {
  "20": "columbia",
  "21": "victoria",
  "23": "iberia",
  "24": "kazimierz",
  "25": "yan",
  "26": "laterano",
  "27": "iberia",
  "28": "leithanien",
  "29": "columbia",
  "30": "durin",
  "31": "yan",
  "32": "victoria",
  "33": "siracusa",
  "34": "victoria",
  "35": "yumen",
  "36": "higashi",
  "37": "columbia",
  "38": "columbia",
  "39": "laterano",
  "40": "sami",
  "41": "siesta",
  "42": "columbia",
  "43": "aegir",
  "44": "leithanien",
};

const PLACE_KEYWORDS = [
  [/laterano/, "laterano"],
  [/lungmen|lmstreet|pgbase/, "lungmen"],
  [/yumen/, "yumen"],
  [/siesta|obsidianhotspring|volcanomountain|purewhitevolcano|festival/, "siesta"],
  [/victoria|lenti|londinium|glasgow/, "victoria"],
  [/(^|_)src|siracusa|srcalley|srcstreet|srccourt|srctheater|srcpark|srcroom/, "siracusa"],
  [/iberia|(^|_)ib(coast|bar|cave|church|indoor|town)|lighthouse|goldenboat/, "iberia"],
  [/trimount|rhine|rhinelab|colombia|columbia|blacksteel|sonwy|ecolab/, "columbia"],
  [/cher|chercen|cherunder|cherbefore/, "ursus"],
  [/sami|samitribe|samiresort|stargate|blackforest|glacier/, "sami"],
  [/rhodes|rhodescom|rhodesroom|(^|_)ri_1($|_)/, "rhodes"],
  [/durin/, "durin"],
  [/kjerag|kxstreet|karlan|snowconutry|iceforest/, "kjerag"],
  [/(^|_)lt(street|alley|room|ruins|strongpoint)|czerny|wolumonde/, "leithanien"],
  [/manor|nearl|kazimierz/, "kazimierz"],
  [/eastern|higashi|redleaf/, "higashi"],
  [/(^|_)luo_|yanstreet|yanalley|yandowntown|yaninn|yanroom|yanliving|lianghouse/, "yan"],
  [/sargon|(^|_)srg|deserttown/, "sargon"],
  [/(^|_)beach_/, "siesta"],
];

const PLACE_ORDER = [
  ["lungmen", "龙门"],
  ["laterano", "拉特兰"],
  ["victoria", "维多利亚"],
  ["yan", "尚蜀"],
  ["yumen", "玉门"],
  ["iberia", "伊比利亚"],
  ["leithanien", "莱塔尼亚"],
  ["kazimierz", "卡西米尔"],
  ["columbia", "哥伦比亚"],
  ["siracusa", "叙拉古"],
  ["siesta", "汐斯塔"],
  ["sami", "萨米"],
  ["durin", "杜林"],
  ["kjerag", "谢拉格"],
  ["ursus", "乌萨斯"],
  ["higashi", "东国"],
  ["sargon", "萨尔贡"],
  ["aegir", "阿戈尔"],
  ["rhodes", "罗德岛"],
  ["unknown", "未分类"],
];

function categoryOf(file) {
  const stem = file.replace(/\.[^.]+$/, "").toLowerCase();
  for (const [re, place] of PLACE_KEYWORDS) {
    if (re.test(stem)) return place;
  }
  const numbered = stem.match(/^(\d{2})_/) || stem.match(/^bg_(\d{2})_/);
  if (numbered && EVENT_PLACE[numbered[1]]) return EVENT_PLACE[numbered[1]];
  if (/^ac\d|^avg_/.test(stem)) return "ursus";
  return "unknown";
}

function sceneSlug(file) {
  return file
    .replace(/\.[^.]+$/, "")
    .replace(/^\d{2}_/i, "")
    .replace(/^(g|ex|rl|rl2|mini)\d*_/i, "")
    .replace(/^bg_/i, "");
}

function titleName(file) {
  const tokens = sceneSlug(file)
    .split(/[_-]+/)
    .filter(Boolean)
    .map((t) => TOKENS[t.toLowerCase()] ?? t);
  const name = tokens.join(" ").replace(/\s+/g, " ").trim();
  return name || file.replace(/\.[^.]+$/, "");
}

const files = JSON.parse(readFileSync(INDEX, "utf8"));
const items = files.map((file) => {
  const legacy = LEGACY_BY_FILE[file];
  return {
    id: legacy?.id ?? file.replace(/\.[^.]+$/, ""),
    file,
    name: legacy?.name ?? titleName(file),
    category: categoryOf(file),
  };
});

const legacyIds = new Set(Object.values(LEGACY_BY_FILE).map((x) => x.id));
const placeRank = new Map(PLACE_ORDER.map(([id], i) => [id, i]));

items.sort((a, b) => {
  const pa = placeRank.get(a.category) ?? 99;
  const pb = placeRank.get(b.category) ?? 99;
  if (pa !== pb) return pa - pb;
  const la = legacyIds.has(a.id) ? 0 : 1;
  const lb = legacyIds.has(b.id) ? 0 : 1;
  if (la !== lb) return la - lb;
  return a.name.localeCompare(b.name, "zh");
});

writeFileSync(OUT, `${JSON.stringify(items, null, 2)}\n`);
const counts = Object.fromEntries(
  PLACE_ORDER.map(([id, name]) => [name, items.filter((x) => x.category === id).length]),
);
console.log(`wrote ${items.length}`, counts);
