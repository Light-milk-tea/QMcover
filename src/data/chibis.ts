import { chibiBase } from "../lib/cdn";
import catalog from "./chibis.json";
import type { ImageLayer } from "../types";
import { findOperator, type Operator, type OperatorArt } from "./arts";

export type ChibiEntry = {
  charId: string;
  artId: string;
  file: string;
};

export const CHIBI_FILES = catalog.files as Record<string, ChibiEntry>;

export function chibiFileKey(id: string): string {
  return id.replaceAll("#", "-");
}

export function spineSkinKey(id: string): string {
  return id.replaceAll("#", "_");
}

export function chibiCharDir(id: string): string {
  const match = id.match(/^(char_\d+_[a-z0-9]+)/i);
  return match ? match[1] : id;
}

export function chibiIdFor(operatorId: string, art?: Pick<OperatorArt, "id" | "kind">): string {
  if (!art || art.kind !== "skin") return chibiCharDir(art?.id ?? operatorId);
  return chibiFileKey(art.id);
}

export function hasChibi(operatorId: string, art?: Pick<OperatorArt, "id" | "kind">): boolean {
  return chibiIdFor(operatorId, art) in CHIBI_FILES;
}

export function localChibiPath(id: string): string {
  return `/chibi/${encodeURIComponent(chibiFileKey(id))}.png`;
}

export function chibiUrl(id: string): string {
  if (import.meta.env.DEV) return localChibiPath(id);
  return `${chibiBase()}/chibi/${encodeURIComponent(chibiFileKey(id))}.png`;
}

function isPortraitArtUrl(url?: string): boolean {
  return Boolean(url && /\/skin\/[^/?#]+b\.png/i.test(url));
}

export function remoteChibiFile(url: string): string {
  const match = url.match(/\/chibi\/([^/?#]+)/i);
  if (!match) return "";
  return decodeURIComponent(match[1]).replace(/\.png$/i, "");
}

export function resolveChibiUrl(layer: {
  imageDataUrl?: string;
  imageUrl?: string;
  artId?: string;
  operatorId?: string;
}): string {
  if (layer.imageDataUrl) return layer.imageDataUrl;
  if (layer.imageUrl && !isPortraitArtUrl(layer.imageUrl)) {
    const file = remoteChibiFile(layer.imageUrl);
    if (import.meta.env.DEV && file && /ArknightsChibi|\/gh\//.test(layer.imageUrl)) {
      return localChibiPath(file);
    }
    return layer.imageUrl;
  }
  if (layer.artId) {
    const kind = layer.artId.includes("#") ? "skin" : "elite0";
    const key = chibiIdFor(layer.operatorId || chibiCharDir(layer.artId), { id: layer.artId, kind });
    if (CHIBI_FILES[key]) return chibiUrl(key);
  }
  if (layer.operatorId && CHIBI_FILES[layer.operatorId]) return chibiUrl(layer.operatorId);
  return "";
}

export function firstChibiArt(op: Operator): OperatorArt | undefined {
  return op.arts.find((art) => hasChibi(op.id, art));
}

export function defaultChibiPick(operatorId?: string): { operatorId: string; artId: string; imageUrl: string } | null {
  const op = findOperator(operatorId || "");
  if (!op) return null;
  const elite0 = op.arts.find((art) => art.kind === "elite0");
  const pick = elite0 && hasChibi(op.id, elite0) ? elite0 : firstChibiArt(op);
  if (!pick) return null;
  return {
    operatorId: op.id,
    artId: pick.id,
    imageUrl: chibiUrl(chibiIdFor(op.id, pick)),
  };
}

export function pickChibiArt(op: Operator, art?: Pick<OperatorArt, "id" | "kind">): OperatorArt | undefined {
  if (art && hasChibi(op.id, art)) {
    return op.arts.find((item) => item.id === art.id) ?? ({ ...art, label: art.id } as OperatorArt);
  }
  return firstChibiArt(op);
}

export function followingChibiPatch(
  layer: Pick<ImageLayer, "hidden" | "removed" | "imageDataUrl" | "operatorId"> | undefined,
  previousOperatorId: string,
  op: Operator,
  art?: Pick<OperatorArt, "id" | "kind">,
): Partial<ImageLayer> | null {
  if (!layer || layer.hidden || layer.removed || layer.imageDataUrl) return null;
  if (layer.operatorId && previousOperatorId && layer.operatorId !== previousOperatorId) return null;
  const pick = pickChibiArt(op, art);
  return {
    source: "chibi",
    operatorId: op.id,
    artId: pick?.id ?? art?.id ?? "",
    imageUrl: pick ? chibiUrl(chibiIdFor(op.id, pick)) : "",
    imageDataUrl: "",
  };
}
