import { beforeEach, expect, test } from "vitest";
import { render } from "vitest-browser-react";
import "../index.css";
import { renderBoxChrome, renderTextContent } from "../canvas/LayerChrome";
import { getDecoration } from "../data/decorations";
import { getTextStyle } from "../data/textStyles";
import { draftToRenderProps } from "../components/CoverStage";
import { EditorPanel } from "../components/EditorPanel";
import { boxLayer, textLayer } from "../lib/document";
import { emptyDraft, loadDraft } from "../lib/storage";
import { CoverProvider, useCover } from "../store/CoverContext";
import { CoverView } from "./registry";
import { UnveilStage } from "./UnveilStage";

beforeEach(() => {
  localStorage.clear();
});

const stubArt =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Crect width='64' height='64' fill='%23e86a4a'/%3E%3C/svg%3E";

function cover({ title = "卡西米尔队\nPV-EX-8\n三人", subtitle = "THREE KAZIMIERZ OPERATOR", signature = "THREE\nKAZIMIERZ\nOPERATOR" } = {}) {
  return (
    <div style={{ width: 1920, height: 1080 }}>
      <UnveilStage
        title={title}
        subtitle={subtitle}
        signature={signature}
        mark=""
        episode={1}
        date="2026-11-27"
        operatorName="玛恩纳"
        imageUrl={stubArt}
        imageScale={284}
        imageX={849}
        imageY={175}
        previewScale={1}
        onImageDrag={() => undefined}
        showPlaceholder={false}
        bgPreset="ink"
      />
    </div>
  );
}

const angle = (el: Element) => {
  const m = new DOMMatrixReadOnly(getComputedStyle(el).transform);
  return (Math.atan2(m.b, m.a) * 180) / Math.PI;
};

test("紫幕爆炸框：三行标题分黄字上下行和 Anton 错位投影大字，像素引号和棋盘衬底跟着走", async () => {
  const screen = await render(cover());
  await document.fonts.load('900 300px "Anton"', "PV-EX-8");
  await document.fonts.load('900 120px "Noto Sans SC"', "卡西米尔队三人");
  await document.fonts.ready;
  const root = screen.container;
  const canvas = root.querySelector("[data-unveil-stage]")!.getBoundingClientRect();

  const top = root.querySelector('[data-title-line="top"]') as HTMLElement;
  const main = root.querySelector('[data-title-line="main"]') as HTMLElement;
  const bottom = root.querySelector('[data-title-line="bottom"]') as HTMLElement;
  expect(top.textContent).toBe("卡西米尔队");
  expect(bottom.textContent).toBe("三人");
  expect(getComputedStyle(top).color).toBe("rgb(245, 220, 59)");
  expect(getComputedStyle(bottom).color).toBe("rgb(245, 220, 59)");
  expect(getComputedStyle(main).fontFamily).toContain("Anton");
  expect(angle(main)).toBeCloseTo(-7, 1);

  const comic = main.querySelector("[data-comic-text]") as HTMLElement;
  const [shadow, face] = [...comic.children] as HTMLElement[];
  expect(shadow.textContent).toBe("PV-EX-8");
  expect(face.textContent).toBe("PV-EX-8");
  expect(getComputedStyle(shadow.firstElementChild!).color).toBe("rgb(133, 20, 38)");
  expect(getComputedStyle(main.closest('[data-cover-el="title"]')!).color).toBe("rgb(248, 231, 186)");
  expect(top.querySelector('[data-pixel-quote="open"]')).not.toBeNull();
  expect(bottom.querySelector('[data-pixel-quote="close"]')).not.toBeNull();

  // 上行在大字上方偏右，下行压在大字右下；三行都在画布里。
  const t = top.getBoundingClientRect();
  const m = face.getBoundingClientRect();
  const b = bottom.getBoundingClientRect();
  expect(t.bottom).toBeLessThan(m.top + m.height * 0.35);
  expect(t.left).toBeGreaterThan(m.left);
  expect(b.top).toBeGreaterThan(m.top + m.height * 0.5);
  expect(b.left).toBeGreaterThan(m.left + m.width * 0.3);
  for (const r of [t, m, b]) {
    expect(r.left).toBeGreaterThanOrEqual(canvas.left);
    expect(r.right).toBeLessThan(canvas.right);
  }

  expect(root.querySelectorAll('[data-cover-el="plates"] [data-checker-plate]').length).toBe(2);
  expect(root.querySelector('[data-cover-el="band"] [data-stage-band]')!.textContent).toContain("THREE KAZIMIERZ OPERATOR");
  const en = root.querySelector('[data-cover-el="en"]') as HTMLElement;
  expect(en.textContent).toBe("THREE\nKAZIMIERZ\nOPERATOR");
  expect(getComputedStyle(en).fontFamily).toContain("Anton");
  for (const id of ["stage", "band", "crowd", "ring", "burst", "stickers"]) {
    expect(root.querySelector(`[data-cover-el="${id}"]`), id).not.toBeNull();
  }
  expect(root.querySelector("[data-comic-burst] polygon")).not.toBeNull();
  expect(root.querySelector("[data-target-disc] filter feDisplacementMap")).not.toBeNull();
});

