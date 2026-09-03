import type { BuiltinTemplateId, Layer } from "../../types";
import { endfieldLayers } from "./endfield";
import { firstkillLayers } from "./firstkill";
import { lowspecLayers } from "./lowspec";
import { madnessLayers } from "./madness";
import { nocoreLayers } from "./nocore";
import { operatorPreviewLayers } from "./operatorPreview";
import { rogueLayers } from "./rogue";
import { specialistLayers } from "./specialist";

const SEEDS: Record<BuiltinTemplateId, Layer[]> = {
  firstkill: firstkillLayers,
  lowspec: lowspecLayers,
  rogue: rogueLayers,
  madness: madnessLayers,
  nocore: nocoreLayers,
  endfield: endfieldLayers,
  specialist: specialistLayers,
  "operator-preview": operatorPreviewLayers,
};

export function getBuiltinLayers(id: BuiltinTemplateId): Layer[] {
  return SEEDS[id].map((layer) => ({ ...layer }));
}
