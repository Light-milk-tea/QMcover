import type { CoverFontId } from "../types";

/** 庆科黄油体是窄字，复古未来标题横向拉宽到参考里方块字的宽度。 */
export const RETRO_QINGKE_STRETCH = 1.25;

export const RETRO_TITLE_FONT: CoverFontId = "cn";
export const RETRO_TITLE_LEFT = 792;
export const RETRO_TITLE_TOP = 201;
const TITLE_RIGHT = 1872;
export const RETRO_TITLE_LEADING = 1.145;
/** 第二行比第一行右移约一个字，单位是画布上的字号。 */
export const RETRO_TITLE_INDENT = 1.12;

export type RetroTitleMetrics = {
  /** 横向拉宽倍数。 */
  stretch: number;
  /** 拉宽后每个字在画布上占几个字号宽。 */
  advance: number;
};

/** 思源黑体 Heavy 每字正好一个字号宽，和参考的方块字比例一致；庆科黄油体只有 0.77，要拉宽。 */
export function retroTitleMetrics(font?: CoverFontId): RetroTitleMetrics {
  if (font === "qingke") return { stretch: RETRO_QINGKE_STRETCH, advance: 0.77 * RETRO_QINGKE_STRETCH };
  return { stretch: 1, advance: 1 };
}

/** 回车分行，最多两行；单行五个字以上对半拆，前一行多一个字。 */
export function retroTitleLines(text: string): string[] {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length > 1) return lines.slice(0, 2);
  const single = lines[0] ?? "";
  if (single.length >= 5) {
    const cut = Math.ceil(single.length / 2);
    return [single.slice(0, cut), single.slice(cut)];
  }
  return lines;
}

/** 每行字宽（含第二行缩进），单位是字号。 */
export function retroLineWidths(lines: string[], advance = 1): number[] {
  return lines.map((line, i) => [...line].length * advance + (i > 0 ? RETRO_TITLE_INDENT : 0));
}

/** 最宽一行收进标题区右沿。 */
export function retroTitleSize(lines: string[], advance = 1): number {
  const widest = Math.max(1, ...retroLineWidths(lines, advance));
  return Math.max(96, Math.min(320, Math.floor((TITLE_RIGHT - RETRO_TITLE_LEFT) / widest)));
}
