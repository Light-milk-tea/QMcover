import { beforeEach, expect, test } from "vitest";
import { render } from "vitest-browser-react";
import "../index.css";
import { renderBoxChrome, renderTextContent } from "../canvas/LayerChrome";
import { artUrl } from "../data/arts";
import { getDecoration } from "../data/decorations";
import { nativeTextValue, TEMPLATE_ELEMENTS } from "../data/elements";
import { getTextStyle } from "../data/textStyles";
import { draftToRenderProps } from "../components/CoverStage";
import { EditorPanel } from "../components/EditorPanel";
import { boxLayer, textLayer } from "../lib/document";
import { emptyDraft, loadDraft } from "../lib/storage";
import { CoverProvider, useCover } from "../store/CoverContext";
import { CoverView } from "./registry";
import { GarrisonRecord } from "./GarrisonRecord";

beforeEach(() => {
  localStorage.clear();
});

const stubArt =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Crect width='64' height='64' fill='%23e86a4a'/%3E%3C/svg%3E";

function cover({ title = "史尔特尔", subtitle = "PV-S-3", imageUrl = stubArt }: { title?: string; subtitle?: string; imageUrl?: string } = {}) {
  return (
    <div style={{ width: 1920, height: 1080 }}>
      <GarrisonRecord
        title={title}
        subtitle={subtitle}
        signature="Surtr"
        mark="突袭"
        episode={1}
        date="2026-11-27"
        operatorName="史尔特尔"
        imageUrl={imageUrl}
        imageScale={453}
        imageX={-177}
        imageY={-226}
        previewScale={1}
        onImageDrag={() => undefined}
        showPlaceholder={false}
        bgPreset="ink"
      />
    </div>
  );
}

test("红白档案复现黑转红主标题、红色宽体大字、红底小字和背景英文大字", async () => {
  const screen = await render(cover());
  await document.fonts.load('900 156px "Noto Sans SC"', "史尔特尔突袭");
  await document.fonts.load('900 196px "Unbounded"', "PV-S-3SURTR");
  await document.fonts.ready;
  const root = screen.container;

  const title = root.querySelector('[data-cover-el="title"]') as HTMLElement;
  const fade = title.querySelector("[data-fade-ink]") as HTMLElement;
  expect(fade.textContent).toBe("史尔特尔史尔特尔");
  const [ink, red] = [...fade.children] as HTMLElement[];
  expect(getComputedStyle(ink).color).toBe("rgb(18, 18, 18)");
  expect(getComputedStyle(red).color).toBe("rgb(229, 54, 42)");
  expect(getComputedStyle(red).maskImage).toContain("linear-gradient");
  expect(getComputedStyle(fade).maskImage).toContain("repeating-linear-gradient");

  const sub = root.querySelector('[data-cover-el="subtitle"]') as HTMLElement;
  expect(getComputedStyle(sub).fontFamily).toContain("Unbounded");
  expect(sub.textContent).toContain("PV-S-3");
  const face = sub.querySelector("span > span.relative") as HTMLElement;
  expect(getComputedStyle(face).backgroundClip).toBe("text");
  expect(getComputedStyle(face).backgroundImage).toContain("repeating-linear-gradient");

  const mark = root.querySelector('[data-cover-el="mark"]') as HTMLElement;
  expect(mark.textContent).toBe("突袭");
  expect(getComputedStyle(mark).backgroundColor).toBe("rgb(229, 54, 42)");
  expect(getComputedStyle(mark).color).toBe("rgb(255, 255, 255)");

  const backdrop = root.querySelector('[data-cover-el="backdrop"]') as HTMLElement;
  expect([...backdrop.children].map((n) => n.textContent)).toEqual(["SURTR", "SURTR"]);

  // 主标题在红色大字上方，二者都在卡片右边、画布里；小字落在大字右下。
  const canvas = root.querySelector("[data-garrison-record]")!.getBoundingClientRect();
  const card = root.querySelector("[data-garrison-card]")!.getBoundingClientRect();
  const t = ink.getBoundingClientRect();
  const s = face.getBoundingClientRect();
  const m = mark.getBoundingClientRect();
  expect(t.bottom).toBeLessThan(s.top + s.height * 0.3);
  expect(t.left).toBeGreaterThan(card.right);
  expect(s.right).toBeLessThan(canvas.right);
  expect(m.left).toBeGreaterThan(s.left + s.width * 0.6);
  expect(m.top).toBeGreaterThan(s.top + s.height * 0.4);
});

