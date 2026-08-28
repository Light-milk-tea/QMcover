import {
  BLANK_TEMPLATE_ID,
  IMAGE_EDGE_FADE_DEFAULT,
  LEGACY_STORAGE_KEY,
  SHAFT_LIGHT_DEFAULT,
  SHAFT_LIGHT_ROTATE_DEFAULT,
  SHAFT_LIGHT_X_DEFAULT,
  SHAFT_LIGHT_Y_DEFAULT,
  STORAGE_KEY,
} from "../constants";
import { defaultArtFields } from "../data/arts";
import { DEFAULT_BG_PRESET } from "../data/backgrounds";
import { DEFAULT_ORNAMENT, ORNAMENTS } from "../data/ornaments";
import { getBuiltinLayers } from "../data/seeds";
import { getTemplate } from "../data/templates";
import type { Draft, Layer, TemplateId } from "../types";
import { todayISO } from "./dates";
import { applyElementStyles, cloneLayers, defaultCanvasSkin, isBuiltinId } from "./document";
import { hydrateImageArtGrade, normalizeCoverEffects, referenceCoverEffects } from "./effects";
import { getSavedTemplate } from "./templateStore";

export type PersistedState = {
  drafts: Partial<Record<TemplateId, Draft>>;
  defaultsVersion?: number;
};

const DEFAULTS_VERSION = 6;

function seedLayers(templateId: TemplateId): Layer[] {
  if (isBuiltinId(templateId)) return getBuiltinLayers(templateId);
  if (templateId === BLANK_TEMPLATE_ID) return [];
  const saved = getSavedTemplate(templateId);
  return saved ? cloneLayers(saved.seed.layers) : [];
}

export function emptyDraft(templateId: TemplateId): Draft {
  const meta = getTemplate(templateId);
  const saved = getSavedTemplate(templateId);
  const seed = saved?.seed;
  const art = defaultArtFields(seed?.operatorId ?? meta?.defaultOperatorId, seed?.artId ?? meta?.defaultArtId);
  const canvasSkin = seed?.canvasSkin ?? meta?.canvasSkin ?? defaultCanvasSkin(templateId);
  const bgDim = seed?.bgDim ?? meta?.defaultBgDim ?? false;
  const bgDimAmount = seed?.bgDimAmount ?? meta?.defaultBgDimAmount ?? 48;
  const shaftLight = seed?.shaftLight ?? meta?.defaultShaftLight ?? false;
  const shaftLightAmount = seed?.shaftLightAmount ?? meta?.defaultShaftLightAmount ?? SHAFT_LIGHT_DEFAULT;
  const shaftLightKind = seed?.shaftLightKind ?? meta?.defaultShaftLightKind ?? "bloom";
  const shaftLightX = seed?.shaftLightX ?? meta?.defaultShaftLightX ?? SHAFT_LIGHT_X_DEFAULT;
  const shaftLightY = seed?.shaftLightY ?? meta?.defaultShaftLightY ?? SHAFT_LIGHT_Y_DEFAULT;
  const shaftLightRotate = seed?.shaftLightRotate ?? meta?.defaultShaftLightRotate ?? SHAFT_LIGHT_ROTATE_DEFAULT;
  const effects = normalizeCoverEffects(canvasSkin, seed?.effects, {
    bgDim,
    bgDimAmount,
    shaftLight,
    shaftLightAmount,
    shaftLightKind,
    shaftLightX,
    shaftLightY,
    shaftLightRotate,
  });
  return {
    title: seed?.title ?? meta?.sampleTitle ?? "",
    subtitle: seed?.subtitle ?? meta?.defaultSubtitle ?? "",
    signature: seed?.signature ?? meta?.sampleSignature ?? "",
    mark: seed?.mark ?? meta?.sampleMark ?? "",
    date: todayISO(),
    episode: seed?.episode ?? meta?.defaultEpisode ?? 1,
    operatorName: seed?.operatorName ?? art.operatorName,
    operatorId: seed?.operatorId ?? art.operatorId,
    artId: seed?.artId ?? art.artId,
    imageUrl: seed?.imageUrl || art.imageUrl,
    imageDataUrl: "",
    imageScale: seed?.imageScale ?? meta?.defaultImageScale ?? 100,
    imageX: seed?.imageX ?? meta?.defaultImageX ?? 0,
    imageY: seed?.imageY ?? meta?.defaultImageY ?? 0,
    imageEdgeFade: seed?.imageEdgeFade ?? false,
    imageEdgeFadeAmount: seed?.imageEdgeFadeAmount ?? IMAGE_EDGE_FADE_DEFAULT,
    showSafeArea: true,
    bgPreset: seed?.bgPreset ?? meta?.defaultBgPreset ?? DEFAULT_BG_PRESET,
    textBgPreset: seed?.textBgPreset ?? meta?.defaultTextBgPreset ?? meta?.defaultBgPreset ?? DEFAULT_BG_PRESET,
    bgDim,
    bgDimAmount,
    shaftLight,
    shaftLightAmount,
    shaftLightKind,
    shaftLightX,
    shaftLightY,
    shaftLightRotate,
    effects,
    ornamentId: seed?.ornamentId ?? meta?.defaultOrnamentId ?? DEFAULT_ORNAMENT,
    layers: seedLayers(templateId),
    canvasSkin,
    paper: seed?.paper,
    elementStyles: {},
  };
}