test("长大字自动缩字号不出画布；中文大字不压窄、上限更小；单行标题没有黄字行", async () => {
  const long = await render(cover({ title: "卡西米尔队\nPV-EX-8-HARD-MODE\n三人" }));
  await document.fonts.ready;
  const canvas = long.container.querySelector("[data-unveil-stage]")!.getBoundingClientRect();
  const main = long.container.querySelector('[data-title-line="main"]') as HTMLElement;
  expect(Number.parseFloat(getComputedStyle(main).fontSize)).toBeLessThan(341);
  expect(main.querySelector("[data-comic-text] > span:last-child")!.getBoundingClientRect().right).toBeLessThan(canvas.right);

  const cjk = await render(cover({ title: "卡西米尔队\n三人通关\n高配" }));
  const cjkMain = cjk.container.querySelector('[data-title-line="main"]') as HTMLElement;
  expect(Number.parseFloat(getComputedStyle(cjkMain).fontSize)).toBeLessThanOrEqual(200);
  expect(getComputedStyle(cjkMain.querySelector("[data-comic-text]")!).transform).toBe("none");

  const single = await render(cover({ title: "PV-EX-8" }));
  expect(single.container.querySelector('[data-title-line="top"]')).toBeNull();
  expect(single.container.querySelector('[data-title-line="bottom"]')).toBeNull();
  expect(single.container.querySelectorAll("[data-checker-plate]").length).toBe(0);
});

test("空稿使用玛恩纳精英 0 和参考图文案，图层顺序固定", () => {
  const draft = emptyDraft("unveil-stage");
  expect(draft.title).toBe("卡西米尔队\nPV-EX-8\n三人");
  expect(draft.subtitle).toBe("THREE KAZIMIERZ OPERATOR");
  expect(draft.signature).toBe("THREE\nKAZIMIERZ\nOPERATOR");
  expect(draft.operatorId).toBe("char_4064_mlynar");
  expect(draft.artId).toBe("char_4064_mlynar_1");
  expect(draft.imageScale).toBe(284);
  expect(draft.imageX).toBe(849);
  expect(draft.imageY).toBe(175);
  expect(draft.canvasSkin).toBe("unveil-stage");
  expect(draft.layers.map((layer) => layer.id)).toEqual(["stage", "band", "crowd", "ring", "burst", "stickers", "operator", "plates", "title", "en"]);
});

function EditorPreview() {
  const { draft, templateId } = useCover();
  return (
    <>
      <EditorPanel />
      <div style={{ width: 960, height: 540 }}>
        <CoverView
          {...draftToRenderProps(templateId, { ...draft, imageDataUrl: stubArt }, { previewScale: 0.5, onImageDrag: () => undefined, showPlaceholder: false })}
        />
      </div>
    </>
  );
}

test("编辑器里改标题、条带小字和黄色英文，画布跟着换并存进草稿", async () => {
  const screen = await render(
    <CoverProvider templateId="unveil-stage">
      <EditorPreview />
    </CoverProvider>,
  );
  const root = screen.container;
  await screen.getByRole("textbox", { name: "标题（三行）" }).fill("莱茵生命\nCW-8\n四人");
  await expect.poll(() => root.querySelector('[data-title-line="main"] [data-comic-text] > span:last-child')?.textContent).toBe("CW-8");
  expect(root.querySelector('[data-title-line="top"]')!.textContent).toBe("莱茵生命");
  await expect.poll(() => loadDraft("unveil-stage").title).toBe("莱茵生命\nCW-8\n四人");

  await screen.getByRole("textbox", { name: "条带小字" }).fill("RHINE LAB");
  await expect.poll(() => root.querySelector("[data-stage-band]")?.textContent).toContain("RHINE LAB");

  await screen.getByRole("textbox", { name: "黄色英文" }).fill("FOUR RHINE");
  await expect.poll(() => root.querySelector('[data-cover-el="en"]')?.textContent).toBe("FOUR\nRHINE");
});

test("空白画布能加漫画爆炸框、红靶圆盘、漫画贴纸和漫画错位大字", async () => {
  const draft = emptyDraft("plain");
  const comic = getTextStyle("comic-shadow")!;
  const screen = await render(
    <div style={{ width: 1920, height: 1080, position: "relative" }}>
      <div className="font-anton">{renderTextContent(textLayer({ id: "t1", x: 0, y: 0, ...comic.layer }), draft, null)}</div>
      {["comic-burst", "target-disc", "comic-stickers"].map((id) => (
        <div key={id} style={{ position: "relative", width: 1920, height: 1080 }}>
          {renderBoxChrome(boxLayer({ id, ...getDecoration(id)!.layer }))}
        </div>
      ))}
    </div>,
  );
  const root = screen.container;
  expect(root.querySelector("[data-comic-text] > span:last-child")!.textContent).toBe("PV-EX-8");
  expect(getDecoration("comic-burst")!.behindArt).toBe(true);
  // 颜色控制错位边和红盘。
  expect(root.querySelector("[data-comic-burst] polygon")!.getAttribute("fill")).toBe("#6d47bc");
  expect(root.querySelector('[data-target-disc] circle[fill="#e1203a"]')).not.toBeNull();
  expect(root.querySelectorAll("[data-comic-stickers] polygon").length).toBeGreaterThanOrEqual(3);
  expect(root.querySelector("[data-comic-stickers] circle")).not.toBeNull();
});