test("卡片抬头、底条和右侧竖条跟着英文名和红色大字走", async () => {
  const screen = await render(cover());
  const root = screen.container;
  for (const id of ["grid", "rings", "dial", "lines", "card", "panel", "rail", "island", "hatch", "only", "tag-top", "tag-bottom", "record", "pixels"]) {
    expect(root.querySelector(`[data-cover-el="${id}"]`), id).not.toBeNull();
  }
  const card = root.querySelector("[data-garrison-card]") as HTMLElement;
  expect(card.textContent).toContain("RHODES ISLAND");
  expect(card.textContent).toContain("SURTR ARKNIGHTS RECORD");
  expect(card.textContent).toContain("PV-S-3 HARD MODE");
  expect(root.querySelector('[data-cover-el="only"]')!.textContent).toBe("SURTR ONLY");
  expect(root.querySelector('[data-cover-el="rail"]')!.textContent).toContain("S");
  expect(root.querySelector('[data-cover-el="tag-top"] [data-hud-pixel-x]')).not.toBeNull();
  const matrix = new DOMMatrixReadOnly(getComputedStyle(card).transform);
  expect((Math.atan2(matrix.b, matrix.a) * 180) / Math.PI).toBeCloseTo(-3.5, 1);
  expect(root.querySelector("[data-hud-rings] filter feTurbulence")).not.toBeNull();
});

test("默认立绘在卡片里裁切，再按手描轮廓出框；换别的立绘就不出框", async () => {
  const screen = await render(cover({ imageUrl: artUrl("char_350_surtr_summer#9") }));
  const root = screen.container;
  const pop = root.querySelector('[data-cover-el="pop"]') as HTMLElement;
  expect(pop).not.toBeNull();
  const echo = pop.querySelector("[data-art-echo] img") as HTMLImageElement;
  expect(getComputedStyle(echo).maskImage).toContain("data:image/svg+xml");
  const main = root.querySelector('[data-garrison-card] [data-cover-el="operator"] img') as HTMLImageElement;
  expect(getComputedStyle(main).maskImage).toBe("none");
  const clip = main.closest(".overflow-hidden") as HTMLElement;
  expect(getComputedStyle(clip).overflow).toBe("hidden");

  const z = (el: Element) => Number(getComputedStyle(el).zIndex);
  expect(z(pop)).toBeGreaterThan(z(root.querySelector('[data-cover-el="card"]')!));

  const other = await render(cover({ imageUrl: artUrl("char_350_surtr_2") }));
  expect(other.container.querySelector('[data-cover-el="pop"]')).toBeNull();
});

test("长红色大字和长标题自动缩字号，不出画布", async () => {
  const screen = await render(cover({ title: "史尔特尔精二专三", subtitle: "CW-ST-10" }));
  await document.fonts.ready;
  const root = screen.container;
  const canvas = root.querySelector("[data-garrison-record]")!.getBoundingClientRect();
  const sub = root.querySelector('[data-cover-el="subtitle"]') as HTMLElement;
  const title = root.querySelector('[data-cover-el="title"]') as HTMLElement;
  expect(Number.parseFloat(getComputedStyle(sub).fontSize)).toBeLessThan(196);
  expect(Number.parseFloat(getComputedStyle(title).fontSize)).toBeLessThan(156);
  expect(sub.getBoundingClientRect().right).toBeLessThan(canvas.right);
  expect(title.querySelector("[data-fade-ink] > span")!.getBoundingClientRect().right).toBeLessThan(canvas.right);
});

