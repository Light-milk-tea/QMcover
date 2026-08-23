import { BILI_COVER } from "../constants";
import { findOperator } from "../data/arts";
import { getBgPreset } from "../data/backgrounds";
import { TEMPLATE_ELEMENTS } from "../data/elements";
import { getTemplate } from "../data/templates";
import type { Draft, ResolvedElement, TemplateId } from "../types";

export type CoverConfigFile = {
  kind: "qmcover-config";
  version: 1;
  howToUse: string;
  exportedAt: string;
  templateId: TemplateId;
  templateName: string;
  texts: {
    title: string;
    subtitle: string;
    signature: string;
    episode: number;
    date: string;
  };
  art: {
    operatorId: string;
    operatorName: string;
    artId: string;
    artLabel: string;
    imageScale: number;
    imageX: number;
    imageY: number;
    uploaded: boolean;
    imageUrl: string;
  };
  background: {
    id: string;
    name: string;
    dim: boolean;
    dimAmount: number;
    textId?: string;
    textName?: string;
  };
  ornamentId: string;
  elements: Array<{
    id: string;
    label: string;
    kind: string;
    override: Draft["elementStyles"][string];
    resolved: ResolvedElement;
    box?: { x: number; y: number; w: number; h: number; fontSize?: number; color?: string };
  }>;
  draft: Omit<Draft, "imageDataUrl">;
};

function round(n: number): number {
  return Math.round(n * 10) / 10;
}

function collectBoxes(stage: HTMLElement) {
  const rect = stage.getBoundingClientRect();
  const sx = rect.width / BILI_COVER.width || 1;
  const sy = rect.height / BILI_COVER.height || 1;
  const boxes: Record<string, { x: number; y: number; w: number; h: number; fontSize?: number; color?: string }> = {};
  for (const el of stage.querySelectorAll<HTMLElement>("[data-cover-el]")) {
    const id = el.dataset.coverEl;
    if (!id) continue;
    const r = el.getBoundingClientRect();
    const css = getComputedStyle(el);
    const fontSize = Number.parseFloat(css.fontSize);
    boxes[id] = {
      x: round((r.left - rect.left) / sx),
      y: round((r.top - rect.top) / sy),
      w: round(r.width / sx),
      h: round(r.height / sy),
      ...(Number.isFinite(fontSize) && fontSize > 0 ? { fontSize: round(fontSize / sx) } : {}),
      ...(css.color ? { color: css.color } : {}),
    };
  }
  return boxes;
}

export function buildCoverConfig(
  templateId: TemplateId,
  draft: Draft,
  resolvedElements: Record<string, ResolvedElement>,
  stage?: HTMLElement | null,
): CoverConfigFile {
  const meta = getTemplate(templateId);
  const op = findOperator(draft.operatorId);
  const art = op?.arts.find((item) => item.id === draft.artId);
  const bg = getBgPreset(draft.bgPreset);
  const textBg = getBgPreset(draft.textBgPreset || draft.bgPreset);
  const boxes = stage ? collectBoxes(stage) : {};
  const { imageDataUrl: _omit, ...draftSafe } = draft;

  return {
    kind: "qmcover-config",
    version: 1,
    howToUse: "发给 Agent 即可复现当前封面配置。不含立绘原图。坐标是 1920×1080 画布像素。",
    exportedAt: new Date().toISOString(),
    templateId,
    templateName: meta?.name ?? templateId,
    texts: {
      title: draft.title,
      subtitle: draft.subtitle,
      signature: draft.signature,
      episode: draft.episode,
      date: draft.date,
    },
    art: {
      operatorId: draft.operatorId,
      operatorName: draft.operatorName,
      artId: draft.artId,
      artLabel: art?.label ?? "",
      imageScale: draft.imageScale,
      imageX: draft.imageX,
      imageY: draft.imageY,
      uploaded: Boolean(draft.imageDataUrl),
      imageUrl: draft.imageDataUrl ? "" : draft.imageUrl,
    },
    background: {
      id: draft.bgPreset,
      name: bg.name,
      dim: draft.bgDim,
      dimAmount: draft.bgDimAmount,
      textId: draft.textBgPreset || draft.bgPreset,
      textName: textBg.name,
    },
    ornamentId: draft.ornamentId,
    elements: TEMPLATE_ELEMENTS[templateId].map((el) => ({
      id: el.id,
      label: el.label,
      kind: el.kind,
      override: draft.elementStyles[el.id] ?? {},
      resolved: resolvedElements[el.id] ?? {},
      box: boxes[el.id],
    })),
    draft: draftSafe,
  };
}

export function downloadCoverConfig(config: CoverConfigFile): void {
  const safe = (s: string) => s.replace(/[\\/:*?"<>|]/g, "").trim() || "cover";
  const name = `${config.texts.date || "config"}_${safe(config.templateName)}_配置.json`;
  const blob = new Blob([`${JSON.stringify(config, null, 2)}\n`], { type: "application/json" });
  const link = document.createElement("a");
  link.download = name;
  link.href = URL.createObjectURL(blob);
  link.click();
  URL.revokeObjectURL(link.href);
}
