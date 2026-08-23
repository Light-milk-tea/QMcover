import { STORAGE_KEY } from "../constants";
import { defaultArtFields } from "../data/arts";
import { DEFAULT_BG_PRESET } from "../data/backgrounds";
import { DEFAULT_ORNAMENT, ORNAMENTS } from "../data/ornaments";
import { getTemplate } from "../data/templates";
import { todayISO } from "./dates";
import type { Draft, TemplateId } from "../types";

const BG_THEME_MIGRATED_KEY = "qmcover-bg-theme-v1";
const LOWSPEC_NIGHT_KEY = "qmcover-lowspec-bg-v1";
const SAMPLE_TEXT_MIGRATED_KEY = "qmcover-sample-text-v1";
const NOCORE_LAYOUT_KEY = "qmcover-nocore-layout-v12";
const ROGUE_LAYOUT_KEY = "qmcover-rogue-layout-v3";

export type PersistedState = {
  drafts: Partial<Record<TemplateId, Draft>>;
};

function readFlagMap(key: string): Partial<Record<TemplateId, boolean>> {
  try {
    return JSON.parse(localStorage.getItem(key) || "{}");
  } catch {
    return {};
  }
}

function markFlag(key: string, templateId: TemplateId): void {
  const done = readFlagMap(key);
  localStorage.setItem(key, JSON.stringify({ ...done, [templateId]: true }));
}

export function emptyDraft(templateId: TemplateId): Draft {
  const meta = getTemplate(templateId);
  const art = defaultArtFields(meta?.defaultOperatorId, meta?.defaultArtId);
  return {
    title: meta?.sampleTitle ?? "",
    subtitle: meta?.defaultSubtitle ?? "",
    signature: meta?.sampleSignature ?? "",
    date: todayISO(),
    episode: meta?.defaultEpisode ?? 1,
    operatorName: art.operatorName,
    operatorId: art.operatorId,
    artId: art.artId,
    imageUrl: art.imageUrl,
    imageDataUrl: "",
    imageScale: meta?.defaultImageScale ?? 100,
    imageX: meta?.defaultImageX ?? 0,
    imageY: meta?.defaultImageY ?? 0,
    showSafeArea: true,
    bgPreset: meta?.defaultBgPreset ?? DEFAULT_BG_PRESET,
    textBgPreset: meta?.defaultTextBgPreset ?? meta?.defaultBgPreset ?? DEFAULT_BG_PRESET,
    bgDim: meta?.defaultBgDim ?? false,
    bgDimAmount: meta?.defaultBgDimAmount ?? 48,
    ornamentId: meta?.defaultOrnamentId ?? DEFAULT_ORNAMENT,
    elementStyles: {},
  };
}

export function loadState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { drafts: {} };
    const parsed = JSON.parse(raw) as PersistedState;
    return { drafts: parsed.drafts ?? {} };
  } catch {
    return { drafts: {} };
  }
}

export function saveState(state: PersistedState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function loadDraft(templateId: TemplateId): Draft {
  const saved = loadState().drafts[templateId];
  if (!saved) return emptyDraft(templateId);
  const empty = emptyDraft(templateId);
  const usedInkByDefault =
    (templateId === "firstkill" || templateId === "rogue") &&
    !readFlagMap(BG_THEME_MIGRATED_KEY)[templateId] &&
    (saved.bgPreset === "ink" || !saved.bgPreset) &&
    empty.bgPreset !== "ink";
  const usedThunderDefault =
    templateId === "lowspec" &&
    !readFlagMap(LOWSPEC_NIGHT_KEY)[templateId] &&
    (saved.bgPreset === "thunder" || !saved.bgPreset);
  const missingArt = !saved.imageUrl && !saved.imageDataUrl && !saved.operatorId;
  const fillSampleText =
    !readFlagMap(SAMPLE_TEXT_MIGRATED_KEY)[templateId] &&
    (!(saved.title ?? "").trim() || !(saved.signature ?? "").trim());
  const resetNocoreLayout =
    templateId === "nocore" && !readFlagMap(NOCORE_LAYOUT_KEY)[templateId];
  if (resetNocoreLayout) {
    const fresh = emptyDraft(templateId);
    saveDraft(templateId, fresh);
    markFlag(NOCORE_LAYOUT_KEY, templateId);
    return fresh;
  }
  const resetRogueLayout =
    templateId === "rogue" && !readFlagMap(ROGUE_LAYOUT_KEY)[templateId];
  if (resetRogueLayout) {
    const fresh = emptyDraft(templateId);
    saveDraft(templateId, fresh);
    markFlag(ROGUE_LAYOUT_KEY, templateId);
    return fresh;
  }
  const next = {
    ...empty,
    ...saved,
    elementStyles: saved.elementStyles ?? {},
    bgPreset: usedInkByDefault || usedThunderDefault ? empty.bgPreset : (saved.bgPreset ?? empty.bgPreset),
    textBgPreset: saved.textBgPreset ?? empty.textBgPreset,
    bgDim: saved.bgDim ?? empty.bgDim,
    bgDimAmount: saved.bgDimAmount ?? empty.bgDimAmount,
    ornamentId: ORNAMENTS.some((item) => item.id === saved.ornamentId) ? saved.ornamentId : empty.ornamentId,
    title: fillSampleText && !(saved.title ?? "").trim() ? empty.title : (saved.title ?? empty.title),
    signature: fillSampleText && !(saved.signature ?? "").trim() ? empty.signature : (saved.signature ?? empty.signature),
    ...(missingArt
      ? {
          operatorName: empty.operatorName,
          operatorId: empty.operatorId,
          artId: empty.artId,
          imageUrl: empty.imageUrl,
        }
      : {}),
  };
  if (usedInkByDefault || usedThunderDefault || missingArt || fillSampleText) {
    saveDraft(templateId, next);
    if (usedInkByDefault) markFlag(BG_THEME_MIGRATED_KEY, templateId);
    if (usedThunderDefault) markFlag(LOWSPEC_NIGHT_KEY, templateId);
    if (fillSampleText) markFlag(SAMPLE_TEXT_MIGRATED_KEY, templateId);
  }
  return next;
}

export function saveDraft(templateId: TemplateId, draft: Draft): void {
  const state = loadState();
  saveState({ drafts: { ...state.drafts, [templateId]: draft } });
}
