import { artUrl, preferredArt, type Operator } from "../data/arts";
import { normalizeHex } from "../data/elements";
import type { ImageLayer } from "../types";

export const MODULE_COLUMN_COUNT = 4;
export const MODULE_COLUMN_W = 1920 / MODULE_COLUMN_COUNT;
export const MODULE_YELLOW = "#fedd00";
/** 四栏默认代表色：红、紫、蓝、橙，对应四位默认干员。 */
export const MODULE_TONES = ["#b8142c", "#a12ee0", "#3038dc", "#e4522a"] as const;

/** 立绘槽比栏宽，方图先铺到 1080 见方再放大；栏本身裁掉两侧。 */
export const MODULE_SLOT_W = 1080;
/**
 * 偏移为 0 时按常见立绘取景：精一的头约在图高 15%，放大后取半身、脸落在 UNIT 下沿；
 * 精二多是带场景的大图，头约在图高 40%，放大后脸铺满栏顶。
 */
export const MODULE_FRONT_SCALE = 230;
export const MODULE_FRONT_ORIGIN = "50% 5%";
export const MODULE_BACK_SCALE = 360;
export const MODULE_BACK_ORIGIN = "50% 50%";

export type ModuleColumnIds = {
  tone: string;
  back: string;
  unit: string;
  front: string;
  badge: string;
};

/** 第一栏精一沿用 `operator`，编辑栏换干员、上传、缩放都落在它身上。 */
export function moduleColumnIds(index: number): ModuleColumnIds {
  const n = index + 1;
  return {
    tone: `tone-${n}`,
    back: `back-${n}`,
    unit: `unit-${n}`,
    front: n === 1 ? "operator" : `front-${n}`,
    badge: `badge-${n}`,
  };
}

export const MODULE_COLUMNS = Array.from({ length: MODULE_COLUMN_COUNT }, (_, index) => moduleColumnIds(index));

/** 选中的是第几栏的精一；不是精一时返回 -1。 */
export function moduleFrontColumn(layerId: string): number {
  return MODULE_COLUMNS.findIndex((ids) => ids.front === layerId);
}

export function moduleBackColumn(layerId: string): number {
  return MODULE_COLUMNS.findIndex((ids) => ids.back === layerId);
}

/** 精一换人时，同栏精二跟着换成这位干员的精二立绘，并回到默认取景。 */
export function moduleBackFollow(op: Operator): Partial<ImageLayer> {
  const art = preferredArt(op);
  return {
    source: "operator",
    operatorId: op.id,
    artId: art.id,
    imageUrl: artUrl(art.id),
    imageDataUrl: "",
    scale: MODULE_BACK_SCALE,
    imageX: 0,
    imageY: 0,
  };
}

type Rgb = [number, number, number];

function parseRgb(hex: string): Rgb {
  const value = hex.slice(1);
  return [0, 2, 4].map((index) => Number.parseInt(value.slice(index, index + 2), 16)) as Rgb;
}

function toHex(rgb: Rgb): string {
  return `#${rgb.map((channel) => Math.round(Math.min(255, Math.max(0, channel))).toString(16).padStart(2, "0")).join("")}`;
}

function mix(a: Rgb, b: Rgb, amount: number): Rgb {
  return [0, 1, 2].map((index) => a[index] + (b[index] - a[index]) * amount) as Rgb;
}

export function moduleTone(index: number, color?: string): string {
  return normalizeHex(color ?? "") ?? MODULE_TONES[index % MODULE_TONES.length];
}

const LUMA = [0.2126, 0.7152, 0.0722];

/** 映射前先拉开明度：线稿和头发压到黑，皮肤和高光顶到代表色，和参考成图一样硬。 */
const MAP_GAIN = 1.3;
const MAP_LIFT = -0.18;

/** 渐变映射（黑 → 代表色）：先取明度并加对比，再按代表色三通道放大。 */
export function gradientMapMatrix(tone: string): string {
  const rows = parseRgb(tone).map((channel) => {
    const k = channel / 255;
    return `${LUMA.map((weight) => (weight * MAP_GAIN * k).toFixed(4)).join(" ")} 0 ${(MAP_LIFT * k).toFixed(4)}`;
  });
  return [...rows, "0 0 0 1 0"].join(" ");
}

