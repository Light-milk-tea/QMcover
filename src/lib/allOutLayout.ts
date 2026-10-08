import type { CSSProperties } from "react";

const CJK = /[\u3400-\u9fff]/;

/** 两道同心环：hole 内是圆洞，hole–inner 是内环，inner–gap 是亮缝，gap–outer 是外环。 */
export type AllOutRings = {
  cx: number;
  cy: number;
  hole: number;
  inner: number;
  gap: number;
  outer: number;
};

export const ALL_OUT_RINGS: AllOutRings = { cx: 1426, cy: -104, hole: 890, inner: 1460, gap: 1492, outer: 1744 };

export const RING_RADIUS = { min: 240, max: 1500, default: ALL_OUT_RINGS.hole } as const;
export const RING_THICKNESS = { min: 80, max: 1100, default: ALL_OUT_RINGS.inner - ALL_OUT_RINGS.hole } as const;

/** 改圆洞半径和内环宽度；亮缝宽度不变，外环按原比例跟着内环变粗变细。 */
export function sizeRings(rings: AllOutRings, radius?: number, thickness?: number): AllOutRings {
  const innerWidth = rings.inner - rings.hole;
  const hole = radius ?? rings.hole;
  const width = thickness ?? innerWidth;
  const inner = hole + width;
  const gap = inner + (rings.gap - rings.inner);
  return { ...rings, hole, inner, gap, outer: gap + (width * (rings.outer - rings.gap)) / innerWidth };
}

/** 圆环图层经 translate(x, y) rotate(deg) 后的圆心；旋转绕画布中心。 */
export function placeRings(rings: AllOutRings, x = 0, y = 0, rotation = 0): AllOutRings {
  const rad = (rotation * Math.PI) / 180;
  const dx = rings.cx - 960;
  const dy = rings.cy - 540;
  return {
    ...rings,
    cx: 960 + dx * Math.cos(rad) - dy * Math.sin(rad) + x,
    cy: 540 + dx * Math.sin(rad) + dy * Math.cos(rad) + y,
  };
}

export function ringBands(rings: AllOutRings): { r: number; width: number }[] {
  return [
    { r: (rings.hole + rings.inner) / 2, width: rings.inner - rings.hole },
    { r: (rings.gap + rings.outer) / 2, width: rings.outer - rings.gap },
  ];
}

export function inRing(rings: AllOutRings, x: number, y: number): boolean {
  const d = Math.hypot(x - rings.cx, y - rings.cy);
  return (d > rings.hole && d < rings.inner) || (d > rings.gap && d < rings.outer);
}

/** 圆环选区，用作 mask：整张画布坐标，只在两道环里不透明。 */
export function ringMaskStyle(rings: AllOutRings): CSSProperties {
  const circles = ringBands(rings)
    .map(({ r, width }) => `<circle cx="${rings.cx}" cy="${rings.cy}" r="${r}" fill="none" stroke="#000" stroke-width="${width}"/>`)
    .join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="1920" height="1080">${circles}</svg>`;
  const url = `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
  return {
    WebkitMaskImage: url,
    maskImage: url,
    WebkitMaskSize: "100% 100%",
    maskSize: "100% 100%",
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
  };
}

export function allOutHasCjk(text: string): boolean {
  return CJK.test(text);
}

/** 台词拆行：手动换行照拆；否则中文按两三字一行，英文按词贪心排，一行不超过 7 个字符。 */
export function allOutLines(text: string): string[] {
  const raw = text.replace(/\r/g, "").trim();
  if (!raw) return [];
  if (raw.includes("\n")) return raw.split("\n").map((line) => line.trim()).filter(Boolean).slice(0, 5);
  if (CJK.test(raw) && !/\s/.test(raw)) {
    const chars = [...raw];
    if (chars.length <= 3) return [raw];
    const size = chars.length <= 8 ? 2 : Math.ceil(chars.length / 4);
    const lines: string[] = [];
    for (let i = 0; i < chars.length; i += size) lines.push(chars.slice(i, i + size).join(""));
    return lines.slice(0, 5);
  }
  const words = raw.split(/\s+/);
  const limit = Math.max(7, ...words.map((word) => [...word].length));
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    if (!line) line = word;
    else if ([...`${line} ${word}`].length <= limit) line = `${line} ${word}`;
    else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 5);
}

