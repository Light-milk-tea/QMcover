import { toPng } from "html-to-image";
import { useRef } from "react";
import { beforeAll, beforeEach, expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { CoverStage } from "../components/CoverStage";
import { EditorPanel } from "../components/EditorPanel";
import { InspectorPanel } from "../components/InspectorPanel";
import { getBuiltinLayers } from "../data/seeds";
import { emptyDraft } from "../lib/storage";
import "../index.css";
import { MODULE_TONES, gradientMapMatrix, moduleGradePixel, moduleUnitColor } from "../lib/moduleReviewLayout";
import { CoverProvider } from "../store/CoverContext";
import type { CoverRenderProps, Layer } from "../types";
import { ModuleReview } from "./ModuleReview";

beforeAll(async () => {
  await Promise.all([
    document.fonts.load('400 100px "Six Caps"'),
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

/** 精二用纯白图，渐变映射后应正好是代表色；精一透明，露出后面的精二和大字。 */
function stubLayers(): Layer[] {
  return getBuiltinLayers("module-review").map((layer) => {
    if (layer.kind !== "image") return layer;
    return { ...layer, imageUrl: layer.id.startsWith("back-") ? WHITE_ART : EMPTY_ART, artId: "" };
  });
}

function renderCover(patch: Partial<CoverRenderProps> = {}) {
  return render(
    <div style={{ width: 1920, height: 1080 }}>
      <ModuleReview
        title="模组测评"
        subtitle="THIS IS A MOD REVIEW VIDEO"
        signature="2nd"
        mark="UNIT"
        episode={3}
        date="2026-10-09"
        operatorName=""
        imageUrl={EMPTY_ART}
        imageScale={230}
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

const canvasOf = (root: HTMLElement) => root.querySelector("[data-module-review-canvas]") as HTMLElement;
/** 标题和期号带一层 aria-hidden 的暗边副本，只读看得见的那层。 */
const faceText = (canvas: HTMLElement, id: string) =>
  canvas.querySelector(`[data-cover-el="${id}"] [data-halo-word] > span:last-child`)?.textContent;
const zOf = (el: Element | null) => Number(getComputedStyle(el as HTMLElement).zIndex);

function hexToRgb(hex: string) {
  const n = Number.parseInt(hex.slice(1), 16);
  return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`;
}

async function settle(canvas: HTMLElement) {
  await document.fonts.ready;
  await Promise.all([...canvas.querySelectorAll("img")].map((img) => img.decode()));
}

/**
 * 半尺寸导出，采样时坐标仍按 1920×1080 写；细框 3px 也能落满一个采样像素。
 * 这里只验滤镜、遮罩和色块，不内嵌字体：思源黑体几百个分片会把导出拖过超时。
 */
async function exportPixels(canvas: HTMLElement) {
  const url = await toPng(canvas, { width: 1920, height: 1080, pixelRatio: 0.5, skipFonts: true });
  const image = new Image();
  image.src = url;
  await image.decode();
  const probe = document.createElement("canvas");
  probe.width = image.naturalWidth;
  probe.height = image.naturalHeight;
  const ctx = probe.getContext("2d");
  if (!ctx) throw new Error("no canvas");
  ctx.drawImage(image, 0, 0);
  return (x: number, y: number) => ctx.getImageData(Math.floor(x / 2), Math.floor(y / 2), 1, 1).data;
}

test("默认取景跟 2026-10-09 导出稿一致，第一栏精一用文档上的偏移", () => {
  const want: Array<[string, number, number, number]> = [
    ["operator", 230, 140.3429602888087, -104.31043405911552],
    ["back-1", 268, -209.29585260604674, 18.07585193620233],
    ["front-2", 216, 11.55248759025271, -109.85901187387185],
    ["back-2", 202, 8.826855821299624, -327.93505330550545],
    ["front-3", 188, -76.24548736462094, 196.6932113041516],
    ["back-3", 311, -172.40780121841158, 116.16252538357395],
    ["front-4", 171, 110.90295013537906, 269.48732936597463],
    ["back-4", 209, 142.93140794223828, -105.38261859769855],
  ];
  const layers = getBuiltinLayers("module-review");
  for (const [id, scale, imageX, imageY] of want) {
    expect(layers.find((layer) => layer.id === id)).toMatchObject({ scale, imageX, imageY });
  }
  const draft = emptyDraft("module-review");
  expect(draft.imageScale).toBe(230);
  expect(draft.imageX).toBe(want[0][2]);
  expect(draft.imageY).toBe(want[0][3]);
});

test("四栏等宽无缝；每栏精二在大字下、精一在大字上，标题压在所有立绘上", async () => {
  const screen = await renderCover();
  const canvas = canvasOf(screen.container);
  const box = canvas.getBoundingClientRect();
  const columns = [...canvas.querySelectorAll("[data-module-column]")];
  expect(columns).toHaveLength(4);
  columns.forEach((column, index) => {
    const rect = column.getBoundingClientRect();
    expect(rect.left - box.left).toBeCloseTo(index * 480, 0);
    expect(rect.width).toBeCloseTo(480, 0);
    expect(rect.height).toBeCloseTo(1080, 0);
    expect(getComputedStyle(column).overflow).toBe("hidden");
  });

  const [first] = columns;
  const back = first.querySelector("[data-module-back]");
  const unit = first.querySelector('[data-cover-el="unit-1"]') as HTMLElement;
  const front = first.querySelector("[data-module-front]");
  expect(front?.contains(first.querySelector('[data-cover-el="operator"]'))).toBe(true);
  const shade = canvas.querySelector('[data-cover-el="shade"]');
  const title = canvas.querySelector('[data-cover-el="title"]') as HTMLElement;
  expect(zOf(back)).toBeLessThan(zOf(unit));
  expect(zOf(unit)).toBeLessThan(zOf(front));
  expect(zOf(front)).toBeLessThan(zOf(shade));
  expect(zOf(shade)).toBeLessThan(zOf(title));

  expect(getComputedStyle(unit).fontFamily).toMatch(/^"?Six Caps/);
  expect(document.fonts.check('400 100px "Six Caps"')).toBe(true);
  expect(unit.textContent).toBe("UNIT");
  expect(getComputedStyle(unit.querySelector("[data-fade-down]") as HTMLElement).maskImage).toContain("linear-gradient");
  const unitBox = unit.getBoundingClientRect();
  expect(unitBox.top - box.top).toBeGreaterThan(150);
  expect(unitBox.top - box.top).toBeLessThan(260);
});

test("精二按代表色做渐变映射，栏内大字比代表色亮一档", async () => {
  const screen = await renderCover({ elementStyles: { "tone-2": { color: "#22aa66" } } });
  const columns = [...canvasOf(screen.container).querySelectorAll("[data-module-column]")] as HTMLElement[];

  expect(columns[0].dataset.tone).toBe(MODULE_TONES[0]);
  expect(columns[1].dataset.tone).toBe("#22aa66");
  expect(columns[1].querySelector("feColorMatrix")?.getAttribute("values")).toBe(gradientMapMatrix("#22aa66"));
  expect(getComputedStyle(columns[1].querySelector("[data-module-back]") as HTMLElement).filter).toContain("url(");

  const unit = columns[1].querySelector('[data-cover-el="unit-2"]') as HTMLElement;
  expect(getComputedStyle(unit).color).toBe(hexToRgb(moduleUnitColor("#22aa66")));
  const sum = (hex: string) => [1, 3, 5].reduce((total, i) => total + Number.parseInt(hex.slice(i, i + 2), 16), 0);
  expect(sum(moduleUnitColor("#22aa66"))).toBeGreaterThan(sum("#22aa66"));
});

test("导出后白色精二被染成各栏代表色，底部压暗，括号和细外框是黄色", async () => {
  const screen = await renderCover();
  const canvas = canvasOf(screen.container);
  await settle(canvas);
  const at = await exportPixels(canvas);

  const red = at(240, 60);
  expect(red[0]).toBeGreaterThan(110);
  expect(red[0]).toBeGreaterThan(red[1] * 3);
  expect(red[0]).toBeGreaterThan(red[2] * 2);

  const violet = at(720, 60);
  expect(violet[2]).toBeGreaterThan(violet[1] * 2);
  expect(violet[0]).toBeGreaterThan(violet[1] * 2);

  const blue = at(1200, 60);
  expect(blue[2]).toBeGreaterThan(blue[0] * 2);

  // 映射前加了对比：同一张白图，精二顶部要比代表色本身乘上曲线压暗后更亮，暗部才压得到黑。
  const tone = Number.parseInt(MODULE_TONES[0].slice(1, 3), 16);
  expect(red[0]).toBeGreaterThan(tone * 0.86);

  expect(at(120, 690)[0]).toBeLessThan(red[0] * 0.6);
  const ramp = at(120, 1070);
  expect(ramp[0]).toBeGreaterThan(ramp[2] + 40);
  expect(ramp[1]).toBeGreaterThan(ramp[2] + 40);

  const frame = at(10, 540);
  expect(frame[0]).toBeGreaterThan(200);
  expect(frame[1]).toBeGreaterThan(170);
  expect(frame[2]).toBeLessThan(90);

  const box = canvas.getBoundingClientRect();
  const bracket = (canvas.querySelector('[data-cover-el="bracket-l"]') as HTMLElement).getBoundingClientRect();
  const bar = at(bracket.left - box.left + 4, bracket.top - box.top + bracket.height / 2);
  expect(bar[0]).toBeGreaterThan(200);
  expect(bar[1]).toBeGreaterThan(170);
  expect(bar[2]).toBeLessThan(90);
});

const chroma = (rgb: ArrayLike<number>) => Math.max(rgb[0], rgb[1], rgb[2]) - Math.min(rgb[0], rgb[1], rgb[2]);

test("精一叠废土搭配：灰调比纯色提得多，暗处更暗、亮处更亮；种子不再带单独的精一调色", async () => {
  const swatches = ["#a08c78", "#d02838", "#404040", "#c0c0c0"];
  const solid = (hex: string) => svg(`<rect width='64' height='64' fill='${hex}'/>`);
  const layers = stubLayers().map((layer) => {
    const column = ["front-2", "front-3", "front-4"].indexOf(layer.id);
    return column >= 0 && layer.kind === "image" ? { ...layer, imageUrl: solid(swatches[column + 1]) } : layer;
  });
  const screen = await renderCover({ imageUrl: solid(swatches[0]), layers });
  const canvas = canvasOf(screen.container);
  await settle(canvas);
  const at = await exportPixels(canvas);
  const rgbOf = (hex: string) => [1, 3, 5].map((i) => Number.parseInt(hex.slice(i, i + 2), 16));

  const out = swatches.map((_, index) => at(index * 480 + 240, 400));
  out.forEach((pixel, index) => {
    const want = moduleGradePixel(swatches[index]);
    want.forEach((channel, i) => expect(Math.abs(pixel[i] - channel)).toBeLessThan(5));
  });

  const gain = (index: number) => chroma(out[index]) / chroma(rgbOf(swatches[index]));
  expect(gain(0)).toBeGreaterThan(1.2);
  expect(gain(0)).toBeGreaterThan(gain(1) + 0.15);
  expect(out[2][0]).toBeLessThan(0x40 - 8);
  expect(out[3][0]).toBeGreaterThan(0xc0 + 8);

  for (const layer of getBuiltinLayers("module-review")) {
    if (layer.kind === "image" && !layer.id.startsWith("back-")) expect(layer.artGrade).toBeUndefined();
  }
});

test("期号前加 #；标题行居中，长标题整行缩小，括号留在画布内", async () => {
  const short = await renderCover();
  const shortCanvas = canvasOf(short.container);
  const shortTitle = shortCanvas.querySelector('[data-cover-el="title"]') as HTMLElement;
  expect(faceText(shortCanvas, "episode")).toBe("#3");
  expect(faceText(shortCanvas, "title")).toBe("模组测评");
  expect(getComputedStyle(shortTitle).fontWeight).toBe("900");
  expect(document.fonts.check('900 100px "Noto Sans SC"')).toBe(true);
  expect(parseFloat(getComputedStyle(shortTitle).fontSize)).toBe(240);
  const box = shortCanvas.getBoundingClientRect();
  const left = (shortCanvas.querySelector('[data-cover-el="bracket-l"]') as HTMLElement).getBoundingClientRect();
  const right = (shortCanvas.querySelector('[data-cover-el="bracket-r"]') as HTMLElement).getBoundingClientRect();
  expect(Math.abs((left.left + right.right) / 2 - (box.left + 960))).toBeLessThan(4);
  expect(shortTitle.getBoundingClientRect().top - box.top).toBeGreaterThan(700);
  expect(box.bottom - shortTitle.getBoundingClientRect().bottom).toBeGreaterThan(20);

  const long = await renderCover({ title: "模组测评·第二模组特别篇", episode: 12 });
  const canvas = canvasOf(long.container);
  const title = canvas.querySelector('[data-cover-el="title"]') as HTMLElement;
  expect(parseFloat(getComputedStyle(title).fontSize)).toBeLessThan(240);
  const longBox = canvas.getBoundingClientRect();
  const l = (canvas.querySelector('[data-cover-el="bracket-l"]') as HTMLElement).getBoundingClientRect();
  const r = (canvas.querySelector('[data-cover-el="bracket-r"]') as HTMLElement).getBoundingClientRect();
  expect(l.left - longBox.left).toBeGreaterThan(12);
  expect(longBox.right - r.right).toBeGreaterThan(12);
  expect(faceText(canvas, "episode")).toBe("#12");
});

function EditorFixture() {
  const stageRef = useRef<HTMLDivElement>(null);
  return (
    <>
      <InspectorPanel />
      <EditorPanel />
      <div style={{ width: 960, height: 540 }}>
        <CoverStage stageRef={stageRef} />
      </div>
    </>
  );
}

test("编辑器里第一栏默认不挂角标，角标读角标文字；改第二栏代表色，画布跟着变", async () => {
  const screen = await render(
    <CoverProvider templateId="module-review">
      <EditorFixture />
    </CoverProvider>,
  );
  const canvas = () => canvasOf(screen.container);
  await expect.poll(() => canvas()?.querySelectorAll("[data-module-column]").length).toBe(4);
  expect(canvas().querySelector('[data-cover-el="badge-1"]')).toBeNull();
  for (const n of [2, 3, 4]) {
    expect(canvas().querySelector(`[data-cover-el="badge-${n}"]`)?.textContent).toBe("2nd");
  }

  await screen.getByRole("textbox", { name: "角标文字" }).fill("3rd");
  await expect.poll(() => canvas().querySelector('[data-cover-el="badge-2"]')?.textContent).toBe("3rd");

  await screen.getByRole("textbox", { name: "第2栏", exact: true }).fill("#22aa66");
  await expect.poll(() => (canvas().querySelectorAll("[data-module-column]")[1] as HTMLElement).dataset.tone).toBe("#22aa66");
  expect((canvas().querySelectorAll("[data-module-column]")[0] as HTMLElement).dataset.tone).toBe(MODULE_TONES[0]);
});

test("给第三栏精一点干员：精一默认用精一立绘，同栏精二跟着换成这位的精二", async () => {
  const screen = await render(
    <CoverProvider templateId="module-review">
      <EditorFixture />
    </CoverProvider>,
  );
  const column = () => canvasOf(screen.container).querySelectorAll("[data-module-column]")[2] as HTMLElement;
  await expect.poll(() => column()?.querySelectorAll("img").length).toBe(2);

  await screen.getByText("第3栏精一", { exact: true }).first().click();
  await screen.getByPlaceholder("搜中文名 / 英文 / ID").fill("能天使");
  await screen.getByTitle("能天使 Exusiai", { exact: true }).click();

  const sources = () => [...column().querySelectorAll("img")].map((img) => decodeURIComponent(img.src));
  await expect.poll(() => sources().some((src) => src.includes("char_103_angel_1b.png"))).toBe(true);
  await expect.poll(() => sources().some((src) => src.includes("char_103_angel_2b.png"))).toBe(true);
  const back = column().querySelector("[data-module-back]") as HTMLElement;
  expect(decodeURIComponent((back.querySelector("img") as HTMLImageElement).src)).toContain("char_103_angel_2b.png");
});
