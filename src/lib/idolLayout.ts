/** 主标题拆左右两个词：title 对半（前半取多），短词也能拆。 */
export function splitTitleWords(title: string | undefined): [string, string] {
  const glyphs = [...(title ?? "").trim()];
  if (glyphs.length === 0) return ["", ""];
  const half = Math.ceil(glyphs.length / 2);
  return [glyphs.slice(0, half).join(""), glyphs.slice(half).join("")];
}

function halves(word: string): [string, string] {
  const glyphs = [...word.toUpperCase().replace(/\s+/g, "")];
  const half = Math.ceil(glyphs.length / 2);
  return [glyphs.slice(0, half).join(""), glyphs.slice(half).join("")];
}

/**
 * 干员英文名拆成四块空心字：上排左右、下排左右。
 * 首词放上排，余词放下排；名字只有一个词时上下两排同词（上小下大）。
 */
export function nameRows(nameEn: string | undefined): { t1: string; t2: string; b1: string; b2: string } {
  const parts = (nameEn ?? "").trim().split(/\s+/).filter(Boolean);
  const top = parts[0] ?? "";
  const rest = parts.length > 1 ? parts.slice(1).join(" ") : top;
  const [t1, t2] = halves(top);
  const [b1, b2] = halves(rest);
  return { t1, t2, b1, b2 };
}

/** 下装饰带文案：VOL.001 式期号；name 模式放干员英文名（失败回退期号）。 */
export function bandBottomText(episode: number | undefined, mode?: "vol" | "name", nameEn?: string): string {
  if (mode === "name") return (nameEn ?? "").trim().toUpperCase() || bandBottomText(episode);
  return `VOL.${String(episode || 1).padStart(3, "0")}`;
}