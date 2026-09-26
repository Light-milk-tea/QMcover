import { artUrl } from "../arts";
import { blueCutPalette } from "../../lib/blueCutPalette";
import { boxLayer, imageLayer, textLayer } from "../../lib/document";
import type { Layer } from "../../types";

const BLUE = "#f50039";
const INK = "#555555";
const WEDGE = "#2a2a2a";

export const blueCutLayers: Layer[] = [
  boxLayer({
    id: "slash",
    label: "蓝斜切",
    x: 0,
    y: 0,
    w: 1920,
    h: 1080,
    fill: BLUE,
    color: BLUE,
  }),
  imageLayer({
    id: "operator",
    label: "立绘",
    x: -40,
    y: -80,
    w: 1100,
    h: 1280,
    scale: 124,
    imageX: -116.3,
    imageY: -55.8,
    objectFit: "contain",
    objectPosition: "62% 0%",
    transformOrigin: "62% 0%",
    operatorId: "char_4098_vvana",
    artId: "char_4098_vvana_1",
    imageUrl: artUrl("char_4123_ela_1"),
  }),
  boxLayer({
    id: "wedge",
    label: "黑斜切",
    x: 0,
    y: 0,
    w: 1920,
    h: 1080,
    fill: WEDGE,
    color: WEDGE,
  }),
  textLayer({
    id: "squad",
    label: "阵容",
    x: 1100,
    y: 236,
    w: 860,
    h: 240,
    bind: "title",
    font: "cn",
    fontSize: 204,
    color: INK,
  }),
  textLayer({
    id: "stage",
    label: "关卡码",
    x: 1048,
    y: 478,
    w: 820,
    h: 300,
    bind: "subtitle",
    font: "cn",
    fontSize: 320,
    color: INK,
  }),
  textLayer({
    id: "en",
    label: "英文标",
    x: 1280,
    y: 456,
    w: 520,
    h: 90,
    bind: "signature",
    font: "cn",
    fontSize: 66,
    color: blueCutPalette(BLUE).en,
  }),
];
