import { beforeEach, expect, test } from "vitest";
import { render } from "vitest-browser-react";
import "../index.css";
import { draftToRenderProps } from "../components/CoverStage";
import { TEMPLATE_ELEMENTS } from "../data/elements";
import { emptyDraft, loadDraft, saveDraft } from "../lib/storage";
import { CoverProvider, useCover } from "../store/CoverContext";
import { CoverView } from "./registry";

const stubArt = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='100'%3E%3Crect width='60' height='100' fill='%23c2b588'/%3E%3C/svg%3E";

beforeEach(() => localStorage.clear());

// Compare rotated ink envelopes, excluding font ascent/descent whitespace. The reference
// deliberately interlocks the slanted lines; CSS line boxes alone cannot detect ink collisions.
function textCorners(layer: HTMLElement) {
  const inner = layer.firstElementChild as HTMLElement;
  const css = getComputedStyle(inner);
  const [ox, oy] = css.transformOrigin.split(" ").map(parseFloat);
  const matrix = new DOMMatrix(css.transform);
  const box = layer.getBoundingClientRect();
  const context = document.createElement("canvas").getContext("2d")!;
  context.font = `${css.fontStyle} ${css.fontWeight} ${css.fontSize} ${css.fontFamily}`;
  const text = inner.querySelector("[data-type-face]")!.firstElementChild!.textContent ?? "";
  const metrics = context.measureText(text);
  const baseline = (parseFloat(css.lineHeight) - metrics.fontBoundingBoxAscent - metrics.fontBoundingBoxDescent) / 2 + metrics.fontBoundingBoxAscent;
  const top = baseline - metrics.actualBoundingBoxAscent;
  const bottom = baseline + metrics.actualBoundingBoxDescent;
  return [[0, top], [inner.offsetWidth, top], [inner.offsetWidth, bottom], [0, bottom]].map(([x, y]) => {
    const p = matrix.transformPoint(new DOMPoint(x - ox, y - oy));
    return { x: p.x + ox + inner.offsetLeft + box.left, y: p.y + oy + inner.offsetTop + box.top };
  });
}

function separated(a: ReturnType<typeof textCorners>, b: ReturnType<typeof textCorners>) {
  return [a, b].some(poly => poly.some((p, i) => {
    const next = poly[(i + 1) % poly.length];
    const axis = { x: p.y - next.y, y: next.x - p.x };
    const project = (v: typeof p) => v.x * axis.x + v.y * axis.y;
    const pa = a.map(project), pb = b.map(project);
    return Math.max(...pa) < Math.min(...pb) || Math.max(...pb) < Math.min(...pa);
  }));
}

test.each([
  ["H2-5", "特种三人", "Vanguard"],
  ["H12-4突袭", "先锋六人无支援", "Vanguard Operations"],
  ["1-7", "双人", "Duo"],
])("关卡 %s 与阵容 %s 在安全区内保持主次字级", async (title, subtitle, signature) => {
  const draft = { ...emptyDraft("six-vanguard"), title, subtitle, signature, bgPreset: "ink", imageDataUrl: stubArt };
  const screen = await render(<div style={{ width: 1920, height: 1080 }}><CoverView {...draftToRenderProps("six-vanguard", draft, { previewScale: 1, onImageDrag: () => undefined, showPlaceholder: false })} /></div>);
  await document.fonts.ready;
  const canvas = screen.container.querySelector('[data-six-vanguard-canvas]')!.getBoundingClientRect();
  const stage = screen.container.querySelector('[data-cover-el="stage"] [data-type-face]')!.getBoundingClientRect();
  const squad = screen.container.querySelector('[data-cover-el="squad"] [data-type-face]')!.getBoundingClientRect();
  const script = screen.container.querySelector('[data-cover-el="script"] > span')!.getBoundingClientRect();
  expect(stage.left).toBeGreaterThan(canvas.left + 780);
  expect(stage.right).toBeLessThan(canvas.right - 88);
  expect(stage.bottom).toBeLessThan(canvas.bottom - 108);
  expect(squad.right).toBeLessThan(canvas.right - 88);
  expect(separated(
    textCorners(screen.container.querySelector('[data-cover-el="squad"]')!),
    textCorners(screen.container.querySelector('[data-cover-el="stage"]')!),
  )).toBe(true);
  expect(stage.height).toBeGreaterThan(squad.height);
  expect(script.right).toBeLessThan(canvas.right - 70);
  const imageSlot = screen.container.querySelector('[data-operator-slot]')!;
  const stageLayer = screen.container.querySelector('[data-cover-el="stage"]')!;
  expect(Number(getComputedStyle(imageSlot).zIndex)).toBeLessThan(Number(getComputedStyle(stageLayer).zIndex));
  const operator = screen.container.querySelector('[data-cover-el="operator"] [data-art-pan]') as HTMLElement;
  expect(operator.getBoundingClientRect().left).toBeCloseTo(canvas.left - 215.5387931034468, 0);
});

