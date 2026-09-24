import highspecNocoreThumb from "../assets/thumbs/highspec-nocore-shot.webp";
import tacticalMatrixThumb from "../assets/thumbs/tactical-matrix-shot.webp";
import endfieldThumb from "../assets/thumbs/endfield-shot.webp";
import emergencyLessonThumb from "../assets/thumbs/emergency-lesson-shot.webp";
import firstkillThumb from "../assets/thumbs/firstkill-shot.webp";
import fourstarNocoreThumb from "../assets/thumbs/fourstar-nocore-shot.webp";
import madnessThumb from "../assets/thumbs/madness-shot.webp";
import soloThumb from "../assets/thumbs/solo-shot.webp";
import operatorPreviewThumb from "../assets/thumbs/operator-preview-shot.webp";
import rogueThumb from "../assets/thumbs/rogue-shot.webp";
import specialistThumb from "../assets/thumbs/specialist-shot.webp";
import type { TemplateId } from "../types";
import sixVanguardThumb from "../assets/thumbs/six-vanguard-shot.webp";
import strengthReviewThumb from "../assets/thumbs/strength-review-shot.webp";

const THUMB_REV: Partial<Record<TemplateId, number>> = {
  nocore: 13,
};

const THUMB_ASSET: Partial<Record<TemplateId, string>> = {
  "tactical-matrix": tacticalMatrixThumb,
  "six-vanguard": sixVanguardThumb,
  "strength-review": strengthReviewThumb,
  firstkill: firstkillThumb,
  "emergency-lesson": emergencyLessonThumb,
  madness: madnessThumb,
  rogue: rogueThumb,
  endfield: endfieldThumb,
  specialist: specialistThumb,
  "operator-preview": operatorPreviewThumb,
  "fourstar-nocore": fourstarNocoreThumb,
  solo: soloThumb,
  "highspec-nocore": highspecNocoreThumb,
};

export function templateThumbSrc(id: TemplateId): string {
  const asset = THUMB_ASSET[id];
  if (asset) return asset;
  const rev = THUMB_REV[id];
  return rev ? `/thumbs/${id}.webp?v=${rev}` : `/thumbs/${id}.webp`;
}