function migrateLegacyDraft(templateId: TemplateId, saved: Partial<Draft>): Draft {
  const empty = emptyDraft(templateId);
  const canvasSkin = empty.canvasSkin;
  const effects = normalizeCoverEffects(canvasSkin, saved.effects, {
    bgDim: saved.bgDim ?? empty.bgDim,
    bgDimAmount: saved.bgDimAmount ?? empty.bgDimAmount,
    shaftLight: saved.shaftLight ?? empty.shaftLight,
    shaftLightAmount: saved.shaftLightAmount ?? empty.shaftLightAmount,
    shaftLightKind: saved.shaftLightKind ?? empty.shaftLightKind,
    shaftLightX: saved.shaftLightX ?? empty.shaftLightX,
    shaftLightY: saved.shaftLightY ?? empty.shaftLightY,
    shaftLightRotate: saved.shaftLightRotate ?? empty.shaftLightRotate,
  });
  return {
    ...empty,
    ...saved,
    layers: Array.isArray(saved.layers) && saved.layers.length > 0 ? saved.layers : empty.layers,
    canvasSkin: empty.canvasSkin,
    paper: empty.paper,
    elementStyles: saved.elementStyles ?? {},
    title: saved.title ?? empty.title,
    subtitle: saved.subtitle ?? empty.subtitle,
    signature: saved.signature ?? empty.signature,
    mark: saved.mark ?? empty.mark,
    date: saved.date ?? empty.date,
    episode: saved.episode ?? empty.episode,
    operatorName: saved.operatorName ?? empty.operatorName,
    operatorId: saved.operatorId ?? empty.operatorId,
    artId: saved.artId ?? empty.artId,
    imageUrl: saved.imageUrl ?? empty.imageUrl,
    imageDataUrl: saved.imageDataUrl ?? "",
    imageScale: saved.imageScale ?? empty.imageScale,
    imageX: saved.imageX ?? empty.imageX,
    imageY: saved.imageY ?? empty.imageY,
    imageEdgeFade: saved.imageEdgeFade ?? false,
    imageEdgeFadeAmount: saved.imageEdgeFadeAmount ?? empty.imageEdgeFadeAmount,
    showSafeArea: saved.showSafeArea ?? true,
    bgPreset: saved.bgPreset ?? empty.bgPreset,
    textBgPreset: saved.textBgPreset ?? empty.textBgPreset,
    bgDim: saved.bgDim ?? empty.bgDim,
    bgDimAmount: saved.bgDimAmount ?? empty.bgDimAmount,
    shaftLight: saved.shaftLight ?? empty.shaftLight,
    shaftLightAmount: saved.shaftLightAmount ?? empty.shaftLightAmount,
    shaftLightKind: saved.shaftLightKind ?? empty.shaftLightKind,
    shaftLightX: saved.shaftLightX ?? empty.shaftLightX,
    shaftLightY: saved.shaftLightY ?? empty.shaftLightY,
    shaftLightRotate: saved.shaftLightRotate ?? empty.shaftLightRotate,
    effects,
    ornamentId: ORNAMENTS.some((item) => item.id === saved.ornamentId) ? saved.ornamentId! : empty.ornamentId,
  };
}

