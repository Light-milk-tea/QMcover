import { BLANK_TEMPLATE_ID, BUILTIN_TEMPLATE_IDS, CUSTOM_TEMPLATE_PREFIX } from "../constants";
import { getDecoration } from "../data/decorations";
import type {
  AutoSize,
  BoxLayer,
  BuiltinTemplateId,
  CanvasSkin,
  CoverDocument,
  CoverFontId,
  Draft,
  ElementOverride,
  ImageLayer,
  Layer,
  SavedTemplate,
  TemplateId,
  TextBind,
  TextLayer,
} from "../types";
import { cloneCoverEffects } from "./effects";
import { uid } from "./id";

export type DocumentFile = {
  kind: "qmcover-document";
  version: 2;
  exportedAt: string;
  name?: string;
  blurb?: string;
  basedOn?: string;
  document: CoverDocument;
};

export function isBuiltinId(id: string): id is BuiltinTemplateId {
  return (BUILTIN_TEMPLATE_IDS as readonly string[]).includes(id);
}

export function isCustomTemplateId(id: string): boolean {
  return id.startsWith(CUSTOM_TEMPLATE_PREFIX);
}

export function isOpenableId(id: string): boolean {
  return id === BLANK_TEMPLATE_ID || isBuiltinId(id) || isCustomTemplateId(id);
}

export function cloneLayer<T extends Layer>(layer: T): T {
  return { ...layer };
}

export function cloneLayers(layers: Layer[]): Layer[] {
  return layers.map(cloneLayer);
}

export function imageLayerPan(
  layer: ImageLayer,
  draft?: { imageX?: number; imageY?: number },
): { x: number; y: number } {
  if (layer.frame) return { x: 0, y: 0 };
  return {
    x: layer.imageX ?? (layer.id === "operator" ? (draft?.imageX ?? 0) : 0),
    y: layer.imageY ?? (layer.id === "operator" ? (draft?.imageY ?? 0) : 0),
  };
}

export function applyElementStyles(layers: Layer[], styles: Record<string, ElementOverride>): Layer[] {
  return layers.map((layer) => {
    const style = styles[layer.id];
    if (!style) return cloneLayer(layer);
    const next = cloneLayer(layer);
    if (style.x != null) next.x += style.x;
    if (style.y != null) next.y += style.y;
    if (style.opacity != null) next.opacity = style.opacity;
    if (style.color) next.color = style.color;
    if (style.rotation != null) next.rotation = (next.rotation ?? 0) + style.rotation;
    if (next.kind === "text") {
      if (style.fontSize != null) next.fontSize = style.fontSize;
      if (style.font) next.font = style.font;
    }
    return next;
  });
}