/**
 * 视频最后盖在全部立绘上的「废土搭配」：自然饱和度 +35、饱和度 −15，再加对比度 +30。
 * 色彩平衡那层青红、洋红绿、黄蓝都是 +8 且保留明度，三项抵消，不做。
 * 精二的映射、代表色和大字颜色是照着调完色的成图取的，这一层只叠在精一上。
 */
const GRADE_VIBRANCE = 0.35;
const GRADE_SATURATION = -0.15;
const GRADE_CONTRAST = 0.3;

/** 自然饱和度按像素色度（max − min）在两档之间插值：灰调提到 LIFT，纯色只剩 TAME。 */
export const MODULE_GRADE_TAME = 1 + GRADE_SATURATION;
export const MODULE_GRADE_LIFT = MODULE_GRADE_TAME * (1 + GRADE_VIBRANCE);

function saturateRows(amount: number): number[][] {
  return [0, 1, 2].map((row) => LUMA.map((weight, col) => weight * (1 - amount) + (row === col ? amount : 0)));
}

/** 饱和度矩阵，倍数可以大于 1。 */
export function saturateMatrix(amount: number): string {
  return [...saturateRows(amount).map((row) => `${row.map((v) => v.toFixed(4)).join(" ")} 0 0`), "0 0 0 1 0"].join(" ");
}

/** 新版「亮度/对比度」不截断：中间调斜率 1.3，两端放缓到 0.7，黑白点不动。 */
function contrastCurve(x: number): number {
  return x - (GRADE_CONTRAST / (2 * Math.PI)) * Math.sin(2 * Math.PI * x);
}

export const MODULE_GRADE_CURVE = Array.from({ length: 17 }, (_, i) => contrastCurve(i / 16).toFixed(4)).join(" ");

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

/** 和精一滤镜同一套算法，返回 0–255。 */
export function moduleGradePixel(hex: string): Rgb {
  const rgb = parseRgb(hex).map((channel) => channel / 255);
  const chroma = Math.max(...rgb) - Math.min(...rgb);
  const saturate = (amount: number) =>
    saturateRows(amount).map((row) => clamp01(row.reduce((sum, weight, col) => sum + weight * rgb[col], 0)));
  const tame = saturate(MODULE_GRADE_TAME);
  const lift = saturate(MODULE_GRADE_LIFT);
  return [0, 1, 2].map((i) => contrastCurve(clamp01(chroma * tame[i] + (1 - chroma) * lift[i])) * 255) as Rgb;
}

/** UNIT 要比精二的代表色亮一档，但不能提到白。 */
export function moduleUnitColor(tone: string): string {
  return toHex(mix(parseRgb(tone), [255, 255, 255], 0.14));
}

function glyphUnits(text: string): number {
  return [...text].reduce((sum, ch) => {
    const code = ch.codePointAt(0) ?? 0;
    if (code >= 0x2e80) return sum + 1;
    if (ch === " ") return sum + 0.28;
    return sum + 0.6;
  }, 0);
}

export const MODULE_TITLE_MAX = 240;
/** 期号字号比中文略大，数字才和参考成图一样高（约为中文字身的 87%）。 */
export const MODULE_EPISODE_SCALE = 1.15;
const MODULE_TITLE_ROOM = 1480;
/** 括号、标题与期号之间的空当，按字号算的总宽。 */
const MODULE_TITLE_CHROME = 0.62;

/** 四字 + 期号时 240px，和参考成图一致；字多了整行等比缩小，括号始终留在画布内。 */
export function moduleTitleSize(title: string, episode: string): number {
  const units = glyphUnits(title.trim()) + glyphUnits(episode.trim()) * MODULE_EPISODE_SCALE + MODULE_TITLE_CHROME;
  return Math.min(MODULE_TITLE_MAX, Math.floor(MODULE_TITLE_ROOM / Math.max(units, 1)));
}
