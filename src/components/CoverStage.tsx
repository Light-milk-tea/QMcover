import type { RefObject } from "react";
import { BILI_COVER, IMAGE_EDGE_FADE_DEFAULT } from "../constants";
import { coverImage } from "../data/arts";
import { displaySubtitle, displayTitle } from "../lib/interpolate";
import { useCover } from "../store/CoverContext";
import { CoverView } from "../templates/registry";
import { getTemplate } from "../data/templates";
import { CoverEffectsStage } from "../effects/CoverEffectsStage";
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
    mark: draft.mark ?? "",
    episode: draft.episode,
    date: draft.date,
    operatorName: draft.operatorName,
    imageUrl: coverImage(draft),
    imageScale: draft.imageScale,
    imageX: draft.imageX,
    imageY: draft.imageY,
    imageEdgeFade: draft.imageEdgeFade ?? false,
    imageEdgeFadeAmount: draft.imageEdgeFadeAmount ?? IMAGE_EDGE_FADE_DEFAULT,
    bgPreset: draft.bgPreset,
    textBgPreset: draft.textBgPreset,
    bgDim: false,
    bgDimAmount: draft.effects.vignette.amount,
    shaftLight: false,
    shaftLightAmount: draft.effects.light.amount,
    shaftLightKind: draft.effects.light.kind,
    shaftLightX: draft.effects.light.x,
    shaftLightY: draft.effects.light.y,
    shaftLightRotate: draft.effects.light.rotate,
    effects: draft.effects,
    ornamentId: draft.ornamentId,
    elementStyles: draft.elementStyles ?? {},
    layers: draft.layers,
    canvasSkin: draft.canvasSkin,
    paper: draft.paper,
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
            <CoverEffectsStage effects={draft.effects} skin={draft.canvasSkin} layeredLight={draft.canvasSkin === "specialist"}>
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
            </CoverEffectsStage>
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