function EditorHarness() {
  const cover = useCover();
  return <>
    <button onClick={() => cover.patchDraft({ title: "H10-3", subtitle: "先锋四人", imageDataUrl: stubArt.replace("c2b588", "774433"), bgPreset: "ink" })}>更换内容与立绘</button>
    <button onClick={() => cover.patchElement("mark-bg", { color: "#2468ac", x: 40 })}>调整红标</button>
    <button onClick={() => cover.patchLayer("geometry", { hidden: true })}>隐藏斜框</button>
    <button onClick={() => cover.patchElement("mark", { font: "serif" })}>更换红标字体</button>
    <div style={{ width: 1920, height: 1080 }}><CoverView {...draftToRenderProps("six-vanguard", cover.draft, { previewScale: 1, onImageDrag: () => undefined })} /></div>
  </>;
}

test("编辑器更新文案和立绘、调整色块与隐藏背景装饰", async () => {
  saveDraft("six-vanguard", { ...emptyDraft("six-vanguard"), bgPreset: "ink", imageDataUrl: stubArt });
  const screen = await render(<CoverProvider templateId="six-vanguard"><EditorHarness /></CoverProvider>);
  await screen.getByRole("button", { name: "更换内容与立绘" }).click();
  await expect.poll(() => screen.container.querySelector('[data-cover-el="stage"]')?.textContent).toContain("H10-3");
  expect(screen.container.querySelector('[data-cover-el="squad"]')?.textContent).toContain("先锋四人");
  const images = screen.container.querySelectorAll<HTMLImageElement>('[data-six-vanguard-canvas] img');
  expect(images.length).toBe(2);
  expect([...images].every(img => img.src.includes("774433"))).toBe(true);
  await screen.getByRole("button", { name: "调整红标" }).click();
  const badge = screen.container.querySelector('[data-cover-el="mark-bg"]')!;
  expect(getComputedStyle(badge).color).toBe("rgb(36, 104, 172)");
  expect(getComputedStyle(badge).transform).toContain("40, 0");
  await screen.getByRole("button", { name: "隐藏斜框" }).click();
  expect(screen.container.querySelector('[data-cover-el="geometry"]')).toBeNull();
  await screen.getByRole("button", { name: "更换红标字体" }).click();
  expect(getComputedStyle(screen.container.querySelector('[data-cover-el="mark"] > span')!).fontFamily).toContain("Noto Serif SC");
  expect(screen.container.querySelector('[data-cover-el="count-mark"]')).toBeNull();
});

