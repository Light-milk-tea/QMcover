import { artUrl } from "../arts";
import { boxLayer, imageLayer, textLayer } from "../../lib/document";
import type { Layer } from "../../types";

const full = { x: 0, y: 0, w: 1920, h: 1080, fill: "transparent" } as const;

export const unveilStageLayers: Layer[] = [
  boxLayer({ ...full, id: "stage", label: "紫色舞台底" }),
  boxLayer({ ...full, id: "band", label: "顶部斜条与汽车剪影" }),
  boxLayer({ ...full, id: "crowd", label: "观众席剪影" }),
  boxLayer({ ...full, id: "ring", label: "靶心圆盘" }),
  boxLayer({ ...full, id: "burst", label: "黑色爆炸框" }),
  boxLayer({ ...full, id: "stickers", label: "闪电与贴纸" }),
  imageLayer({
    id: "operator",
    label: "立绘",
    x: 0,
    y: 0,
    w: 1000,
    h: 1000,
    scale: 284,
    imageX: 849,
    imageY: 175,
    objectFit: "contain",
    objectPosition: "0% 0%",
    transformOrigin: "493px 95px",
    operatorId: "char_4064_mlynar",
    artId: "char_4064_mlynar_1",
    imageUrl: artUrl("char_4064_mlynar_1"),
  }),
  boxLayer({ ...full, id: "plates", label: "棋盘格衬底" }),
  textLayer({ id: "title", label: "标题", x: 140, y: 240, w: 930, h: 620, bind: "title", font: "cn", fontSize: 341, color: "#f8e7ba" }),
  textLayer({ id: "en", label: "黄色英文", x: 346, y: 726, w: 200, h: 150, bind: "signature", font: "anton", fontSize: 44, color: "#f5dc3b" }),
];
