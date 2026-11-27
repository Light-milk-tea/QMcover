import { artUrl } from "../arts";
import { boxLayer, imageLayer, textLayer } from "../../lib/document";
import type { Layer } from "../../types";

const full = { x: 0, y: 0, w: 1920, h: 1080, fill: "transparent" } as const;
const card = { x: 258, y: 226, w: 590, h: 600, fill: "transparent" } as const;

export const garrisonRecordLayers: Layer[] = [
  boxLayer({ ...full, id: "grid", label: "白纸方格" }),
  boxLayer({ ...full, id: "rings", label: "灰色粗环" }),
  boxLayer({ ...full, id: "dial", label: "刻度盘" }),
  textLayer({ id: "backdrop", label: "背景大字", x: 170, y: 96, w: 1500, h: 760, bind: "signature", font: "unbounded", fontSize: 250, color: "#e5362a" }),
  boxLayer({ ...full, id: "lines", label: "细框线" }),
  imageLayer({
    id: "operator",
    label: "立绘",
    x: 258,
    y: 226,
    w: 590,
    h: 600,
    scale: 453,
    imageX: -177,
    imageY: -226,
    objectFit: "contain",
    objectPosition: "0% 0%",
    transformOrigin: "532px 432px",
    operatorId: "char_350_surtr",
    artId: "char_350_surtr_summer#9",
    imageUrl: artUrl("char_350_surtr_summer#9"),
  }),
  boxLayer({ ...card, id: "card", label: "卡片外框" }),
  boxLayer({ ...card, id: "pop", label: "立绘出框" }),
  boxLayer({ id: "panel", label: "标题白板", x: 1000, y: 318, w: 735, h: 404, fill: "transparent" }),
  textLayer({ id: "title", label: "黑色主标题", x: 1092, y: 336, w: 620, h: 160, bind: "title", font: "cn", fontSize: 156, color: "#121212" }),
  textLayer({ id: "subtitle", label: "红色大字", x: 866, y: 492, w: 846, h: 220, bind: "subtitle", font: "unbounded", fontSize: 200, color: "#e5362a" }),
  boxLayer({ id: "rail", label: "竖条与 S 标", x: 1727, y: 362, w: 46, h: 300, fill: "transparent" }),
  textLayer({ id: "mark", label: "红底小字", x: 1606, y: 636, w: 110, h: 56, bind: "mark", font: "cn", fontSize: 46, color: "#ffffff" }),
  textLayer({ id: "island", label: "RHODES 条", x: 870, y: 715, w: 330, h: 36, text: "RHODES ISLAND", font: "outfit", fontSize: 21, color: "#ffffff" }),
  boxLayer({ id: "hatch", label: "斜纹条", x: 1205, y: 715, w: 164, h: 36, fill: "transparent" }),
  textLayer({ id: "only", label: "红色小标", x: 1588, y: 316, w: 120, h: 22, font: "outfit", fontSize: 15, color: "#ffffff" }),
  textLayer({ id: "tag-top", label: "右上标签", x: 1598, y: 134, w: 130, h: 22, text: "HARD MODE", font: "outfit", fontSize: 15, color: "#ffffff" }),
  textLayer({ id: "tag-bottom", label: "右下标签", x: 1598, y: 920, w: 130, h: 22, text: "HARD MODE", font: "outfit", fontSize: 15, color: "#ffffff" }),
  textLayer({ id: "record", label: "档案小字", x: 1652, y: 866, w: 120, h: 36, text: "PRTS RECORD\nWELCOME DOCTOR", font: "pixel", fontSize: 10, color: "#8a8a8a" }),
  boxLayer({ ...full, id: "pixels", label: "像素块" }),
];
