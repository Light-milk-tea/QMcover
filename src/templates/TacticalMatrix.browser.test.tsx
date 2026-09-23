import { useState } from "react";
import { beforeEach, expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { toPng } from "html-to-image";
import { InspectorPanel } from "../components/InspectorPanel";
import "../index.css";
import { CoverView } from "./registry";
import { draftToRenderProps } from "../components/CoverStage";
import { EditorPanel } from "../components/EditorPanel";
import { CoverProvider, useCover } from "../store/CoverContext";
import { emptyDraft, loadDraft, saveDraft } from "../lib/storage";
import { buildDocumentFile, parseDocumentFile } from "../lib/document";
import { MineralSurface } from "./TacticalMatrixAtmosphere";

beforeEach(() => localStorage.clear());
const stubArt = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='64'%3E%3Crect width='48' height='64' fill='%23d8b6ca'/%3E%3C/svg%3E";

// Inline text boxes include font ascenders/descenders well outside the painted
// glyphs. Compare ink bounds so tall Oswald metrics don't report false overlaps.
function inkBounds(el: Element) {
  const style = getComputedStyle(el);
  const ctx = document.createElement("canvas").getContext("2d")!;
  ctx.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
  const metrics = ctx.measureText(el.textContent ?? "");
  const box = el.getBoundingClientRect();
  const sx = box.width / metrics.width;
  const sy = box.height / (metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent);
  const baseline = box.top + metrics.fontBoundingBoxAscent * sy;
  return { width: box.width, left: box.left - metrics.actualBoundingBoxLeft * sx,
    right: box.left + metrics.actualBoundingBoxRight * sx,
    top: baseline - metrics.actualBoundingBoxAscent * sy,
    bottom: baseline + metrics.actualBoundingBoxDescent * sy };
}

for (const [title, subtitle] of [["LS-4", "四人"], ["H5-1", "七人"], ["H15-EX-8", "六人无支援"], ["终末地高难关卡", "全程低配无借人"]]) {
  test(`关卡 ${title} 和阵容完整保留在右栏，不相互覆盖`, async () => {
    const draft = { ...emptyDraft("tactical-matrix"), title, subtitle, imageDataUrl: stubArt };
    const screen = await render(<div style={{ width: 1920, height: 1080 }}><CoverView {...draftToRenderProps("tactical-matrix", draft, { previewScale: 1, onImageDrag: () => undefined, showPlaceholder: false })} /></div>);
    await document.fonts.load('700 360px Oswald', title);
    await document.fonts.load('900 174px "Noto Sans SC"', subtitle);
    await document.fonts.ready;
    const canvas = screen.container.querySelector('[data-tactical-matrix-canvas]')!.getBoundingClientRect();
    const stage = inkBounds(screen.container.querySelector('[data-stage-face]')!);
    const squad = inkBounds(screen.container.querySelector('[data-cover-el="squad"] [data-matrix-ink]')!);
    const operator = screen.container.querySelector('[data-matrix-operator]')!;
    expect(stage.width).toBeGreaterThan(300);
    expect(stage.left).toBeGreaterThan(canvas.left + 1000);
    expect(stage.right).toBeLessThan(canvas.right - 130);
    expect(stage.bottom).toBeLessThan(canvas.bottom - 175);
    expect(squad.bottom).toBeLessThan(stage.top);
    expect(squad.left).toBeGreaterThan(canvas.left + 1000);
    expect(squad.right).toBeLessThan(canvas.right - 130);
    expect(Number(getComputedStyle(operator).zIndex)).toBeLessThan(Number(getComputedStyle(screen.container.querySelector('[data-cover-el="stage"]')!).zIndex));
  });
}

function EditorPreview() {
  const { draft, templateId } = useCover();
  return <><EditorPanel /><div style={{ width: 960, height: 540 }}><CoverView {...draftToRenderProps(templateId, { ...draft, imageDataUrl: stubArt }, { previewScale: .5, onImageDrag: () => undefined, showPlaceholder: false })} /></div></>;
}

test("编辑器可用调色盘改主题色，保存与配置导出保留配色", async () => {
  const screen = await render(<CoverProvider templateId="tactical-matrix"><EditorPreview /></CoverProvider>);
  await expect.element(screen.getByRole("textbox", { name: "模板配色" })).toHaveValue("#12165f");
  await screen.getByRole("textbox", { name: "模板配色" }).fill("#d9735b");
  const canvas = screen.container.querySelector('[data-tactical-matrix-canvas]')!;
  expect(canvas.getAttribute("data-colorway")).toBe("ember");
  expect(getComputedStyle(canvas.querySelector('[data-cover-el="orbits"]')!).color).toBe("rgb(217, 115, 91)");
  await screen.getByRole("textbox", { name: "关卡码", exact: true }).fill("H5-1");
  await screen.getByRole("textbox", { name: "人数 / 阵容", exact: true }).fill("七人");
  expect(canvas.querySelector('[data-stage-face]')!.textContent).toBe("H5-1");
  expect(canvas.querySelector('[data-cover-el="squad"] [data-matrix-ink]')!.textContent).toBe("七人");
  await expect.poll(() => loadDraft("tactical-matrix").colorway).toBe("ember");
  const stored = loadDraft("tactical-matrix");
  const parsed = parseDocumentFile(buildDocumentFile(stored));
  expect(parsed?.document.colorway).toBe("ember");
  expect(stored.artId).toBe("char_1050_chen3_2");
  expect(stored.imageX).toBe(0);
  expect(stored.imageY).toBe(0);
  await screen.getByRole("textbox", { name: "模板配色" }).fill("#1d4ed8");
  await expect.poll(() => loadDraft("tactical-matrix").colorway).toBe("#1d4ed8");
  expect(canvas.getAttribute("data-colorway")).toBe("#1d4ed8");
  expect(getComputedStyle(canvas.querySelector('[data-cover-el="orbits"]')!).color).toBe("rgb(29, 78, 216)");
  await screen.getByRole("button", { name: "还原" }).click();
  expect(canvas.getAttribute("data-colorway")).toBe("#12165f");
  expect(getComputedStyle(canvas.querySelector('[data-cover-el="orbits"]')!).color).toBe("rgb(18, 22, 95)");
});

test("旧默认死芒草稿换成赤刃明霄陈，自定义立绘和配色保留", () => {
  const draft = emptyDraft("tactical-matrix");
  draft.operatorName = "死芒";
  draft.operatorId = "char_450_necras";
  draft.artId = "char_450_necras_1";
  draft.imageUrl = "https://example.invalid/necras.png";
  draft.imageScale = 310;
  draft.imageX = 130;
  draft.imageY = 530;
  draft.colorway = undefined;
  draft.layers = draft.layers.map((layer) =>
    layer.id === "operator" && layer.kind === "image"
      ? { ...layer, operatorId: "char_450_necras", artId: "char_450_necras_1", imageX: 130, imageY: 530 }
      : layer,
  );
  saveDraft("tactical-matrix", draft);
  const restored = loadDraft("tactical-matrix");
  expect(restored.artId).toBe("char_1050_chen3_2");
  expect(restored.operatorId).toBe("char_1050_chen3");
  expect(restored.imageX).toBe(0);
  expect(restored.imageY).toBe(0);
  expect(restored.colorway).toBe("#12165f");
  const operator = restored.layers.find((layer) => layer.id === "operator");
  expect(operator?.kind === "image" ? operator.imageX : undefined).toBe(0);

  const custom = emptyDraft("tactical-matrix");
  custom.operatorId = "char_4048_doroth";
  custom.artId = "char_4048_doroth_1";
  custom.imageUrl = "https://example.invalid/doroth.png";
  custom.imageX = 40;
  custom.colorway = "ember";
  saveDraft("tactical-matrix", custom);
  const kept = loadDraft("tactical-matrix");
  expect(kept.artId).toBe("char_4048_doroth_1");
  expect(kept.imageX).toBe(40);
  expect(kept.colorway).toBe("ember");
});

test("重新加载草稿保留自定义图层颜色与赤焰配色", () => {
  const draft = { ...emptyDraft("tactical-matrix"), colorway: "ember" as const, elementStyles: { stage: { color: "#f0e1aa" } } };
  saveDraft("tactical-matrix", draft);
  expect(loadDraft("tactical-matrix").colorway).toBe("ember");
  expect(loadDraft("tactical-matrix").elementStyles.stage.color).toBe("#f0e1aa");
});


test("虹彩与颗粒可分别隐藏和调节，切换赤焰不带入紫色专属材质", async () => {
  const screen = await render(<CoverProvider templateId="tactical-matrix"><InspectorPanel /><EditorPreview /></CoverProvider>);
  await screen.getByText("局部虹彩反光", { exact: true }).click();
  await screen.getByRole("slider", { name: /暗度/ }).fill("40");
  const canvas = screen.container.querySelector('[data-tactical-matrix-canvas]')!;
  expect(getComputedStyle(canvas.querySelector('[data-cover-el="prism"]')!).opacity).toBe("0.4");
  await screen.getByTitle("隐藏", { exact: true }).click();
  expect(canvas.querySelector('[data-matrix-prism]')).toBeNull();
  await screen.getByTitle("显示", { exact: true }).click();
  expect(canvas.querySelector('[data-matrix-prism]')).not.toBeNull();
  await screen.getByText("胶片颗粒", { exact: true }).click();
  await screen.getByRole("slider", { name: /暗度/ }).fill("0");
  expect(getComputedStyle(canvas.querySelector('[data-cover-el="film"]')!).opacity).toBe("0");
  await screen.getByRole("textbox", { name: "模板配色" }).fill("#d9735b");
  expect(canvas.querySelector('[data-matrix-prism]')).toBeNull();
  expect(canvas.querySelector('[data-matrix-film]')).toBeNull();
  expect(getComputedStyle(canvas.querySelector('[data-matrix-operator] img')!).filter).toBe("none");
});

test("旧草稿补入新材质图层，保留自定义位置、文案、颜色和隐藏状态", () => {
  const draft = emptyDraft("tactical-matrix");
  draft.layers = draft.layers.filter((layer) => !["prism", "film"].includes(layer.id));
  draft.title = "H15-4";
  draft.imageX = 207;
  draft.elementStyles = { stage: { x: 28, color: "#d2ceff" } };
  saveDraft("tactical-matrix", draft);
  const restored = loadDraft("tactical-matrix");
  expect(restored.layers.filter((layer) => layer.id === "prism")).toHaveLength(1);
  expect(restored.layers.filter((layer) => layer.id === "film")).toHaveLength(1);
  expect(restored.title).toBe("H15-4");
  expect(restored.imageX).toBe(207);
  expect(restored.elementStyles).toEqual(draft.elementStyles);
  restored.layers = restored.layers.map((layer) => layer.id === "prism" ? { ...layer, hidden: true } : layer);
  saveDraft("tactical-matrix", restored);
  expect(loadDraft("tactical-matrix").layers).toEqual(restored.layers);
});

test("实际 PNG 保留轻淡虹彩、响应强度调节，且透明立绘之外没有染色", async () => {
  // Match the PNG art/upload path; SVGs without a viewBox have different
  // intrinsic sizing when nested in SVG <image> than in HTML <img>.
  const fixture = document.createElement("canvas"); fixture.width = 96; fixture.height = 128;
  const paint = fixture.getContext("2d")!; paint.fillStyle = "#e9e2e5"; paint.fillRect(24, 0, 48, 128);
  const alphaArt = fixture.toDataURL("image/png");
  function ExportProbe() {
    const [prismOpacity, setPrismOpacity] = useState(95);
    const draft = { ...emptyDraft("tactical-matrix"), imageDataUrl: alphaArt, imageScale: 100, imageX: 0, imageY: 0, elementStyles: { prism: { opacity: prismOpacity } } };
    return <><button onClick={() => setPrismOpacity(0)}>关闭虹彩</button><button onClick={() => setPrismOpacity(40)}>减弱虹彩</button><div style={{ width: 1920, height: 1080 }}><CoverView {...draftToRenderProps("tactical-matrix", draft, { previewScale: 1, onImageDrag: () => undefined, showPlaceholder: false })} /></div></>;
  }
  const screen = await render(<ExportProbe />);
  const node = screen.container.querySelector('[data-tactical-matrix-canvas]') as HTMLElement;
  async function capture() {
    await Promise.all([...node.querySelectorAll('img')].map((img) => img.decode()));
    await document.fonts.ready;
    const url = await toPng(node, { width: 1920, height: 1080, pixelRatio: .5, skipFonts: true });
    const image = new Image(); image.src = url; await image.decode();
    const canvas = document.createElement("canvas"); canvas.width = 960; canvas.height = 540;
    const ctx = canvas.getContext("2d")!; ctx.drawImage(image, 0, 0);
    const inside = [...ctx.getImageData(396, 216, 6, 6).data];
    const outside = [...ctx.getImageData(178, 404, 6, 6).data];
    return { inside, outside };
  }
  const on = await capture();
  await screen.getByRole("button", { name: "减弱虹彩" }).click();
  const soft = await capture();
  await screen.getByRole("button", { name: "关闭虹彩" }).click();
  const off = await capture();
  const difference = (a: number[], b: number[]) => a.reduce((sum, value, i) => sum + Math.abs(value - b[i]), 0) / a.length;
  expect(difference(on.inside, off.inside)).toBeGreaterThan(3);
  // Pale reflection should remain visible without heavily dyeing neutral art.
  expect(difference(on.inside, off.inside)).toBeLessThan(15);
  expect(difference(soft.inside, off.inside)).toBeLessThan(difference(on.inside, off.inside));
  expect(difference(on.outside, off.outside)).toBeLessThan(1);
}, 30000);

test("矿物底纹实际导出保留块面明暗，不只剩均匀细噪点", async () => {
  const screen = await render(<div data-mineral-probe style={{ position: "relative", width: 960, height: 540, background: "#07151d" }}><MineralSurface violet /></div>);
  const node = screen.container.querySelector('[data-mineral-probe]') as HTMLElement;
  const url = await toPng(node, { width: 960, height: 540, pixelRatio: 1, skipFonts: true });
  const image = new Image(); image.src = url; await image.decode();
  const canvas = document.createElement("canvas"); canvas.width = 960; canvas.height = 540;
  const ctx = canvas.getContext("2d")!; ctx.drawImage(image, 0, 0);
  const blocks: number[] = [];
  for (let y = 60; y < 480; y += 24) {
    for (let x = 60; x < 900; x += 24) {
      const pixels = ctx.getImageData(x, y, 12, 12).data;
      let luminance = 0;
      for (let i = 0; i < pixels.length; i += 4) luminance += pixels[i] * .2126 + pixels[i + 1] * .7152 + pixels[i + 2] * .0722;
      blocks.push(luminance / 144);
    }
  }
  // Averaging removes fine grain: these bounds require larger visible mottles.
  const mean = blocks.reduce((a, b) => a + b, 0) / blocks.length;
  const contrast = Math.sqrt(blocks.reduce((sum, value) => sum + (value - mean) ** 2, 0) / blocks.length);
  expect(contrast).toBeGreaterThan(1.5);
  expect(Math.max(...blocks) - Math.min(...blocks)).toBeGreaterThan(8);
  expect(mean).toBeLessThan(40);
}, 15000);

test("PNG 字面平滑明亮，保留轻微透色、主题色与边缘立体阴影", async () => {
  function art(color: string) {
    const canvas = document.createElement("canvas"); canvas.width = 96; canvas.height = 128;
    const ctx = canvas.getContext("2d")!; ctx.fillStyle = color; ctx.fillRect(0, 0, 96, 128);
    return canvas.toDataURL();
  }
  const red = art("#a02030"); const blue = art("#2040b0"); const neutral = art("#808080");
  function Probe() {
    const [phase, setPhase] = useState(0);
    const draft = {
      ...emptyDraft("tactical-matrix"), title: "L", imageDataUrl: phase > 1 ? neutral : phase === 1 ? blue : red,
      colorway: phase === 3 ? "ember" as const : "violet" as const,
      imageScale: 500, imageX: 500, imageY: 0,
      elementStyles: {
        ...Object.fromEntries(["mineral", "orbits", "glow", "prism", "embers", "film"].map(id => [id, { opacity: 0 }])),
        film: { opacity: phase === 4 ? 100 : 0 },
        stage: { x: phase ? 100 : 0, y: phase ? -60 : 0 },
      },
    };
    return <><button onClick={() => setPhase(value => value + 1)}>切换校对场景</button><div style={{ width: 1920, height: 1080 }}><CoverView {...draftToRenderProps("tactical-matrix", draft, { previewScale: 1, onImageDrag: () => undefined, showPlaceholder: false })} /></div></>;
  }
  const screen = await render(<Probe />);
  const node = screen.container.querySelector('[data-tactical-matrix-canvas]') as HTMLElement;
  async function sampleInk() {
    await document.fonts.load('700 360px Oswald', "L");
    await document.fonts.ready;
    await Promise.all([...node.querySelectorAll("img")].map(img => img.decode()));
    const bounds = inkBounds(node.querySelector('[data-stage-face]')!);
    const origin = node.getBoundingClientRect();
    const url = await toPng(node, { width: 1920, height: 1080, pixelRatio: .5 });
    const image = new Image(); image.src = url; await image.decode();
    const canvas = document.createElement("canvas"); canvas.width = 960; canvas.height = 540;
    const ctx = canvas.getContext("2d")!; ctx.drawImage(image, 0, 0);
    // Inside the solid left stem, away from antialiased edges and the foot.
    const x = (bounds.left - origin.left + (bounds.right - bounds.left) * .2) / 2;
    const pixel = (height: number) => {
      const y = (bounds.top - origin.top + (bounds.bottom - bounds.top) * height) / 2;
      return [...ctx.getImageData(Math.round(x), Math.round(y), 1, 1).data];
    };
    const upperY = (bounds.top - origin.top + (bounds.bottom - bounds.top) * .15) / 2;
    const patch = ctx.getImageData(Math.round(x), Math.round(upperY), 5, 5).data;
    const edgePatch = ctx.getImageData(
      Math.floor((bounds.left - origin.left) / 2) - 6,
      Math.floor((bounds.top - origin.top) / 2) - 6,
      Math.ceil((bounds.right - bounds.left) / 2) + 12,
      Math.ceil((bounds.bottom - bounds.top) / 2) + 12,
    ).data;
    return { upper: pixel(.15), lower: pixel(.7), highlightPatch: [...patch], edgePatch: [...edgePatch] };
  }
  const warm = await sampleInk();
  await screen.getByRole("button", { name: "切换校对场景" }).click();
  const cool = await sampleInk();
  // Only faint color should come through, without a clear silhouette in the ink.
  expect(warm.lower[0] - cool.lower[0]).toBeGreaterThan(2);
  expect(warm.lower[0] - cool.lower[0]).toBeLessThan(18);
  expect(cool.lower[2] - warm.lower[2]).toBeGreaterThan(2);
  expect(cool.lower[2] - warm.lower[2]).toBeLessThan(18);
  expect(Math.min(...warm.upper.slice(0, 3), ...cool.upper.slice(0, 3))).toBeGreaterThan(215);
  await screen.getByRole("button", { name: "切换校对场景" }).click();
  const violet = await sampleInk();
  const shadows = [...node.querySelectorAll<HTMLElement>("[data-matrix-depth]")];
  shadows.forEach(shadow => { shadow.style.visibility = "hidden"; });
  const flat = await sampleInk();
  shadows.forEach(shadow => { shadow.style.visibility = ""; });
  // The exported outline adds depth at the edge without darkening the ink core.
  expect(violet.edgePatch.filter((value, i) => Math.abs(value - flat.edgePatch[i]) > 3).length).toBeGreaterThan(100);
  expect(violet.lower).toEqual(flat.lower);
  expect(violet.upper).toEqual(flat.upper);
  await screen.getByRole("button", { name: "切换校对场景" }).click();
  const ember = await sampleInk();
  expect(violet.lower[2] - violet.lower[1]).toBeGreaterThan(25);
  expect(ember.lower[0] - ember.lower[2]).toBeGreaterThan(25);
  await screen.getByRole("button", { name: "切换校对场景" }).click();
  const grain = await sampleInk();
  // Even maximum film grain must sit below the opaque text highlights.
  expect(Math.max(...grain.highlightPatch.map((value, i) => Math.abs(value - violet.highlightPatch[i])))).toBeLessThan(2);
  expect(Math.min(...grain.upper.slice(0, 3))).toBeGreaterThan(235);
}, 30000);

test("底部行动名比栏目名更大、字面更实，且没有轮廓黑影", async () => {
  const draft = { ...emptyDraft("tactical-matrix"), imageDataUrl: stubArt };
  const screen = await render(<div style={{ width: 1920, height: 1080 }}><CoverView {...draftToRenderProps("tactical-matrix", draft, { previewScale: 1, onImageDrag: () => undefined, showPlaceholder: false })} /></div>);
  await document.fonts.load('900 60px "Noto Sans SC"', "特种战演习");
  await document.fonts.ready;
  const operation = screen.container.querySelector('[data-cover-el="operation"]') as HTMLElement;
  const mark = screen.container.querySelector('[data-cover-el="mark"]') as HTMLElement;
  expect(operation.querySelector("[data-matrix-caption]")).not.toBeNull();
  expect(operation.querySelector("[data-matrix-depth]")).toBeNull();
  expect(mark.querySelector("[data-matrix-depth]")).not.toBeNull();
  expect(parseFloat(getComputedStyle(operation).fontSize)).toBeGreaterThan(parseFloat(getComputedStyle(mark).fontSize));
  expect(parseFloat(getComputedStyle(operation).fontSize)).toBeGreaterThanOrEqual(58);
});

test("旧默认行动名升到更大字号，手动改过的字号保留", () => {
  const draft = emptyDraft("tactical-matrix");
  const operation = draft.layers.find((layer) => layer.id === "operation");
  if (operation && operation.kind === "text") {
    operation.fontSize = 48;
    operation.x = 1060;
    operation.y = 934;
    operation.h = 70;
  }
  saveDraft("tactical-matrix", draft);
  expect(loadDraft("tactical-matrix").layers.find((layer) => layer.id === "operation")).toMatchObject({ fontSize: 60, y: 926 });
  const custom = emptyDraft("tactical-matrix");
  custom.elementStyles = { operation: { fontSize: 40 } };
  saveDraft("tactical-matrix", custom);
  expect(loadDraft("tactical-matrix").elementStyles.operation?.fontSize).toBe(40);
});

test("旧默认草稿将胶片颗粒移到文字下方，保留自定义强度、颜色和位置", () => {
  const draft = emptyDraft("tactical-matrix");
  const film = { ...draft.layers.find(layer => layer.id === "film")!, opacity: 33 };
  draft.layers = [...draft.layers.filter(layer => layer.id !== "film"), film];
  draft.elementStyles = { stage: { x: 45, color: "#ffdcf6" } };
  saveDraft("tactical-matrix", draft);
  const restored = loadDraft("tactical-matrix");
  expect(restored.layers.findIndex(layer => layer.id === "film")).toBeLessThan(restored.layers.findIndex(layer => layer.id === "mark"));
  expect(restored.layers.find(layer => layer.id === "film")?.opacity).toBe(33);
  expect(restored.elementStyles).toEqual(draft.elementStyles);
});
