import {
  BLANK_TEMPLATE_ID,
  IMAGE_EDGE_FADE_DEFAULT,
  IMAGE_EDGE_FADE_MODE_DEFAULT,
  normalizeEdgeFadeMode,
  LEGACY_STORAGE_KEY,
  SHAFT_LIGHT_DEFAULT,
  SHAFT_LIGHT_ROTATE_DEFAULT,
  SHAFT_LIGHT_X_DEFAULT,
  SHAFT_LIGHT_Y_DEFAULT,
  STORAGE_KEY,
} from "../constants";
import { defaultArtFields } from "../data/arts";
import { defaultChibiPick } from "../data/chibis";
import { DEFAULT_BG_PRESET } from "../data/backgrounds";
import { DEFAULT_ORNAMENT, ORNAMENTS } from "../data/ornaments";
import { getBuiltinLayers } from "../data/seeds";
import { getTemplate } from "../data/templates";
import type { Draft, ImageLayer, Layer, TemplateId } from "../types";
import { todayISO } from "./dates";
import { applyElementStyles, cloneLayers, defaultCanvasSkin, isBuiltinId } from "./document";
import { hydrateImageArtGrade, normalizeCoverEffects, referenceCoverEffects } from "./effects";
import { getSavedTemplate } from "./templateStore";

export type PersistedState = {
  drafts: Partial<Record<TemplateId, Draft>>;
  defaultsVersion?: number;
};

const DEFAULTS_VERSION = 39;

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
    imageEdgeFade: seed?.imageEdgeFade ?? meta?.defaultImageEdgeFade ?? false,
    imageEdgeFadeAmount: seed?.imageEdgeFadeAmount ?? meta?.defaultImageEdgeFadeAmount ?? IMAGE_EDGE_FADE_DEFAULT,
    imageEdgeFadeMode: normalizeEdgeFadeMode(
      seed?.imageEdgeFadeMode ?? meta?.defaultImageEdgeFadeMode ?? IMAGE_EDGE_FADE_MODE_DEFAULT,
    ),
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
    colorway: seed?.colorway ?? meta?.defaultColorway,
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
    imageEdgeFadeMode: normalizeEdgeFadeMode(saved.imageEdgeFadeMode ?? empty.imageEdgeFadeMode),
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

function migrateOperatorPreviewLayout(draft: Draft): Draft {
  const legacyDefault =
    draft.operatorId === "char_1027_greyy2" ||
    draft.operatorId === "char_4042_lumen" ||
    draft.operatorId === "char_427_vigil" ||
    (draft.operatorId === "char_213_mostma" &&
      draft.imageScale === 350 &&
      draft.imageX === -40 &&
      draft.imageY === 470);
  const legacyGrade =
    draft.effects.bgGrade.enabled &&
    draft.effects.bgGrade.grayscale >= 30 &&
    draft.effects.bgGrade.brightness <= 72;
  const legacyEpisode = draft.episode === 6;
  if (!legacyDefault && !legacyGrade && !legacyEpisode) return draft;

  const current = emptyDraft("operator-preview");
  if (!legacyDefault) {
    return {
      ...draft,
      episode: legacyEpisode ? current.episode : draft.episode,
      effects: {
        ...draft.effects,
        bgGrade: current.effects.bgGrade,
        grain: current.effects.grain,
      },
    };
  }
  const nativeLayers = getBuiltinLayers("operator-preview");
  const nativeIds = new Set(nativeLayers.map((layer) => layer.id));
  const extras = draft.layers.filter((layer) => !nativeIds.has(layer.id));
  const elementStyles = Object.fromEntries(
    Object.entries(draft.elementStyles ?? {}).filter(([id]) => !nativeIds.has(id)),
  );
  return {
    ...draft,
    operatorName: current.operatorName,
    operatorId: current.operatorId,
    artId: current.artId,
    imageUrl: current.imageUrl,
    imageScale: current.imageScale,
    imageX: current.imageX,
    imageY: current.imageY,
    episode: legacyEpisode ? current.episode : draft.episode,
    layers: [...nativeLayers, ...extras],
    elementStyles,
    effects: {
      ...draft.effects,
      bgGrade: current.effects.bgGrade,
      grain: current.effects.grain,
    },
  };
}

