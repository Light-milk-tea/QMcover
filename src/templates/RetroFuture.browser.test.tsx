import { beforeEach, expect, test } from "vitest";
import { render } from "vitest-browser-react";
import "../index.css";
import { renderBoxChrome, renderTextContent } from "../canvas/LayerChrome";
import { artUrl } from "../data/arts";
import { getDecoration } from "../data/decorations";
import { getTextStyle } from "../data/textStyles";
import { boxLayer, textLayer } from "../lib/document";
import { draftToRenderProps } from "../components/CoverStage";
import { EditorPanel } from "../components/EditorPanel";
import { retroTitleLines, retroTitleSize } from "../lib/retroFutureLayout";
import { RETRO_DEFAULT_PALETTE, RETRO_THEME, RETRO_THEME_PRESETS, retroPalette } from "../lib/retroPalette";
import { emptyDraft, loadDraft } from "../lib/storage";
import { CoverProvider, useCover } from "../store/CoverContext";
import { CoverView } from "./registry";
import { RetroFuture } from "./RetroFuture";

beforeEach(() => {
  localStorage.clear();
});

const stubArt =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='64'%3E%3Crect width='48' height='64' fill='%23d8b6ca'/%3E%3C/svg%3E";

function cover(title: string, imageUrl = stubArt, colorway?: string) {
  return (
    <div style={{ width: 1920, height: 1080 }}>
      <RetroFuture
        colorway={colorway}
        title={title}
        subtitle="New Series"
        signature="No."
        mark=""
        episode={12}
        date="2026-11-27"
        operatorName="娜斯提"
        imageUrl={imageUrl}
        imageScale={256}
        imageX={-563}
        imageY={-421}
        previewScale={1}
        onImageDrag={() => undefined}
        showPlaceholder={false}
        bgPreset="ink"
      />
    </div>
  );
}

test("让大地变成一片酸橙复现两行立体标题、眉题期号和整套装饰层", async () => {
  const screen = await render(cover("娜斯提\n全解析"));
  await document.fonts.ready;

  const canvas = screen.container.querySelector("[data-retro-future-canvas]") as HTMLElement;
  const title = screen.container.querySelector('[data-cover-el="title"]') as HTMLElement;
  const kicker = screen.container.querySelector('[data-cover-el="kicker"]') as HTMLElement;
  const episode = screen.container.querySelector('[data-cover-el="episode"]') as HTMLElement;
  const operatorSlot = screen.container.querySelector("[data-operator-slot]") as HTMLElement;

  for (const id of ["sky", "brush", "halo", "haze", "pennant", "orbits", "sparkles", "grain"]) {
    expect(screen.container.querySelector(`[data-cover-el="${id}"]`), id).not.toBeNull();
  }
  expect(screen.container.querySelector("[data-retro-pennant] polygon")).not.toBeNull();
  expect(screen.container.querySelector("[data-retro-orbits] ellipse")).not.toBeNull();

  const lines = [...title.querySelectorAll("[data-retro-line]")] as HTMLElement[];
  expect(lines.map((line) => line.querySelector("[data-retro-face]")?.textContent)).toEqual(["娜斯提", "全解析"]);
  expect(title.querySelectorAll("[data-retro-rim]").length).toBeGreaterThan(2);
  expect(title.querySelectorAll("[data-retro-side]").length).toBeGreaterThan(2);
  const face = lines[0].querySelector("[data-retro-face]") as HTMLElement;
  expect(getComputedStyle(face).backgroundClip.split(", ").every((clip) => clip === "text")).toBe(true);
  expect(getComputedStyle(face).backgroundImage).toContain("linear-gradient");
  expect(kicker.textContent).toContain("New Series");
  expect(episode.textContent).toContain("No.12");

  const canvasBox = canvas.getBoundingClientRect();
  const first = lines[0].querySelector("[data-retro-face]")!.getBoundingClientRect();
  const second = lines[1].querySelector("[data-retro-face]")!.getBoundingClientRect();
  const kickerBox = kicker.getBoundingClientRect();
  const episodeBox = episode.getBoundingClientRect();
  // 第二行右移约一个字，两行都在画面右半边。
  expect(second.left - first.left).toBeGreaterThan(first.width / 3 * 0.7);
  // 思源黑体的行内盒高 1.45 个字，字形墨迹只有 0.96 个字；行距大于墨迹高，两行字形就不相叠。
  const titleSize = Number.parseFloat(getComputedStyle(title).fontSize);
  expect(second.top - first.top).toBeGreaterThan(titleSize * 0.96);
  expect(first.left).toBeGreaterThan(canvasBox.left + canvasBox.width * 0.38);
  expect(second.right).toBeLessThan(canvasBox.right);
  expect(kickerBox.bottom).toBeLessThan(first.top + first.height * 0.4);
  expect(episodeBox.top).toBeGreaterThan(second.top + second.height * 0.5);
  expect(episodeBox.bottom).toBeLessThan(canvasBox.bottom);
  expect(Number(getComputedStyle(operatorSlot).zIndex)).toBeLessThan(Number(getComputedStyle(title).zIndex));
});