function readLegacy(): PersistedState | null {
  try {
    const raw = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedState;
    if (!parsed.drafts) return null;
    const drafts: PersistedState["drafts"] = {};
    for (const [id, draft] of Object.entries(parsed.drafts)) {
      if (!draft) continue;
      drafts[id] = migrateLegacyDraft(id, draft);
    }
    return { drafts };
  } catch {
    return null;
  }
}

function applySpecialistDocumentEffects(draft: Draft): Draft {
  const effects = referenceCoverEffects();
  return {
    ...draft,
    effects,
    bgDim: effects.vignette.enabled,
    bgDimAmount: effects.vignette.amount,
    shaftLight: effects.light.enabled,
    shaftLightAmount: effects.light.amount,
    shaftLightKind: effects.light.kind,
    shaftLightX: effects.light.x,
    shaftLightY: effects.light.y,
    shaftLightRotate: effects.light.rotate,
  };
}

function migrateDraftDefaults(state: PersistedState): PersistedState {
  if ((state.defaultsVersion ?? 0) >= DEFAULTS_VERSION) return state;
  const drafts: PersistedState["drafts"] = {};
  for (const [id, draft] of Object.entries(state.drafts)) {
    if (!draft) continue;
    if (id === "specialist" || draft.canvasSkin === "specialist") {
      drafts[id] = id === "specialist" ? applySpecialistDocumentEffects(draft) : draft;
      continue;
    }
    const effects = normalizeCoverEffects(draft.canvasSkin ?? "plain", draft.effects, {
      bgDim: false,
      bgDimAmount: draft.bgDimAmount ?? draft.effects?.vignette?.amount,
      shaftLight: draft.shaftLight,
      shaftLightAmount: draft.shaftLightAmount,
      shaftLightKind: draft.shaftLightKind,
      shaftLightX: draft.shaftLightX,
      shaftLightY: draft.shaftLightY,
      shaftLightRotate: draft.shaftLightRotate,
    });
    drafts[id] = {
      ...draft,
      bgDim: false,
      effects: {
        ...effects,
        vignette: { ...effects.vignette, enabled: false },
      },
    };
  }
  const next = { drafts, defaultsVersion: DEFAULTS_VERSION };
  saveState(next);
  return next;
}

export function loadState(): PersistedState {
  let current: PersistedState | null = null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as PersistedState;
      current = { drafts: parsed.drafts ?? {}, defaultsVersion: parsed.defaultsVersion };
    }
  } catch {
    /* fall through */
  }
  const hasDrafts = Boolean(current && Object.keys(current.drafts).length > 0);
  if (hasDrafts && current) return migrateDraftDefaults(current);
  const legacy = readLegacy();
  if (legacy) {
    const merged: PersistedState = {
      drafts: { ...legacy.drafts, ...(current?.drafts ?? {}) },
      defaultsVersion: current?.defaultsVersion,
    };
    return migrateDraftDefaults(merged);
  }
  return migrateDraftDefaults(current ?? { drafts: {} });
}

