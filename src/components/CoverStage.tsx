import type { RefObject } from "react";
import { BILI_COVER } from "../constants";
import { coverImage } from "../data/arts";
import { displaySubtitle, displayTitle } from "../lib/interpolate";
import { useCover } from "../store/CoverContext";
import { CoverView } from "../templates/registry";
import { getTemplate } from "../data/templates";
import type { Draft, TemplateId } from "../types";
import { SafeArea } from "./SafeArea";
import { ScaledFrame } from "./ScaledFrame";

export function draftToRenderProps(
  templateId: TemplateId,
  draft: Draft,
  extra: {
    previewScale: number;
    onImageDrag: (dx: number, dy: number) => void;
    showPlaceholder?: boolean;
  },
) {
  return {
    templateId,
    title: displayTitle(draft, getTemplate(templateId)?.titleKind ?? "operator"),
    subtitle: displaySubtitle(draft),
    signature: draft.signature,
    episode: draft.episode,
    date: draft.date,
    operatorName: draft.operatorName,
    imageUrl: coverImage(draft),
    imageScale: draft.imageScale,
    imageX: draft.imageX,
    imageY: draft.imageY,
    bgPreset: draft.bgPreset,
    elementStyles: draft.elementStyles ?? {},
    previewScale: extra.previewScale,
    onImageDrag: extra.onImageDrag,
    showPlaceholder: extra.showPlaceholder,
  };
}

type Props = {
  stageRef: RefObject<HTMLDivElement | null>;
};

export function CoverStage({ stageRef }: Props) {
  const { templateId, draft, patchDraft } = useCover();

  return (
    <ScaledFrame>
      {(scale) => (
        <>
          <div
            ref={stageRef}
            className="relative overflow-hidden"
            style={{ width: BILI_COVER.width, height: BILI_COVER.height }}
          >
            <CoverView
              {...draftToRenderProps(templateId, draft, {
                previewScale: scale,
                onImageDrag: (dx, dy) => {
                  patchDraft({
                    imageX: draft.imageX + dx,
                    imageY: draft.imageY + dy,
                  });
                },
              })}
            />
          </div>
          {draft.showSafeArea ? (
            <div className="pointer-events-none absolute inset-0">
              <SafeArea />
            </div>
          ) : null}
        </>
      )}
    </ScaledFrame>
  );
}
