import { toJpeg } from "html-to-image";
import { BILI_COVER } from "../constants";
import { todayISO } from "./dates";
import { buildDocumentFile, draftToDocument, newCustomId, type DocumentFile } from "./document";
import { saveDraft } from "./storage";
import { upsertSavedTemplate } from "./templateStore";
import type { Draft, SavedTemplate, TemplateId } from "../types";

export function downloadCoverDocument(draft: Draft, name?: string, basedOn?: string): void {
  const file = buildDocumentFile(draft, { name, basedOn });
  const safe = (s: string) => s.replace(/[\\/:*?"<>|]/g, "").trim() || "cover";
  const filename = `${draft.date || "config"}_${safe(name || "封面")}.json`;
  const blob = new Blob([`${JSON.stringify(file, null, 2)}\n`], { type: "application/json" });
  const link = document.createElement("a");
  link.download = filename;
  link.href = URL.createObjectURL(blob);
  link.click();
  URL.revokeObjectURL(link.href);
}

export async function captureThumb(node: HTMLElement): Promise<string> {
  const scale = 480 / BILI_COVER.width;
  return toJpeg(node, {
    quality: 0.72,
    pixelRatio: scale,
    width: BILI_COVER.width,
    height: BILI_COVER.height,
    cacheBust: false,
    filter: (el) => {
      if (el instanceof HTMLElement && el.dataset.ignoreExport === "true") return false;
      return true;
    },
  });
}

export async function saveDraftAsTemplate(
  draft: Draft,
  basedOn: TemplateId,
  name: string,
  blurb: string,
  stage?: HTMLElement | null,
): Promise<SavedTemplate> {
  let thumbDataUrl = "";
  if (stage) {
    try {
      thumbDataUrl = await captureThumb(stage);
    } catch {
      thumbDataUrl = "";
    }
  }
  const id = newCustomId();
  const item: SavedTemplate = {
    id,
    name: name.trim() || "未命名模板",
    blurb: blurb.trim() || "自定义模板",
    createdAt: new Date().toISOString(),
    basedOn,
    seed: draftToDocument(draft),
    thumbDataUrl,
  };
  upsertSavedTemplate(item);
  saveDraft(id, { ...draft, date: todayISO(), imageDataUrl: draft.imageDataUrl });
  return item;
}

export type { DocumentFile };
