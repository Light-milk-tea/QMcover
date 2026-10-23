import { toPng } from "html-to-image";
import { beforeAll, beforeEach, expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { TEMPLATE_ELEMENTS, nativeTextValue } from "../data/elements";
import { getBuiltinLayers } from "../data/seeds";
import "../index.css";
import { emptyDraft } from "../lib/storage";
import type { CoverRenderProps, Layer } from "../types";
import { Idol } from "./Idol";

beforeAll(async () => {
  await Promise.all([
    document.fonts.load('900 100px "Outfit Variable"'),
    document.fonts.load("400 160px Anton"),
    document.fonts.load('900 100px "Noto Sans SC"'),
  ]);
});

beforeEach(() => {
  localStorage.clear();
});

const svg = (body: string) =>
  `data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'>${body}</svg>`)}`;
const WHITE_ART = svg("<rect width='64' height='64' fill='#ffffff'/>");
const EMPTY_ART = svg("");
/** operator 槽的 OperatorLayer 展开 {...props}，立绘以 props.imageUrl 为准；
 *  导出像素测试要给立绘传透明 PNG，否则默认的白块占位会盖住黑带。 */
function transparentPng(): string {
  const c = document.createElement("canvas");
  c.width = 2;
  c.height = 2;
  return c.toDataURL("image/png");
}

function stubLayers(clearOperator = false, operatorArt = WHITE_ART): Layer[] {
  return getBuiltinLayers("idol").map((layer) => {
    if (layer.kind !== "image") return layer;
    if (layer.id === "operator") {
      return { ...layer, imageUrl: operatorArt, artId: "", operatorId: clearOperator ? "" : layer.operatorId };
    }
    return { ...layer, imageUrl: EMPTY_ART };
  });
}

function renderCover(patch: Partial<CoverRenderProps> = {}) {
  return render(
    <div style={{ width: 1920, height: 1080 }}>
      <Idol
        title="干员评测"
        subtitle=""
        signature=""
        mark=""
        episode={3}
        date="2026-10-16"
        operatorName=""
        imageUrl={WHITE_ART}
        imageScale={138}
        imageX={0}
        imageY={0}
        previewScale={1}
        onImageDrag={() => undefined}
        showPlaceholder={false}
        layers={stubLayers()}
        {...patch}
      />
    </div>,
  );
}

const canvasOf = (root: HTMLElement) => root.querySelector("[data-idol-canvas]") as HTMLElement;
/** 空心字和主标题都带一层 aria-hidden 的底副本，只读看得见的那层。 */
const faceText = (canvas: HTMLElement, id: string) =>
  canvas.querySelector(`[data-cover-el="${id}"] > span > span:last-child`)?.textContent ?? "";
const zOf = (el: Element | null) => Number(getComputedStyle(el as HTMLElement).zIndex);

function meta(id: string) {
  return TEMPLATE_ELEMENTS.idol.find((item) => item.id === id)!;
}

test("默认稿：四块空心字按干员英文名拆分，两条装饰带和左右主标题就位", async () => {
  const screen = await renderCover();
  const canvas = canvasOf(screen.container);

  // 默认干员多萝西 DOROTHY → 上下两排各拆 DORO/THY
  for (const id of ["name-t1", "name-t2", "name-b1", "name-b2"]) {
    expect(faceText(canvas, id), id).toBe(["DORO", "THY", "DORO", "THY"][["name-t1", "name-t2", "name-b1", "name-b2"].indexOf(id)]);
  }
  expect(faceText(canvas, "head-l")).toBe("干员");
  expect(faceText(canvas, "head-r")).toBe("评测");

  const bandTop = canvas.querySelector('[data-cover-el="band-top"]') as HTMLElement;
  expect(bandTop?.textContent?.includes("QMcover")).toBe(true);
  expect(bandTop?.textContent?.match(/QMcover/g)?.length ?? 0).toBeGreaterThan(6);
  expect(getComputedStyle(bandTop).backgroundColor).toBe("rgba(0, 0, 0, 0)");
  expect(getComputedStyle(bandTop).color).toBe("rgb(28, 22, 20)");

  const bandBottom = canvas.querySelector('[data-cover-el="band-bottom"]');
  expect(bandBottom?.textContent?.includes("VOL.003")).toBe(true);

  // 半身立绘压住标题内侧，小人再压在标题字上
  expect(zOf(canvas.querySelector("[data-operator-slot]"))).toBeGreaterThan(
    zOf(canvas.querySelector('[data-cover-el="head-l"]')),
  );
  expect(zOf(canvas.querySelector('[data-cover-el="chibi-bl"]'))).toBeGreaterThan(
    zOf(canvas.querySelector("[data-operator-slot]")),
  );
  expect(zOf(canvas.querySelector('[data-cover-el="band-bottom"]'))).toBeGreaterThan(
    zOf(canvas.querySelector('[data-cover-el="name-b1"]')),
  );

  const chibi = canvas.querySelector('[data-cover-el="chibi-tl"]') as HTMLElement;
  expect(Number.parseFloat(getComputedStyle(chibi).top)).toBeGreaterThan(400);

  const head = canvas.querySelector('[data-cover-el="head-l"] [data-idol-head] span:last-child') as HTMLElement;
  expect(getComputedStyle(head).color).toBe("rgb(163, 60, 22)");

  expect(canvas.getAttribute("data-colorway")).toBe("#f9e5e2");
  expect(getComputedStyle(canvas).backgroundColor).toBe("rgb(249, 229, 226)");
});

test("空心字只有一根渐变细描边，没有切片交叉", async () => {
  const screen = await renderCover();
  const canvas = canvasOf(screen.container);
  const face = canvas.querySelector('[data-cover-el="name-t1"] [data-idol-hollow]') as HTMLElement;
  const lines = [...face.querySelectorAll("text")];
  expect(lines).toHaveLength(1);
  expect(face.querySelectorAll("[clip-path], [style*='clip-path']")).toHaveLength(0);
  const stops = [...face.querySelectorAll("stop")].map((stop) => stop.getAttribute("stop-color"));
  expect(stops).toEqual(["#470857", "#7a1064", "#c43a88"]);
  expect(lines[0].getAttribute("stroke-width")).toBe("0.008em");
  expect(lines[0].getAttribute("fill")).toBe("none");
});

test("主标题对半拆分：两字各一行，三字前两个字放左边，单字只放左", async () => {
  const cases: Array<[string, string, string]> = [
    ["干员评测", "干员", "评测"],
    ["评测", "评", "测"],
    ["评测记录", "评测", "记录"],
    ["评", "评", ""],
  ];
  for (const [title, left, right] of cases) {
    const screen = await renderCover({ title, layers: stubLayers() });
    const canvas = canvasOf(screen.container);
    expect(faceText(canvas, "head-l"), title).toBe(left);
    expect(canvas.querySelector('[data-cover-el="head-r"]') !== null, `${title} 右词存在`).toBe(right.length > 0);
    if (right) expect(faceText(canvas, "head-r"), title).toBe(right);
    canvas.remove();
  }
});

test("换干员后空心字跟着换英文名；期号决定下装饰带 VOL", async () => {
  const screen = await renderCover({
    operatorName: "阿米娅",
    episode: 7,
    layers: stubLayers(true),
  });
  const canvas = canvasOf(screen.container);
  // AMIYA → AMI / YA
  expect(faceText(canvas, "name-t1")).toBe("AMI");
  expect(faceText(canvas, "name-b2")).toBe("YA");
  expect(canvas.querySelector('[data-cover-el="band-bottom"]')?.textContent?.includes("VOL.007")).toBe(true);
});

test("背景纯色可换色", async () => {
  const screen = await renderCover({ colorway: "#3355aa" });
  const canvas = canvasOf(screen.container);
  expect(canvas.getAttribute("data-colorway")).toBe("#3355aa");
  expect(getComputedStyle(canvas).backgroundColor).toBe("rgb(51, 85, 170)");
});

test("检查器读原生文字：左右标题对半、空心字跟干员、期号 VOL 带", () => {
  const draft = emptyDraft("idol");
  draft.title = "干员评测";
  draft.operatorName = "阿米娅";
  draft.episode = 12;
  const style = {};
  expect(nativeTextValue("idol", meta("head-l"), draft, style)).toBe("干员");
  expect(nativeTextValue("idol", meta("head-r"), draft, style)).toBe("评测");
  expect(nativeTextValue("idol", meta("name-t1"), draft, style)).toBe("AMI");
  expect(nativeTextValue("idol", meta("name-b2"), draft, style)).toBe("YA");
  expect(nativeTextValue("idol", meta("band-bottom"), draft, style)).toBe("VOL.012");
  draft.bandMode = "name";
  expect(nativeTextValue("idol", meta("band-bottom"), draft, style)).toBe("AMIYA");
});

test("下装饰带可切干员英文名；条纹背景底画出条纹", async () => {
  const screen = await renderCover({
    bandMode: "name",
    operatorName: "阿米娅",
    layers: stubLayers(true),
    bgPattern: "stripes",
  });
  const canvas = canvasOf(screen.container);
  expect(canvas.querySelector('[data-cover-el="band-bottom"]')?.textContent?.includes("AMIYA")).toBe(true);

  const stripes = canvas.querySelector("[data-idol-stripes]");
  expect(stripes).not.toBeNull();
  expect(getComputedStyle(stripes as HTMLElement).backgroundImage).toContain("repeating-linear-gradient");
});

test("背景手写底纹默认隐藏，打开后落在所有元素最底层", async () => {
  const screen = await renderCover();
  const canvas = canvasOf(screen.container);
  expect(canvas.querySelector('[data-cover-el="hand-bg"]')).toBeNull();

  const shown = await renderCover({
    layers: stubLayers().map((layer) => (layer.id === "hand-bg" ? { ...layer, hidden: false } : layer)),
  });
  const visible = canvasOf(shown.container);
  const bg = visible.querySelector('[data-cover-el="hand-bg"]');
  expect(bg).not.toBeNull();
  expect(bg?.textContent?.includes("QMcover")).toBe(true);
  expect(zOf(bg)).toBeLessThan(zOf(visible.querySelector('[data-cover-el="name-t1"]')));
});

test("导出：底色、粗黑字和紫粉空心描边都真实落进像素，透明立绘不产生白块", async () => {
  const screen = await renderCover({
    elementStyles: { "head-l": { text: "" }, "head-r": { text: "" }, "hand-note": { text: "" } },
    imageUrl: transparentPng(),
    layers: stubLayers(false, transparentPng()),
  });
  const canvas = canvasOf(screen.container);
  await document.fonts.ready;
  await Promise.all([...canvas.querySelectorAll("img")].map((img) => img.decode()));
  // 只留空心字，Outfit 可变字体内嵌很快；主标题的思源黑体太沉，导出前已清空。
  const url = await toPng(canvas, { width: 1920, height: 1080, pixelRatio: 0.5 });
  const image = new Image();
  image.src = url;
  await image.decode();
  const probe = document.createElement("canvas");
  probe.width = image.naturalWidth;
  probe.height = image.naturalHeight;
  const ctx = probe.getContext("2d");
  if (!ctx) throw new Error("no canvas");
  ctx.drawImage(image, 0, 0);
  const at = (x: number, y: number) => ctx.getImageData(Math.floor(x / 2), Math.floor(y / 2), 1, 1).data;

  const [br, bg, bb] = at(30, 30);
  expect(br).toBeGreaterThan(230);
  expect(bg).toBeGreaterThan(215);
  expect(bb).toBeGreaterThan(205);

  // 黑字行不是黑底：同一行里既有深色笔画，也有露出的底色
  let ink = 0;
  let paper = 0;
  for (let x = 20; x < 900; x += 6) {
    const [r, g, b] = at(x, 348);
    if (r + g + b < 140) ink += 1;
    if (r > 210 && g > 190 && b > 180) paper += 1;
  }
  expect(ink).toBeGreaterThan(4);
  expect(paper).toBeGreaterThan(4);

  let tinted = 0;
  for (let y = 40; y < 280; y += 3) {
    for (let x = 40; x < 700; x += 3) {
      const [r, g, b] = at(x, y);
      const purple = r < 160 && b > 40 && b > g + 10 && r > 30;
      const pink = r > 180 && b > 150 && g < 220 && b > g;
      if (purple || pink) tinted += 1;
    }
  }
  expect(tinted).toBeGreaterThan(12);
});