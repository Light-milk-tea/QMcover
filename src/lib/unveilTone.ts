/** 紫幕爆炸框 / 红蓝黑卡：两套漫画舞台配色（参考图取色）。 */
export type StageTone = {
  base: string;
  deep: string;
  mid: string;
  light: string;
  edge: string;
  ink: string;
  cream: string;
  yellow: string;
  orange: string;
  red: string;
  redDeep: string;
  blue: string;
  tan: string;
  gray: string;
};

export const STAGE_TONE: StageTone = {
  base: "#4a266b",
  deep: "#24133a",
  mid: "#5d3589",
  light: "#7a59ab",
  edge: "#6d47bc",
  ink: "#0b070e",
  cream: "#f8e7ba",
  yellow: "#f5dc3b",
  orange: "#f39a24",
  red: "#e1203a",
  redDeep: "#851426",
  blue: "#5047cf",
  tan: "#c8a062",
  gray: "#9a8fa8",
};

export type BrushTone = {
  base: string;
  dusk: string;
  red: string;
  redDeep: string;
  blue: string;
  violet: string;
  cream: string;
  ink: string;
  neon: string;
  paper: string;
  muted: string;
};

export const BRUSH_TONE: BrushTone = {
  base: "#140d16",
  dusk: "#2b1a2a",
  red: "#e3173b",
  redDeep: "#7a0d27",
  blue: "#3a3fd6",
  violet: "#6a2a9e",
  cream: "#f6e6d2",
  ink: "#0c0a0d",
  neon: "#e5ff2e",
  paper: "#f4f1ea",
  muted: "#8d8790",
};
