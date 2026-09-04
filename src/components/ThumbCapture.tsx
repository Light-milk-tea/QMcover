import { useEffect, useRef } from "react";
import { toJpeg } from "html-to-image";
import { BILI_COVER } from "../constants";
import { emptyDraft } from "../lib/storage";
import { CoverView } from "../templates/registry";
import type { TemplateId } from "../types";
import { draftToRenderProps } from "./CoverStage";
import { TEMPLATES } from "../data/templates";
import { CoverEffectsStage, usesLayeredLight } from "../effects/CoverEffectsStage";

const WIDTH = 960;
const SCALE = WIDTH / BILI_COVER.width;

type Props = {
  templateId: TemplateId;
};

declare global {
  interface Window {
    __QM_THUMB?: string;
    __QM_THUMB_ID?: string;
  }
}

export function ThumbCapture({ templateId }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const meta = TEMPLATES.find((t) => t.id === templateId);
  const draft = {
    ...emptyDraft(templateId),
    title: meta?.sampleTitle ?? "标题",
    subtitle: meta?.defaultSubtitle ?? "",
    episode: meta?.sampleEpisode ?? 12,
    signature: meta?.sampleSignature ?? "",
    showSafeArea: false,
  };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let cancelled = false;
    window.__QM_THUMB = undefined;
    window.__QM_THUMB_ID = templateId;

    (async () => {
      await document.fonts.ready;
      await Promise.all(
        [...el.querySelectorAll("img")].map((img) => img.decode().catch(() => undefined)),
      );
      const url = await toJpeg(el, {
        quality: 0.84,
        pixelRatio: 1,
        width: WIDTH,
        height: BILI_COVER.height * SCALE,
        cacheBust: false,
      });
      if (!cancelled) window.__QM_THUMB = url;
    })().catch((err: unknown) => {
      if (!cancelled) window.__QM_THUMB = `error:${err instanceof Error ? err.message : "fail"}`;
    });

    return () => {
      cancelled = true;
    };
  }, [templateId]);

  return (
    <div
      ref={ref}
      data-thumb-capture=""
      className="overflow-hidden bg-black"
      style={{ width: WIDTH, height: BILI_COVER.height * SCALE }}
    >
      <div
        className="origin-top-left"
        style={{
          width: BILI_COVER.width,
          height: BILI_COVER.height,
          transform: `scale(${SCALE})`,
        }}
      >
        <CoverEffectsStage effects={draft.effects} skin={draft.canvasSkin} layeredLight={usesLayeredLight(draft.canvasSkin)}>
          <CoverView
            {...draftToRenderProps(templateId, draft, {
              previewScale: SCALE,
              onImageDrag: () => undefined,
              showPlaceholder: false,
            })}
          />
        </CoverEffectsStage>
      </div>
    </div>
  );
}
