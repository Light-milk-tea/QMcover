import type { RefObject } from "react";
import { X } from "@phosphor-icons/react";
import { BILI_COVER, IMAGE_EDGE_FADE_DEFAULT } from "../constants";
import { coverImage } from "../data/arts";
import { displaySubtitle, displayTitle } from "../lib/interpolate";
import { useCover } from "../store/CoverContext";
import { CoverView } from "../templates/registry";
import { getTemplate } from "../data/templates";
import { CoverEffectsStage, usesLayeredLight } from "../effects/CoverEffectsStage";
import type { Draft, TemplateId } from "../types";
import { layerLabel } from "./LayerStackList";
import { SafeArea } from "./SafeArea";
import { ScaledFrame } from "./ScaledFrame";
import { SelectionOverlay } from "./SelectionOverlay";

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
    imageEdgeFadeMode: draft.imageEdgeFadeMode,
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
    colorway: draft.colorway,
    previewScale: extra.previewScale,
    onImageDrag: extra.onImageDrag,
    showPlaceholder: extra.showPlaceholder,
  };
}

type Props = {
  stageRef: RefObject<HTMLDivElement | null>;
};

export function CoverStage({ stageRef }: Props) {
  const { templateId, draft, patchDraft, selectedLayer, selectElement } = useCover();
  const picked = selectedLayer && !selectedLayer.hidden && !selectedLayer.removed ? selectedLayer : undefined;

  return (
    <div
      className="relative h-full w-full"
      onPointerDown={(e) => {
        if (!stageRef.current?.contains(e.target as Node)) selectElement(null);
      }}
    >
      {picked ? (
        <button
          type="button"
          data-ignore-export="true"
          title="取消选择（点空白处或按 Esc 也可以）"
          className="absolute top-2 right-2 z-[300] flex max-w-[60%] items-center gap-1.5 rounded-full bg-text/85 py-1 pr-2.5 pl-3 text-[12px] text-white shadow-[0_4px_12px_rgba(0,0,0,0.18)] hover:bg-text"
          onClick={() => selectElement(null)}
        >
          <span className="min-w-0 truncate">已选 {layerLabel(templateId, picked, draft.canvasSkin)}</span>
          <X size={12} weight="bold" className="shrink-0" />
          <span className="sr-only">取消选择</span>
        </button>
      ) : null}
      <ScaledFrame>
        {(scale) => (
          <>
            <div
              ref={stageRef}
              className="relative overflow-hidden"
              style={{ width: BILI_COVER.width, height: BILI_COVER.height }}
            >
              <CoverEffectsStage effects={draft.effects} skin={draft.canvasSkin} layeredLight={usesLayeredLight(draft.canvasSkin)}>
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
              <SelectionOverlay stageRef={stageRef} previewScale={scale} />
            </div>
            {draft.showSafeArea ? (
              <div className="pointer-events-none absolute inset-0">
                <SafeArea />
              </div>
            ) : null}
          </>
        )}
      </ScaledFrame>
    </div>
  );
}
