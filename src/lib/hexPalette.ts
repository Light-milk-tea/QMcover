export type HexCell = {
  q: number;
  r: number;
  x: number;
  y: number;
  hex: string;
};

const RADIUS = 4;
const SIZE = 12;

function hslToHex(h: number, s: number, l: number): string {
  const sat = s / 100;
  const light = l / 100;
  const a = sat * Math.min(light, 1 - light);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = light - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function cellHex(q: number, r: number): string {
  if (q === 0 && r === 0) return "#ffffff";
  const ring = Math.max(Math.abs(q), Math.abs(r), Math.abs(-q - r));
  const x = q + r / 2;
  const y = (Math.sqrt(3) / 2) * r;
  const hue = ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
  const t = ring / RADIUS;
  return hslToHex(hue, 22 + t * 78, 90 - t * 42);
}

function buildHoneycomb(): { cells: HexCell[]; width: number; height: number; cellW: number; cellH: number } {
  const cellW = Math.sqrt(3) * SIZE;
  const cellH = 2 * SIZE;
  const raw: HexCell[] = [];
  for (let q = -RADIUS; q <= RADIUS; q += 1) {
    for (let r = -RADIUS; r <= RADIUS; r += 1) {
      if (Math.max(Math.abs(q), Math.abs(r), Math.abs(-q - r)) > RADIUS) continue;
      raw.push({
        q,
        r,
        x: cellW * (q + r / 2),
        y: (SIZE * 3) / 2 * r,
        hex: cellHex(q, r),
      });
    }
  }
  const minX = Math.min(...raw.map((c) => c.x));
  const minY = Math.min(...raw.map((c) => c.y));
  const maxX = Math.max(...raw.map((c) => c.x));
  const maxY = Math.max(...raw.map((c) => c.y));
  const cells = raw.map((c) => ({ ...c, x: c.x - minX, y: c.y - minY }));
  return {
    cells,
    width: maxX - minX + cellW,
    height: maxY - minY + cellH,
    cellW,
    cellH,
  };
}

export const HONEYCOMB = buildHoneycomb();

export const GRAY_STRIP = ["#ffffff", "#f4f0e8", "#d8d8d8", "#a8a8a8", "#787878", "#484848", "#141618"];