test("旧稿补齐虚焦字，去掉编号章，同时保留自定义人物、文案与图层调整", () => {
  const draft = emptyDraft("six-vanguard");
  saveDraft("six-vanguard", {
    ...draft,
    title: "H10-3",
    imageX: 77,
    layers: draft.layers.filter(l => !["edge-type-top", "edge-type-bottom"].includes(l.id))
      .map(l => l.id === "geometry" ? { ...l, hidden: true } : l)
      .concat([{ ...draft.layers[0], id: "count-mark", label: "黑色编号章" }]),
    elementStyles: { stage: { fontSize: 270, color: "#ffcc00", x: 14 }, script: { text: "Custom" }, "count-mark": { text: "04" } },
  });
  const loaded = loadDraft("six-vanguard");
  expect(loaded.layers.map(l => l.id)).toEqual(TEMPLATE_ELEMENTS["six-vanguard"].map(l => l.id));
  expect(loaded.layers.some(l => l.id === "count-mark")).toBe(false);
  expect(loaded.layers.find(l => l.id === "geometry")?.hidden).toBe(true);
  expect(loaded.title).toBe("H10-3");
  expect(loaded.imageX).toBe(77);
  expect(loaded.elementStyles).toEqual({ stage: { fontSize: 270, color: "#ffcc00", x: 14 }, script: { text: "Custom" } });
});

test("旧默认忍冬稿换成多萝西精零并重排", () => {
  const draft = emptyDraft("six-vanguard");
  saveDraft("six-vanguard", {
    ...draft,
    operatorId: "char_4026_vulpis",
    artId: "char_4026_vulpis_1",
    operatorName: "忍冬",
    imageX: -30,
    imageScale: 290,
    imageY: -160,
    layers: draft.layers.map(l => l.id === "operator" && l.kind === "image" ? { ...l, imageX: -30, scale: 290, operatorId: "char_4026_vulpis", artId: "char_4026_vulpis_1" } : l),
  });
  const loaded = loadDraft("six-vanguard");
  expect(loaded.operatorName).toBe("多萝西");
  expect(loaded.artId).toBe("char_4048_doroth_1");
  expect(loaded.imageX).toBe(-215.5387931034468);
  expect(loaded.imageScale).toBe(177);
  expect(loaded.layers.find(l => l.id === "operator" && l.kind === "image")).toMatchObject({ imageX: -215.5387931034468, scale: 177, artId: "char_4048_doroth_1" });
});

test("旧默认文案换成 H2-5 与特种三人，自定义文案保留", () => {
  const draft = emptyDraft("six-vanguard");
  saveDraft("six-vanguard", { ...draft, title: "H9-5", subtitle: "先锋六人" });
  const loaded = loadDraft("six-vanguard");
  expect(loaded.title).toBe("H2-5");
  expect(loaded.subtitle).toBe("特种三人");

  saveDraft("six-vanguard", { ...emptyDraft("six-vanguard"), title: "H10-3", subtitle: "先锋四人" });
  const kept = loadDraft("six-vanguard");
  expect(kept.title).toBe("H10-3");
  expect(kept.subtitle).toBe("先锋四人");
});

test("新建稿使用多萝西精英零且原生图层完整接入", () => {
  const draft = emptyDraft("six-vanguard");
  expect(draft.title).toBe("H2-5");
  expect(draft.subtitle).toBe("特种三人");
  expect(draft.operatorName).toBe("多萝西");
  expect(draft.operatorId).toBe("char_4048_doroth");
  expect(draft.artId).toBe("char_4048_doroth_1");
  expect(draft.canvasSkin).toBe("six-vanguard");
  expect(draft.layers.map(l => l.id)).toEqual(TEMPLATE_ELEMENTS["six-vanguard"].map(l => l.id));
  expect(draft.imageX).toBe(-215.5387931034468);
  expect(draft.imageY).toBe(-40.73275862068997);
  expect(draft.imageScale).toBe(177);
  expect(draft.layers.find(l => l.id === "operator")).toMatchObject({ scale: draft.imageScale, imageX: draft.imageX, imageY: draft.imageY, w: 1400, transformOrigin: "left top" });
});