test("标题字面干净：思源黑体 Heavy，细描边和侧面不糊住字内空隙，颗粒压在标题下面", async () => {
  const screen = await render(cover("娜斯提\n全解析"));
  await document.fonts.load('900 262px "Noto Sans SC"', "娜斯提全解析");
  await document.fonts.ready;
  const title = screen.container.querySelector('[data-cover-el="title"]') as HTMLElement;
  const style = getComputedStyle(title);
  expect(style.fontFamily).toContain("Noto Sans SC");
  expect(style.fontWeight).toBe("900");
  const size = Number.parseFloat(style.fontSize);
  expect(size).toBeGreaterThan(240);

  const lines = [...title.querySelectorAll("[data-retro-line]")] as HTMLElement[];
  const em = (el: Element) => Number.parseFloat(getComputedStyle(el).webkitTextStrokeWidth) / size;
  for (const line of lines) {
    const strokes = line.querySelectorAll("[data-retro-line-stroke]");
    expect(strokes).toHaveLength(1);
    const face = line.querySelector("[data-retro-face]")!;
    const rim = line.querySelector("[data-retro-rim]")!;
    const side = line.querySelector("[data-retro-side]")!;
    // 字面本身不加描边；紧贴字面的深线、侧面和奶油外边都细，向外扩出去的总宽不到 0.05 个字。
    expect(em(face)).toBe(0);
    expect(em(strokes[0])).toBeGreaterThan(0.025);
    expect(em(strokes[0])).toBeLessThanOrEqual(0.05);
    expect(em(side)).toBeLessThanOrEqual(em(strokes[0]));
    expect(em(rim) / 2).toBeLessThanOrEqual(0.05);
    expect(getComputedStyle(strokes[0]).color).not.toBe(getComputedStyle(side).color);
    // 厚度只往左下错开一点，不压到下一笔。
    const sides = [...line.querySelectorAll("[data-retro-side]")];
    const deepest = new DOMMatrixReadOnly(getComputedStyle(sides[sides.length - 1]).transform);
    expect(Math.hypot(deepest.m41, deepest.m42) / size).toBeLessThan(0.06);
  }

  const z = (id: string) => Number(getComputedStyle(screen.container.querySelector(`[data-cover-el="${id}"]`)!).zIndex);
  expect(z("grain")).toBeLessThan(z("title"));
  expect(z("sparkles")).toBeGreaterThan(z("title"));
});

test("主题色派生整套配色：默认保持原版，换色后天空跟走、橄榄一族转色相、奶油字面不变", () => {
  expect(retroPalette()).toBe(RETRO_DEFAULT_PALETTE);
  expect(retroPalette(RETRO_THEME)).toBe(RETRO_DEFAULT_PALETTE);
  expect(RETRO_DEFAULT_PALETTE.skyMid).toBe("#5a9ab4");
  expect(RETRO_DEFAULT_PALETTE.pennant).toBe("#8fae5f");
  expect(retroPalette("not-a-color")).toBe(RETRO_DEFAULT_PALETTE);

  const sakura = retroPalette("#d77a9c");
  expect(sakura.theme).toBe("#d77a9c");
  expect(sakura.skyMid).toBe("#d77a9c");
  expect(sakura.pennant).not.toBe(RETRO_DEFAULT_PALETTE.pennant);
  expect(sakura.titleLine).not.toBe(RETRO_DEFAULT_PALETTE.titleLine);
  expect(sakura.artEdge).not.toBe(RETRO_DEFAULT_PALETTE.artEdge);
  expect(sakura.titleFace).toBe(RETRO_DEFAULT_PALETTE.titleFace);
  // 冷色主题下夕阳和红球保持原样，奶油字面永远不动。
  const dusk = retroPalette("#7b67b8");
  expect(dusk.pennant).not.toBe(RETRO_DEFAULT_PALETTE.pennant);
  expect(dusk.band).toBe(RETRO_DEFAULT_PALETTE.band);
  expect(dusk.ball).toBe(RETRO_DEFAULT_PALETTE.ball);
  expect(dusk.tag).toBe(RETRO_DEFAULT_PALETTE.tag);
  expect(dusk.titleFace).toBe(RETRO_DEFAULT_PALETTE.titleFace);
  expect(sakura.titleRim).toBe(RETRO_DEFAULT_PALETTE.titleRim);

  // 暖色主题时暖色一族让开，红球不再和天空同色。
  const ember = retroPalette("#c4544a");
  expect(ember.skyMid).toBe("#c4544a");
  expect(ember.ball).not.toBe(RETRO_DEFAULT_PALETTE.ball);
  expect(ember.tag).not.toBe(RETRO_DEFAULT_PALETTE.tag);
  expect(ember.titleFace).toBe(RETRO_DEFAULT_PALETTE.titleFace);
  for (const preset of RETRO_THEME_PRESETS) expect(retroPalette(preset.value).skyMid).toBe(preset.value);
});

