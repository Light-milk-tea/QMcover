import { STORAGE_KEY } from "../constants";
import { defaultArtFields } from "../data/arts";
import { DEFAULT_BG_PRESET } from "../data/backgrounds";
import { getTemplate } from "../data/templates";
import { todayISO } from "./dates";
import type { Draft, TemplateId } from "../types";

const BG_THEME_MIGRATED_KEY = "qmcover-bg-theme-v1";

export type PersistedState = {
  drafts: Partial<Record<TemplateId, Draft>>;
};

function readMigrated(): Partial<Record<TemplateId, boolean>> {
  try {
    return JSON.parse(localStorage.getItem(BG_THEME_MIGRATED_KEY) || "{}");
  } catch {
    return {};
  }
}

function markMigrated(templateId: TemplateId): void {
  const done = readMigrated();
  localStorage.setItem(
    BG_THEME_MIGRATED_KEY,
    JSON.stringify({ ...done, [templateId]: true }),
  );
}

export function emptyDraft(templateId: TemplateId): Draft {
  const meta = getTemplate(templateId);
  const art = defaultArtFields(meta?.defaultOperatorId);
  return {
    title: "",
    subtitle: meta?.defaultSubtitle ?? "",
    signature: "",
    date: todayISO(),
    episode: meta?.defaultEpisode ?? 1,
    operatorName: art.operatorName,
    operatorId: art.operatorId,
    artId: art.artId,
    imageUrl: art.imageUrl,
    imageDataUrl: "",
    imageScale: meta?.defaultImageScale ?? 100,
    imageX: 0,
    imageY: 0,
    showSafeArea: true,
    bgPreset: meta?.defaultBgPreset ?? DEFAULT_BG_PRESET,
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
    !readMigrated()[templateId] &&
    (saved.bgPreset === "ink" || !saved.bgPreset) &&
    empty.bgPreset !== "ink";
  const missingArt = !saved.imageUrl && !saved.imageDataUrl && !saved.operatorId;
  const next = {
    ...empty,
    ...saved,
    elementStyles: saved.elementStyles ?? {},
    bgPreset: usedInkByDefault ? empty.bgPreset : (saved.bgPreset ?? empty.bgPreset),
    ...(missingArt
      ? {
          operatorName: empty.operatorName,
          operatorId: empty.operatorId,
          artId: empty.artId,
          imageUrl: empty.imageUrl,
        }
      : {}),
  };
  if (usedInkByDefault || missingArt) {
    saveDraft(templateId, next);
    if (usedInkByDefault) markMigrated(templateId);
  }
  return next;
}

export function saveDraft(templateId: TemplateId, draft: Draft): void {
  const state = loadState();
  saveState({ drafts: { ...state.drafts, [templateId]: draft } });
}
