import { artUrl } from "../arts";
import { boxLayer, imageLayer, textLayer } from "../../lib/document";
import type { ImageLayer, Layer, TextLayer } from "../../types";

export const BLANK_OPERATOR_ID = "char_002_amiya";
export const BLANK_ART_ID = "char_002_amiya_1";
export const BLANK_BG_PRESET = "lungmen-night";

export type FieldBind = "title" | "subtitle" | "episode" | "signature" | "mark";

/** Where each right-panel field lands on the canvas, in the demo layout and when placed again. */
export const FIELD_TEXT_LAYERS: Record<FieldBind, Omit<TextLayer, "id" | "kind" | "bind">> = {
  mark: { label: "角标", text: "", x: 150, y: 190, w: 900, h: 64, font: "cn", fontSize: 40, letterSpacing: 8, color: "#f4d06f" },
  title: { label: "标题", text: "", x: 140, y: 258, w: 1060, h: 250, font: "serif", fontSize: 200, color: "#ffffff", fit: true },
  subtitle: { label: "副标题", text: "", x: 150, y: 566, w: 1000, h: 110, font: "cn", fontSize: 72, color: "#ffffff", fit: true },
  episode: { label: "期数", text: "", x: 150, y: 812, w: 480, h: 84, font: "cn", fontSize: 60, letterSpacing: 4, color: "#ffffff", effect: "episode-zh" },
  signature: { label: "署名", text: "", x: 150, y: 910, w: 820, h: 52, font: "cn", fontSize: 34, letterSpacing: 6, color: "#cfd6de" },
};

export function fieldTextLayer(bind: FieldBind, id: string): TextLayer {
  return textLayer({ id, bind, ...FIELD_TEXT_LAYERS[bind] });
}

/** The demo's main art slot; also where the art lands when placed again. */
export const BLANK_ART_LAYER: ImageLayer = imageLayer({
  id: "operator",
  label: "立绘",
  x: 1060,
  y: -30,
  w: 820,
  h: 1560,
  objectFit: "contain",
  objectPosition: "center top",
  operatorId: BLANK_OPERATOR_ID,
  artId: BLANK_ART_ID,
  imageUrl: artUrl(BLANK_ART_ID),
});

/** Demo layout: shaded text column on the left, operator on the right, every field bound. */
export const blankLayers: Layer[] = [
  boxLayer({ id: "blank-shade", label: "文字侧压暗", x: 0, y: 0, w: 1240, h: 1080, chrome: "side-shade" }),
  BLANK_ART_LAYER,
  boxLayer({ id: "blank-rule", label: "标题下划线", x: 150, y: 528, w: 300, h: 8, fill: "#f4d06f", color: "#f4d06f" }),
  fieldTextLayer("mark", "blank-mark"),
  fieldTextLayer("title", "blank-title"),
  fieldTextLayer("subtitle", "blank-subtitle"),
  fieldTextLayer("episode", "blank-episode"),
  fieldTextLayer("signature", "blank-signature"),
];
