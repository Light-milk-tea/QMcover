import type { BoxLayer } from "../types";

export type DecorationCategory = "atmosphere" | "texture" | "geometry" | "band" | "mark" | "ark" | "class";

export const DECORATION_CATEGORIES: { id: DecorationCategory; name: string }[] = [
  { id: "atmosphere", name: "氛围光效" },
  { id: "texture", name: "纹理材质" },
  { id: "geometry", name: "几何线框" },
  { id: "band", name: "条带色块" },
  { id: "mark", name: "小标记" },
  { id: "ark", name: "方舟饰件" },
  { id: "class", name: "职业图标" },
];

export type DecorationPreset = {
  id: string;
  name: string;
  description: string;
  category: DecorationCategory;
  kind?: "box" | "polaroid";
  layer: Omit<BoxLayer, "id" | "kind">;
  /** 缩略预览只取这一块（图层内坐标），整幅装饰缩小后才看得清。 */
  preview?: { x: number; y: number; w: number; h: number };
  /** 原模板里铺在立绘后面的底层装饰，加入时插到立绘下方。 */
  behindArt?: boolean;
};

export const CLASS_ICON_SRC: Record<string, string> = {
  "class-vanguard": "https://media.prts.wiki/8/82/%E5%9B%BE%E6%A0%87_%E8%81%8C%E4%B8%9A_%E5%85%88%E9%94%8B_%E5%A4%A7%E5%9B%BE.png",
  "class-guard": "https://media.prts.wiki/a/a9/%E5%9B%BE%E6%A0%87_%E8%81%8C%E4%B8%9A_%E8%BF%91%E5%8D%AB_%E5%A4%A7%E5%9B%BE.png",
  "class-defender": "https://media.prts.wiki/6/6f/%E5%9B%BE%E6%A0%87_%E8%81%8C%E4%B8%9A_%E9%87%8D%E8%A3%85_%E5%A4%A7%E5%9B%BE.png",
  "class-sniper": "https://media.prts.wiki/d/d1/%E5%9B%BE%E6%A0%87_%E8%81%8C%E4%B8%9A_%E7%8B%99%E5%87%BB_%E5%A4%A7%E5%9B%BE.png",
  "class-caster": "https://media.prts.wiki/4/4d/%E5%9B%BE%E6%A0%87_%E8%81%8C%E4%B8%9A_%E6%9C%AF%E5%B8%88_%E5%A4%A7%E5%9B%BE.png",
  "class-medic": "https://media.prts.wiki/b/b8/%E5%9B%BE%E6%A0%87_%E8%81%8C%E4%B8%9A_%E5%8C%BB%E7%96%97_%E5%A4%A7%E5%9B%BE.png",
  "class-supporter": "https://media.prts.wiki/f/f0/%E5%9B%BE%E6%A0%87_%E8%81%8C%E4%B8%9A_%E8%BE%85%E5%8A%A9_%E5%A4%A7%E5%9B%BE.png",
  "class-specialist": "https://media.prts.wiki/2/2a/%E5%9B%BE%E6%A0%87_%E8%81%8C%E4%B8%9A_%E7%89%B9%E7%A7%8D_%E5%A4%A7%E5%9B%BE.png",
};

const CLASS_MARKS: DecorationPreset[] = [
  ["class-vanguard", "先锋"],
  ["class-guard", "近卫"],
  ["class-defender", "重装"],
  ["class-sniper", "狙击"],
  ["class-caster", "术师"],
  ["class-medic", "医疗"],
  ["class-supporter", "辅助"],
  ["class-specialist", "特种"],
].map(([chrome, name]) => ({
  id: chrome,
  name,
  description: "PRTS 职业大图",
  category: "class" as const,
  layer: {
    label: name,
    x: 80,
    y: 64,
    w: 160,
    h: 160,
    chrome: chrome as BoxLayer["chrome"],
    color: "#ffffff",
  },
}));

/** Full-canvas pieces keep the template's 1920×1080 placement. */
const FULL = { x: 0, y: 0, w: 1920, h: 1080 } as const;