function migrateSoloUserLayout(draft: Draft): Draft {
  const current = emptyDraft("solo");
  const elementStyles = { ...draft.elementStyles };
  // Overrides are absolute translations. Keep custom positions; remove the
  // approved values now baked into the component defaults.
  for (const [id, x, y] of [
    ["stage", -2.363110539845758, -52.00964010282776],
    ["title", 30.241002570694096, -3.0366323907455017],
  ] as const) {
    const value = elementStyles[id];
    if (!value) continue;
    const next = { ...value };
    if (next.x === x) delete next.x;
    if (next.y === y) delete next.y;
    if (Object.keys(next).length) elementStyles[id] = next;
    else delete elementStyles[id];
  }
  const oldDefault = draft.artId === current.artId &&
    ((draft.imageScale === 440 && draft.imageX === 400 && draft.imageY === 220) ||
     (draft.imageScale === 203 && draft.imageX === 24 && draft.imageY === 121));
  return {
    ...draft,
    ...(oldDefault ? { imageScale: current.imageScale, imageX: current.imageX, imageY: current.imageY } : {}),
    elementStyles,
    layers: draft.layers.map(layer => layer.id === "ak-mark"
      ? { ...layer, hidden: true, removed: true }
      : oldDefault && layer.id === "operator" && layer.kind === "image"
        ? { ...layer, scale: current.imageScale, imageX: current.imageX, imageY: current.imageY }
        : layer),
  };
}

function migrateHighspecOperator(draft: Draft): Draft {
  const eliteDefault =
    draft.imageScale === 196 &&
    draft.imageX === 120 &&
    draft.imageY === 24 &&
    (draft.artId === "char_103_angel_1" || draft.artId === "char_103_angel_2");
  const standingDefault =
    draft.imageScale === 188 &&
    draft.imageX === 72 &&
    draft.imageY === 310 &&
    draft.artId === "char_103_angel_2";
  if (!eliteDefault && !standingDefault) return draft;
  const current = emptyDraft("highspec-nocore");
  const operator = current.layers.find(
    (layer): layer is ImageLayer => layer.id === "operator" && layer.kind === "image",
  );
  return {
    ...draft,
    artId: current.artId,
    imageUrl: current.imageUrl,
    operatorId: current.operatorId,
    operatorName: current.operatorName,
    imageScale: current.imageScale,
    imageX: current.imageX,
    imageY: current.imageY,
    imageEdgeFade: current.imageEdgeFade,
    imageEdgeFadeAmount: current.imageEdgeFadeAmount,
    imageEdgeFadeMode: current.imageEdgeFadeMode,
    layers: draft.layers.map((layer) =>
      layer.id === "operator" && layer.kind === "image" && operator
        ? {
            ...layer,
            artId: current.artId,
            imageUrl: current.imageUrl,
            operatorId: current.operatorId,
            x: operator.x,
            y: operator.y,
            w: operator.w,
            h: operator.h,
            scale: current.imageScale,
            imageX: current.imageX,
            imageY: current.imageY,
            fadeLeft: operator.fadeLeft ?? false,
            fadeLeftSolid: operator.fadeLeftSolid,
            objectFit: operator.objectFit,
            objectPosition: operator.objectPosition,
            transformOrigin: operator.transformOrigin,
            edgeFade: operator.edgeFade,
            edgeFadeAmount: operator.edgeFadeAmount,
            edgeFadeMode: operator.edgeFadeMode,
          }
        : layer,
    ),
  };
}

const HIGHSPEC_BAKED_NUDGES = [
  ["stage", 2.6779059884937237, -13.389039618200837],
  ["verb", -10.711256210774058, -8.03347280334728],
] as const;

