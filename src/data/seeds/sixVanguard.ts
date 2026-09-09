import { boxLayer, imageLayer, textLayer } from "../../lib/document";
import type { Layer } from "../../types";

export const sixVanguardLayers: Layer[] = [
  boxLayer({ id: "echo", label: "灰色人物叠影", x: 0, y: 0, w: 1920, h: 1080, fill: "transparent" }),
  boxLayer({ id: "geometry", label: "斜框与三角纹", x: 0, y: 0, w: 1920, h: 1080, fill: "transparent" }),
  textLayer({ id: "edge-type-top", label: "顶部虚焦字", x: -120, y: -75, w: 1040, h: 182, text: "PIONEER", font: "sans", fontSize: 182, color: "#d6c18e", opacity: 48 }),
  textLayer({ id: "edge-type-bottom", label: "底部虚焦字", x: 1190, y: 970, w: 1040, h: 180, text: "VANGUARD", font: "sans", fontSize: 180, color: "#d9c18d", opacity: 50 }),
  boxLayer({ id: "gold-rule", label: "金色斜线", x: 0, y: 0, w: 1920, h: 1080, fill: "transparent", color: "#dbb64d" }),
  boxLayer({ id: "flecks", label: "纸面白点", x: 0, y: 0, w: 1920, h: 1080, fill: "transparent" }),
  imageLayer({ id: "operator", label: "立绘", x: 0, y: 0, w: 1400, h: 1080, scale: 177, imageX: -215.5387931034468, imageY: -40.73275862068997, objectFit: "contain", objectPosition: "left top", transformOrigin: "left top", fadeRight: true, fadeRightSolid: 86 }),
  boxLayer({ id: "halftone", label: "网点纸纹", x: 0, y: 0, w: 1920, h: 1080, fill: "transparent" }),
  boxLayer({ id: "mark-bg", label: "红标底色", x: 901, y: 475, w: 170, h: 38, fill: "#d92529", color: "#d92529" }),
  textLayer({ id: "mark", label: "红标文字", x: 910, y: 472, w: 150, h: 36, bind: "mark", font: "sans", fontSize: 34, color: "#ffffff" }),
  textLayer({ id: "squad", label: "阵容标题", x: 1040, y: 364, w: 660, h: 156, bind: "subtitle", font: "serif", fontSize: 156, color: "#fffefb" }),
  textLayer({ id: "stage", label: "关卡码", x: 826, y: 516, w: 930, h: 308, bind: "title", font: "sans", fontSize: 350, color: "#fffefb" }),
  textLayer({ id: "script", label: "英文花体", x: 1200, y: 466, w: 540, h: 119, bind: "signature", font: "script", fontSize: 119, color: "#070b0e" }),
];
