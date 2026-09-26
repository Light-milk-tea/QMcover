import { normalizeHex } from "../data/elements";

export const BLUE_CUT_ACCENT = "#f50039";

function parseRgb(hex: string): [number, number, number] {
  const value = hex.slice(1);
  return [0, 2, 4].map((index) => Number.parseInt(value.slice(index, index + 2), 16)) as [number, number, number];
}

function toHex(rgb: [number, number, number]): string {
  return `#${rgb.map((channel) => Math.round(Math.min(255, Math.max(0, channel))).toString(16).padStart(2, "0")).join("")}`;
}

function mix(a: [number, number, number], b: [number, number, number], amount: number): [number, number, number] {
  return [0, 1, 2].map((index) => a[index] + (b[index] - a[index]) * amount) as [number, number, number];
}

export function blueCutAccent(colorway?: string): string {
  return normalizeHex(colorway ?? "") ?? BLUE_CUT_ACCENT;
}

export type BlueCutPalette = {
  accent: string;
  depth: string;
  gloss: string;
  glossSoft: string;
  fringe: string;
  en: string;
  enShadow: string;
  shadow: string;
};

export function blueCutPalette(colorway?: string): BlueCutPalette {
  const accent = blueCutAccent(colorway);
  const rgb = parseRgb(accent);
  const white: [number, number, number] = [255, 255, 255];
  const black: [number, number, number] = [0, 0, 0];
  return {
    accent,
    depth: toHex(mix(rgb, black, 0.72)),
    gloss: toHex(mix(rgb, white, 0.38)),
    glossSoft: toHex(mix(rgb, white, 0.52)),
    fringe: toHex(mix(rgb, white, 0.12)),
    en: toHex(mix(rgb, white, 0.64)),
    enShadow: toHex(mix(rgb, white, 0.2)),
    shadow: rgb.join(" "),
  };
}
