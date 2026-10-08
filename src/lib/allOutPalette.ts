import { normalizeHex } from "../data/elements";

export const ALL_OUT_ACCENT = "#22ccf2";

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

export function allOutAccent(colorway?: string): string {
  return normalizeHex(colorway ?? "") ?? ALL_OUT_ACCENT;
}

export type AllOutPalette = {
  base: string;
  ink: string;
  outline: string;
};

/** 主题色就是底色。实心背景字压到接近黑，描边比实心亮一档。 */
export function allOutPalette(colorway?: string): AllOutPalette {
  const base = allOutAccent(colorway);
  const rgb = parseRgb(base);
  const black: [number, number, number] = [0, 0, 0];
  return {
    base,
    ink: toHex(mix(rgb, black, 0.86)),
    outline: toHex(mix(rgb, black, 0.62)),
  };
}
