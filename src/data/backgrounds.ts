const AVG = "https://cdn.jsdelivr.net/gh/Aceship/Arknight-Images@main/avg/backgrounds";

const avg = (file: string) => `${AVG}/${file}`;

export type BgPreset = {
  id: string;
  name: string;
  url: string | null;
};

export const BG_PRESETS: BgPreset[] = [
  { id: "ink", name: "墨底", url: null },
  { id: "arena", name: "竞技场", url: avg("bg_arena_1.png") },
  { id: "mine", name: "矿坑", url: avg("bg_cave_2.png") },
  { id: "wild", name: "荒野", url: avg("bg_wild_a.png") },
  { id: "desert", name: "沙原", url: avg("bg_desert_1.png") },
  { id: "ruins", name: "废城", url: avg("bg_cher_3.png") },
  { id: "battlefield", name: "战场", url: avg("bg_battlefield.png") },
  { id: "lungmen-night", name: "龙门夜", url: avg("bg_lungmen_n.png") },
  { id: "lungmen-street", name: "龙门街", url: avg("bg_lmstreet_1.png") },
  { id: "beach", name: "海滩", url: avg("bg_beach_1.png") },
  { id: "forest", name: "密林", url: avg("bg_forest.png") },
  { id: "coldforest", name: "寒林", url: avg("bg_coldforest.png") },
  { id: "snow", name: "雪乡", url: avg("bg_snowconutry_1.png") },
  { id: "thunder", name: "雷云", url: avg("bg_thundercloud.png") },
  { id: "village", name: "村落", url: avg("bg_village.png") },
  { id: "county", name: "乡野", url: avg("bg_county_1.png") },
  { id: "wreck", name: "废墟", url: avg("bg_ruins_1.png") },
  { id: "cave-mouth", name: "洞口", url: avg("bg_caveentrance.png") },
  { id: "motorway", name: "公路", url: avg("bg_motorway.png") },
  { id: "outcity", name: "城外", url: avg("bg_outcity_1.png") },
  { id: "iberia-coast", name: "海蚀", url: avg("bg_ibcoastd.png") },
  { id: "yumen-desert", name: "玉门漠", url: avg("35_g11_yumendesert.png") },
  { id: "wild-war", name: "荒战", url: avg("37_g10_wildbattlefield.png") },
  { id: "snowmount", name: "雪山", url: avg("30_ex1_snowmount.png") },
  { id: "blackforest", name: "黑林", url: avg("40_g1_blackforest.png") },
  { id: "giantwall", name: "巨墙", url: avg("27_g4_giantwall.png") },
];

export const DEFAULT_BG_PRESET = "ink";

export function getBgPreset(id?: string): BgPreset {
  return BG_PRESETS.find((p) => p.id === id) ?? BG_PRESETS[0];
}