export function autoFontSize(kind: AutoSize | undefined, len: number, fallback: number): number {
  if (!kind) return fallback;
  if (kind === "stage") {
    if (len <= 4) return 220;
    if (len <= 6) return 168;
    if (len <= 8) return 128;
    return 96;
  }
  if (kind === "operation") {
    if (len <= 4) return 118;
    if (len <= 6) return 92;
    return 72;
  }
  if (kind === "gold") {
    if (len <= 2) return 220;
    if (len <= 3) return 204;
    if (len <= 4) return 180;
    if (len <= 6) return 136;
    return 104;
  }
  if (kind === "guide") {
    if (len <= 4) return 220;
    if (len <= 6) return 152;
    return 118;
  }
  if (kind === "theme") {
    if (len <= 2) return 268;
    if (len <= 3) return 248;
    if (len <= 4) return 228;
    if (len <= 6) return 168;
    return 128;
  }
  if (kind === "tag") {
    if (len <= 2) return 160;
    if (len <= 4) return 130;
    if (len <= 6) return 96;
    return 72;
  }
  if (kind === "series") {
    if (len <= 6) return 148;
    if (len <= 8) return 122;
    return 100;
  }
  if (kind === "chapter") {
    if (len <= 4) return 58;
    if (len <= 6) return 50;
    return 42;
  }
  if (kind === "sub") {
    if (len <= 6) return 58;
    if (len <= 10) return 50;
    return 40;
  }
  if (kind === "enName") {
    if (len <= 10) return 30;
    if (len <= 16) return 24;
    return 18;
  }
  if (kind === "row") {
    if (len <= 6) return 164;
    if (len <= 10) return 158;
    if (len <= 14) return 126;
    return 102;
  }
  if (kind === "name") {
    if (len <= 2) return 356;
    if (len <= 3) return 312;
    if (len <= 4) return 280;
    if (len <= 6) return 196;
    return 152;
  }
  if (kind === "seriesBar") {
    if (len <= 6) return 140;
    if (len <= 8) return 128;
    if (len <= 12) return 92;
    return 70;
  }
  if (kind === "sign") {
    if (len <= 2) return 200;
    if (len <= 4) return 92;
    return 68;
  }
  if (kind === "level") return len >= 3 ? 84 : 104;
  if (kind === "squad") {
    if (len <= 2) return 300;
    if (len <= 3) return 248;
    if (len <= 4) return 228;
    if (len <= 6) return 172;
    return 132;
  }
  if (kind === "stageCode") {
    if (len <= 3) return 440;
    if (len <= 5) return 408;
    if (len <= 7) return 328;
    return 252;
  }
  return fallback;
}

export function bindText(layer: TextLayer, draft: Draft): string {
  if (layer.bind === "title") return draft.title;
  if (layer.bind === "subtitle") return draft.subtitle;
  if (layer.bind === "signature") return draft.signature;
  if (layer.bind === "mark") return draft.mark;
  if (layer.bind === "operatorName") return draft.operatorName;
  if (layer.bind === "episode") return String(draft.episode || 1);
  return layer.text;
}

export function displayBoundText(layer: TextLayer, draft: Draft): string {
  const raw = bindText(layer, draft);
  if (layer.effect === "episode-zh") return `第${raw || 1}期`;
  if (layer.effect === "node") return `N${raw || 15}`;
  if (layer.effect === "chapter") return `${raw.trim() || "干员"}篇`;
  if (layer.effect === "series-wrap") return `[ ${raw.trim() || layer.text} ]`;
  if (layer.effect === "tag-prefix") return `▼ // ${raw.trim() || layer.text}`;
  return raw;
}

export function draftToDocument(draft: Draft): CoverDocument {
  return {
    layers: cloneLayers(draft.layers),
    canvasSkin: draft.canvasSkin,
    title: draft.title,
    subtitle: draft.subtitle,
    signature: draft.signature,
    mark: draft.mark,
    episode: draft.episode,
    operatorName: draft.operatorName,
    operatorId: draft.operatorId,
    artId: draft.artId,
    imageUrl: draft.imageDataUrl ? "" : draft.imageUrl,
    imageScale: draft.imageScale,
    imageX: draft.imageX,
    imageY: draft.imageY,
    imageEdgeFade: draft.imageEdgeFade,
    imageEdgeFadeAmount: draft.imageEdgeFadeAmount,
    bgPreset: draft.bgPreset,
    textBgPreset: draft.textBgPreset,
    bgDim: draft.bgDim,
    bgDimAmount: draft.bgDimAmount,
    shaftLight: draft.shaftLight,
    shaftLightAmount: draft.shaftLightAmount,
    shaftLightKind: draft.shaftLightKind,
    shaftLightX: draft.shaftLightX,
    shaftLightY: draft.shaftLightY,
    shaftLightRotate: draft.shaftLightRotate,
    effects: cloneCoverEffects(draft.effects),
    ornamentId: draft.ornamentId,
    paper: draft.paper,
    elementStyles: Object.fromEntries(
      Object.entries(draft.elementStyles ?? {}).map(([id, style]) => [id, { ...style }]),
    ),
  };
}