function bakeHighspecLayout(draft: Draft): Draft {
  const elementStyles = { ...draft.elementStyles };
  for (const [id, x, y] of HIGHSPEC_BAKED_NUDGES) {
    const value = elementStyles[id];
    if (!value) continue;
    const next = { ...value };
    if (next.x != null && Math.abs(next.x - x) < 0.02) delete next.x;
    if (next.y != null && Math.abs(next.y - y) < 0.02) delete next.y;
    if (Object.keys(next).length) elementStyles[id] = next;
    else delete elementStyles[id];
  }
  const previousImage =
    draft.imageScale === 100 &&
    draft.imageX === 0 &&
    draft.imageY === 0 &&
    draft.artId === "char_103_angel_kfc#1";
  if (!previousImage) return { ...draft, elementStyles };
  const current = emptyDraft("highspec-nocore");
  const operator = current.layers.find(
    (layer): layer is ImageLayer => layer.id === "operator" && layer.kind === "image",
  );
  return {
    ...draft,
    elementStyles,
    imageScale: current.imageScale,
    imageX: current.imageX,
    imageY: current.imageY,
    imageEdgeFade: current.imageEdgeFade,
    imageEdgeFadeAmount: current.imageEdgeFadeAmount,
    imageEdgeFadeMode: current.imageEdgeFadeMode,
    layers: draft.layers.map((layer) =>
      layer.id === "operator" && layer.kind === "image" && operator && (layer.scale ?? 100) === 100 && !layer.imageX && !layer.imageY
        ? {
            ...layer,
            scale: current.imageScale,
            imageX: current.imageX,
            imageY: current.imageY,
            edgeFade: operator.edgeFade,
            edgeFadeAmount: operator.edgeFadeAmount,
            edgeFadeMode: operator.edgeFadeMode,
          }
        : layer,
    ),
  };
}

function migrateDraftDefaults(state: PersistedState): PersistedState {
  if ((state.defaultsVersion ?? 0) >= DEFAULTS_VERSION) return state;
  if ((state.defaultsVersion ?? 0) >= 35) {
    const solo = state.drafts.solo;
    const highspec = state.drafts["highspec-nocore"];
    const next = {
      ...state,
      defaultsVersion: DEFAULTS_VERSION,
      drafts: {
        ...state.drafts,
        ...(solo ? { solo: migrateSoloUserLayout(solo) } : {}),
        ...(highspec ? { "highspec-nocore": bakeHighspecLayout(migrateHighspecOperator(highspec)) } : {}),
      },
    };
    saveState(next);
    return next;
  }
  const drafts: PersistedState["drafts"] = {};
  for (const [id, draft] of Object.entries(state.drafts)) {
    if (!draft) continue;
    if (id === "operator-preview") {
      drafts[id] = migrateOperatorPreviewLayout(draft);
      continue;
    }
    if (id === "highspec-nocore") {
      drafts[id] = bakeHighspecLayout(migrateHighspecOperator(draft));
      continue;
    }
    if (id === "solo") {
      const current = emptyDraft("solo");
      drafts[id] = {
        ...draft,
        imageScale: current.imageScale,
        imageX: current.imageX,
        imageY: current.imageY,
        bgPreset: current.bgPreset,
        textBgPreset: current.textBgPreset,
        layers: getBuiltinLayers("solo"),
        elementStyles: {},
        effects: current.effects,
      };
      continue;
    }
    if (id === "fourstar-nocore") {
      const current = emptyDraft("fourstar-nocore");
      drafts[id] = {
        ...draft,
        title: current.title,
        subtitle: current.subtitle,
        signature: current.signature,
        operatorName: current.operatorName,
        operatorId: current.operatorId,
        artId: current.artId,
        imageUrl: current.imageUrl,
        imageScale: current.imageScale,
        imageX: current.imageX,
        imageY: current.imageY,
        bgPreset: current.bgPreset,
        textBgPreset: current.textBgPreset,
        layers: getBuiltinLayers("fourstar-nocore"),
        elementStyles: {},
        effects: current.effects,
      };
      continue;
    }
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
      !(templateId === "specialist" && (layer.id === "tri" || layer.id === "ruler")) &&
      !(templateId === "strength-review" && layer.id === "operator-b"),
  );
  return { ...draft, layers: [...natives, ...extras] };
}

