import { beforeEach, expect, test } from "vitest";
import { render } from "vitest-browser-react";
import "../index.css";
import { draftToRenderProps } from "../components/CoverStage";
import { EditorPanel } from "../components/EditorPanel";
import { emptyDraft, loadDraft } from "../lib/storage";
import { CoverProvider, useCover } from "../store/CoverContext";
import { CoverView } from "./registry";
import { GarrisonTerminal } from "./GarrisonTerminal";

beforeEach(() => {
  localStorage.clear();
});

const stubArt =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Crect width='64' height='64' fill='%23cfe3da'/%3E%3C/svg%3E";

function cover(title: string, signature = "MAGALLAN") {
  return (
    <div style={{ width: 1920, height: 1080 }}>
      <GarrisonTerminal
        title={title}
        subtitle="NOT FOR"
        signature={signature}
        mark="NEW MODE"
        episode={1}
        date="2026-11-27"
        operatorName="麦哲伦"
        imageUrl={stubArt}
        imageScale={228}
        imageX={-277}
        imageY={-182}
        previewScale={1}
        onImageDrag={() => undefined}
        showPlaceholder={false}
        bgPreset="ink"
      />
    </div>
  );
}

const box = (root: Element, selector: string) => root.querySelector(selector)!.getBoundingClientRect();

test("墨绿终端复现三行标题：上下两行绿色斜体，中间白色大字带横扫描缝和直角括号", async () => {
  const screen = await render(cover("卫戍协议对我家\n麦哲伦\n是有意见吗？"));
  await document.fonts.load('900 256px "Noto Sans SC"', "卫戍协议对我家麦哲伦是有意见吗？");
  await document.fonts.ready;
  const root = screen.container;

  const top = root.querySelector('[data-title-line="top"]') as HTMLElement;
  const main = root.querySelector('[data-title-line="main"]') as HTMLElement;
  const bottom = root.querySelector('[data-title-line="bottom"]') as HTMLElement;
  expect(top.textContent).toBe("卫戍协议对我家");
  expect(main.textContent).toBe("麦哲伦");
  expect(bottom.textContent).toBe("是有意见吗？");

  // 中间大字是白的，上下两行是绿色且斜切；大字字号是小行的两倍半以上。
  const scan = main.querySelector("[data-scan-text]") as HTMLElement;
  expect(getComputedStyle(scan).color).toBe("rgb(246, 255, 251)");
  expect(getComputedStyle(scan).maskImage).toContain("repeating-linear-gradient");
  expect(getComputedStyle(top).color).toBe("rgb(54, 226, 160)");
  expect(getComputedStyle(top).transform).not.toBe("none");
  const mainSize = Number.parseFloat(getComputedStyle(main).fontSize);
  expect(mainSize / Number.parseFloat(getComputedStyle(top).fontSize)).toBeGreaterThan(2.5);
  expect(main.querySelectorAll("[aria-hidden] > span > span")).toHaveLength(4);

  // 三行从上到下排在卡片右边，中心大致对齐，整块在画布里。
  const canvas = box(root, "[data-garrison-terminal]");
  const card = box(root, "[data-garrison-card]");
  const t = top.getBoundingClientRect();
  const m = scan.getBoundingClientRect();
  const b = bottom.getBoundingClientRect();
  expect(t.bottom).toBeLessThanOrEqual(m.top + m.height * 0.2);
  expect(b.top).toBeGreaterThanOrEqual(m.bottom - m.height * 0.2);
  expect(m.left).toBeGreaterThan(card.right);
  expect(Math.abs((t.left + t.right) / 2 - (m.left + m.right) / 2)).toBeLessThan(60);
  expect(m.right).toBeLessThan(canvas.right);
  expect(b.bottom).toBeLessThan(canvas.bottom);
});

test("卡片倾斜、立绘装在卡片里，HUD 装饰层齐全，扫描线压在最上面", async () => {
  const screen = await render(cover("卫戍协议对我家\n麦哲伦\n是有意见吗？"));
  const root = screen.container;
  for (const id of ["grid", "rings", "dial", "lines", "frame", "card", "hatch", "pixels", "scan", "island", "en-name", "tagline", "mode", "file", "tag", "record"]) {
    expect(root.querySelector(`[data-cover-el="${id}"]`), id).not.toBeNull();
  }
  const card = root.querySelector("[data-garrison-card]") as HTMLElement;
  const matrix = new DOMMatrixReadOnly(getComputedStyle(card).transform);
  expect((Math.atan2(matrix.b, matrix.a) * 180) / Math.PI).toBeCloseTo(-2.3, 1);
  expect(card.querySelector('[data-cover-el="operator"] img')).not.toBeNull();
  expect(root.querySelectorAll("[data-hud-dial] text").length).toBeGreaterThan(10);
  expect(root.querySelector('[data-cover-el="island"]')!.textContent).toContain("RHODES ISLAND");
  expect(root.querySelector('[data-cover-el="tag"]')!.textContent).toBe("WHY FOR THIS");

  const z = (selector: string) => Number(getComputedStyle(root.querySelector(selector)!).zIndex);
  expect(z("[data-garrison-card]")).toBeLessThan(z('[data-cover-el="title"]'));
  expect(z('[data-cover-el="scan"]')).toBeGreaterThan(z('[data-cover-el="title"]'));
});

