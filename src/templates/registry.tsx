import type { ComponentType } from "react";
import { LayerStage } from "../canvas/LayerStage";
import { ElementEditProvider } from "../components/CoverElement";
import { isNativeElement, nativeTemplateId } from "../data/elements";
import { useCoverOptional } from "../store/CoverContext";
import type { BuiltinTemplateId, CoverRenderProps } from "../types";
import { Endfield } from "./Endfield";
import { FirstKill } from "./FirstKill";
import { LowSpec } from "./LowSpec";
import { Madness } from "./Madness";
import { Nocore } from "./Nocore";
import { Rogue } from "./Rogue";
import { Specialist } from "./Specialist";

export const TEMPLATE_VIEWS: Record<BuiltinTemplateId, ComponentType<CoverRenderProps>> = {
  firstkill: FirstKill,
  lowspec: LowSpec,
  rogue: Rogue,
  madness: Madness,
  nocore: Nocore,
  endfield: Endfield,
  specialist: Specialist,
};

export function CoverView(props: CoverRenderProps) {
  const cover = useCoverOptional();
  const templateId = props.templateId ?? cover?.templateId;
  const viewId = nativeTemplateId(templateId ?? "", props.canvasSkin ?? cover?.draft.canvasSkin);
  const extras = (cover?.draft.layers ?? props.layers ?? []).filter((layer) => {
    if (!viewId) return true;
    return !isNativeElement(viewId, layer.id);
  });

  if (viewId) {
    const View = TEMPLATE_VIEWS[viewId];
    return (
      <ElementEditProvider
        styles={props.elementStyles ?? {}}
        previewScale={props.previewScale}
        interactive={props.showPlaceholder !== false}
      >
        <div
          className="relative h-full w-full"
          onPointerDown={(e) => {
            if ((e.target as HTMLElement).closest("[data-cover-el]")) return;
            cover?.selectElement(null);
          }}
        >
          <View {...props} />
          {extras.length > 0 ? <LayerStage {...props} overlay extraLayers={extras} /> : null}
        </div>
      </ElementEditProvider>
    );
  }

  return <LayerStage {...props} />;
}
