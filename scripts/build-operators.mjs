import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const CHAR_URL =
  "https://raw.githubusercontent.com/yuanyan3060/ArknightsGameResource/main/gamedata/excel/character_table.json";
const SKIN_URL =
  "https://raw.githubusercontent.com/yuanyan3060/ArknightsGameResource/main/gamedata/excel/skin_table.json";

const SKIP_PROF = new Set(["TOKEN", "TRAP"]);

const PROF_CN = {
  PIONEER: "先锋",
  WARRIOR: "近卫",
  TANK: "重装",
  SNIPER: "狙击",
  CASTER: "术师",
  MEDIC: "医疗",
  SUPPORT: "辅助",
  SPECIAL: "特种",
};

function rarityOf(char) {
  const raw = char.rarity;
  if (typeof raw === "number") return raw + 1;
  const m = String(raw ?? "").match(/(\d+)/);
  return m ? Number(m[1]) : 0;
}

function artKind(portraitId, skinName) {
  if (skinName) return "skin";
  if (portraitId.endsWith("_2")) return "elite2";
  if (portraitId.endsWith("_1")) return "elite0";
  return "other";
}

function artLabel(portraitId, skinName) {
  if (skinName) return skinName;
  if (portraitId.endsWith("_2")) return "精二";
  if (portraitId.endsWith("_1")) return "精英0";
  return "立绘";
}

function kindRank(kind) {
  if (kind === "elite2") return 0;
  if (kind === "skin") return 1;
  if (kind === "elite0") return 2;
  return 3;
}

const [charRes, skinRes] = await Promise.all([fetch(CHAR_URL), fetch(SKIN_URL)]);
if (!charRes.ok) throw new Error(`character_table ${charRes.status}`);
if (!skinRes.ok) throw new Error(`skin_table ${skinRes.status}`);

const characters = await charRes.json();
const skins = await skinRes.json();
const charSkins = skins.charSkins ?? skins;

const artsByChar = new Map();

for (const skin of Object.values(charSkins)) {
  if (!skin || typeof skin !== "object") continue;
  const charId = skin.charId;
  const portraitId = skin.portraitId;
  if (!charId || !portraitId) continue;
  const skinName = skin.displaySkin?.skinName ?? "";
  const list = artsByChar.get(charId) ?? [];
  if (list.some((a) => a.id === portraitId)) continue;
  const kind = artKind(portraitId, skinName);
  list.push({
    id: portraitId,
    label: artLabel(portraitId, skinName),
    kind,
  });
  artsByChar.set(charId, list);
}

const operators = [];

for (const [id, char] of Object.entries(characters)) {
  if (!id.startsWith("char_")) continue;
  if (SKIP_PROF.has(char.profession)) continue;
  if (!char.name) continue;

  const arts = (artsByChar.get(id) ?? []).sort((a, b) => kindRank(a.kind) - kindRank(b.kind));
  if (!arts.length) {
    const phases = Array.isArray(char.phases) ? char.phases.length : 1;
    if (phases >= 3) arts.push({ id: `${id}_2`, label: "精二", kind: "elite2" });
    arts.push({ id: `${id}_1`, label: "精英0", kind: "elite0" });
  }

  operators.push({
    id,
    name: char.name,
    nameEn: char.appellation ?? "",
    rarity: rarityOf(char),
    profession: char.profession,
    professionCn: PROF_CN[char.profession] ?? char.profession,
    arts,
  });
}

operators.sort((a, b) => b.rarity - a.rarity || a.name.localeCompare(b.name, "zh-CN"));

const out = {
  generatedAt: new Date().toISOString(),
  source: "yuanyan3060/ArknightsGameResource",
  count: operators.length,
  operators,
};

const dest = resolve(import.meta.dirname, "../src/data/operators.json");
writeFileSync(dest, JSON.stringify(out));
console.log(`wrote ${operators.length} operators -> ${dest}`);
