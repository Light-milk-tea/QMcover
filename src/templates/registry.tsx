import type { ComponentType } from "react";
import { ElementEditProvider } from "../components/CoverElement";
import { useCoverOptional } from "../store/CoverContext";
import type { CoverRenderProps, TemplateId } from "../types";
import { Endfield } from "./Endfield";
import { FirstKill } from "./FirstKill";
import { LowSpec } from "./LowSpec";
import { Madness } from "./Madness";
import { Nocore } from "./Nocore";
import { Rogue } from "./Rogue";

export const TEMPLATE_VIEWS: Record<TemplateId, ComponentType<CoverRenderProps>> = {
  firstkill: FirstKill,
  lowspec: LowSpec,
  rogue: Rogue,
  madness: Madness,
  nocore: Nocore,
  endfield: Endfield,
};

export function CoverView(props: CoverRenderProps & { templateId: TemplateId }) {
  const View = TEMPLATE_VIEWS[props.templateId] ?? FirstKill;
  const cover = useCoverOptional();
  return (
    <ElementEditProvider
      styles={props.elementStyles ?? {}}
      previewScale={props.previewScale}
      interactive={props.showPlaceholder !== false}
    >
      <div
        className="h-full w-full"
        onPointerDown={(e) => {
          if ((e.target as HTMLElement).closest("[data-cover-el]")) return;
          cover?.selectElement(null);
        }}
      >
        <View {...props} />
      </div>
    </ElementEditProvider>
  );
}