const ARK_DECORATIONS: DecorationPreset[] = [
  {
    id: "ak-mark",
    name: "方舟标",
    description: "明日方舟中文标，方舟二字下有绿线",
    category: "ark",
    layer: { label: "方舟标", x: 48, y: 36, w: 320, h: 78, chrome: "ak-mark", color: "#eef6e4" },
  },
  {
    id: "ak-star",
    name: "四角星",
    description: "明日方舟界面常用的四向星标",
    category: "ark",
    layer: { label: "四角星", x: 80, y: 64, w: 240, h: 240, chrome: "ak-star", color: "#d8e8c4" },
  },
  {
    id: "radar-arcs",
    name: "雷达弧",
    description: "左下起的同心弧和斜虚线",
    category: "ark",
    layer: { label: "雷达弧", x: 0, y: 0, w: 420, h: 420, chrome: "radar-arcs", color: "#c6e84a" },
  },
  {
    id: "dash-ticks",
    name: "斜刻度",
    description: "带刻度的斜向虚线",
    category: "ark",
    layer: { label: "斜刻度", x: 40, y: 80, w: 520, h: 72, chrome: "dash-ticks", color: "#e8f0d8" },
  },
  {
    id: "originium",
    name: "源石棱",
    description: "棱角源石结晶，不是官方贴图",
    category: "ark",
    layer: { label: "源石棱", x: 96, y: 88, w: 200, h: 232, chrome: "originium", color: "#9ad14a" },
  },
  {
    id: "reticle",
    name: "准星",
    description: "作战准心和角括",
    category: "ark",
    layer: { label: "准星", x: 120, y: 96, w: 160, h: 160, chrome: "reticle", color: "#e8f2d2" },
  },
  {
    id: "hex-cell",
    name: "六边形",
    description: "罗德岛设备上的六角单元",
    category: "ark",
    layer: { label: "六边形", x: 110, y: 90, w: 176, h: 192, chrome: "hex-cell", color: "#c8d8b0" },
  },
  {
    id: "ring-ticks",
    name: "圆环刻度",
    description: "圆周刻度盘",
    category: "ark",
    layer: { label: "圆环刻度", x: 100, y: 80, w: 188, h: 188, chrome: "ring-ticks", color: "#dce8c8" },
  },
  {
    id: "chain-rule",
    name: "链节线",
    description: "一排相扣链节，可当署名两侧饰线",
    category: "ark",
    layer: { label: "链节线", x: 80, y: 920, w: 360, h: 28, chrome: "chain-rule", color: "#c6e84a" },
  },
];

const ATMOSPHERE: DecorationPreset[] = [
  {
    id: "violet-streaks",
    name: "紫色光痕",
    description: "紧急授课：斜向断续的紫色光痕",
    category: "atmosphere",
    layer: { label: "紫色光痕", ...FULL, chrome: "violet-streaks" },
    preview: { x: 1250, y: 0, w: 670, h: 430 },
  },
  {
    id: "violet-mist",
    behindArt: true,
    name: "紫雾笔触",
    description: "紧急授课：紫黑笔触雾带",
    category: "atmosphere",
    layer: { label: "紫雾笔触", ...FULL, chrome: "violet-mist" },
  },
  {
    id: "glitch-haze",
    name: "故障烟带",
    description: "紧急授课：底部青红故障烟带",
    category: "atmosphere",
    layer: { label: "故障烟带", ...FULL, chrome: "glitch-haze" },
    preview: { x: 120, y: 760, w: 1640, h: 280 },
  },
  {
    id: "red-smoke",
    behindArt: true,
    name: "红雾",
    description: "仅需一人：红色径向雾和烟带",
    category: "atmosphere",
    layer: { label: "红雾", ...FULL, chrome: "red-smoke", opacity: 74 },
  },
  {
    id: "top-glow",
    behindArt: true,
    name: "顶光晕",
    description: "四星无核：顶部暖色光晕",
    category: "atmosphere",
    layer: { label: "顶光晕", ...FULL, chrome: "top-glow" },
  },
  {
    id: "corner-glow",
    name: "角落光晕",
    description: "全息作战矩阵：左上右下两角的主色光晕，可改色",
    category: "atmosphere",
    layer: { label: "角落光晕", ...FULL, chrome: "corner-glow", color: "#9730f2" },
  },
  {
    id: "embers",
    name: "微光颗粒",
    description: "全息作战矩阵：斜向飘散的微光，可改色",
    category: "atmosphere",
    layer: { label: "微光颗粒", ...FULL, chrome: "embers", color: "#a468d6" },
    preview: { x: 700, y: 420, w: 260, h: 146 },
  },
  {
    id: "vignette",
    behindArt: true,
    name: "暗角",
    description: "决战五星：局部径向暗角",
    category: "atmosphere",
    layer: { label: "暗角", x: -140, y: -80, w: 1120, h: 1240, chrome: "vignette", opacity: 70 },
  },
  {
    id: "side-shade",
    behindArt: true,
    name: "侧边压暗",
    description: "文字一侧从左往右淡出的压暗，不整屏抹黑",
    category: "atmosphere",
    layer: { label: "侧边压暗", x: 0, y: 0, w: 1240, h: 1080, chrome: "side-shade" },
  },
  {
    id: "bottom-fade",
    name: "底边压暗",
    description: "四星无核：底边一窄条压暗",
    category: "atmosphere",
    layer: { label: "底边压暗", x: 0, y: 990, w: 1920, h: 90, chrome: "bottom-fade" },
  },
  {
    id: "light-wash",
    behindArt: true,
    name: "浅色罩",
    description: "V我50：从左往右变淡的米白罩，配深色字",
    category: "atmosphere",
    layer: { label: "浅色罩", ...FULL, chrome: "light-wash" },
  },
];