test("空稿使用史尔特尔缤纷奇境和参考图文案；ONLY 小标跟英文名走", () => {
  const draft = emptyDraft("garrison-record");
  expect(draft.title).toBe("史尔特尔");
  expect(draft.subtitle).toBe("PV-S-3");
  expect(draft.signature).toBe("SURTR");
  expect(draft.mark).toBe("突袭");
  expect(draft.operatorId).toBe("char_350_surtr");
  expect(draft.artId).toBe("char_350_surtr_summer#9");
  expect(draft.imageScale).toBe(453);
  expect(draft.imageX).toBe(-177);
  expect(draft.imageY).toBe(-226);
  expect(draft.canvasSkin).toBe("garrison-record");
  expect(draft.layers.map((layer) => layer.id)).toEqual([
    "grid", "rings", "dial", "backdrop", "lines", "operator", "card", "pop", "panel", "title", "subtitle", "rail", "mark", "island", "hatch", "only", "tag-top", "tag-bottom", "record", "pixels",
  ]);
  const only = TEMPLATE_ELEMENTS["garrison-record"].find((el) => el.id === "only")!;
  expect(nativeTextValue("garrison-record", only, { ...draft, signature: "Ifrit" }, {})).toBe("IFRIT ONLY");
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

test("编辑器里改英文名，背景大字、卡片底条和 ONLY 小标一起换", async () => {
  const screen = await render(
    <CoverProvider templateId="garrison-record">
      <EditorPreview />
    </CoverProvider>,
  );
  const root = screen.container;
  await screen.getByRole("textbox", { name: "英文名" }).fill("Ifrit");
  await expect.poll(() => root.querySelector('[data-cover-el="backdrop"]')?.textContent).toBe("IFRITIFRIT");
  expect(root.querySelector("[data-garrison-card]")!.textContent).toContain("IFRIT ARKNIGHTS RECORD");
  expect(root.querySelector('[data-cover-el="only"]')!.textContent).toBe("IFRIT ONLY");
  await expect.poll(() => loadDraft("garrison-record").signature).toBe("Ifrit");

  await screen.getByRole("textbox", { name: "红色大字" }).fill("H8-4");
  await expect.poll(() => root.querySelector('[data-cover-el="subtitle"]')?.textContent).toContain("H8-4");
});

test("空白画布能加 HUD 刻度盘、粗圆环、方格、扫描线和扫描缝大字", async () => {
  const draft = emptyDraft("plain");
  const scan = getTextStyle("hud-scan")!;
  const scanLayer = textLayer({ id: "t1", x: 0, y: 0, ...scan.layer });
  const screen = await render(
    <div style={{ width: 1920, height: 1080, position: "relative" }}>
      <div className="font-cn">{renderTextContent(scanLayer, draft, null)}</div>
      {["hud-dial", "hud-rings", "hud-grid", "hud-scan"].map((id) => (
        <div key={id} style={{ position: "relative", width: 1920, height: 1080 }}>
          {renderBoxChrome(boxLayer({ id, ...getDecoration(id)!.layer }))}
        </div>
      ))}
    </div>,
  );
  const root = screen.container;
  expect(root.querySelector("[data-scan-text]")?.textContent).toBe("麦哲伦");
  expect(root.querySelectorAll("[data-hud-dial] text").length).toBeGreaterThan(10);
  expect(root.querySelector("[data-hud-dial] line")!.getAttribute("stroke") ?? root.querySelector("[data-hud-dial] g g")!.getAttribute("stroke")).toBe("#8d8d8d");
  for (const sel of ["[data-hud-rings] circle", "[data-hud-grid] pattern", "[data-hud-scan] pattern"]) {
    expect(root.querySelector(sel), sel).not.toBeNull();
  }
});
