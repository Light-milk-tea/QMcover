/** 卫戍协议式 HUD 的两套固定配色：墨绿终端（暗底）和红白档案（白纸）。 */
export type HudTone = {
  /** 画布底色 */
  base: string;
  /** 方格线 */
  grid: string;
  gridOpacity: number;
  /** 粗圆环 */
  ring: string;
  ringOpacity: number;
  /** 刻度盘线条与数字 */
  dial: string;
  dialOpacity: number;
  /** 刻度数字的错位影子 */
  dialShadow: string;
  /** 主强调色：标签底、RHODES 条、标题副行 */
  accent: string;
  /** 深一档强调色：卡片外框、英文名 */
  accentDeep: string;
  /** 强调色块上的字 */
  accentInk: string;
  /** 卡片纸色、像素块里的浅色 */
  paper: string;
  /** 正文字色（白纸上为黑，暗底上为白） */
  ink: string;
  /** 次要灰字 */
  muted: string;
  /** 全幅扫描线 */
  scan: string;
  scanOpacity: number;
  /** 细框线 */
  frame: string;
  /** 斜纹块 */
  hatch: string;
};

/** 空白画布上的 HUD 装饰：图层颜色就是线色，其余沿用白纸版的透明度。 */
export function hudToneFromColor(color?: string): HudTone {
  if (!color) return RECORD_TONE;
  return { ...RECORD_TONE, grid: color, ring: color, dial: color, dialShadow: "transparent", scan: color };
}

/** 空白画布用的居中刻度盘。 */
export const HUD_DIAL_CENTERED = {
  cx: 960,
  cy: 540,
  r: 470,
  size: 34,
  tickInner: 414,
  tickOuter: 444,
  majorInner: 398,
  circles: [458, 386],
  small: [-18, -12, -6, 0, 6, 12, 18],
  smallR: 366,
  smallSize: 22,
};

/** 红白档案标题旁的「XXX ONLY」小标，跟英文名走。 */
export function garrisonOnlyText(signature: string) {
  return `${(signature.trim() || "OPERATOR").toUpperCase()} ONLY`;
}

export const TERMINAL_TONE: HudTone = {
  base: "#070b0a",
  grid: "#1f5a45",
  gridOpacity: 0.42,
  ring: "#1f7a5b",
  ringOpacity: 0.66,
  dial: "#2a8a68",
  dialOpacity: 0.62,
  dialShadow: "#0d3326",
  accent: "#36e2a0",
  accentDeep: "#1a6e51",
  accentInk: "#04261a",
  paper: "#f2fff9",
  ink: "#f6fffb",
  muted: "#6f8a80",
  scan: "#000000",
  scanOpacity: 0.24,
  frame: "#1f8a66",
  hatch: "#2c9e77",
};

export const RECORD_TONE: HudTone = {
  base: "#f3f3f1",
  grid: "#bdbdbd",
  gridOpacity: 0.55,
  ring: "#cdcdcb",
  ringOpacity: 0.72,
  dial: "#7d7d7d",
  dialOpacity: 0.78,
  dialShadow: "#d5d5d5",
  accent: "#e5362a",
  accentDeep: "#b0121a",
  accentInk: "#ffffff",
  paper: "#ffffff",
  ink: "#121212",
  muted: "#8a8a8a",
  scan: "#ffffff",
  scanOpacity: 0.42,
  frame: "#b8b8b8",
  hatch: "#bdbdbd",
};
