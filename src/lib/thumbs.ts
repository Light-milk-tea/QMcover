import endfieldThumb from "../assets/thumbs/endfield-shot.webp";
import firstkillThumb from "../assets/thumbs/firstkill-shot.webp";
import madnessThumb from "../assets/thumbs/madness-shot.webp";
import operatorPreviewThumb from "../assets/thumbs/operator-preview-shot.webp";
import rogueThumb from "../assets/thumbs/rogue-shot.webp";
import specialistThumb from "../assets/thumbs/specialist-shot.webp";
import type { TemplateId } from "../types";

const THUMB_REV: Partial<Record<TemplateId, number>> = {
  nocore: 13,
};

const THUMB_ASSET: Partial<Record<TemplateId, string>> = {
  firstkill: firstkillThumb,
  madness: madnessThumb,
  rogue: rogueThumb,
  endfield: endfieldThumb,
  specialist: specialistThumb,
  "operator-preview": operatorPreviewThumb,
};

export function templateThumbSrc(id: TemplateId): string {
  const asset = THUMB_ASSET[id];
  if (asset) return asset;
  const rev = THUMB_REV[id];
  return rev ? `/thumbs/${id}.webp?v=${rev}` : `/thumbs/${id}.webp`;
}
