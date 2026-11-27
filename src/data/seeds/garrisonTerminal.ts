import { artUrl } from "../arts";
import { boxLayer, imageLayer, textLayer } from "../../lib/document";
import type { Layer } from "../../types";

const full = { x: 0, y: 0, w: 1920, h: 1080, fill: "transparent" } as const;

export const garrisonTerminalLayers: Layer[] = [
  boxLayer({ ...full, id: "grid", label: "方格底" }),
  boxLayer({ ...full, id: "rings", label: "粗圆环" }),
  boxLayer({ ...full, id: "dial", label: "刻度盘" }),
  boxLayer({ ...full, id: "lines", label: "细框线与箭头" }),
  boxLayer({ id: "frame", label: "绿色底框", x: 262, y: 212, w: 590, h: 580, fill: "transparent" }),
  imageLayer({
    id: "operator",
    label: "立绘",
    x: 325,
    y: 263,
    w: 458,
    h: 486,
    scale: 228,
    imageX: -277,
    imageY: -182,
    objectFit: "contain",
    objectPosition: "0% 0%",
    transformOrigin: "505px 348px",
    operatorId: "char_248_mgllan",
    artId: "char_248_mgllan_kitchen#1",
    imageUrl: artUrl("char_248_mgllan_kitchen#1"),
  }),
  boxLayer({ id: "card", label: "卡片白边与细网格", x: 325, y: 263, w: 458, h: 486, fill: "transparent" }),
  textLayer({ id: "island", label: "RHODES 条", x: 275, y: 768, w: 383, h: 39, text: "RHODES ISLAND", font: "outfit", fontSize: 20, color: "#f2fff9" }),
  textLayer({ id: "en-name", label: "英文名", x: 272, y: 824, w: 320, h: 80, bind: "signature", font: "anton", fontSize: 74, color: "#1a6e51" }),
  boxLayer({ id: "hatch", label: "斜纹条", x: 596, y: 847, w: 264, h: 36, fill: "transparent" }),
  textLayer({ id: "tagline", label: "绿色标语", x: 382, y: 880, w: 220, h: 44, bind: "subtitle", font: "outfit", fontSize: 40, color: "#36e2a0" }),
  textLayer({ id: "mode", label: "描边小字", x: 596, y: 896, w: 160, h: 20, bind: "mark", font: "pixel", fontSize: 17, color: "#6f8a80" }),
  textLayer({ id: "file", label: "左下档案字", x: 38, y: 930, w: 260, h: 90, text: "FILE\nA B 7.2-12\n3.2217", font: "pixel", fontSize: 15, color: "#6f8a80" }),
  textLayer({ id: "title", label: "标题", x: 837, y: 278, w: 900, h: 520, bind: "title", font: "cn", fontSize: 256, color: "#f6fffb" }),
  textLayer({ id: "tag", label: "顶部小标签", x: 1514, y: 180, w: 130, h: 20, text: "WHY FOR THIS", font: "outfit", fontSize: 14, color: "#04261a" }),
  textLayer({ id: "record", label: "右上档案字", x: 1772, y: 172, w: 120, h: 40, text: "PRTS RECORD\nWELCOME DOCTOR", font: "pixel", fontSize: 11, color: "#6f8a80" }),
  boxLayer({ ...full, id: "pixels", label: "像素块" }),
  boxLayer({ ...full, id: "scan", label: "竖扫描线" }),
];