const TEMPLATE_WASHES: DecorationPreset[] = [
  {
    id: "violet-atmosphere",
    behindArt: true,
    name: "紫黑氛围",
    description: "紧急授课：紫黑渐变、四周暗角和紫雾笔触",
    category: "atmosphere",
    layer: { label: "紫黑氛围", ...FULL, chrome: "violet-atmosphere" },
  },
  {
    id: "art-veil",
    name: "立绘暗角",
    description: "紧急授课：压在立绘上的紫色暗角，脸部留亮",
    category: "atmosphere",
    layer: { label: "立绘暗角", ...FULL, chrome: "art-veil" },
  },
  {
    id: "cool-wash",
    behindArt: true,
    name: "冷色压暗",
    description: "职业队：左侧和底部压暗，顶部一道天光",
    category: "atmosphere",
    layer: { label: "冷色压暗", ...FULL, chrome: "cool-wash" },
  },
  {
    id: "violet-bloom",
    name: "紫色角光",
    description: "全息作战矩阵紫色主题：两角的品红光和烟雾，可改色",
    category: "atmosphere",
    layer: { label: "紫色角光", ...FULL, chrome: "violet-bloom", color: "#9730f2" },
  },
];

const OPERATOR_PIECES: DecorationPreset[] = [
  {
    id: "art-echo",
    behindArt: true,
    name: "灰色叠影",
    description: "特种三人：当前立绘去色、倾斜后的叠影",
    category: "atmosphere",
    layer: { label: "灰色叠影", ...FULL, chrome: "art-echo" },
    preview: { x: 600, y: 0, w: 1320, h: 1080 },
  },
  {
    id: "skill-icons",
    name: "技能图标",
    description: "强度测评：当前干员的三个技能图标和金框",
    category: "mark",
    layer: { label: "技能图标", x: 1010, y: 380, w: 780, h: 236, chrome: "skill-icons" },
  },
];

