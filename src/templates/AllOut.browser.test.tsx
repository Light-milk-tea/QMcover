import { toPng } from "html-to-image";
import { useRef } from "react";
import { beforeAll, beforeEach, expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { CoverStage } from "../components/CoverStage";
import { ElementEditProvider } from "../components/CoverElement";
import { EditorPanel } from "../components/EditorPanel";
import { InspectorPanel } from "../components/InspectorPanel";
import "../index.css";
import { ALL_OUT_RINGS, placeRings } from "../lib/allOutLayout";
import { CoverProvider } from "../store/CoverContext";
import { AllOut } from "./AllOut";

beforeAll(async () => {
  await Promise.all([
    document.fonts.load('900 100px "Outfit Variable"'),
    document.fonts.load('200 100px "Outfit Variable"'),
    document.fonts.load("400 100px Anton"),
  ]);
});

beforeEach(() => {
  localStorage.clear();
});

const stubArt =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='64'%3E%3Crect width='40' height='64' fill='%232a3a55'/%3E%3C/svg%3E";

/** Same aspect as the operator slot, so the stub fills it edge to edge. */
const slotArt =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1229' height='1382'%3E%3Crect width='1229' height='1382' fill='%232a3a55'/%3E%3C/svg%3E";

function renderCover(patch: Partial<Parameters<typeof AllOut>[0]> = {}) {
  return render(
    <div style={{ width: 1920, height: 1080 }}>
      <AllOut
        title="NO CORE ALL CLEAR."
        subtitle=""
        signature=""
        mark="ALL OUT ATTACK"
        episode={1}
        date="2026-10-08"
        operatorName=""
        imageUrl={stubArt}
        imageScale={156}
        imageX={0}
        imageY={0}
        previewScale={1}
        onImageDrag={() => undefined}
        showPlaceholder={false}
        colorway="#22ccf2"
        {...patch}
      />
    </div>,
  );
}

function zOf(el: Element | null) {
  return Number(getComputedStyle(el as HTMLElement).zIndex);
}

test("总攻击按教程的图层顺序排：背景字、人物、双环、环内调色、台词", async () => {
  await document.fonts.ready;
  const screen = await renderCover();
  const canvas = screen.container.querySelector("[data-all-out-canvas]") as HTMLElement;
  const quote = screen.container.querySelector('[data-cover-el="quote"]') as HTMLElement;
  const groundLayer = canvas.querySelector("[data-all-out-ground]");
  const solid = canvas.querySelector("[data-ground-solid]") as HTMLElement;
  const outline = canvas.querySelector("[data-ground-outline]") as HTMLElement;
  const slot = canvas.querySelector("[data-operator-slot]");
  const ring = canvas.querySelector('[data-cover-el="ring"]');
  const tint = canvas.querySelector('[data-cover-el="tint"]') as HTMLElement;
  const lines = [...quote.querySelectorAll("[data-all-out-line]")].map((node) => node.textContent);

  expect(lines).toEqual(["NO CORE", "ALL", "CLEAR."]);
  expect(getComputedStyle(quote).fontFamily).toContain("Outfit");
  expect(getComputedStyle(quote).fontWeight).toBe("900");
  expect(getComputedStyle(quote).textAlign).toBe("right");

  const groundEl = solid.querySelector('[data-cover-el="ground"]') as HTMLElement;
  expect(groundEl.textContent).toContain("ALL OUT");
  for (const face of [groundEl, outline]) {
    expect(getComputedStyle(face).fontFamily).toMatch(/^Anton/);
    expect(getComputedStyle(face).fontSynthesisWeight).toBe("none");
  }
  expect(document.fonts.check("400 100px Anton")).toBe(true);
  expect(getComputedStyle(solid).maskImage).toContain("data:image/svg+xml");
  expect(getComputedStyle(outline).color).toBe("rgba(0, 0, 0, 0)");
  expect(parseFloat(getComputedStyle(outline).webkitTextStrokeWidth)).toBeGreaterThan(1);
  expect(getComputedStyle(outline.querySelector("[data-speed-type]") as HTMLElement).transform).not.toBe("none");

  expect(canvas.querySelectorAll("[data-focus-ring] circle")).toHaveLength(2);
  expect(getComputedStyle(tint).maskImage).toContain("data:image/svg+xml");
  expect(getComputedStyle(tint.querySelector("[data-operator-tint]") as HTMLElement).filter).toContain("url(");
  expect(tint.querySelector("[data-art-echo] img")).not.toBeNull();
  expect(canvas.querySelectorAll('[data-cover-el="operator"]')).toHaveLength(1);

  expect(zOf(slot)).toBeGreaterThan(zOf(groundLayer));
  expect(zOf(ring)).toBeGreaterThan(zOf(slot));
  expect(zOf(tint)).toBeGreaterThan(zOf(ring));
  expect(zOf(quote)).toBeGreaterThan(zOf(tint));

  const canvasBox = canvas.getBoundingClientRect();
  const quoteBox = quote.getBoundingClientRect();
  expect(quoteBox.right).toBeLessThan(canvasBox.left + canvasBox.width * 0.4);
  expect(quoteBox.left).toBeGreaterThan(canvasBox.left);
  expect(quoteBox.top).toBeGreaterThan(canvasBox.top + 60);
});

test("台词字距行距收紧到参考图，行尾句点挂在右缘外", async () => {
  await document.fonts.ready;
  const screen = await renderCover();
  const quote = screen.container.querySelector('[data-cover-el="quote"]') as HTMLElement;
  const size = parseFloat(getComputedStyle(quote).fontSize);
  expect(parseFloat(getComputedStyle(quote).letterSpacing) / size).toBeCloseTo(-0.045, 2);
  const [first, second, third] = [...quote.querySelectorAll("[data-all-out-line]")] as HTMLElement[];
  expect((second.getBoundingClientRect().top - first.getBoundingClientRect().top) / size).toBeCloseTo(0.74, 2);

  const textRight = (line: HTMLElement) => {
    const range = document.createRange();
    range.selectNodeContents(line.firstChild as Node);
    return range.getBoundingClientRect().right;
  };
  const mark = third.querySelector("[data-hanging-mark]") as HTMLElement;
  expect(mark.textContent).toBe(".");
  expect(Math.abs(textRight(third) - textRight(second))).toBeLessThan(size * 0.08);
  expect(mark.getBoundingClientRect().left).toBeGreaterThan(textRight(second) - size * 0.08);
});

test("台词不换行时按词排行，手动换行照拆，细字眉题用细字重", async () => {
  const words = await renderCover({ title: "clear the stage." });
  const wordLines = [...words.container.querySelectorAll('[data-cover-el="quote"] [data-all-out-line]')].map((node) => node.textContent);
  expect(wordLines).toEqual(["clear", "the", "stage."]);
  expect(getComputedStyle(words.container.querySelector('[data-cover-el="quote"]') as HTMLElement).textTransform).toBe("uppercase");

  const forced = await renderCover({ title: "STAY\nALERT AND\n24/7.", subtitle: "please", mark: "ONE\nTWO THREE" });
  const forcedLines = [...forced.container.querySelectorAll('[data-cover-el="quote"] [data-all-out-line]')].map((node) => node.textContent);
  expect(forcedLines).toEqual(["STAY", "ALERT AND", "24/7."]);
  const groundLines = [...(forced.container.querySelector('[data-cover-el="ground"] [data-speed-type]') as HTMLElement).children].map(
    (node) => node.textContent,
  );
  expect(groundLines).toEqual(["ONE", "TWO THREE"]);
  const kicker = forced.container.querySelector('[data-cover-el="kicker"]') as HTMLElement;
  expect(kicker.textContent).toBe("please");
  expect(Number(getComputedStyle(kicker).fontWeight)).toBeLessThanOrEqual(300);
  const quote = forced.container.querySelector('[data-cover-el="quote"]') as HTMLElement;
  expect(kicker.getBoundingClientRect().bottom).toBeLessThanOrEqual(quote.getBoundingClientRect().top + 8);
});

test("更长的台词会缩小，中英文都留在画布内", async () => {
  await document.fonts.ready;
  const short = await renderCover();
  const shortSize = parseFloat(getComputedStyle(short.container.querySelector('[data-cover-el="quote"]') as HTMLElement).fontSize);

  for (const title of ["WE CLEARED IT WITHOUT A SINGLE CORE OPERATOR.", "特种高配通关演示长标题"]) {
    const screen = await renderCover({ title });
    const canvas = screen.container.querySelector("[data-all-out-canvas]") as HTMLElement;
    const quote = screen.container.querySelector('[data-cover-el="quote"]') as HTMLElement;
    const canvasBox = canvas.getBoundingClientRect();
    const quoteBox = quote.getBoundingClientRect();

    if (title.startsWith("WE")) expect(parseFloat(getComputedStyle(quote).fontSize)).toBeLessThan(shortSize);
    expect(quoteBox.right).toBeLessThan(canvasBox.left + canvasBox.width * 0.4);
    expect(quoteBox.left).toBeGreaterThanOrEqual(canvasBox.left);
    expect(quoteBox.bottom).toBeLessThanOrEqual(canvasBox.bottom);
    expect(quoteBox.top).toBeGreaterThanOrEqual(canvasBox.top);
  }
});

test("导出后暗环压暗底色，环里的人物被背景色调亮", async () => {
  const screen = await renderCover({ imageUrl: slotArt, imageScale: 100 });
  const canvas = screen.container.querySelector("[data-all-out-canvas]") as HTMLElement;
  await document.fonts.ready;
  await Promise.all([...canvas.querySelectorAll("img")].map((img) => img.decode()));

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
  const at = (x: number, y: number) => ctx.getImageData(Math.round(x / 2), Math.round(y / 2), 1, 1).data;

  const { cx, cy, hole, inner } = ALL_OUT_RINGS;
  const dist = (x: number, y: number) => Math.hypot(x - cx, y - cy);
  const bgRing = [300, 150] as const;
  const bgHole = [700, 100] as const;
  const artHole = [1400, 300] as const;
  const artRing = [1000, 1000] as const;
  expect(dist(...bgRing)).toBeGreaterThan(hole);
  expect(dist(...bgRing)).toBeLessThan(inner);
  expect(dist(...bgHole)).toBeLessThan(hole);
  expect(dist(...artHole)).toBeLessThan(hole);
  expect(dist(...artRing)).toBeGreaterThan(hole);
  expect(dist(...artRing)).toBeLessThan(inner);

  const ring = at(...bgRing);
  const open = at(...bgHole);
  expect(open[1]).toBeGreaterThan(190);
  expect(ring[1]).toBeLessThan(open[1] * 0.8);
  expect(ring[1]).toBeGreaterThan(open[1] * 0.6);

  const plain = at(...artHole);
  const tinted = at(...artRing);
  expect(plain[1]).toBeLessThan(80);
  expect(tinted[1]).toBeGreaterThan(plain[1] + 60);
  expect(tinted[2]).toBeGreaterThan(plain[2] + 60);
});

test("挪动聚焦圆环后，环照样画到画布边缘，不留方框切边", async () => {
  const shift = { x: 260, y: 40 };
  const styles = { ring: shift };
  const screen = await render(
    <div style={{ width: 1920, height: 1080 }}>
      <ElementEditProvider styles={styles} previewScale={1} interactive={false}>
        <AllOut
          title="NO CORE ALL CLEAR."
          subtitle=""
          signature=""
          mark="ALL OUT ATTACK"
          episode={1}
          date="2026-10-08"
          operatorName=""
          imageUrl=""
          imageScale={100}
          imageX={0}
          imageY={0}
          previewScale={1}
          onImageDrag={() => undefined}
          showPlaceholder={false}
          colorway="#22ccf2"
          elementStyles={styles}
        />
      </ElementEditProvider>
    </div>,
  );
  const canvas = screen.container.querySelector("[data-all-out-canvas]") as HTMLElement;
  const ring = canvas.querySelector('[data-cover-el="ring"]') as HTMLElement;
  expect(getComputedStyle(ring).transform).toBe("matrix(1, 0, 0, 1, 260, 40)");
  expect(getComputedStyle(ring.querySelector("[data-focus-ring]") as SVGSVGElement).overflow).toBe("visible");
  await document.fonts.ready;

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
  const at = (x: number, y: number) => ctx.getImageData(Math.round(x / 2), Math.round(y / 2), 1, 1).data;

  const { cx, cy, gap, outer, hole } = ALL_OUT_RINGS;
  const edge = [40, 200] as const;
  const open = [900, 120] as const;
  const edgeDist = Math.hypot(edge[0] - cx - shift.x, edge[1] - cy - shift.y);
  expect(edge[0]).toBeLessThan(shift.x);
  expect(edgeDist).toBeGreaterThan(gap);
  expect(edgeDist).toBeLessThan(outer);
  expect(Math.hypot(open[0] - cx - shift.x, open[1] - cy - shift.y)).toBeLessThan(hole);

  expect(at(...edge)[1]).toBeLessThan(at(...open)[1] * 0.8);
});

test("圆环旋转后，蒙版的圆心按画布中心转过去", () => {
  const rings = { ...ALL_OUT_RINGS, cx: 1960, cy: 540 };
  const turned = placeRings(rings, 10, -20, 90);
  expect(turned.cx).toBeCloseTo(970);
  expect(turned.cy).toBeCloseTo(1520);
});

test("检查器能调圆环大小和粗细，暗环和两份蒙版一起变", async () => {
  const screen = await render(
    <CoverProvider templateId="all-out">
      <InspectorPanel />
      <EditorFixture />
    </CoverProvider>,
  );
  await screen.getByText("聚焦圆环", { exact: true }).first().click();
  await screen.getByRole("slider", { name: /圆环大小/ }).fill("600");
  await screen.getByRole("slider", { name: /圆环粗细/ }).fill("300");

  const canvas = screen.container.querySelector("[data-all-out-canvas]") as HTMLElement;
  await expect.poll(() => canvas.querySelector("[data-focus-ring] circle")?.getAttribute("r")).toBe("750");
  const [inner, outer] = [...canvas.querySelectorAll("[data-focus-ring] circle")];
  expect(inner.getAttribute("stroke-width")).toBe("300");
  expect(Number(outer.getAttribute("r"))).toBeGreaterThan(600 + 300);

  for (const masked of [canvas.querySelector('[data-cover-el="tint"]'), canvas.querySelector("[data-ground-solid]")]) {
    const mask = decodeURIComponent(getComputedStyle(masked as HTMLElement).maskImage);
    expect(mask).toContain('r="750"');
    expect(mask).toContain('stroke-width="300"');
  }
});

test("主题色就是底色", async () => {
  const screen = await renderCover({ colorway: "#ef7890" });
  const canvas = screen.container.querySelector("[data-all-out-canvas]") as HTMLElement;
  expect(canvas.getAttribute("data-colorway")).toBe("#ef7890");
  expect(getComputedStyle(canvas).backgroundColor).toBe("rgb(239, 120, 144)");
});

function EditorFixture() {
  const stageRef = useRef<HTMLDivElement>(null);
  return (
    <>
      <EditorPanel />
      <div style={{ width: 960, height: 540 }}>
        <CoverStage stageRef={stageRef} />
      </div>
    </>
  );
}

test("编辑栏的台词、背景大字、角落署名是多行框，手动换行原样上画布", async () => {
  const screen = await render(
    <CoverProvider templateId="all-out">
      <EditorFixture />
    </CoverProvider>,
  );
  const quoteBox = screen.getByRole("textbox", { name: "台词" });
  const groundBox = screen.getByRole("textbox", { name: "背景大字" });
  const creditBox = screen.getByRole("textbox", { name: "角落署名" });

  await expect.element(quoteBox).toHaveValue("NO CORE\nALL\nCLEAR.");
  await expect.element(groundBox).toHaveValue("ALL OUT\nATTACK");
  for (const box of [quoteBox, groundBox, creditBox]) expect(box.element().tagName).toBe("TEXTAREA");
  expect(screen.getByRole("textbox", { name: "细字眉题" }).element().tagName).toBe("INPUT");

  const canvasLines = () =>
    [...screen.container.querySelectorAll('[data-cover-el="quote"] [data-all-out-line]')].map((node) => node.textContent);
  await expect.poll(canvasLines).toEqual(["NO CORE", "ALL", "CLEAR."]);

  await quoteBox.fill("ON TO\nTHE NEXT\nROUND.");
  await screen.getByRole("textbox", { name: "细字眉题" }).fill("LEAVE IT");
  await groundBox.fill("RHODES\nISLAND OPS");
  await creditBox.fill("QMcover 仿作\n原作：P3R 总攻击结算");

  await expect.poll(canvasLines).toEqual(["ON TO", "THE NEXT", "ROUND."]);
  await expect.poll(() => screen.container.querySelector('[data-cover-el="kicker"]')?.textContent ?? "").toContain("LEAVE IT");
  await expect
    .poll(() =>
      [...(screen.container.querySelector('[data-cover-el="ground"] [data-speed-type]')?.children ?? [])].map((node) => node.textContent),
    )
    .toEqual(["RHODES", "ISLAND OPS"]);
  await expect
    .poll(() => [...(screen.container.querySelector('[data-cover-el="credit"]')?.children ?? [])].map((node) => node.textContent))
    .toEqual(["QMcover 仿作", "原作：P3R 总攻击结算"]);
});
