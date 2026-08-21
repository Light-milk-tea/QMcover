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

export const STORAGE_KEY = "qmcover-v3";