const TEXTURES: DecorationPreset[] = [
  {
    id: "mineral",
    behindArt: true,
    name: "矿物底纹",
    description: "全息作战矩阵：深色矿石底，放在最底层",
    category: "texture",
    layer: { label: "矿物底纹", ...FULL, chrome: "mineral" },
  },
  {
    id: "film-grain",
    name: "胶片颗粒",
    description: "全息作战矩阵：细密胶片颗粒",
    category: "texture",
    layer: { label: "胶片颗粒", ...FULL, chrome: "film-grain", opacity: 11 },
    preview: { x: 0, y: 0, w: 240, h: 135 },
  },
  {
    id: "print-dots",
    name: "网点纸纹",
    description: "特种三人：旋转网点和纸纹，两侧保留",
    category: "texture",
    layer: { label: "网点纸纹", ...FULL, chrome: "print-dots" },
  },
  {
    id: "paper-flecks",
    behindArt: true,
    name: "纸面白点",
    description: "特种三人：散落的纸面白点",
    category: "texture",
    layer: { label: "纸面白点", ...FULL, chrome: "paper-flecks" },
    preview: { x: 0, y: 0, w: 480, h: 270 },
  },
  {
    id: "night-grid",
    behindArt: true,
    name: "夜空网格",
    description: "无核论文：金紫星点和细网格",
    category: "texture",
    layer: { label: "夜空网格", ...FULL, chrome: "night-grid" },
    preview: { x: 1150, y: 200, w: 800, h: 450 },
  },
  {
    id: "checker-floor",
    behindArt: true,
    name: "棋盘地",
    description: "四星无核：透视棋盘地面",
    category: "texture",
    layer: { label: "棋盘地", ...FULL, chrome: "checker-floor" },
  },
  {
    id: "halftone-fade",
    behindArt: true,
    name: "渐隐网点",
    description: "明日方舟角色测评的渐隐半调网点",
    category: "texture",
    layer: { label: "渐隐网点", x: 1040, y: 100, w: 620, h: 300, chrome: "halftone-fade", color: "#c4c4c2" },
  },
  {
    id: "paper-halftone",
    behindArt: true,
    name: "纸带网点",
    description: "低配模板纸带左侧的渐隐网点",
    category: "texture",
    layer: { label: "纸带网点", x: 360, y: 390, w: 450, h: 280, chrome: "halftone-side", color: "#141414" },
  },
  {
    id: "dot-grid",
    name: "白色点阵",
    description: "肉鸽模板右下角的规则点阵",
    category: "texture",
    layer: { label: "白色点阵", x: 240, y: 240, w: 160, h: 80, chrome: "dot-grid", color: "#ffffff" },
  },
];

const GEOMETRY: DecorationPreset[] = [
  {
    id: "tactical-orbits",
    behindArt: true,
    name: "战术圆环",
    description: "全息作战矩阵：圆环、弧线和网格，可改色",
    category: "geometry",
    layer: { label: "战术圆环", ...FULL, chrome: "tactical-orbits", color: "#a468d6" },
    preview: { x: 900, y: 80, w: 1020, h: 920 },
  },
  {
    id: "print-geometry",
    behindArt: true,
    name: "印刷斜框",
    description: "特种三人：斜框、三角纹和干笔触",
    category: "geometry",
    layer: { label: "印刷斜框", ...FULL, chrome: "print-geometry" },
  },
  {
    id: "teal-hud",
    behindArt: true,
    name: "青绿线框",
    description: "四星无核：青绿细线和罗盘",
    category: "geometry",
    layer: { label: "青绿线框", ...FULL, chrome: "teal-hud" },
    preview: { x: 0, y: 640, w: 1100, h: 440 },
  },
  {
    id: "tech-frame",
    behindArt: true,
    name: "战术边框",
    description: "干员前瞻分析：双层细框、大弧线和红色定位点",
    category: "geometry",
    layer: { label: "战术边框", ...FULL, chrome: "tech-frame" },
  },
  {
    id: "tactical-guides",
    behindArt: true,
    name: "战术标线",
    description: "职业队模板的工业标线与坐标文字",
    category: "geometry",
    layer: { label: "战术标线", x: 480, y: 270, w: 960, h: 540, chrome: "tactical-guides" },
  },
  {
    id: "soft-shards",
    behindArt: true,
    name: "灰色碎片",
    description: "职业队模板背景中的半透明碎片",
    category: "geometry",
    layer: { label: "灰色碎片", x: 1050, y: 80, w: 700, h: 520, chrome: "soft-shards" },
  },
  {
    id: "corner-shards",
    name: "红白角片",
    description: "职业队模板右下角的工业碎片",
    category: "geometry",
    layer: { label: "红白角片", x: 1480, y: 520, w: 440, h: 520, chrome: "corner-shards" },
  },
  {
    id: "gold-rules",
    behindArt: true,
    name: "金色斜线",
    description: "特种三人：左上右下的斜向细线，可改色",
    category: "geometry",
    layer: { label: "金色斜线", ...FULL, chrome: "gold-rules", color: "#dbb64d" },
    preview: { x: 0, y: 0, w: 1500, h: 300 },
  },
  {
    id: "gold-frame",
    behindArt: true,
    name: "金框棋盘",
    description: "四星无核：倾斜的金色画框和关卡棋盘",
    category: "geometry",
    layer: { label: "金框棋盘", ...FULL, chrome: "gold-frame" },
    preview: { x: 1000, y: 0, w: 920, h: 1000 },
  },
  {
    id: "ef-triangle",
    name: "地形三角",
    description: "明日方舟角色测评的等高线黄三角",
    category: "geometry",
    layer: { label: "地形三角", x: 520, y: 250, w: 880, h: 640, chrome: "ef-triangle", color: "#fdfe3e" },
  },
];