test("刻度盘数字不压英文名，英文名和标语都按草稿字段显示", async () => {
  const screen = await render(cover("卫戍协议对我家\n麦哲伦\n是有意见吗？"));
  await document.fonts.ready;
  const root = screen.container;
  const name = root.querySelector('[data-cover-el="en-name"]') as HTMLElement;
  expect(name.textContent).toBe("MAGALLAN");
  expect(root.querySelector('[data-cover-el="tagline"]')!.textContent).toContain("NOT FOR");
  expect(root.querySelector('[data-cover-el="mode"]')!.textContent).toBe("NEW MODE");
  const n = name.getBoundingClientRect();
  for (const text of root.querySelectorAll("[data-hud-dial] text")) {
    const r = text.getBoundingClientRect();
    const overlap = r.left < n.right && r.right > n.left && r.top < n.bottom && r.bottom > n.top;
    expect(overlap, text.textContent ?? "").toBe(false);
  }
});

test("一行标题只出中间大字；长名字自动缩字号，不出画布", async () => {
  const single = await render(cover("麦哲伦"));
  expect(single.container.querySelector('[data-title-line="top"]')).toBeNull();
  expect(single.container.querySelector('[data-title-line="bottom"]')).toBeNull();
  expect(single.container.querySelector('[data-title-line="main"]')!.textContent).toBe("麦哲伦");

  const long = await render(cover("卫戍协议对我家\n维娜·维多利亚\n是有意见吗？"));
  await document.fonts.ready;
  const canvas = box(long.container, "[data-garrison-terminal]");
  const main = long.container.querySelector('[data-title-line="main"]') as HTMLElement;
  expect(Number.parseFloat(getComputedStyle(main).fontSize)).toBeLessThan(200);
  const scan = main.querySelector("[data-scan-text]")!.getBoundingClientRect();
  expect(scan.left).toBeGreaterThan(canvas.left);
  expect(scan.right).toBeLessThan(canvas.right);
});

test("空稿使用麦哲伦回味冰霜雪和参考图文案", () => {
  const draft = emptyDraft("garrison-terminal");
  expect(draft.title).toBe("卫戍协议对我家\n麦哲伦\n是有意见吗？");
  expect(draft.subtitle).toBe("NOT FOR");
  expect(draft.signature).toBe("MAGALLAN");
  expect(draft.mark).toBe("NEW MODE");
  expect(draft.operatorId).toBe("char_248_mgllan");
  expect(draft.artId).toBe("char_248_mgllan_kitchen#1");
  expect(draft.imageScale).toBe(228);
  expect(draft.imageX).toBe(-277);
  expect(draft.imageY).toBe(-182);
  expect(draft.canvasSkin).toBe("garrison-terminal");
  expect(draft.layers.map((layer) => layer.id)).toEqual([
    "grid", "rings", "dial", "lines", "frame", "operator", "card", "island", "en-name", "hatch", "tagline", "mode", "file", "title", "tag", "record", "pixels", "scan",
  ]);
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

test("编辑器里改英文名和三行标题，画布和草稿同步", async () => {
  const screen = await render(
    <CoverProvider templateId="garrison-terminal">
      <EditorPreview />
    </CoverProvider>,
  );
  const root = screen.container;
  await expect.element(screen.getByRole("textbox", { name: "英文名" })).toHaveValue("MAGALLAN");
  await screen.getByRole("textbox", { name: "英文名" }).fill("Mostima");
  await expect.poll(() => root.querySelector('[data-cover-el="en-name"]')?.textContent).toBe("MOSTIMA");
  await expect.poll(() => loadDraft("garrison-terminal").signature).toBe("Mostima");

  await screen.getByRole("textbox", { name: "标题（三行）" }).fill("今天也\n莫斯提马\n在摸鱼");
  await expect.poll(() => root.querySelector('[data-title-line="main"]')?.textContent).toBe("莫斯提马");
  expect(root.querySelector('[data-title-line="top"]')?.textContent).toBe("今天也");
  expect(root.querySelector('[data-title-line="bottom"]')?.textContent).toBe("在摸鱼");
});