export function saveState(state: PersistedState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function mergeNativeLayers(templateId: TemplateId, draft: Draft): Draft {
  if (!isBuiltinId(templateId)) return draft;
  const seeds = seedLayers(templateId);
  const have = new Map(draft.layers.map((layer) => [layer.id, layer]));
  const natives = seeds.map((seed) => have.get(seed.id) ?? seed);
  const extras = draft.layers.filter(
    (layer) =>
      !seeds.some((seed) => seed.id === layer.id) &&
      !(templateId === "specialist" && (layer.id === "tri" || layer.id === "ruler")),
  );
  return { ...draft, layers: [...natives, ...extras] };
}

function migrateSpecialistLayout(draft: Draft): Draft {
  const oldMain = new Set([104, 128, 158, 168, 176, 236, 242, 286]);
  const imageScale = oldMain.has(draft.imageScale) ? 300 : draft.imageScale;
  const imageX =
    oldMain.has(draft.imageScale) ||
    (draft.imageScale === 300 &&
      ((draft.imageX === -410 && draft.imageY === 200) ||
        (draft.imageX === -300 && draft.imageY === 265) ||
        (draft.imageX === -340 && draft.imageY === 305)))
      ? -375
      : draft.imageX;
  const imageY =
    oldMain.has(draft.imageScale) ||
    (draft.imageScale === 300 &&
      ((draft.imageX === -410 && draft.imageY === 200) ||
        (draft.imageX === -300 && draft.imageY === 265) ||
        (draft.imageX === -340 && draft.imageY === 305)))
      ? 265
      : draft.imageY;
  const layers = draft.layers.map((layer) => {
    if (
      layer.id === "operator-b" &&
      layer.kind === "image" &&
      ([108, 132, 168, 198].includes(layer.scale ?? 0) ||
        ((layer.scale ?? 0) === 148 && layer.imageX === 168 && layer.imageY === -16) ||
        ((layer.scale ?? 0) === 230 && layer.imageX === 14 && layer.imageY === 130) ||
        ((layer.scale ?? 0) === 250 && layer.imageX === -120 && [195, 260].includes(layer.imageY ?? 0)))
    ) {
      return { ...layer, scale: 300, imageX: -120, imageY: 260, objectPosition: "64% 14%", transformOrigin: "center 18%" };
    }
    if (
      layer.id === "script" &&
      layer.kind === "text" &&
      ((layer.fontSize ?? 0) >= 180 ||
        ((layer.fontSize ?? 0) === 122 && layer.x === 288 && layer.y === 392) ||
        ((layer.fontSize ?? 0) === 88 && layer.x === 442 && layer.y === 400) ||
        ((layer.fontSize ?? 0) === 104 && layer.x === 442 && [400, 420].includes(layer.y)))
    ) {
      return { ...layer, fontSize: 88, x: 442, y: 420, w: 760, h: 130, rotation: -15 };
    }
    if (
      layer.id === "squad" &&
      layer.kind === "text" &&
      ((layer.x === 128 && layer.y === 336) ||
        (layer.x === 118 && layer.y === 318) ||
        (layer.x === 170 && layer.y === 350 && layer.fontSize === 178))
    ) {
      return { ...layer, x: 170, y: 350, fontSize: 186 };
    }
    if (
      layer.id === "stage" &&
      layer.kind === "text" &&
      ((layer.x === 112 && layer.y === 508) ||
        (layer.x === 118 && layer.y === 498) ||
        (layer.x === 154 && layer.y === 506 && layer.fontSize === 360))
    ) {
      return { ...layer, x: 154, y: 510, fontSize: 340 };
    }
    if (layer.id === "mark" && layer.kind === "text" && layer.x === 132 && layer.y === 986) {
      return { ...layer, x: 170, y: 992 };
    }
    if (layer.id === "corner-shards" && layer.x === 1480 && layer.y === 560) {
      return { ...layer, x: 1560, y: 600 };
    }
    return layer;
  });
  const styles = { ...(draft.elementStyles ?? {}) };
  const shards = styles["corner-shards"];
  if (shards && shards.x === 80 && shards.y === 40) {
    const { x: _x, y: _y, ...rest } = shards;
    if (Object.keys(rest).length) styles["corner-shards"] = rest;
    else delete styles["corner-shards"];
  }
  const script = styles.script;
  if (script && (script.fontSize == null || script.fontSize >= 180)) {
    const { fontSize: _fontSize, x: _x, y: _y, rotation: _rotation, ...rest } = script;
    if (Object.keys(rest).length) styles.script = rest;
    else delete styles.script;
  }
  const legacyEffects =
    draft.effects.light.amount === 52 &&
    draft.effects.light.x === 54 &&
    draft.effects.light.y === 6 &&
    draft.effects.light.rotate === 8 &&
    draft.effects.scanlines.amount === 34 &&
    draft.effects.grain.amount === 46 &&
    draft.effects.chromatic.amount === 16 &&
    draft.effects.glitch.amount === 34 &&
    draft.effects.slashes.amount === 28 &&
    draft.effects.vignette.amount === 36;
  const previousReferenceEffects =
    draft.effects.light.amount === 66 &&
    draft.effects.light.x === 51 &&
    draft.effects.light.y === 0 &&
    draft.effects.light.rotate === 6 &&
    draft.effects.scanlines.amount === 38 &&
    draft.effects.grain.amount === 42 &&
    draft.effects.chromatic.amount === 12 &&
    draft.effects.glitch.amount === 30 &&
    draft.effects.slashes.amount === 24 &&
    draft.effects.vignette.amount === 48;
  const strongReferenceEffects =
    draft.effects.light.amount === 66 &&
    draft.effects.light.x === 51 &&
    draft.effects.light.y === 0 &&
    draft.effects.light.rotate === 6 &&
    draft.effects.scanlines.amount === 28 &&
    draft.effects.grain.amount === 34 &&
    draft.effects.chromatic.amount === 12 &&
    draft.effects.glitch.amount === 30 &&
    draft.effects.slashes.amount === 24 &&
    draft.effects.vignette.amount === 30;
  const tunedReferenceEffects =
    draft.effects.light.amount === 58 &&
    draft.effects.light.x === 51 &&
    draft.effects.light.y === 0 &&
    draft.effects.light.rotate === 6 &&
    draft.effects.scanlines.amount === 28 &&
    draft.effects.grain.amount === 34 &&
    draft.effects.chromatic.amount === 8 &&
    draft.effects.glitch.amount === 16 &&
    draft.effects.slashes.amount === 8 &&
    draft.effects.vignette.amount === 30;
  const clearColorReferenceEffects =
    draft.effects.light.amount === 52 &&
    draft.effects.light.x === 47 &&
    draft.effects.light.y === 0 &&
    draft.effects.light.rotate === 6 &&
    draft.effects.scanlines.amount === 24 &&
    draft.effects.grain.amount === 28 &&
    draft.effects.chromatic.amount === 6 &&
    draft.effects.glitch.amount === 16 &&
    draft.effects.slashes.amount === 8 &&
    draft.effects.vignette.amount === 30;
  const diagonalReferenceEffects =
    draft.effects.light.amount === 52 &&
    draft.effects.light.x === 40 &&
    draft.effects.light.y === 0 &&
    draft.effects.light.rotate === -12 &&
    draft.effects.scanlines.amount === 24 &&
    draft.effects.grain.amount === 28 &&
    draft.effects.chromatic.amount === 4 &&
    draft.effects.glitch.amount === 16 &&
    draft.effects.slashes.amount === 8 &&
    draft.effects.vignette.amount === 30;
  const currentDocumentEffects =
    draft.effects.light.amount === 40 &&
    draft.effects.light.x === 30 &&
    draft.effects.light.y === 0 &&
    draft.effects.light.rotate === -12 &&
    draft.effects.scanlines.amount === 24 &&
    draft.effects.grain.amount === 28 &&
    draft.effects.chromatic.amount === 4 &&
    draft.effects.glitch.amount === 16 &&
    draft.effects.slashes.amount === 8 &&
    draft.effects.vignette.amount === 30;
  const reference = referenceCoverEffects();
  const shouldMigrateEffects =
    legacyEffects ||
    previousReferenceEffects ||
    strongReferenceEffects ||
    tunedReferenceEffects ||
    clearColorReferenceEffects ||
    diagonalReferenceEffects ||
    currentDocumentEffects;
  const effects = shouldMigrateEffects
    ? {
        ...reference,
        light: { ...reference.light, enabled: draft.effects.light.enabled },
        scanlines: { ...reference.scanlines, enabled: draft.effects.scanlines.enabled },
        grain: { ...reference.grain, enabled: draft.effects.grain.enabled },
        chromatic: { ...reference.chromatic, enabled: draft.effects.chromatic.enabled },
        glitch: { ...reference.glitch, enabled: draft.effects.glitch.enabled },
        slashes: { ...reference.slashes },
        vignette: { ...reference.vignette, enabled: draft.effects.vignette.enabled },
      }
    : draft.effects;
  return {
    ...draft,
    imageScale,
    imageX,
    imageY,
    layers,
    elementStyles: styles,
    effects,
    bgDim: effects.vignette.enabled,
    bgDimAmount: effects.vignette.amount,
    shaftLight: effects.light.enabled,
    shaftLightAmount: effects.light.amount,
    shaftLightKind: effects.light.kind,
    shaftLightX: effects.light.x,
    shaftLightY: effects.light.y,
    shaftLightRotate: effects.light.rotate,
  };
}

function ensureLayers(templateId: TemplateId, draft: Draft): Draft {
  if (isBuiltinId(templateId)) return mergeNativeLayers(templateId, draft);
  if (Array.isArray(draft.layers)) return draft;
  const empty = emptyDraft(templateId);
  return {
    ...empty,
    ...draft,
    layers: applyElementStyles(empty.layers, draft.elementStyles ?? {}),
    canvasSkin: draft.canvasSkin ?? empty.canvasSkin,
    elementStyles: draft.elementStyles ?? {},
  };
}

export function loadDraft(templateId: TemplateId): Draft {
  const saved = loadState().drafts[templateId];
  if (!saved) return emptyDraft(templateId);
  const empty = emptyDraft(templateId);
  const missingArt = !saved.imageUrl && !saved.imageDataUrl && !saved.operatorId;
  const next = ensureLayers(templateId, {
    ...empty,
    ...saved,
    elementStyles: saved.elementStyles ?? {},
    layers: saved.layers ?? empty.layers,
    canvasSkin: saved.canvasSkin ?? empty.canvasSkin,
    ornamentId: ORNAMENTS.some((item) => item.id === saved.ornamentId) ? saved.ornamentId : empty.ornamentId,
    imageEdgeFade: saved.imageEdgeFade ?? false,
    imageEdgeFadeAmount: saved.imageEdgeFadeAmount ?? empty.imageEdgeFadeAmount,
    mark: saved.mark ?? empty.mark,
    ...(missingArt
      ? {
          operatorName: empty.operatorName,
          operatorId: empty.operatorId,
          artId: empty.artId,
          imageUrl: empty.imageUrl,
        }
      : {}),
  });
  const normalized = {
    ...next,
    effects: normalizeCoverEffects(next.canvasSkin, saved.effects, {
      bgDim:
        next.canvasSkin === "specialist"
          ? (saved.bgDim ?? empty.bgDim)
          : (saved.effects?.vignette?.enabled ?? false),
      bgDimAmount: saved.bgDimAmount ?? empty.bgDimAmount,
      shaftLight: saved.shaftLight ?? empty.shaftLight,
      shaftLightAmount: saved.shaftLightAmount ?? empty.shaftLightAmount,
      shaftLightKind: saved.shaftLightKind ?? empty.shaftLightKind,
      shaftLightX: saved.shaftLightX ?? empty.shaftLightX,
      shaftLightY: saved.shaftLightY ?? empty.shaftLightY,
      shaftLightRotate: saved.shaftLightRotate ?? empty.shaftLightRotate,
    }),
  };
  const laidOut = templateId === "specialist" ? migrateSpecialistLayout(normalized) : normalized;
  return {
    ...laidOut,
    layers: hydrateImageArtGrade(laidOut.layers, laidOut.effects.artGrade, laidOut.canvasSkin === "specialist"),
    effects: {
      ...laidOut.effects,
      artGrade: { ...laidOut.effects.artGrade, enabled: false },
    },
  };
}

export function saveDraft(templateId: TemplateId, draft: Draft): void {
  const state = loadState();
  saveState({ ...state, drafts: { ...state.drafts, [templateId]: draft } });
}