export function buildDocumentFile(draft: Draft, extra?: { name?: string; blurb?: string; basedOn?: string }): DocumentFile {
  return {
    kind: "qmcover-document",
    version: 2,
    exportedAt: new Date().toISOString(),
    name: extra?.name,
    blurb: extra?.blurb,
    basedOn: extra?.basedOn,
    document: draftToDocument(draft),
  };
}

export function parseDocumentFile(raw: unknown): DocumentFile | null {
  if (!raw || typeof raw !== "object") return null;
  const data = raw as Partial<DocumentFile>;
  if (data.kind !== "qmcover-document" || data.version !== 2) return null;
  if (!data.document || !Array.isArray(data.document.layers)) return null;
  const layers = data.document.layers.map((layer, index) => {
    if (!layer || typeof layer !== "object") return null;
    const item = layer as Layer;
    if (typeof item.id === "string" && item.id) return item;
    return { ...item, id: uid("el") || `layer-${index}` };
  }).filter((layer): layer is Layer => Boolean(layer));
  return {
    ...data,
    document: {
      ...data.document,
      layers,
    },
  } as DocumentFile;
}

export function newCustomId(): string {
  return `${CUSTOM_TEMPLATE_PREFIX}${uid("t").slice(2)}`;
}

function textLayer(partial: Omit<TextLayer, "kind" | "bind" | "text" | "font" | "fontSize"> & Partial<TextLayer>): TextLayer {
  return {
    kind: "text",
    bind: "custom",
    text: "",
    font: "cn",
    fontSize: 48,
    ...partial,
  };
}

function imageLayer(partial: Omit<ImageLayer, "kind" | "source"> & Partial<ImageLayer>): ImageLayer {
  return {
    kind: "image",
    source: "operator",
    ...partial,
  };
}

function boxLayer(partial: Omit<BoxLayer, "kind"> & Partial<BoxLayer>): BoxLayer {
  return {
    kind: "box",
    ...partial,
  };
}

export function createTextLayer(at: { x: number; y: number }): TextLayer {
  return textLayer({
    id: uid("el"),
    label: "文字",
    x: at.x,
    y: at.y,
    w: 520,
    h: 96,
    text: "标题",
    fontSize: 72,
    bind: "custom",
    color: "#ffffff",
  });
}

export function createBoxLayer(at: { x: number; y: number }): BoxLayer {
  return boxLayer({
    id: uid("el"),
    label: "色块",
    x: at.x,
    y: at.y,
    w: 420,
    h: 120,
    fill: "#141618",
    color: "#141618",
  });
}

export function createDecorationLayer(
  presetId: string,
  frameDefaults?: Pick<ImageLayer, "operatorId" | "artId" | "imageUrl" | "imageDataUrl" | "frameBgPreset">,
): Layer | undefined {
  const preset = getDecoration(presetId);
  if (!preset) return undefined;
  if (preset.kind === "polaroid") {
    return imageLayer({
      id: uid("el"),
      label: preset.layer.label,
      x: preset.layer.x,
      y: preset.layer.y,
      w: preset.layer.w,
      h: preset.layer.h,
      rotation: preset.layer.rotation ?? 3.4,
      source: "operator",
      frame: "polaroid",
      frameBgPreset: frameDefaults?.frameBgPreset || "lungmen-night",
      frameBgScale: 100,
      frameBgX: 0,
      frameBgY: 0,
      scale: 118,
      imageX: 0,
      imageY: 0,
      objectFit: "contain",
      objectPosition: "center bottom",
      ...frameDefaults,
    });
  }
  return boxLayer({
    id: uid("el"),
    ...preset.layer,
  });
}

export function createImageLayer(
  at: { x: number; y: number },
  source: "operator" | "upload" = "operator",
  extras?: Partial<ImageLayer>,
): ImageLayer {
  return imageLayer({
    id: uid("el"),
    label: source === "upload" ? "上传图" : "立绘",
    x: at.x,
    y: at.y,
    w: 720,
    h: 980,
    objectFit: "contain",
    objectPosition: "center bottom",
    ...extras,
    source,
  });
}

