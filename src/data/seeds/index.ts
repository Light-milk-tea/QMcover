import type { BuiltinTemplateId, Layer } from "../../types";
import { endfieldLayers } from "./endfield";
import { firstkillLayers } from "./firstkill";
import { fourstarNocoreLayers } from "./fourstarNocore";
import { lowspecLayers } from "./lowspec";
import { madnessLayers } from "./madness";
import { nocoreLayers } from "./nocore";
import { operatorPreviewLayers } from "./operatorPreview";
import { rogueLayers } from "./rogue";
import { soloLayers } from "./solo";
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
  "fourstar-nocore": fourstarNocoreLayers,
  solo: soloLayers,
};

export function getBuiltinLayers(id: BuiltinTemplateId): Layer[] {
  return SEEDS[id].map((layer) => ({ ...layer }));
}
