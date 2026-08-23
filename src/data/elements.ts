import type { CoverFontId, ElementKind, TemplateId } from "../types";

export type CoverElMeta = {
  id: string;
  label: string;
  kind: ElementKind;
  defaultFont?: CoverFontId;
  hasOpacity?: boolean;
  defaultOpacity?: number;
};

export const COVER_FONTS: { id: CoverFontId; label: string; className: string }[] = [
  { id: "cn", label: "思源黑体", className: "font-cn" },
  { id: "display", label: "Oswald", className: "font-display" },
  { id: "sans", label: "系统黑体", className: "font-sans" },
  { id: "serif", label: "思源宋体", className: "font-serif" },
];

export function fontClass(id?: CoverFontId): string {
  return COVER_FONTS.find((f) => f.id === id)?.className ?? "font-cn";
}

export const TEXT_COLORS: { id: string; label: string; value: string }[] = [
  { id: "white", label: "白", value: "#ffffff" },
  { id: "ivory", label: "米白", value: "#f4f0e8" },
  { id: "paper", label: "纸色", value: "#f3eee4" },
  { id: "gold", label: "金", value: "#f4d06f" },
  { id: "yellow", label: "黄", value: "#e8b400" },
  { id: "orange", label: "橙", value: "#e3943a" },
  { id: "lavender", label: "紫", value: "#b8a6ff" },
  { id: "red", label: "红", value: "#c41c1c" },
  { id: "blue", label: "蓝", value: "#1d4ed8" },
  { id: "gray", label: "灰", value: "#c8c8c8" },
  { id: "black", label: "黑", value: "#141618" },
];

export function normalizeHex(raw: string): string | undefined {
  const t = raw.trim();
  if (!t) return undefined;
  const m = t.match(/^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);
  if (!m) return undefined;
  let hex = m[1];
  if (hex.length === 3) hex = [...hex].map((c) => c + c).join("");
  return `#${hex.toLowerCase()}`;
}

export const TEMPLATE_ELEMENTS: Record<TemplateId, CoverElMeta[]> = {
  firstkill: [
    { id: "operator", label: "立绘", kind: "image" },
    { id: "stage", label: "地图名", kind: "text", defaultFont: "cn" },
    { id: "subtitle", label: "副标题", kind: "text", defaultFont: "cn" },
    { id: "level-label", label: "危机等级", kind: "text", defaultFont: "cn" },
    { id: "level", label: "等级数字", kind: "text", defaultFont: "display" },
    { id: "cc-en", label: "CONTINGENCY", kind: "text", defaultFont: "display" },
    { id: "operation", label: "行动名", kind: "text", defaultFont: "cn" },
    { id: "cc-cn", label: "危机合约", kind: "text", defaultFont: "cn" },
  ],
  lowspec: [
    { id: "operator", label: "立绘", kind: "image" },
    { id: "operation", label: "行动", kind: "text", defaultFont: "serif" },
    { id: "operation-sub", label: "活动后缀", kind: "text", defaultFont: "serif" },
    { id: "cc-gold", label: "活动标", kind: "text", defaultFont: "cn" },
    { id: "operation-en", label: "OPERATION", kind: "text", defaultFont: "display" },
    { id: "banner", label: "白底条", kind: "box" },
    { id: "sign", label: "署名", kind: "text", defaultFont: "display" },
    { id: "guide", label: "攻略类型", kind: "text", defaultFont: "serif" },
    { id: "slogan", label: "卖点句", kind: "text", defaultFont: "serif" },
  ],
  rogue: [
    { id: "operator", label: "立绘", kind: "image" },
    { id: "watermark", label: "ISW-NO 上", kind: "text", defaultFont: "serif" },
    { id: "watermark-flip", label: "ISW-NO 下", kind: "text", defaultFont: "serif" },
    { id: "theme", label: "主题", kind: "text", defaultFont: "serif" },
    { id: "red-tag", label: "红标", kind: "text", defaultFont: "cn" },
    { id: "cond", label: "条件", kind: "text", defaultFont: "serif" },
    { id: "node", label: "节点", kind: "text", defaultFont: "display" },
    { id: "emblem", label: "侧标", kind: "box" },
  ],
  madness: [
    { id: "vignette", label: "暗角", kind: "box", hasOpacity: true, defaultOpacity: 70 },
    { id: "operator", label: "立绘", kind: "image" },
    { id: "polaroid", label: "拍立得", kind: "box" },
    { id: "episode", label: "期数", kind: "text", defaultFont: "cn" },
    { id: "series", label: "栏目名", kind: "text", defaultFont: "cn" },
    { id: "series-accent", label: "之癫", kind: "text", defaultFont: "cn" },
    { id: "chapter", label: "干员篇", kind: "text", defaultFont: "cn" },
    { id: "subtitle", label: "副标题", kind: "text", defaultFont: "cn" },
    { id: "en-tag", label: "英文标", kind: "text", defaultFont: "display" },
    { id: "en-name", label: "英文名", kind: "text", defaultFont: "display" },
  ],
  nocore: [
    { id: "operator", label: "立绘", kind: "image" },
    { id: "stage", label: "关卡", kind: "text", defaultFont: "cn" },
    { id: "line", label: "分隔线", kind: "box" },
    { id: "limit", label: "限制", kind: "text", defaultFont: "cn" },
    { id: "sign", label: "署名", kind: "text", defaultFont: "cn" },
  ],
};
