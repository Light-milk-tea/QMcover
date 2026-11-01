import { TEMPLATES_STORAGE_KEY } from "../constants";
import type { SavedTemplate } from "../types";
import { parsePersisted, writePersisted } from "./persist";

export function loadSavedTemplates(): SavedTemplate[] {
  try {
    const raw = localStorage.getItem(TEMPLATES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = parsePersisted<SavedTemplate[]>(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveSavedTemplates(items: SavedTemplate[]): void {
  if (!writePersisted(TEMPLATES_STORAGE_KEY, items)) throw new Error("save-failed");
}

export function upsertSavedTemplate(item: SavedTemplate): void {
  const items = loadSavedTemplates().filter((cur) => cur.id !== item.id);
  saveSavedTemplates([item, ...items]);
}

export function removeSavedTemplate(id: string): void {
  saveSavedTemplates(loadSavedTemplates().filter((item) => item.id !== id));
}

export function getSavedTemplate(id: string): SavedTemplate | undefined {
  return loadSavedTemplates().find((item) => item.id === id);
}
