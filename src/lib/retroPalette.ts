import { normalizeHex } from "../data/elements";

/** 默认主题色就是参考图天空的中段青蓝，选它时画面和原版一模一样。 */
export const RETRO_THEME = "#5a9ab4";

type Hsl = [number, number, number];

function toHsl(hex: string): Hsl {
  const [r, g, b] = [1, 3, 5].map((i) => Number.parseInt(hex.slice(i, i + 2), 16) / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return [0, 0, l];
  const s = d / (1 - Math.abs(2 * l - 1));
  const h = max === r ? ((g - b) / d + 6) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h * 60, s, l];
}

function fromHsl([h, s, l]: Hsl): string {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  const [r, g, b] =
    h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return `#${[r, g, b].map((v) => Math.round(Math.min(1, Math.max(0, v + m)) * 255).toString(16).padStart(2, "0")).join("")}`;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export function retroTheme(colorway?: string): string {
  return normalizeHex(colorway ?? "") ?? RETRO_THEME;
}

/**
 * 默认配色分四族：天空跟主题色的色相、饱和度和明度走；橄榄一族（长三角、描边、侧面）跟天空转同样的色相；
 * 夕阳暖色一族保持暖调，只在主题本身是暖色时往旁边让开；奶油色固定，标题始终读得清。
 */
const SKY = {
  skyTop: "#7cbccb",
  skyMid: "#5a9ab4",
  skyLow: "#3c6a91",
  glow: "#d9eef0",
  halo: "#bfe9ef",
  haloMid: "#a9dfe8",
  haloRim: "#dff6f6",
  moon: "#d3e9ec",
  scan: "#0d2233",
  starTail: "#6fa79a",
};

const INK = {
  pennant: "#8fae5f",
  pennantLow: "#6c8b43",
  pennantShade: "#4f5f2a",
  titleLine: "#4f5c25",
  titleSide: "#738240",
  artEdge: "#7f8640",
  tagEdge: "#5f6a2c",
};

const WARM = {
  sunsetMid: "#f6c07c",
  sunsetEdge: "#ef9a52",
  band: "#f19a45",
  bandLow: "#f2ad62",
  bandLight: "#f8dca4",
  streak: "#f1a85a",
  streakLow: "#f2a052",
  haze: "#f6b46c",
  hazeEdge: "#f19a52",
  hazeRect: "#f3a865",
  flare: "#f2a24e",
  planet: "#b98984",
  ballHi: "#ff6a45",
  ball: "#e3361f",
  ballLow: "#a71c12",
  star: "#f45c52",
  starMid: "#ec4f45",
  wedge: "#c8241c",
  wedgeHi: "#f0503f",
  dotEdge: "#8a2f22",
  tag: "#ea5a4b",
};

const FIXED = {
  sunset: "#fdebc4",
  cloud: "#f4f7f8",
  ring: "#f4f7f8",
  ringLow: "#c9d3da",
  ballSpot: "#f4f1ea",
  rays: "#e9e26c",
  pennantRim: "#f1e3b0",
  sparkle: "#f3f1f6",
  dot: "#fbedcf",
  titleFace: "#fff6dc",
  titleLower: "#f6dc94",
  titleRim: "#f5dfa8",
  artRim: "#f4e8bf",
  tagRim: "#fbedc9",
};

type Keys = keyof typeof SKY | keyof typeof INK | keyof typeof WARM | keyof typeof FIXED;
export type RetroPalette = { theme: string } & Record<Keys, string>;

export const RETRO_DEFAULT_PALETTE: RetroPalette = { theme: RETRO_THEME, ...SKY, ...INK, ...WARM, ...FIXED };

/** 暖色一族的中心色相（橙）。主题色离它不到这么多度时，暖色往反方向让开。 */
const WARM_HUE = 25;
const WARM_GAP = 50;

function mapFamily<T extends Record<string, string>>(family: T, fn: (hsl: Hsl) => Hsl): T {
  return Object.fromEntries(Object.entries(family).map(([key, hex]) => [key, fromHsl(fn(toHsl(hex)))])) as T;
}

const wrap = (deg: number) => ((deg % 360) + 360) % 360;

export function retroPalette(colorway?: string): RetroPalette {
  const theme = retroTheme(colorway);
  if (theme === RETRO_THEME) return RETRO_DEFAULT_PALETTE;
  const [h0, s0, l0] = toHsl(RETRO_THEME);
  const [h, s, l] = toHsl(theme);
  const turn = s < 0.04 ? 0 : h - h0;
  const satScale = s / s0;
  const lift = clamp(l - l0, -0.28, 0.2);
  const fromWarm = wrap(h - WARM_HUE + 180) - 180;
  const push = s >= 0.25 && Math.abs(fromWarm) < WARM_GAP ? -(Math.sign(fromWarm) || 1) * (WARM_GAP - Math.abs(fromWarm)) : 0;

  const sky = mapFamily(SKY, ([ch, cs, cl]) => {
    const weight = 1 - clamp((cl - 0.5) / 0.4, 0, 1) * 0.7;
    return [wrap(ch + turn), clamp(cs * satScale, 0, 1), clamp(cl + lift * weight, 0.04, 0.96)];
  });
  const ink = mapFamily(INK, ([ch, cs, cl]) => [wrap(ch + turn), cs, cl]);
  const warm = push ? mapFamily(WARM, ([ch, cs, cl]) => [wrap(ch + push), cs, cl]) : WARM;
  return { theme, ...sky, skyMid: theme, ...ink, ...warm, ...FIXED };
}

/** 编辑器里给常见干员主色的一键预设，第一项是原版。 */
export const RETRO_THEME_PRESETS: { id: string; label: string; value: string }[] = [
  { id: "sky", label: "天青（原版）", value: RETRO_THEME },
  { id: "sakura", label: "樱粉", value: "#d77a9c" },
  { id: "dusk", label: "暮紫", value: "#7b67b8" },
  { id: "mint", label: "薄荷", value: "#4fa88c" },
  { id: "ember", label: "炽红", value: "#c4544a" },
  { id: "amber", label: "琥珀", value: "#c8973f" },
  { id: "night", label: "夜蓝", value: "#2f4f7f" },
];
