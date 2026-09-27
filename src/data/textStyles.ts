import type { TextLayer } from "../types";

export type TextStylePreset = {
  id: string;
  name: string;
  /** 字效出处，用来提示“这是哪个模板的做法”。 */
  source?: string;
  /** 深色字，预览放在浅底上。 */
  light?: boolean;
  layer: Pick<TextLayer, "label" | "text" | "font" | "fontSize" | "w" | "h"> &
    Partial<Pick<TextLayer, "color" | "effect" | "letterSpacing" | "opacity" | "rotation">>;
};

export const TEXT_STYLES: TextStylePreset[] = [
  {
    id: "shadow",
    name: "普通文字",
    layer: { label: "文字", text: "文字", font: "cn", fontSize: 72, color: "#ffffff", w: 520, h: 96 },
  },
  {
    id: "serif-title",
    name: "宋体大标题",
    layer: { label: "宋体标题", text: "标题文字", font: "serif", fontSize: 160, color: "#ffffff", w: 900, h: 200 },
  },
  {
    id: "gold",
    name: "描边金字",
    source: "低配攻略",
    layer: { label: "金字", text: "沃伦姆德", font: "serif", fontSize: 170, effect: "gold-title", w: 900, h: 200 },
  },
  {
    id: "chromatic",
    name: "色散标题",
    source: "紧急授课",
    layer: { label: "色散标题", text: "紧急授课", font: "serif", fontSize: 180, color: "#ffffff", effect: "chromatic", w: 1000, h: 210 },
  },
  {
    id: "pink",
    name: "粉色条件字",
    source: "紧急授课",
    layer: { label: "粉色条件字", text: "无藏", font: "serif-regular", fontSize: 210, color: "#ed91cc", effect: "pink", w: 600, h: 230 },
  },
  {
    id: "magenta",
    name: "品红投影数字",
    source: "紧急授课",
    layer: { label: "品红投影", text: "5人", font: "times", fontSize: 320, color: "#fffdfb", effect: "magenta-shadow", w: 700, h: 340 },
  },
  {
    id: "metal",
    name: "金属字",
    source: "强度测评",
    layer: { label: "金属字", text: "强度测评", font: "serif-medium", fontSize: 180, color: "#d5dce4", effect: "metal", w: 1000, h: 210 },
  },
  {
    id: "gold-grain",
    name: "金纹字",
    source: "特种三人",
    layer: { label: "金纹字", text: "H9-5", font: "outfit", fontSize: 220, color: "#fffefb", effect: "gold-grain", w: 900, h: 220 },
  },
  {
    id: "matrix",
    name: "全息字",
    source: "全息作战矩阵",
    layer: { label: "全息字", text: "四人", font: "cn", fontSize: 170, color: "#a468d6", effect: "matrix", w: 900, h: 210 },
  },
  {
    id: "layered",
    name: "叠影标题",
    source: "干员前瞻分析",
    layer: { label: "叠影标题", text: "强度预测", font: "serif", fontSize: 170, color: "#e9e4e1", effect: "layered", w: 900, h: 200 },
  },
  {
    id: "glow",
    name: "柔影白字",
    source: "仅需一人",
    layer: { label: "柔影白字", text: "酒神单人", font: "serif", fontSize: 170, color: "#ffffff", effect: "glow", w: 900, h: 200 },
  },
  {
    id: "block",
    name: "硬投影字",
    source: "职业队",
    layer: { label: "硬投影字", text: "特种三人", font: "cn", fontSize: 150, color: "#ffffff", effect: "block", w: 900, h: 190 },
  },
  {
    id: "stroke",
    name: "斜体描边",
    source: "危机合约",
    layer: { label: "斜体描边", text: "无序矿区", font: "cn", fontSize: 150, color: "#ffffff", effect: "stroke", w: 900, h: 190 },
  },
  {
    id: "face-word",
    name: "粗描边标题",
    source: "决战五星之癫",
    layer: { label: "粗描边标题", text: "决战五星", font: "serif", fontSize: 130, color: "#ffffff", effect: "face-word", w: 900, h: 170 },
  },
  {
    id: "hollow",
    name: "空心水印",
    source: "肉鸽",
    layer: { label: "空心水印", text: "ISW-NO", font: "serif", fontSize: 180, effect: "hollow", w: 1000, h: 210 },
  },
  {
    id: "glass",
    name: "透景玻璃字",
    source: "肉鸽",
    layer: { label: "玻璃字", text: "命运共享", font: "serif", fontSize: 200, color: "#e8e2d6", effect: "glass", w: 900, h: 230 },
  },
  {
    id: "split-de",
    name: "金白拆字",
    source: "低配攻略",
    layer: { label: "金白拆字", text: "沃伦姆德的薄暮", font: "serif", fontSize: 170, effect: "split-de", w: 1300, h: 200 },
  },
  {
    id: "split-stage",
    name: "关卡拆色",
    source: "无核论文",
    layer: { label: "关卡拆色", text: "H12-4 突袭", font: "cn", fontSize: 150, effect: "split-stage", w: 1200, h: 180 },
  },
  {
    id: "sign-stripe",
    name: "署名条纹",
    source: "低配攻略",
    layer: { label: "署名条纹", text: "QM攻略组", font: "cn", fontSize: 92, effect: "sign-stripe", w: 600, h: 110 },
  },
  {
    id: "guide",
    name: "攻略字",
    source: "低配攻略",
    light: true,
    layer: { label: "攻略字", text: "平民攻略", font: "cn", fontSize: 150, effect: "guide", w: 900, h: 180 },
  },
  {
    id: "outline",
    name: "外描边",
    source: "无核论文",
    layer: { label: "外描边", text: "外描边文字", font: "cn", fontSize: 120, color: "#fff6ea", effect: "outline", w: 900, h: 150 },
  },
  {
    id: "grain-stage",
    name: "颗粒关卡码",
    source: "斜切关卡",
    light: true,
    layer: { label: "颗粒关卡码", text: "H8-4", font: "cn", fontSize: 300, color: "#f50039", effect: "grain-stage", w: 900, h: 320 },
  },
  {
    id: "raised",
    name: "轻投影",
    source: "斜切关卡",
    light: true,
    layer: { label: "轻投影", text: "六人", font: "cn", fontSize: 170, color: "#4a4a4a", effect: "raised", w: 900, h: 190 },
  },
  {
    id: "plain-dark",
    name: "纯色字（浅底）",
    source: "V我50",
    light: true,
    layer: { label: "纯色字", text: "纯色文字", font: "cn", fontSize: 96, color: "#1a1614", effect: "plain", w: 700, h: 120 },
  },
  {
    id: "hand",
    name: "手写花体",
    source: "特种三人",
    layer: { label: "手写花体", text: "Vanguard", font: "hand", fontSize: 120, color: "#ffffff", effect: "plain", w: 900, h: 150 },
  },
  {
    id: "defocus",
    name: "虚焦大字",
    source: "特种三人",
    layer: { label: "虚焦大字", text: "PIONEER", font: "outfit", fontSize: 180, color: "#d6c18e", effect: "defocus", opacity: 48, rotation: -12, w: 1040, h: 200 },
  },
  {
    id: "kicker",
    name: "英文小标",
    layer: { label: "英文小标", text: "OPERATION RECORD", font: "display", fontSize: 28, color: "#e8e8e8", effect: "plain", letterSpacing: 8, w: 700, h: 40 },
  },
];

export function getTextStyle(id: string): TextStylePreset | undefined {
  return TEXT_STYLES.find((item) => item.id === id);
}
