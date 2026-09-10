import { findOperatorByName } from "./arts";
import type { BuiltinTemplateId, CoverFontId, Draft, ElementKind, ElementOverride, TextBind } from "../types";

export type CoverElMeta = {
  id: string;
  label: string;
  kind: ElementKind;
  defaultFont?: CoverFontId;
  hasOpacity?: boolean;
  defaultOpacity?: number;
  hasColor?: boolean;
  hasWidth?: boolean;
  textBind?: Exclude<TextBind, "custom">;
  textDefault?: string;
};

export function elementText(
  styles: Record<string, ElementOverride> | undefined,
  id: string,
  fallback: string,
): string {
  const override = styles?.[id]?.text;
  return override !== undefined ? override : fallback;
}

export function nativeTextValue(
  templateId: string,
  meta: CoverElMeta,
  draft: Draft,
  style: ElementOverride,
): string {
  if (meta.textBind === "title") return draft.title;
  if (meta.textBind === "subtitle") return draft.subtitle;
  if (meta.textBind === "signature") return draft.signature;
  if (meta.textBind === "mark") return draft.mark ?? "";
  if (meta.textBind === "operatorName") return draft.operatorName;
  if (meta.textBind === "episode") return String(draft.episode);
  if (style.text !== undefined) return style.text;
  if (templateId === "madness" && meta.id === "chapter") {
    return `${draft.title.trim() || draft.operatorName.trim() || "干员"}篇`;
  }
  if (templateId === "madness" && meta.id === "en-name") {
    const name = draft.title.trim() || draft.operatorName.trim();
    return findOperatorByName(name)?.nameEn || findOperatorByName(draft.operatorName)?.nameEn || "";
  }
  if (templateId === "madness" && meta.id === "episode") {
    return `第${draft.episode || 1}期`;
  }
  if (templateId === "rogue" && meta.id === "node") {
    return `N${draft.episode || 15}`;
  }
  if (templateId === "lowspec" && meta.id === "operation-sub") {
    const title = draft.title.trim() || "行动";
    const i = title.indexOf("的");
    return i > 0 && i < title.length - 1 ? title.slice(i) : "";
  }
  return meta.textDefault ?? "";
}

