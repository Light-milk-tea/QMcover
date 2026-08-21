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
];

export function fontClass(id?: CoverFontId): string {
  return COVER_FONTS.find((f) => f.id === id)?.className ?? "font-cn";
}

export const TEXT_COLORS: { id: string; label: string; value: string }[] = [
  { id: "white", label: "白", value: "#ffffff" },
  { id: "ivory", label: "米白", value: "#f4f0e8" },
  { id: "gold", label: "金", value: "#f3d36a" },
  { id: "red", label: "红", value: "#c41c1c" },
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
    { id: "operation", label: "行动", kind: "text", defaultFont: "cn" },
    { id: "cc-gold", label: "危机合约", kind: "text", defaultFont: "cn" },
    { id: "operation-en", label: "OPERATION", kind: "text", defaultFont: "display" },
    { id: "banner", label: "白底条", kind: "box" },
    { id: "sign", label: "署名", kind: "text", defaultFont: "display" },
    { id: "guide", label: "攻略类型", kind: "text", defaultFont: "cn" },
    { id: "slogan", label: "卖点句", kind: "text", defaultFont: "cn" },
  ],
  rogue: [
    { id: "operator", label: "立绘", kind: "image" },
    { id: "watermark", label: "IS 水印", kind: "text", defaultFont: "display" },
    { id: "theme", label: "主题", kind: "text", defaultFont: "cn" },
    { id: "red-tag", label: "红标", kind: "text", defaultFont: "cn" },
    { id: "cond", label: "条件", kind: "text", defaultFont: "cn" },
    { id: "node", label: "节点", kind: "text", defaultFont: "display" },
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
};