const BANDS: DecorationPreset[] = [
  {
    id: "stage-arrow",
    behindArt: true,
    name: "关卡箭头",
    description: "V我50：左端尖角的横向色条，可改色",
    category: "band",
    layer: { label: "关卡箭头", x: 0, y: 358, w: 1920, h: 227, chrome: "stage-arrow", color: "#1c1917" },
  },
  {
    id: "glossy-slash",
    behindArt: true,
    name: "光泽斜切",
    description: "斜切关卡：右侧两条带高光的斜切色带，可改色",
    category: "band",
    layer: { label: "光泽斜切", x: 156, y: -78, w: 1920, h: 1080, chrome: "glossy-slash", color: "#f50039" },
    preview: { x: 1350, y: 0, w: 570, h: 1080 },
  },
  {
    id: "focus-ring",
    name: "聚焦圆环",
    description: "总攻击：两道同心黑环压暗三成，中间夹一道亮缝",
    category: "geometry",
    layer: { label: "聚焦圆环", ...FULL, chrome: "focus-ring", color: "#000000" },
    preview: { x: 0, y: 0, w: 1920, h: 1080 },
  },
  {
    id: "wedge",
    name: "黑斜切",
    description: "斜切关卡：左下的斜切色块，可改色",
    category: "band",
    layer: { label: "黑斜切", x: 43, y: -499, w: 1920, h: 1080, chrome: "wedge", color: "#2a2a2a" },
    preview: { x: -260, y: 640, w: 680, h: 420 },
  },
  {
    id: "hex-badge",
    name: "六角栏目条",
    description: "干员前瞻分析：带箭头的六角栏目条，可改色",
    category: "band",
    layer: { label: "六角栏目条", x: 1286, y: 766, w: 430, h: 104, chrome: "hex-badge", color: "#125d9f" },
  },
  {
    id: "stage-bar",
    name: "投影色条",
    description: "四星无核：带硬投影的关卡色条，可改色",
    category: "band",
    layer: { label: "投影色条", x: 640, y: 600, w: 478, h: 156, chrome: "stage-bar", color: "#f3ead4" },
  },
  {
    id: "skew-tag",
    name: "斜切红标",
    description: "特种三人：倾斜的标签底，左侧带拖尾，可改色",
    category: "band",
    layer: { label: "斜切红标", x: 901, y: 475, w: 170, h: 38, chrome: "skew-tag", color: "#d92529" },
  },
  {
    id: "title-bar",
    name: "栏目底条",
    description: "明日方舟角色测评的深色栏目底条",
    category: "band",
    layer: { label: "栏目底条", x: 480, y: 470, w: 960, h: 140, fill: "#282828", color: "#282828" },
  },
  {
    id: "paper-band",
    name: "横向纸带",
    description: "低配模板的横向浅色纸带",
    category: "band",
    layer: { label: "横向纸带", x: 360, y: 390, w: 1200, h: 280, chrome: "paper", fill: "#f3eee4", color: "#f3eee4" },
  },
  {
    id: "torn-paper",
    behindArt: true,
    name: "撕纸",
    description: "四星无核：左上角的撕纸",
    category: "band",
    layer: { label: "撕纸", ...FULL, chrome: "torn-paper" },
    preview: { x: 0, y: 0, w: 640, h: 360 },
  },
  {
    id: "paper",
    name: "纸卡",
    description: "带阴影的浅色纸张底板",
    category: "band",
    layer: { label: "纸卡", x: 640, y: 150, w: 640, h: 780, chrome: "paper", fill: "#f3eee4", color: "#f3eee4" },
  },
  {
    id: "polaroid",
    name: "拍立得",
    description: "五星测评模板的倾斜拍立得",
    category: "band",
    kind: "polaroid",
    layer: { label: "拍立得", x: 640, y: 130, w: 640, h: 800, chrome: "paper", effect: "polaroid", fill: "#f3eee4", color: "#f3eee4" },
  },
  {
    id: "polaroid-back",
    name: "底层拍立得",
    description: "五星测评模板的倾斜底层纸卡",
    category: "band",
    layer: { label: "底层拍立得", x: 610, y: 130, w: 700, h: 860, chrome: "paper", fill: "#e6dfd2", color: "#e6dfd2", rotation: -9 },
  },
  {
    id: "accent-bar",
    name: "强调竖线",
    description: "五星测评期数旁的蓝色强调线",
    category: "band",
    layer: { label: "强调竖线", x: 240, y: 240, w: 8, h: 80, fill: "#007af5", color: "#007af5" },
  },
  {
    id: "divider",
    name: "分隔线",
    description: "无核论文模板使用的细分隔线",
    category: "band",
    layer: { label: "分隔线", x: 240, y: 240, w: 640, h: 4, fill: "#b8a6ff", color: "#b8a6ff" },
  },
  {
    id: "bar-accent",
    name: "色码条",
    description: "明日方舟角色测评的四色栏目边条",
    category: "band",
    layer: { label: "色码条", x: 240, y: 240, w: 18, h: 240, chrome: "bar-accent" },
  },
  {
    id: "bracket-l",
    name: "左括号",
    description: "明日方舟角色测评的粗线左括号",
    category: "band",
    layer: { label: "左括号", x: 240, y: 240, w: 100, h: 320, chrome: "bracket-l", color: "#fdfe3e" },
  },
  {
    id: "bracket-r",
    name: "右括号",
    description: "明日方舟角色测评的粗线右括号",
    category: "band",
    layer: { label: "右括号", x: 420, y: 240, w: 100, h: 320, chrome: "bracket-r", color: "#fdfe3e" },
  },
  {
    id: "yellow-dashes",
    name: "黄短线组",
    description: "明日方舟角色测评的错落黄色短线",
    category: "band",
    layer: { label: "黄短线组", x: 1120, y: 150, w: 580, h: 160, chrome: "yellow-dashes", color: "#fdfe3e" },
  },
];

