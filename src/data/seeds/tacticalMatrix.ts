import { artUrl } from "../arts";
import { boxLayer, imageLayer, textLayer } from "../../lib/document";
import type { Layer } from "../../types";

export const tacticalMatrixLayers: Layer[] = [
  boxLayer({ id: "mineral", label: "矿物底纹", x: 0, y: 0, w: 1920, h: 1080, fill: "transparent" }),
  boxLayer({ id: "orbits", label: "战术圆环与网格", x: 0, y: 0, w: 1920, h: 1080, color: "#a468d6", fill: "transparent" }),
  imageLayer({
    id: "operator",
    label: "立绘",
    x: -400,
    y: 0,
    w: 2240,
    h: 1080,
    scale: 310,
    imageX: 0,
    imageY: 0,
    objectFit: "contain",
    objectPosition: "center center",
    fadeRight: true,
    fadeRightSolid: 78,
    operatorId: "char_1050_chen3",
    artId: "char_1050_chen3_2",
    imageUrl: artUrl("char_1050_chen3_2"),
  }),
  boxLayer({ id: "glow", label: "边角光晕", x: 0, y: 0, w: 1920, h: 1080, color: "#9730f2", fill: "transparent" }),
  boxLayer({ id: "prism", label: "局部虹彩反光", x: 0, y: 0, w: 1920, h: 1080, fill: "transparent", opacity: 95 }),
  boxLayer({ id: "embers", label: "微光颗粒", x: 0, y: 0, w: 1920, h: 1080, color: "#a468d6", fill: "transparent" }),
  boxLayer({ id: "film", label: "胶片颗粒", x: 0, y: 0, w: 1920, h: 1080, fill: "transparent", opacity: 11 }),
  boxLayer({ id: "side-bar", label: "侧边色条", x: 1828, y: 426, w: 18, h: 240, fill: "#a468d6" }),
  textLayer({ id: "mark", label: "顶部栏目名", x: 1060, y: 78, w: 700, h: 70, bind: "mark", font: "cn", fontSize: 48, color: "#fffaff" }),
  textLayer({ id: "squad", label: "人数 / 阵容", x: 1060, y: 243, w: 700, h: 209, bind: "subtitle", font: "cn", fontSize: 174, color: "#fffaff" }),
  textLayer({ id: "stage", label: "关卡码", x: 1060, y: 383, w: 700, h: 460, bind: "title", font: "display", fontSize: 348.214, color: "#ffffff" }),
  textLayer({ id: "operation", label: "底部行动名", x: 1060, y: 926, w: 700, h: 86, bind: "signature", font: "cn", fontSize: 60, color: "#fffaff" }),
  textLayer({ id: "side-note", label: "侧边小字", x: 1826, y: 440, w: 24, h: 230, bind: "custom", text: "OPERATION RECORD", font: "display", fontSize: 16, color: "#fffaff" }),
];