export const COVER_FONTS: { id: CoverFontId; label: string; className: string }[] = [
  { id: "cn", label: "思源黑体", className: "font-cn" },
  { id: "display", label: "Oswald", className: "font-display" },
  { id: "sans", label: "系统黑体", className: "font-sans" },
  { id: "serif", label: "思源宋体", className: "font-serif" },
  { id: "script", label: "花体", className: "font-script" },
  { id: "serif-regular", label: "思源宋体 · 常规", className: "cover-font-preset cover-font-serif-regular" },
  { id: "serif-medium", label: "思源宋体 · 中等", className: "cover-font-preset cover-font-serif-medium" },
  { id: "cn-regular", label: "思源黑体 · 常规", className: "cover-font-preset cover-font-cn-regular" },
  { id: "wenkai", label: "霞鹜文楷", className: "cover-font-preset cover-font-wenkai" },
  { id: "xiaowei", label: "站酷小薇体", className: "cover-font-preset cover-font-xiaowei" },
  { id: "mashan", label: "马善政楷书", className: "cover-font-preset cover-font-mashan" },
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
  { id: "lemon", label: "柠黄", value: "#fdfe3e" },
  { id: "orange", label: "橙", value: "#e3943a" },
  { id: "lavender", label: "紫", value: "#b8a6ff" },
  { id: "violet", label: "堇", value: "#b080e0" },
  { id: "red", label: "红", value: "#c41c1c" },
  { id: "blue", label: "蓝", value: "#1d4ed8" },
  { id: "cyan", label: "青", value: "#00bcf5" },
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

export function nativeTemplateId(templateId: string, canvasSkin?: string): BuiltinTemplateId | undefined {
  if (templateId in TEMPLATE_ELEMENTS) return templateId as BuiltinTemplateId;
  if (canvasSkin && canvasSkin in TEMPLATE_ELEMENTS) return canvasSkin as BuiltinTemplateId;
  return undefined;
}

export function isNativeElement(templateId: string, id: string, canvasSkin?: string): boolean {
  const key = nativeTemplateId(templateId, canvasSkin);
  if (!key) return false;
  return TEMPLATE_ELEMENTS[key].some((el) => el.id === id);
}

export const TEMPLATE_ELEMENTS: Record<BuiltinTemplateId, CoverElMeta[]> = {
  "six-vanguard": [
    { id: "echo", label: "灰色人物叠影", kind: "box", hasOpacity: true, defaultOpacity: 100 },
    { id: "geometry", label: "斜框与三角纹", kind: "box", hasOpacity: true, defaultOpacity: 100 },
    { id: "edge-type-top", label: "顶部虚焦字", kind: "text", defaultFont: "sans", textDefault: "PIONEER", hasOpacity: true, defaultOpacity: 48 },
    { id: "edge-type-bottom", label: "底部虚焦字", kind: "text", defaultFont: "sans", textDefault: "VANGUARD", hasOpacity: true, defaultOpacity: 50 },
    { id: "gold-rule", label: "金色斜线", kind: "box", hasColor: true },
    { id: "flecks", label: "纸面白点", kind: "box", hasOpacity: true, defaultOpacity: 100 },
    { id: "operator", label: "立绘", kind: "image" },
    { id: "halftone", label: "网点纸纹", kind: "box", hasOpacity: true, defaultOpacity: 100 },
    { id: "mark-bg", label: "红标底色", kind: "box", hasColor: true },
    { id: "mark", label: "红标文字", kind: "text", defaultFont: "sans", textBind: "mark" },
    { id: "squad", label: "阵容标题", kind: "text", defaultFont: "serif", textBind: "subtitle" },
    { id: "stage", label: "关卡码", kind: "text", defaultFont: "sans", textBind: "title" },
    { id: "script", label: "英文花体", kind: "text", defaultFont: "script", textBind: "signature" },
  ],
  "strength-review": [
    { id: "atmosphere", label: "背景立绘", kind: "box" },
    { id: "operator", label: "立绘", kind: "image" },
    { id: "chibi", label: "基建小人", kind: "image" },
    { id: "skill-1", label: "技能一", kind: "box" },
    { id: "skill-2", label: "技能二", kind: "box" },
    { id: "skill-3", label: "技能三", kind: "box" },
    { id: "name", label: "干员名", kind: "text", defaultFont: "serif-medium", textBind: "title" },
    { id: "series", label: "栏目名", kind: "text", defaultFont: "serif-medium", textBind: "subtitle" },
  ],
  firstkill: [
    { id: "operator", label: "立绘", kind: "image" },
    { id: "stage", label: "地图名", kind: "text", defaultFont: "cn", textBind: "title" },
    { id: "subtitle", label: "副标题", kind: "text", defaultFont: "cn", textBind: "subtitle" },
    { id: "level-label", label: "危机等级", kind: "text", defaultFont: "cn", textDefault: "危机等级" },
    { id: "level", label: "等级数字", kind: "text", defaultFont: "display", textBind: "episode" },
    { id: "cc-mark", label: "三角标", kind: "box" },
    { id: "cc-en", label: "CONTINGENCY", kind: "text", defaultFont: "display", textDefault: "CONTINGENCY\nCONTRACT" },
    { id: "operation", label: "行动名", kind: "text", defaultFont: "cn", textBind: "signature" },
    { id: "cc-cn", label: "危机合约", kind: "text", defaultFont: "cn", textDefault: "危机合约" },
  ],
  lowspec: [
    { id: "operator", label: "立绘", kind: "image" },
    { id: "operation", label: "行动", kind: "text", defaultFont: "serif", textBind: "title" },
    { id: "operation-sub", label: "活动后缀", kind: "text", defaultFont: "serif" },
    { id: "cc-gold", label: "活动标", kind: "text", defaultFont: "cn", textDefault: "活动" },
    { id: "operation-en", label: "OPERATION", kind: "text", defaultFont: "display", textDefault: "OPERATION" },
    { id: "banner", label: "白底条", kind: "box" },
    { id: "sign", label: "署名", kind: "text", defaultFont: "display", textBind: "signature" },
    { id: "guide", label: "攻略类型", kind: "text", defaultFont: "serif", textBind: "subtitle" },
    { id: "slogan", label: "卖点句", kind: "text", defaultFont: "serif", textDefault: "阵容平民 语音详解" },
  ],
  rogue: [
    { id: "operator", label: "立绘", kind: "image" },
    { id: "watermark", label: "ISW-NO 上", kind: "text", defaultFont: "serif", textDefault: "ISW-NO" },
    { id: "watermark-flip", label: "ISW-NO 下", kind: "text", defaultFont: "serif", textDefault: "ISW-NO" },
    { id: "theme", label: "主题", kind: "text", defaultFont: "serif", textBind: "title" },
    { id: "red-tag", label: "红标", kind: "text", defaultFont: "cn", textBind: "signature" },
    { id: "cond", label: "条件", kind: "text", defaultFont: "serif", textBind: "subtitle" },
    { id: "node", label: "节点", kind: "text", defaultFont: "display" },
    { id: "emblem", label: "侧标", kind: "box" },
  ],
  "emergency-lesson": [
    { id: "atmosphere", label: "紫黑氛围", kind: "box" },
    { id: "shards", label: "斜向光线", kind: "box" },
    { id: "series-mark", label: "系列小标", kind: "text", defaultFont: "display", textDefault: "ROGUELIKE" },
    { id: "operator", label: "立绘", kind: "image" },
    { id: "art-veil", label: "立绘暗角", kind: "box", hasOpacity: true, defaultOpacity: 100 },
    { id: "condition", label: "条件", kind: "text", defaultFont: "serif", textBind: "subtitle" },
    { id: "count", label: "人数", kind: "text", defaultFont: "serif", textBind: "episode" },
    { id: "unit", label: "人数单位", kind: "text", defaultFont: "serif", textBind: "signature" },
    { id: "glitch-debris", label: "故障烟带", kind: "box" },
    { id: "bottom-vignette", label: "底部暗角", kind: "box" },
    { id: "title", label: "主标题", kind: "text", defaultFont: "serif", textBind: "title" },
  ],
  madness: [
    { id: "vignette", label: "暗角", kind: "box", hasOpacity: true, defaultOpacity: 70 },
    { id: "operator", label: "立绘", kind: "image" },
    { id: "polaroid-back", label: "底层拍立得", kind: "box", hasColor: true },
    { id: "polaroid", label: "拍立得", kind: "box" },
    { id: "five-star", label: "五星", kind: "box" },
    { id: "episode", label: "期数", kind: "text", defaultFont: "cn" },
    { id: "episode-bar", label: "期数竖线", kind: "box", hasColor: true },
    { id: "series", label: "栏目名", kind: "text", defaultFont: "serif", textDefault: "决战五星" },
    { id: "series-accent", label: "之癫", kind: "text", defaultFont: "cn", textDefault: "之癫" },
    { id: "chapter", label: "干员篇", kind: "text", defaultFont: "cn" },
    { id: "subtitle", label: "副标题", kind: "text", defaultFont: "cn", textBind: "subtitle" },
    { id: "en-tag", label: "英文标", kind: "text", defaultFont: "display", textBind: "signature" },
    { id: "en-name", label: "英文名", kind: "text", defaultFont: "display" },
  ],
  nocore: [
    { id: "operator", label: "立绘", kind: "image" },
    { id: "stage", label: "关卡", kind: "text", defaultFont: "cn", textBind: "title" },
    { id: "line", label: "分隔线", kind: "box" },
    { id: "limit", label: "限制", kind: "text", defaultFont: "cn", textBind: "subtitle" },
    { id: "sign", label: "署名", kind: "text", defaultFont: "cn", textBind: "signature" },
  ],
  endfield: [
    { id: "triangle", label: "黄三角", kind: "box", hasColor: true },
    { id: "operator", label: "立绘", kind: "image" },
    { id: "mark", label: "角标", kind: "text", defaultFont: "cn", textBind: "mark" },
    { id: "bracket-l", label: "左括号", kind: "text", defaultFont: "cn", hasColor: true },
    { id: "name", label: "角色名", kind: "text", defaultFont: "cn", textBind: "title" },
    { id: "bracket-r", label: "右括号", kind: "text", defaultFont: "cn", hasColor: true },
    { id: "bar", label: "栏目条", kind: "box", hasColor: true },
    { id: "bar-accent", label: "色码条", kind: "box" },
    { id: "series", label: "栏目名", kind: "text", defaultFont: "cn", textBind: "subtitle" },
    { id: "tag", label: "英文标", kind: "text", defaultFont: "display", textBind: "signature" },
  ],
  specialist: [
    { id: "atmosphere", label: "氛围压暗", kind: "box" },
    { id: "bg-shards", label: "灰三角", kind: "box" },
    { id: "operator-b", label: "立绘B", kind: "image" },
    { id: "operator", label: "立绘", kind: "image" },
    { id: "squad", label: "阵容", kind: "text", defaultFont: "cn", textBind: "title" },
    { id: "stage", label: "关卡", kind: "text", defaultFont: "display", textBind: "subtitle" },
    { id: "script", label: "花体标", kind: "text", defaultFont: "script", textBind: "signature", hasColor: true },
    { id: "mark", label: "小标", kind: "text", defaultFont: "display", textBind: "mark" },
    { id: "guides", label: "标线", kind: "box" },
    { id: "corner-shards", label: "红白碎片", kind: "box" },
  ],
  "operator-preview": [
    { id: "frame", label: "战术边框", kind: "box" },
    { id: "watermark", label: "英文水印", kind: "text", defaultFont: "serif", textBind: "signature" },
    { id: "operator", label: "立绘", kind: "image" },
    { id: "mark", label: "顶部小标", kind: "text", defaultFont: "display", textBind: "mark" },
    { id: "subject", label: "栏目对象", kind: "text", defaultFont: "serif", textDefault: "干员" },
    { id: "series", label: "栏目名", kind: "text", defaultFont: "serif", textDefault: "前瞻分析" },
    { id: "episode", label: "期数", kind: "text", defaultFont: "display", textBind: "episode" },
    { id: "title", label: "主标题", kind: "text", defaultFont: "serif", textBind: "title" },
    { id: "analysis", label: "英文分析标", kind: "text", defaultFont: "display", textDefault: "ANALYSIS" },
    { id: "badge-bg", label: "蓝色栏目条", kind: "box", hasColor: true },
    { id: "badge", label: "栏目条文字", kind: "text", defaultFont: "cn", textBind: "subtitle" },
    { id: "micro", label: "底部小字", kind: "text", defaultFont: "display", textDefault: "WHISPERS FROM THE FUTURE" },
  ],
  "fourstar-nocore": [
    { id: "floor", label: "棋盘地", kind: "box" },
    { id: "paper", label: "撕纸", kind: "box" },
    { id: "glow", label: "顶光晕", kind: "box" },
    { id: "hud", label: "青绿线框", kind: "box" },
    { id: "puppets", label: "提线偶", kind: "box" },
    { id: "frame", label: "金框", kind: "box", hasColor: true },
    { id: "operator", label: "立绘", kind: "image" },
    { id: "title", label: "主标题", kind: "text", defaultFont: "cn", textBind: "title" },
    { id: "stage-bar", label: "关卡条", kind: "box", hasColor: true, hasWidth: true },
    { id: "stage", label: "关卡码", kind: "text", defaultFont: "serif", textBind: "subtitle" },
    { id: "micro", label: "英文小字", kind: "text", defaultFont: "display", textBind: "signature" },
    { id: "fade", label: "底压暗", kind: "box" },
  ],
  solo: [
    { id: "wash", label: "红雾", kind: "box", hasOpacity: true, defaultOpacity: 74 },
    { id: "light", label: "光效", kind: "box" },
    { id: "ak-mark", label: "方舟标", kind: "box", hasColor: true },
    { id: "title-bar", label: "标题黑条", kind: "box", hasColor: true },
    { id: "operator", label: "立绘", kind: "image" },
    { id: "stage", label: "关卡码", kind: "text", defaultFont: "cn", textBind: "subtitle" },
    { id: "title", label: "主标题", kind: "text", defaultFont: "serif", textBind: "title" },
    { id: "rule", label: "白线", kind: "box", hasColor: true, hasWidth: true },
    { id: "rule-red", label: "红线", kind: "box", hasColor: true, hasWidth: true },
    { id: "slogan", label: "英文标", kind: "text", defaultFont: "display", textBind: "signature" },
  ],
};
