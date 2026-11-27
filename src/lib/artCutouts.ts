import type { CSSProperties } from "react";

type Cutout = {
  width: number;
  height: number;
  /** 原图像素坐标的外轮廓，只描画布里会露出来的那一截，其余整块保留。 */
  points: [number, number][];
  /** 外轮廓里还要挖掉的场景，比如手臂和身体之间露出的原画天空。 */
  holes?: [number, number][][];
};

/** 精二自带整幅场景的立绘：按封面取景手描人物上沿，把头顶和手臂周围的场景挖掉。 */
const ART_CUTOUTS: Record<string, Cutout> = {
  char_4212_nasti_2: {
    width: 2426,
    height: 2543,
    points: [
      [700, 1750], [700, 1110], [1050, 1100], [1185, 1090], [1172, 1045], [1150, 1005], [1137, 967],
      [1083, 927], [1020, 897], [950, 860], [940, 800], [973, 797], [1000, 812], [1017, 820], [1023, 853],
      [1070, 883], [1123, 913], [1150, 930], [1190, 935], [1216, 902], [1219, 855], [1225, 832], [1241, 817],
      [1257, 798], [1260, 804], [1281, 795], [1304, 787], [1322, 785], [1333, 787], [1335, 748], [1347, 748],
      [1360, 763], [1372, 770], [1377, 763], [1388, 763], [1395, 785], [1407, 811], [1413, 842], [1439, 858],
      [1449, 871], [1439, 876], [1439, 889], [1451, 914], [1460, 927], [1467, 939], [1483, 950], [1550, 953], [1600, 950],
      [1700, 937], [1757, 946], [1810, 995], [1835, 1100], [1820, 1250], [1850, 1750],
    ],
    holes: [
      [
        [1046, 968], [1076, 971], [1126, 979], [1182, 1022], [1239, 1092], [1294, 1112], [1296, 1131],
        [1285, 1168], [1254, 1205], [1238, 1220], [1207, 1158], [1126, 1116], [1123, 1042], [1076, 1022],
        [1046, 1020],
      ],
    ],
  },
};

/** 立绘库地址是 `.../skin/<artId>b.png`；上传图和别的地址认不出，返回空。 */
export function artIdFromUrl(url: string): string | undefined {
  const match = url.match(/\/skin\/([^/?#]+)b\.png(?:[?#]|$)/);
  return match ? decodeURIComponent(match[1]) : undefined;
}

export function hasArtCutout(imageUrl: string): boolean {
  const artId = artIdFromUrl(imageUrl);
  return Boolean(artId && ART_CUTOUTS[artId]);
}

/**
 * 立绘 `<img>` 用 `object-fit: contain` + `object-position: 0 0` 时，同样 `xMinYMin meet`
 * 的 SVG 蒙版铺满元素框，就和图片内容逐像素对齐。
 */
export function artCutoutMask(imageUrl: string): CSSProperties | undefined {
  const artId = artIdFromUrl(imageUrl);
  const cut = artId ? ART_CUTOUTS[artId] : undefined;
  if (!cut) return undefined;
  const ring = (points: [number, number][]) => `${points.map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`).join(" ")} Z`;
  const d = [cut.points, ...(cut.holes ?? [])].map(ring).join(" ");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${cut.width} ${cut.height}" preserveAspectRatio="xMinYMin meet"><path d="${d}" fill="#000" fill-rule="evenodd"/></svg>`;
  const url = `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
  return {
    WebkitMaskImage: url,
    maskImage: url,
    WebkitMaskSize: "100% 100%",
    maskSize: "100% 100%",
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
  };
}
