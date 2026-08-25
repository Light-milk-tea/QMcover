import { BLANK_TEMPLATE_ID, IMAGE_EDGE_FADE_DEFAULT, LEGACY_STORAGE_KEY, STORAGE_KEY } from "../constants";
import { defaultArtFields } from "../data/arts";
import { DEFAULT_BG_PRESET } from "../data/backgrounds";
import { DEFAULT_ORNAMENT, ORNAMENTS } from "../data/ornaments";
import { getBuiltinLayers } from "../data/seeds";
import { getTemplate } from "../data/templates";
import type { Draft, Layer, TemplateId } from "../types";
import { todayISO } from "./dates";
import { applyElementStyles, cloneLayers, defaultCanvasSkin, isBuiltinId } from "./document";
import { getSavedTemplate } from "./templateStore";

export type PersistedState = {
  drafts: Partial<Record<TemplateId, Draft>>;
};

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
    bgDim: seed?.bgDim ?? meta?.defaultBgDim ?? false,
    bgDimAmount: seed?.bgDimAmount ?? meta?.defaultBgDimAmount ?? 48,
    ornamentId: seed?.ornamentId ?? meta?.defaultOrnamentId ?? DEFAULT_ORNAMENT,
    layers: seedLayers(templateId),
    canvasSkin: seed?.canvasSkin ?? meta?.canvasSkin ?? defaultCanvasSkin(templateId),
    paper: seed?.paper,
    elementStyles: {},
  };
}

function migrateLegacyDraft(templateId: TemplateId, saved: Partial<Draft>): Draft {
  const empty = emptyDraft(templateId);
  return {
    ...empty,
    ...saved,
    layers: empty.layers,
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

export function loadState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as PersistedState;
      return { drafts: parsed.drafts ?? {} };
    }
  } catch {
    /* fall through */
  }
  const legacy = readLegacy();
  if (legacy) {
    saveState(legacy);
    return legacy;
  }
  return { drafts: {} };
}

export function saveState(state: PersistedState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function mergeNativeLayers(templateId: TemplateId, draft: Draft): Draft {
  if (!isBuiltinId(templateId)) return draft;
  const seeds = seedLayers(templateId);
  const have = new Map(draft.layers.map((layer) => [layer.id, layer]));
  const natives = seeds.map((seed) => have.get(seed.id) ?? seed);
  const extras = draft.layers.filter((layer) => !seeds.some((seed) => seed.id === layer.id));
  return { ...draft, layers: [...natives, ...extras] };
}

function ensureLayers(templateId: TemplateId, draft: Draft): Draft {
  if (isBuiltinId(templateId)) return mergeNativeLayers(templateId, draft);
  if (Array.isArray(draft.layers) && draft.layers.length > 0) return draft;
  if (templateId === BLANK_TEMPLATE_ID && Array.isArray(draft.layers)) return draft;
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
  return next;
}

export function saveDraft(templateId: TemplateId, draft: Draft): void {
  const state = loadState();
  saveState({ drafts: { ...state.drafts, [templateId]: draft } });
}
