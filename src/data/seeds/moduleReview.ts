import { artUrl } from "../arts";
import { boxLayer, imageLayer, textLayer } from "../../lib/document";
import {
  MODULE_BACK_ORIGIN,
  MODULE_COLUMNS,
  MODULE_COLUMN_W,
  MODULE_FRONT_ORIGIN,
  MODULE_TONES,
  MODULE_YELLOW,
} from "../../lib/moduleReviewLayout";
import type { ImageLayer, Layer } from "../../types";

type Pan = { scale: number; imageX: number; imageY: number };

type ColumnSeed = {
  operatorId: string;
  front: Pan;
  back: Pan;
};

const pan = (scale: number, imageX: number, imageY: number): Pan => ({ scale, imageX, imageY });

/**
 * 默认四人：史尔特尔、澄闪、莫斯提马、伊芙利特。
 * 缩放和偏移来自 2026-10-09 的导出稿：精二收到大约 2 倍，避免把 1024 的立绘放到 4 倍发糊。
 * 第一栏精一拖动时改的是文档上的 imageX / imageY，不写回图层。
 */
export const MODULE_REVIEW_COLUMNS: ColumnSeed[] = [
  { operatorId: "char_350_surtr", front: pan(230, 140.3429602888087, -104.31043405911552), back: pan(268, -209.29585260604674, 18.07585193620233) },
  { operatorId: "char_377_gdglow", front: pan(216, 11.55248759025271, -109.85901187387185), back: pan(202, 8.826855821299624, -327.93505330550545) },
  { operatorId: "char_213_mostma", front: pan(188, -76.24548736462094, 196.6932113041516), back: pan(311, -172.40780121841158, 116.16252538357395) },
  { operatorId: "char_134_ifrit", front: pan(171, 110.90295013537906, 269.48732936597463), back: pan(209, 142.93140794223828, -105.38261859769855) },
];

function artLayer(id: string, label: string, index: number, artId: string, operatorId: string, pan: Pan, origin: string): ImageLayer {
  return imageLayer({
    id,
    label,
    x: index * MODULE_COLUMN_W,
    y: 0,
    w: MODULE_COLUMN_W,
    h: 1080,
    ...pan,
    objectFit: "contain",
    objectPosition: "50% 0%",
    transformOrigin: origin,
    operatorId,
    artId,
    imageUrl: artUrl(artId),
  });
}

function columnLayers(index: number): Layer[] {
  const ids = MODULE_COLUMNS[index];
  const seed = MODULE_REVIEW_COLUMNS[index];
  const n = index + 1;
  return [
    boxLayer({
      id: ids.tone,
      label: `第${n}栏代表色`,
      x: index * MODULE_COLUMN_W,
      y: 0,
      w: MODULE_COLUMN_W,
      h: 1080,
      fill: "transparent",
      color: MODULE_TONES[index],
    }),
    artLayer(ids.back, `第${n}栏精二`, index, `${seed.operatorId}_2`, seed.operatorId, seed.back, MODULE_BACK_ORIGIN),
    textLayer({
      id: ids.unit,
      label: `第${n}栏大字`,
      x: index * MODULE_COLUMN_W,
      y: 200,
      w: MODULE_COLUMN_W,
      h: 520,
      bind: "mark",
      font: "caps",
      fontSize: 540,
      effect: "fade-down",
    }),
    artLayer(ids.front, `第${n}栏精一`, index, `${seed.operatorId}_1`, seed.operatorId, seed.front, MODULE_FRONT_ORIGIN),
  ];
}

export const moduleReviewLayers: Layer[] = [
  ...MODULE_COLUMNS.flatMap((_, index) => columnLayers(index)),
  boxLayer({ id: "shade", label: "底部压暗", x: 0, y: 0, w: 1920, h: 1080, fill: "transparent" }),
  boxLayer({ id: "ramp", label: "底边黄渐变", x: 0, y: 700, w: 1920, h: 380, fill: "transparent", chrome: "yellow-ramp", color: MODULE_YELLOW }),
  boxLayer({ id: "dots", label: "底部细点阵", x: 0, y: 720, w: 1920, h: 360, fill: "transparent", chrome: "dot-band", color: "#8f7d22" }),
  ...MODULE_COLUMNS.map((ids, index) =>
    boxLayer({
      id: ids.badge,
      label: `第${index + 1}栏角标`,
      x: index * MODULE_COLUMN_W + 380,
      y: 180,
      w: 80,
      h: 90,
      fill: "transparent",
      chrome: "rank-badge",
      color: MODULE_YELLOW,
      hidden: index === 0,
    }),
  ),
  textLayer({ id: "tagline", label: "英文小字", x: 0, y: 770, w: 1920, h: 40, bind: "subtitle", font: "display", fontSize: 22, color: "#a08c2c" }),
  boxLayer({ id: "glow", label: "标题光痕", x: 0, y: 780, w: 1920, h: 280, fill: "transparent", color: MODULE_YELLOW }),
  boxLayer({ id: "bracket-l", label: "左括号", x: 262, y: 806, w: 40, h: 230, fill: "transparent", chrome: "thin-bracket-l", color: MODULE_YELLOW }),
  textLayer({ id: "title", label: "主标题", x: 318, y: 800, w: 960, h: 240, bind: "title", font: "cn", fontSize: 240, color: "#ffffff", effect: "streak" }),
  textLayer({ id: "episode", label: "期号", x: 1290, y: 780, w: 340, h: 260, bind: "episode", font: "cn", fontSize: 293, color: MODULE_YELLOW }),
  boxLayer({ id: "bracket-r", label: "右括号", x: 1620, y: 806, w: 40, h: 230, fill: "transparent", chrome: "thin-bracket-r", color: MODULE_YELLOW }),
  boxLayer({ id: "frame", label: "细外框", x: 0, y: 0, w: 1920, h: 1080, fill: "transparent", chrome: "inset-frame", color: MODULE_YELLOW }),
];
