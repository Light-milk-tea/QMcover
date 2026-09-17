import { normalizeHex } from "../data/elements";

export const MATRIX_VIOLET = "#a468d6";
export const MATRIX_EMBER = "#d9735b";

const VIOLET_PALETTE = { accent: MATRIX_VIOLET, glow: "#9730f2", ink: "#cf68ee", depth: "#43205d", paper: "#fffaff", base: "#07151d", muted: "#604294" };
const EMBER_PALETTE = { accent: MATRIX_EMBER, glow: "#ff4522", ink: "#ef8259", depth: "#612d23", paper: "#fff4cf", base: "#18191b", muted: "#93413e" };

export type MatrixPalette = typeof VIOLET_PALETTE;

function parseRgb(hex: string): [number, number, number] {
  const value = hex.slice(1);
  return [0, 2, 4].map((i) => Number.parseInt(value.slice(i, i + 2), 16)) as [number, number, number];
}

function toHex(rgb: [number, number, number]): string {
  return `#${rgb.map((n) => Math.round(Math.min(255, Math.max(0, n))).toString(16).padStart(2, "0")).join("")}`;
}

function mix(a: [number, number, number], b: [number, number, number], t: number): [number, number, number] {
  return [0, 1, 2].map((i) => a[i] + (b[i] - a[i]) * t) as [number, number, number];
}

export function resolveMatrixAccent(colorway?: string): string {
  if (!colorway || colorway === "violet") return MATRIX_VIOLET;
  if (colorway === "ember") return MATRIX_EMBER;
  return normalizeHex(colorway) ?? MATRIX_VIOLET;
}

export function storeMatrixColorway(color?: string): string {
  const hex = resolveMatrixAccent(color);
  if (hex === MATRIX_VIOLET) return "violet";
  if (hex === MATRIX_EMBER) return "ember";
  return hex;
}

export function isMatrixEmber(colorway?: string): boolean {
  return storeMatrixColorway(colorway) === "ember";
}

export function isMatrixViolet(colorway?: string): boolean {
  return storeMatrixColorway(colorway) === "violet";
}

export function matrixPalette(colorway?: string): MatrixPalette {
  const accent = resolveMatrixAccent(colorway);
  if (accent === MATRIX_VIOLET) return VIOLET_PALETTE;
  if (accent === MATRIX_EMBER) return EMBER_PALETTE;
  const rgb = parseRgb(accent);
  const white: [number, number, number] = [255, 255, 255];
  const black: [number, number, number] = [0, 0, 0];
  const inkBase: [number, number, number] = [7, 21, 29];
  return {
    accent,
    glow: toHex(mix(rgb, white, .12)),
    ink: toHex(mix(rgb, white, .28)),
    depth: toHex(mix(rgb, black, .62)),
    paper: toHex(mix(white, rgb, .08)),
    base: toHex(mix(inkBase, rgb, .16)),
    muted: toHex(mix(rgb, black, .38)),
  };
}
