import { avgBackgroundBase, rewriteGhUrl } from "../lib/cdn";
import catalog from "./avg-backgrounds.json";

const avg = (file: string) => `${avgBackgroundBase()}/${file}`;

export type BgCategory = string;

export type BgPreset = {
  id: string;
  name: string;
  url: string | null;
  category: BgCategory;
};

const PLACE_LABELS: { id: string; name: string }[] = [
  { id: "lungmen", name: "龙门" },
  { id: "laterano", name: "拉特兰" },
  { id: "victoria", name: "维多利亚" },
  { id: "yan", name: "尚蜀" },
  { id: "yumen", name: "玉门" },
  { id: "iberia", name: "伊比利亚" },
  { id: "leithanien", name: "莱塔尼亚" },
  { id: "kazimierz", name: "卡西米尔" },
  { id: "columbia", name: "哥伦比亚" },
  { id: "siracusa", name: "叙拉古" },
  { id: "siesta", name: "汐斯塔" },
  { id: "sami", name: "萨米" },
  { id: "durin", name: "杜林" },
  { id: "kjerag", name: "谢拉格" },
  { id: "ursus", name: "乌萨斯" },
  { id: "higashi", name: "东国" },
  { id: "sargon", name: "萨尔贡" },
  { id: "aegir", name: "阿戈尔" },
  { id: "rhodes", name: "罗德岛" },
  { id: "unknown", name: "未分类" },
];

const INK: BgPreset = { id: "ink", name: "墨底", url: null, category: "ink" };

export const BG_PRESETS: BgPreset[] = [
  INK,
  ...catalog.map((item) => ({
    id: item.id,
    name: item.name,
    url: avg(item.file),
    category: item.category,
  })),
];

const used = new Set(BG_PRESETS.map((item) => item.category));

export const BG_CATEGORIES: { id: string; name: string }[] = [
  { id: "all", name: "全部" },
  ...PLACE_LABELS.filter((item) => used.has(item.id)),
];

export const DEFAULT_BG_PRESET = "ink";

const byId = new Map(BG_PRESETS.map((item) => [item.id, item]));

export function getBgPreset(id?: string): BgPreset {
  const item = (id && byId.get(id)) || INK;
  if (!item.url) return item;
  return { ...item, url: rewriteGhUrl(item.url) };
}