function migrateStrengthReviewLayout(draft: Draft): Draft {
  const operator = draft.layers.find((layer) => layer.id === "operator" && layer.kind === "image");
  const hasB = draft.layers.some((layer) => layer.id === "operator-b");
  const oldMainElite0 =
    operator?.kind === "image" &&
    operator.artId === "char_4182_oblvns_1" &&
    draft.artId === "char_4182_oblvns_1";
  const current = emptyDraft("strength-review");
  const nextA = current.layers.find((layer) => layer.id === "operator" && layer.kind === "image");
  let next = draft;
  if (oldMainElite0 && nextA?.kind === "image") {
    next = {
      ...draft,
      artId: current.artId,
      imageUrl: current.imageUrl,
      imageScale: current.imageScale,
      imageX: current.imageX,
      imageY: current.imageY,
      layers: draft.layers.map((layer) =>
        layer.id === "operator" && layer.kind === "image"
          ? {
              ...layer,
              artId: nextA.artId,
              imageUrl: nextA.imageUrl,
              scale: nextA.scale,
              imageX: nextA.imageX,
              imageY: nextA.imageY,
              x: nextA.x,
              y: nextA.y,
              w: nextA.w,
              h: nextA.h,
              objectPosition: nextA.objectPosition,
              transformOrigin: nextA.transformOrigin,
            }
          : layer,
      ),
    };
  }
  // Only move the previous untouched crop; uploaded art and custom pans stay put.
  const oldDefaultCrop =
    next.artId === "char_4182_oblvns_avemujica#1" &&
    !next.imageDataUrl &&
    next.imageScale === 378 && next.imageX === -18 && next.imageY === -268 &&
    operator?.kind === "image" && !operator.imageDataUrl &&
    operator.artId === next.artId && nextA?.kind === "image" && operator.imageUrl === nextA.imageUrl &&
    next.imageUrl === current.imageUrl && operator.scale === 378 &&
    operator.imageX === -18 && operator.imageY === -268;
  if (oldDefaultCrop) {
    next = {
      ...next,
      imageX: current.imageX,
      imageY: current.imageY,
      layers: next.layers.map((layer) =>
        layer.id === "operator" && layer.kind === "image"
          ? { ...layer, imageX: current.imageX, imageY: current.imageY }
          : layer,
      ),
    };
  }
  const oldLayout: Record<string, { x: number; y: number; w: number; h: number; fontSize?: number }> = {
    "skill-1": { x: 1008, y: 396, w: 188, h: 188 },
    "skill-2": { x: 1220, y: 396, w: 188, h: 188 },
    "skill-3": { x: 1432, y: 396, w: 188, h: 188 },
    name: { x: 600, y: 598, w: 1240, h: 220, fontSize: 228 },
    series: { x: 600, y: 778, w: 1240, h: 260, fontSize: 268 },
  };
  const previousSkills: typeof oldLayout = {
    "skill-1": { x: 1080, y: 386, w: 220, h: 220 },
    "skill-2": { x: 1314, y: 386, w: 220, h: 220 },
    "skill-3": { x: 1548, y: 386, w: 220, h: 220 },
  };
  const previousGoldSkills: typeof oldLayout = {
    "skill-1": { x: 1000, y: 380, w: 236, h: 236 },
    "skill-2": { x: 1230, y: 380, w: 236, h: 236 },
    "skill-3": { x: 1460, y: 380, w: 236, h: 236 },
  };
  next = {
    ...next,
    layers: next.layers.map((layer) => {
      const old = layer.w === 220 && layer.h === 220
        ? previousSkills[layer.id] ?? oldLayout[layer.id]
        : layer.w === 236 && layer.h === 236
          ? previousGoldSkills[layer.id]
          : oldLayout[layer.id];
      const seed = current.layers.find((item) => item.id === layer.id);
      if (!old || !seed) return layer;
      const updated = { ...layer };
      for (const key of ["x", "y", "w", "h"] as const) {
        if (layer[key] === old[key]) updated[key] = seed[key];
      }
      if (updated.kind === "text" && seed.kind === "text") {
        if (updated.fontSize === old.fontSize) updated.fontSize = seed.fontSize;
        if (updated.color === "#efc44a") updated.color = seed.color;
        if (updated.font === "serif" && !next.elementStyles[layer.id]?.font) updated.font = seed.font;
      }
      return updated;
    }),
  };
  next = {
    ...next,
    layers: next.layers.map((layer) => {
      if (layer.id !== "chibi" || layer.kind !== "image") return layer;
      const imageUrl = layer.imageUrl && /\/skin\/[^/?#]+b\.png/i.test(layer.imageUrl) ? "" : layer.imageUrl;
      const emptyPlaceholder = !layer.imageDataUrl && !imageUrl && !layer.artId && !layer.operatorId;
      const seed = current.layers.find((item) => item.id === "chibi" && item.kind === "image");
      const oldChibiBox =
        !layer.hidden &&
        !layer.removed &&
        ((layer.x === 728 && layer.y === 188 && layer.w === 320 && layer.h === 500 && (layer.scale ?? 100) === 138
          && !(layer.imageX || layer.imageY))
        || (layer.x === 812 && layer.y === 268 && layer.w === 248 && layer.h === 400 && (layer.scale ?? 100) === 100
          && !(layer.imageX || layer.imageY)));
      let nextLayer: ImageLayer = { ...layer, source: "chibi" as const, imageUrl };
      const operatorId = operator?.kind === "image" ? operator.operatorId || next.operatorId : next.operatorId;
      const pick = defaultChibiPick(operatorId);
      if (emptyPlaceholder && !layer.hidden && !layer.removed && pick) {
        nextLayer = { ...nextLayer, ...pick };
      }
      const oldSkinDefault =
        !layer.imageDataUrl &&
        !layer.hidden &&
        !layer.removed &&
        layer.operatorId === "char_4182_oblvns" &&
        (layer.artId === "char_4182_oblvns_avemujica#1" || /oblvns_avemujica/.test(layer.imageUrl || ""));
      if (oldSkinDefault && pick) {
        nextLayer = { ...nextLayer, ...pick };
      }
      if (oldChibiBox && seed?.kind === "image") {
        nextLayer = {
          ...nextLayer,
          x: seed.x,
          y: seed.y,
          w: seed.w,
          h: seed.h,
          scale: seed.scale,
          imageX: seed.imageX,
          imageY: seed.imageY,
        };
      }
      return nextLayer;
    }),
  };
  next = {
    ...next,
    layers: next.layers.map((layer) => {
      if (layer.id !== "atmosphere" || layer.kind !== "box" || layer.removed) return layer;
      if (layer.x === 0 && layer.y === 0 && layer.w === 1920 && layer.h === 1080) {
        return { ...layer, hidden: true, removed: true };
      }
      return layer;
    }),
    elementStyles: Object.fromEntries(
      Object.entries(next.elementStyles ?? {}).flatMap(([id, style]) => {
        if (!/^skill-[123]$/.test(id)) return [[id, style]];
        const baked = id === "skill-1" ? { x: 10, y: 1 } : id === "skill-2" ? { x: 58 } : { x: 94, y: -2 };
        const onlyXY = Object.keys(style).every((key) => key === "x" || key === "y");
        const xOk = style.x == null || style.x === baked.x;
        const yOk = style.y == null || ("y" in baked && Math.round(style.y) === baked.y) || !("y" in baked);
        if (onlyXY && xOk && yOk) return [];
        return [[id, style]];
      }),
    ),
  };
  next = {
    ...next,
    layers: next.layers.map((layer) => {
      if (layer.kind !== "image" || layer.artGrade) return layer;
      if (layer.id !== "operator" && layer.id !== "chibi") return layer;
      const seed = current.layers.find((item) => item.id === layer.id);
      if (seed?.kind !== "image" || !seed.artGrade) return layer;
      return { ...layer, artGrade: { ...seed.artGrade } };
    }),
  };
  if (!hasB && !oldMainElite0) return next;
  const { ["operator-b"]: _dropped, ...elementStyles } = next.elementStyles ?? {};
  return {
    ...next,
    elementStyles,
    layers: next.layers.filter((layer) => layer.id !== "operator-b"),
  };
}

function migrateSixVanguardLayout(draft: Draft): Draft {
  const { ["count-mark"]: _removed, ...elementStyles } = draft.elementStyles;
  draft = {
    ...draft,
    elementStyles,
    layers: draft.layers.filter((layer) => layer.id !== "count-mark"),
  };
  if (draft.title === "H9-5" && draft.subtitle === "先锋六人") {
    draft = { ...draft, title: "H2-5", subtitle: "特种三人" };
  }
  const oldArt = draft.artId === "char_4026_vulpis_1" || draft.operatorId === "char_4026_vulpis";
  const oldGuessedDorothy =
    draft.artId === "char_4048_doroth_1" &&
    draft.imageScale === 380 &&
    draft.imageX === -40 &&
    draft.imageY === -80;
  if (!oldArt && !oldGuessedDorothy) return draft;
  const art = defaultArtFields("char_4048_doroth", "char_4048_doroth_1");
  return {
    ...draft,
    operatorName: art.operatorName,
    operatorId: art.operatorId,
    artId: art.artId,
    imageUrl: art.imageUrl,
    imageScale: 177,
    imageX: -215.5387931034468,
    imageY: -40.73275862068997,
    layers: draft.layers.map((layer) =>
      layer.id === "operator" && layer.kind === "image"
        ? {
            ...layer,
            operatorId: art.operatorId,
            artId: art.artId,
            imageUrl: art.imageUrl,
            scale: 177,
            imageX: -215.5387931034468,
            imageY: -40.73275862068997,
            w: 1400,
            objectPosition: "left top",
            transformOrigin: "left top",
          }
        : layer,
    ),
  };
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

function migratePolaroidDecorations(draft: Draft): Draft {
  const layers = draft.layers.map((layer): Layer => {
    const legacyPolaroid =
      layer.kind === "box" &&
      layer.id.startsWith("el-") &&
      layer.label === "拍立得" &&
      layer.chrome === "paper" &&
      layer.effect === "polaroid";
    if (!legacyPolaroid) return layer;
    return {
      id: layer.id,
      kind: "image",
      source: "operator",
      frame: "polaroid",
      label: layer.label,
      x: layer.x,
      y: layer.y,
      w: layer.w,
      h: layer.h,
      opacity: layer.opacity,
      locked: layer.locked,
      hidden: layer.hidden,
      removed: layer.removed,
      rotation: layer.rotation ?? 3.4,
      frameBgPreset: draft.bgPreset,
      frameBgScale: 100,
      frameBgX: 0,
      frameBgY: 0,
      operatorId: draft.operatorId,
      artId: draft.artId,
      imageUrl: draft.imageUrl,
      imageDataUrl: draft.imageDataUrl,
      scale: 118,
      imageX: 0,
      imageY: 0,
      objectFit: "contain",
      objectPosition: "center bottom",
    };
  });
  return { ...draft, layers };
}

function migrateTacticalMatrixDefaults(draft: Draft): Draft {
  const current = emptyDraft("tactical-matrix");
  const oldArt =
    !draft.imageDataUrl &&
    (draft.artId === "char_450_necras_1" || draft.operatorId === "char_450_necras");
  const oldPan = draft.imageScale === 310 && draft.imageX === 130 && draft.imageY === 530;
  let next = draft;
  if (oldArt && oldPan) {
    next = {
      ...next,
      operatorName: current.operatorName,
      operatorId: current.operatorId,
      artId: current.artId,
      imageUrl: current.imageUrl,
      imageScale: current.imageScale,
      imageX: current.imageX,
      imageY: current.imageY,
      layers: next.layers.map((layer) =>
        layer.id === "operator" && layer.kind === "image"
          ? {
              ...layer,
              operatorId: current.operatorId,
              artId: current.artId,
              imageUrl: current.imageUrl,
              scale: current.imageScale,
              imageX: current.imageX,
              imageY: current.imageY,
            }
          : layer,
      ),
    };
  }
  if (!next.colorway) next = { ...next, colorway: current.colorway };
  return next;
}

// Add the new material controls to earlier matrix drafts without touching user
// text, transforms, colors, grading, or the order of existing layers.
function migrateTacticalMatrixMaterials(draft: Draft): Draft {
  if (draft.canvasSkin !== "tactical-matrix") return draft;
  const layers = [...draft.layers];
  for (const seed of getBuiltinLayers("tactical-matrix")) {
    if ((seed.id !== "prism" && seed.id !== "film") || layers.some((layer) => layer.id === seed.id)) continue;
    const before = seed.id === "prism" ? layers.findIndex((layer) => layer.id === "embers") : -1;
    layers.splice(before < 0 ? layers.length : before, 0, seed);
  }
  return {
    ...draft,
    layers: layers.map((layer) => {
      if (layer.id !== "operation" || layer.kind !== "text") return layer;
      if (draft.elementStyles.operation?.fontSize != null) return layer;
      if (layer.fontSize !== 48 || layer.x !== 1060 || layer.y !== 934) return layer;
      return { ...layer, fontSize: 60, y: 926, h: 86 };
    }),
  };
}

export function loadDraft(templateId: TemplateId): Draft {
  const saved = loadState().drafts[templateId];
  if (!saved) return emptyDraft(templateId);
  const empty = emptyDraft(templateId);
  const missingArt = !saved.imageUrl && !saved.imageDataUrl && !saved.operatorId;
  const next = migratePolaroidDecorations(ensureLayers(templateId, {
    ...empty,
    ...saved,
    elementStyles: saved.elementStyles ?? {},
    layers: saved.layers ?? empty.layers,
    canvasSkin: saved.canvasSkin ?? empty.canvasSkin,
    ornamentId: ORNAMENTS.some((item) => item.id === saved.ornamentId) ? saved.ornamentId : empty.ornamentId,
    imageEdgeFade: saved.imageEdgeFade ?? false,
    imageEdgeFadeAmount: saved.imageEdgeFadeAmount ?? empty.imageEdgeFadeAmount,
    imageEdgeFadeMode: normalizeEdgeFadeMode(saved.imageEdgeFadeMode ?? empty.imageEdgeFadeMode),
    mark: saved.mark ?? empty.mark,
    ...(missingArt
      ? {
          operatorName: empty.operatorName,
          operatorId: empty.operatorId,
          artId: empty.artId,
          imageUrl: empty.imageUrl,
        }
      : {}),
  }));
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
  const laidOut = normalized.canvasSkin === "tactical-matrix"
    ? migrateTacticalMatrixDefaults(migrateTacticalMatrixMaterials(normalized))
    : templateId === "specialist"
    ? migrateSpecialistLayout(normalized)
    : templateId === "six-vanguard"
      ? migrateSixVanguardLayout(normalized)
      : templateId === "strength-review"
        ? migrateStrengthReviewLayout(normalized)
        : normalized;
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
