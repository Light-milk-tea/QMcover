import type { BuiltinTemplateId, Layer } from "../../types";
import { endfieldLayers } from "./endfield";
import { emergencyLessonLayers } from "./emergencyLesson";
import { firstkillLayers } from "./firstkill";
import { fourstarNocoreLayers } from "./fourstarNocore";
import { lowspecLayers } from "./lowspec";
import { madnessLayers } from "./madness";
import { nocoreLayers } from "./nocore";
import { operatorPreviewLayers } from "./operatorPreview";
import { rogueLayers } from "./rogue";
import { soloLayers } from "./solo";
import { specialistLayers } from "./specialist";
import { sixVanguardLayers } from "./sixVanguard";
import { strengthReviewLayers } from "./strengthReview";

const SEEDS: Record<BuiltinTemplateId, Layer[]> = {
  "six-vanguard": sixVanguardLayers,
  "strength-review": strengthReviewLayers,
  firstkill: firstkillLayers,
  lowspec: lowspecLayers,
  rogue: rogueLayers,
  "emergency-lesson": emergencyLessonLayers,
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
