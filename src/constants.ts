/** B 站视频封面按 16:9 展示，导出按 1920x1080 */
export const BILI_COVER = {
  width: 1920,
  height: 1080,
} as const;

/**
 * 安全区：避开卡片裁切、时长角标（右下）、标题叠字。
 * 重要文字和干员脸不要压到这个框外面。
 */
export const BILI_SAFE = {
  top: 72,
  right: 88,
  bottom: 108,
  left: 88,
} as const;

export const STORAGE_KEY = "qmcover-v4";
export const LEGACY_STORAGE_KEY = "qmcover-v3";
export const TEMPLATES_STORAGE_KEY = "qmcover-templates-v1";

export const BLANK_TEMPLATE_ID = "blank";
export const CUSTOM_TEMPLATE_PREFIX = "c-";

export const BUILTIN_TEMPLATE_IDS = [
  "firstkill",
  "lowspec",
  "rogue",
  "madness",
  "nocore",
  "endfield",
  "specialist",
  "operator-preview",
  "fourstar-nocore",
  "solo",
] as const;

/** 立绘缩放滑条范围。上限要能罩住全身立绘（如丰川祥子精英 0）。 */
export const IMAGE_SCALE_MIN = 40;
export const IMAGE_SCALE_MAX = 350;

export const SHAFT_LIGHT_DEFAULT = 52;
export const SHAFT_LIGHT_X_DEFAULT = 54;
export const SHAFT_LIGHT_Y_DEFAULT = 6;
export const SHAFT_LIGHT_ROTATE_DEFAULT = 8;

/** 立绘四边虚化宽度，单位是立绘盒子的百分比。 */
export const IMAGE_EDGE_FADE_MIN = 6;
export const IMAGE_EDGE_FADE_MAX = 36;
export const IMAGE_EDGE_FADE_DEFAULT = 16;

export const STAGE_BAR_WIDTH_DEFAULT = 478;
export const STAGE_BAR_WIDTH_MIN = 280;
export const STAGE_BAR_WIDTH_MAX = 1400;
