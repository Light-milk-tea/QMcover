import catalog from "./operators.json";

export type ArtKind = "elite2" | "elite0" | "skin" | "other";

export type OperatorArt = {
  id: string;
  label: string;
  kind: ArtKind;
};

export type Operator = {
  id: string;
  name: string;
  nameEn: string;
  rarity: number;
  profession: string;
  professionCn: string;
  arts: OperatorArt[];
};

const ART_BASE = "https://cdn.jsdelivr.net/gh/yuanyan3060/ArknightsGameResource@main";

export const OPERATORS = catalog.operators as Operator[];

export const PROFESSIONS = [
  "先锋",
  "近卫",
  "重装",
  "狙击",
  "术师",
  "医疗",
  "辅助",
  "特种",
] as const;

export function avatarUrl(charId: string): string {
  return `${ART_BASE}/avatar/${charId}.png`;
}

export function artUrl(portraitId: string): string {
  return `${ART_BASE}/skin/${encodeURIComponent(`${portraitId}b`)}.png`;
}

export function preferredArt(op: Operator): OperatorArt {
  return op.arts.find((a) => a.kind === "elite2") ?? op.arts[0];
}

export function findOperator(id: string): Operator | undefined {
  return OPERATORS.find((op) => op.id === id);
}

export function findOperatorByName(name: string): Operator | undefined {
  const t = name.trim();
  if (!t) return undefined;
  return OPERATORS.find((op) => op.name === t);
}

export function coverImage(cover: { imageDataUrl: string; imageUrl?: string }): string {
  return cover.imageDataUrl || cover.imageUrl || "";
}

export function defaultArtFields(operatorId?: string) {
  const op = operatorId ? findOperator(operatorId) : undefined;
  const art = op ? preferredArt(op) : undefined;
  return {
    operatorName: op?.name ?? "",
    operatorId: op?.id ?? "",
    artId: art?.id ?? "",
    imageUrl: art ? artUrl(art.id) : "",
  };
}