export function patchLayerIn(layers: Layer[], id: string, patch: Partial<Layer>): Layer[] {
  return layers.map((layer) => (layer.id === id ? ({ ...layer, ...patch } as Layer) : layer));
}

export function reorderLayer(layers: Layer[], id: string, dir: 1 | -1): Layer[] {
  const i = layers.findIndex((layer) => layer.id === id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= layers.length) return layers;
  const next = layers.slice();
  const [item] = next.splice(i, 1);
  next.splice(j, 0, item);
  return next;
}

export function replaceSubsetOrder(layers: Layer[], orderedSubset: Layer[]): Layer[] {
  const ids = new Set(orderedSubset.map((layer) => layer.id));
  let i = 0;
  return layers.map((layer) => (ids.has(layer.id) ? orderedSubset[i++] : layer));
}

export function visibleLayers(layers: Layer[]): Layer[] {
  return layers.filter((layer) => !layer.removed);
}

export function layerZIndex(layers: Layer[], id: string): number {
  let z = 0;
  for (const layer of layers) {
    if (layer.removed) continue;
    z += 1;
    if (layer.id === id) return z;
  }
  return 1;
}

export function duplicateLayer(layers: Layer[], id: string): { layers: Layer[]; id: string } | null {
  const i = layers.findIndex((layer) => layer.id === id);
  if (i < 0) return null;
  const copy = cloneLayer(layers[i]);
  copy.id = uid("el");
  copy.label = `${copy.label} 副本`;
  copy.x += 24;
  copy.y += 24;
  const next = layers.slice();
  next.splice(i + 1, 0, copy);
  return { layers: next, id: copy.id };
}

export function savedTemplateToMeta(item: SavedTemplate) {
  return {
    id: item.id,
    name: item.name,
    blurb: item.blurb || "自定义模板",
    defaultSubtitle: item.seed.subtitle ?? "",
    showEpisode: true,
    sampleTitle: item.seed.title ?? "",
    titleKind: "theme" as const,
    titleLabel: "标题",
    subtitleLabel: "副标题",
    episodeLabel: "数字",
    signatureLabel: "署名",
    showMark: true,
    markLabel: "角标",
    sampleMark: item.seed.mark ?? "",
    defaultEpisode: item.seed.episode ?? 1,
    sampleSignature: item.seed.signature ?? "",
    defaultImageScale: item.seed.imageScale ?? 100,
    defaultImageX: item.seed.imageX ?? 0,
    defaultImageY: item.seed.imageY ?? 0,
    showBackground: true,
    defaultBgPreset: item.seed.bgPreset,
    showTextBackground: item.seed.canvasSkin === "rogue",
    defaultTextBgPreset: item.seed.textBgPreset,
    showBgDim: true,
    defaultBgDim: item.seed.bgDim ?? false,
    defaultBgDimAmount: item.seed.bgDimAmount,
    showShaftLight: item.seed.canvasSkin === "specialist" || Boolean(item.seed.shaftLight),
    defaultShaftLight: item.seed.shaftLight ?? item.seed.canvasSkin === "specialist",
    defaultShaftLightAmount: item.seed.shaftLightAmount,
    defaultShaftLightKind: item.seed.shaftLightKind ?? (item.seed.canvasSkin === "specialist" ? "beam" : "bloom"),
    defaultShaftLightX: item.seed.shaftLightX,
    defaultShaftLightY: item.seed.shaftLightY,
    defaultShaftLightRotate: item.seed.shaftLightRotate,
    defaultOperatorId: item.seed.operatorId,
    defaultArtId: item.seed.artId,
    canvasSkin: item.seed.canvasSkin ?? "plain",
  };
}

export function defaultCanvasSkin(id: TemplateId): CanvasSkin {
  if (isBuiltinId(id)) return id;
  return "plain";
}

export { textLayer, imageLayer, boxLayer };
export type { TextBind, CoverFontId };