const MARKS: DecorationPreset[] = [
  {
    id: "cc-triangle",
    name: "合约三角",
    description: "危机合约模板的空心三角标",
    category: "mark",
    layer: { label: "合约三角", x: 240, y: 240, w: 68, h: 68, chrome: "cc-triangle", color: "#f2f2f2" },
  },
  {
    id: "side-emblem",
    name: "侧边标",
    description: "肉鸽模板的细长侧标",
    category: "mark",
    layer: { label: "侧边标", x: 240, y: 240, w: 22, h: 118, chrome: "side-emblem", color: "#f3efe6" },
  },
  {
    id: "five-star",
    name: "五星标",
    description: "五星测评模板的星级标记",
    category: "mark",
    layer: { label: "五星标", x: 240, y: 240, w: 168, h: 20, chrome: "five-star", color: "#f4f0e8" },
  },
  {
    id: "sign-dots",
    name: "三点符号",
    description: "无核论文署名旁的蓝色短点",
    category: "mark",
    layer: { label: "三点符号", x: 240, y: 240, w: 47, h: 7, chrome: "sign-dots", color: "#4076ea" },
  },
  {
    id: "ornament-corner",
    name: "古典角花",
    description: "低配模板使用的公有领域角花",
    category: "mark",
    layer: { label: "古典角花", x: 240, y: 240, w: 180, h: 180, chrome: "ornament-corner", color: "#f3eee6" },
  },
  {
    id: "ornament-lace",
    name: "蕾丝卷草",
    description: "低配模板使用的公有领域卷草花边",
    category: "mark",
    layer: { label: "蕾丝卷草", x: 240, y: 240, w: 360, h: 180, chrome: "ornament-lace", color: "#f3eee6" },
  },
];

export const DECORATIONS: DecorationPreset[] = [
  ...ATMOSPHERE,
  ...TEMPLATE_WASHES,
  ...OPERATOR_PIECES,
  ...TEXTURES,
  ...GEOMETRY,
  ...BANDS,
  ...MARKS,
  ...ARK_DECORATIONS,
  ...CLASS_MARKS,
];

export function getDecoration(id: string): DecorationPreset | undefined {
  return DECORATIONS.find((item) => item.id === id);
}
