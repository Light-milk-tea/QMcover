import { artUrl } from "../arts";
import { boxLayer, imageLayer, textLayer } from "../../lib/document";
import type { Layer } from "../../types";

const full = { x: 0, y: 0, w: 1920, h: 1080, fill: "transparent" } as const;

export const unveilBrushLayers: Layer[] = [
  boxLayer({ ...full, id: "backdrop", label: "暗色舞台底" }),
  boxLayer({ ...full, id: "ghost", label: "立绘残影" }),
  boxLayer({ ...full, id: "brush", label: "红蓝笔刷" }),
  boxLayer({ ...full, id: "disc", label: "红色圆盘与刻度尺" }),
  imageLayer({
    id: "operator",
    label: "立绘",
    x: 0,
    y: 0,
    w: 1000,
    h: 1000,
    scale: 251,
    imageX: 840,
    imageY: 126,
    objectFit: "contain",
    objectPosition: "0% 0%",
    transformOrigin: "498px 141px",
    operatorId: "char_1038_whitw2",
    artId: "char_1038_whitw2_1",
    imageUrl: artUrl("char_1038_whitw2_1"),
  }),
  boxLayer({ ...full, id: "card", label: "黑卡与霓虹边" }),
  boxLayer({ ...full, id: "badges", label: "星星与小图标" }),
  textLayer({ id: "name", label: "英文名牌", x: 560, y: 172, w: 330, h: 50, bind: "signature", font: "fraunces", fontSize: 48, color: "#f6e6d2" }),
  textLayer({ id: "title", label: "中文标题", x: 392, y: 268, w: 474, h: 160, bind: "title", font: "serif", fontSize: 158, color: "#f6e6d2" }),
  textLayer({ id: "code", label: "关卡码大字", x: 336, y: 340, w: 600, h: 520, bind: "subtitle", font: "fraunces", fontSize: 520, color: "#f6e6d2" }),
  textLayer({ id: "caption", label: "英文注", x: 600, y: 758, w: 266, h: 56, bind: "mark", font: "fraunces", fontSize: 26, color: "#f6e6d2" }),
  textLayer({ id: "record", label: "档案小字", x: 650, y: 792, w: 140, h: 14, text: ":: ARKNIGHTS RECORD", font: "outfit", fontSize: 11, color: "#f4f1ea" }),
  textLayer({ id: "tag", label: "斜贴小标", x: 716, y: 866, w: 280, h: 60, text: "FOR\nARKNIGHTS TACTIC GROUP", font: "fraunces", fontSize: 16, color: "#f4f1ea" }),
  textLayer({ id: "countdown", label: "倒数小字", x: 770, y: 1022, w: 560, h: 24, text: "...3   ...2   ...1   |   1...   2...   3...", font: "outfit", fontSize: 20, color: "#8d8790" }),
];