const HANGING = /[.,!?。，！？]+$/;

/** 行尾标点挂在对齐线外，参考图 “DUSTED.” 的句点就伸出右缘。 */
export function splitHanging(line: string): [string, string] {
  const match = line.match(HANGING);
  return match ? [line.slice(0, match.index), match[0]] : [line, ""];
}

/** Outfit Black 大写的大致字宽（em），已扣掉台词字距；行尾悬挂标点不计。 */
function quoteUnits(line: string): number {
  let width = 0;
  const [body] = splitHanging(line);
  for (const ch of body.toUpperCase()) {
    if (CJK.test(ch)) width += 1;
    else if (ch === " ") width += 0.35;
    else if (/[.,!'’:;]/.test(ch)) width += 0.28;
    else if (ch === "I") width += 0.32;
    else if (/[MW]/.test(ch)) width += 0.95;
    else if (/[EFLTSJ]/.test(ch)) width += 0.59;
    else if (/[0-9]/.test(ch)) width += 0.57;
    else width += 0.72;
    width += QUOTE_TRACKING;
  }
  return Math.max(width, 0.6);
}

export const QUOTE_RIGHT = 670;
const QUOTE_WIDTH = 600;
const QUOTE_HEIGHT = 440;
/** 参考图行距约为大写高的 1.04 倍；Outfit 大写高 0.7em。 */
export const QUOTE_LEADING = 0.74;
/** 参考图字距约 −0.045em，字母几乎贴在一起。 */
export const QUOTE_TRACKING = -0.045;

export function allOutQuoteSize(lines: string[]): number {
  if (lines.length === 0) return 140;
  const widest = Math.max(...lines.map(quoteUnits));
  const byWidth = Math.floor(QUOTE_WIDTH / widest);
  const byHeight = Math.floor(QUOTE_HEIGHT / (lines.length * QUOTE_LEADING));
  return Math.max(56, Math.min(200, byWidth, byHeight));
}

/** 背景大字：手动换行照拆（最多三行），否则按空格对半成两行。 */
export function allOutGroundLines(text: string): string[] {
  const raw = text.replace(/\r/g, "").trim();
  if (!raw) return [];
  if (raw.includes("\n")) return raw.split("\n").map((line) => line.trim()).filter(Boolean).slice(0, 3);
  const words = raw.split(/\s+/);
  if (words.length < 2) return [raw];
  const half = Math.ceil(words.length / 2);
  return [words.slice(0, half).join(" "), words.slice(half).join(" ")];
}

/** 背景字用 Anton 顶替 Triumvirate CG Inserat：窄粗黑，大写约 0.44em，大写高 0.86em。 */
export const GROUND_LEADING = 0.92;

export function allOutGroundSize(lines: string[]): number {
  if (lines.length === 0) return 380;
  const units = Math.max(
    ...lines.map((line) => {
      let width = 0;
      for (const ch of line) width += CJK.test(ch) ? 1 : ch === " " ? 0.23 : 0.44;
      return Math.max(width, 0.44);
    }),
  );
  return Math.max(180, Math.min(400, Math.floor(1400 / units)));
}

/** 颜色叠加 · 滤色：对固定颜色 c，out = in × (1 − a·c) + a·c，逐通道线性，透明区不变。 */
export function screenTintMatrix(hex: string, amount = 0.75): string {
  const value = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => Number.parseInt(value.slice(i, i + 2), 16) / 255);
  const row = (c: number, index: number) => {
    const cells = [0, 0, 0, 0];
    cells[index] = 1 - amount * c;
    return [...cells, amount * c].map((n) => n.toFixed(4)).join(" ");
  };
  return [row(r, 0), row(g, 1), row(b, 2), "0 0 0 1 0"].join(" ");
}