test("封面按 colorway 换色：天空、长三角、标题描边和眉题都跟着变", async () => {
  const base = await render(cover("娜斯提\n全解析"));
  const pick = (root: Element) => ({
    colorway: root.querySelector("[data-retro-future-canvas]")!.getAttribute("data-colorway"),
    sky: root.querySelectorAll("[data-retro-sky] linearGradient stop")[1].getAttribute("stop-color"),
    pennant: root.querySelector("[data-retro-pennant] linearGradient stop")!.getAttribute("stop-color"),
    line: getComputedStyle(root.querySelector("[data-retro-line-stroke]")!).color,
    face: root.querySelector("[data-retro-face]")!.getAttribute("style"),
    kicker: getComputedStyle(root.querySelector('[data-cover-el="kicker"] [data-retro-serif] > span:last-child')!).color,
  });
  const before = pick(base.container);
  expect(before.colorway).toBe("#5a9ab4");
  expect(before.sky).toBe("#5a9ab4");
  expect(before.pennant).toBe("#8fae5f");

  const themed = await render(cover("娜斯提\n全解析", stubArt, "#c4544a"));
  const after = pick(themed.container);
  const palette = retroPalette("#c4544a");
  expect(after.colorway).toBe("#c4544a");
  expect(after.sky).toBe("#c4544a");
  expect(after.pennant).toBe(palette.pennant);
  expect(after.line).not.toBe(before.line);
  expect(after.kicker).not.toBe(before.kicker);
  expect(after.face).toBe(before.face);
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

test("编辑器主题色：预设一键换色、手填色值、还原回原版，并存进草稿", async () => {
  const screen = await render(
    <CoverProvider templateId="retro-future">
      <EditorPreview />
    </CoverProvider>,
  );
  const canvas = () => screen.container.querySelector("[data-retro-future-canvas]")!;
  await expect.element(screen.getByRole("textbox", { name: "主题色" })).toHaveValue("#5a9ab4");
  expect(canvas().getAttribute("data-colorway")).toBe("#5a9ab4");
  await expect.element(screen.getByRole("button", { name: "主题色：天青（原版）" })).toHaveAttribute("aria-pressed", "true");

  await screen.getByRole("button", { name: "主题色：樱粉" }).click();
  await expect.poll(() => canvas().getAttribute("data-colorway")).toBe("#d77a9c");
  await expect.element(screen.getByRole("textbox", { name: "主题色" })).toHaveValue("#d77a9c");
  await expect.poll(() => loadDraft("retro-future").colorway).toBe("#d77a9c");
  expect(canvas().querySelectorAll("[data-retro-sky] linearGradient stop")[1].getAttribute("stop-color")).toBe("#d77a9c");

  await screen.getByRole("textbox", { name: "主题色" }).fill("#2f4f7f");
  await expect.poll(() => canvas().getAttribute("data-colorway")).toBe("#2f4f7f");
  await expect.poll(() => loadDraft("retro-future").colorway).toBe("#2f4f7f");

  await screen.getByRole("button", { name: "还原" }).click();
  await expect.poll(() => canvas().getAttribute("data-colorway")).toBe("#5a9ab4");
});

test("空稿默认主题色就是原版天青", () => {
  expect(emptyDraft("retro-future").colorway).toBe(RETRO_THEME);
});

test("默认立绘按手描轮廓挖掉自带场景，别的立绘不套蒙版", async () => {
  const screen = await render(cover("娜斯提\n全解析", artUrl("char_4212_nasti_2")));
  const img = screen.container.querySelector("[data-operator-slot] img") as HTMLImageElement;
  expect(getComputedStyle(img).maskImage).toContain("data:image/svg+xml");

  const other = await render(cover("娜斯提\n全解析", artUrl("char_4212_nasti_1")));
  const plain = other.container.querySelectorAll("[data-operator-slot] img")[0] as HTMLImageElement;
  expect(getComputedStyle(plain).maskImage).toBe("none");
});

test("长标题自动拆两行并缩字号，整块留在画布内", async () => {
  expect(retroTitleLines("娜斯提精英二全解析")).toEqual(["娜斯提精英", "二全解析"]);
  expect(retroTitleSize(["娜斯提精英", "二全解析"])).toBeLessThan(retroTitleSize(["娜斯提", "全解析"]));

  const screen = await render(cover("娜斯提精英二全解析"));
  await document.fonts.ready;
  const canvas = screen.container.querySelector("[data-retro-future-canvas]")!.getBoundingClientRect();
  const lines = [...screen.container.querySelectorAll("[data-retro-line] [data-retro-face]")].map((n) => n.getBoundingClientRect());
  expect(lines).toHaveLength(2);
  for (const line of lines) {
    expect(line.right).toBeLessThan(canvas.right);
    expect(line.bottom).toBeLessThan(canvas.bottom);
  }
});

test("空稿使用娜斯提精二和参考图文案", () => {
  const draft = emptyDraft("retro-future");
  expect(draft.title).toBe("娜斯提\n全解析");
  expect(draft.subtitle).toBe("New Series");
  expect(draft.signature).toBe("No.");
  expect(draft.episode).toBe(12);
  expect(draft.operatorId).toBe("char_4212_nasti");
  expect(draft.artId).toBe("char_4212_nasti_2");
  expect(draft.imageScale).toBe(256);
  expect(draft.imageX).toBe(-563);
  expect(draft.imageY).toBe(-421);
  expect(draft.canvasSkin).toBe("retro-future");
  expect(draft.layers.map((layer) => layer.id)).toEqual([
    "sky", "brush", "halo", "operator", "haze", "pennant", "orbits", "grain", "title", "kicker", "episode", "sparkles",
  ]);
  expect(draft.layers.find((layer) => layer.id === "title")).toMatchObject({ font: "cn", fontSize: 262 });
});

test("空白画布能加让大地变成一片酸橙的立体字、衬线贴纸和装饰", async () => {
  const draft = emptyDraft("plain");
  const block = getTextStyle("retro-block")!;
  const serif = getTextStyle("retro-serif")!;
  const blockLayer = textLayer({ id: "t1", x: 0, y: 0, ...block.layer });
  const serifLayer = textLayer({ id: "t2", x: 0, y: 0, ...serif.layer });
  const pennant = getDecoration("retro-pennant")!;

  const screen = await render(
    <div style={{ width: 1920, height: 1080, position: "relative" }}>
      <div className="font-cn">{renderTextContent(blockLayer, draft, null)}</div>
      <div className="font-fraunces" style={{ color: serifLayer.color }}>{renderTextContent(serifLayer, draft, null)}</div>
      <div style={{ position: "relative", width: 1920, height: 1080 }}>{renderBoxChrome(boxLayer({ id: "b1", ...pennant.layer }))}</div>
    </div>,
  );

  const faces = [...screen.container.querySelectorAll("[data-retro-face]")].map((n) => n.textContent);
  expect(faces).toEqual(["学方舟", "做设计"]);
  expect(screen.container.querySelector("[data-retro-serif]")?.textContent).toContain("New Series");
  expect(screen.container.querySelector("[data-retro-pennant]")).not.toBeNull();
  expect(screen.container.querySelector("[data-retro-pennant] linearGradient stop")!.getAttribute("stop-color")).toBe("#8fae5f");

  // 空白画布上装饰的图层颜色就是主题色。
  const tinted = await render(
    <div style={{ position: "relative", width: 1920, height: 1080 }}>
      {renderBoxChrome(boxLayer({ id: "b2", ...pennant.layer, color: "#7b67b8" }))}
    </div>,
  );
  expect(tinted.container.querySelector("[data-retro-pennant] linearGradient stop")!.getAttribute("stop-color")).toBe(
    retroPalette("#7b67b8").pennant,
  );
});
