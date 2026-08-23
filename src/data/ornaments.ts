export type OrnamentKind = "none" | "corner" | "side";

export type OrnamentPreset = {
  id: string;
  name: string;
  src: string | null;
  kind: OrnamentKind;
};

/** 公有领域 / CC0 古典花饰，来自 Wikimedia Commons，不是手绘。 */
export const ORNAMENTS: OrnamentPreset[] = [
  { id: "none", name: "无", src: null, kind: "none" },
  { id: "corner", name: "古典角花", src: "/ornaments/corner.svg", kind: "corner" },
  { id: "lace", name: "蕾丝卷草", src: "/ornaments/lace.svg", kind: "side" },
];

export const DEFAULT_ORNAMENT = "none";

export function getOrnament(id?: string): OrnamentPreset {
  return ORNAMENTS.find((o) => o.id === id) ?? ORNAMENTS[0];
}
