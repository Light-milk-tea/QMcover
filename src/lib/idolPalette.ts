import { normalizeHex } from "../data/elements";

/** 参考图纸色，取四角空处中位。 */
export const IDOL_BASE = "#f9e5e2";
/** 两行粗黑字。 */
export const IDOL_INK = "#1c1614";
/** 主标题棕红，色值取参考图标题。 */
export const IDOL_TITLE = "#a33c16";
/** 空心字渐变的中段洋红。用户改色时整字改成这一色，不再走渐变。 */
export const IDOL_STROKE = "#9a206e";
/** 手写小字亮橙（采样自参考图手写笔迹）。 */
export const IDOL_SCRIPT = "#f7a43c";

export function idolBase(colorway?: string): string {
  return normalizeHex(colorway ?? "") ?? IDOL_BASE;
}