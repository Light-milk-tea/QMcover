import { useRef } from "react";
import { toPng } from "html-to-image";
import { beforeEach, expect, test } from "vitest";
import { render } from "vitest-browser-react";
import "../index.css";
import { CoverStage, draftToRenderProps } from "../components/CoverStage";
import { EditorPanel } from "../components/EditorPanel";
import { InspectorPanel } from "../components/InspectorPanel";
import { TEMPLATE_ELEMENTS } from "../data/elements";
import { chibiUrl } from "../data/chibis";
import { artUrl, skillUrl } from "../data/arts";
import { emptyDraft, loadDraft, saveDraft } from "../lib/storage";
import { CoverProvider, useCover } from "../store/CoverContext";
import type { ImageLayer } from "../types";
import { CoverView } from "./registry";

const stubArt =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='100'%3E%3Crect width='60' height='100' fill='%23c2b588'/%3E%3C/svg%3E";

function stubDraft(patch: Partial<ReturnType<typeof emptyDraft>> = {}) {
  const draft = emptyDraft("strength-review");
  return {
    ...draft,
    bgPreset: "ink",
    imageDataUrl: stubArt,
    layers: draft.layers.map((layer) =>
      layer.kind === "image" && layer.id === "operator" ? { ...layer, imageDataUrl: stubArt, imageUrl: "" } : layer,
    ),
    ...patch,
  };
}

function renderCover(draft: ReturnType<typeof stubDraft>) {
  return render(
    <div style={{ width: 1920, height: 1080 }}>
      <CoverView
        {...draftToRenderProps("strength-review", draft, {
          previewScale: 1,
          onImageDrag: () => undefined,
          showPlaceholder: false,
        })}
      />
    </div>,
  );
}

function drag(element: HTMLElement, dx: number, dy: number) {
  element.setPointerCapture = () => undefined;
  const rect = element.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;
  element.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, pointerId: 1, clientX: x, clientY: y }));
  element.dispatchEvent(new PointerEvent("pointermove", { bubbles: true, pointerId: 1, clientX: x + dx, clientY: y + dy }));
  element.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, pointerId: 1, clientX: x + dx, clientY: y + dy }));
}

beforeEach(() => localStorage.clear());

test("新建稿使用丰川祥子主立绘、三技能位和精0小人层", () => {
  const draft = emptyDraft("strength-review");
  expect(draft.title).toBe("丰川祥子");
  expect(draft.subtitle).toBe("强度测评");
  expect(draft.operatorName).toBe("丰川祥子");
  expect(draft.operatorId).toBe("char_4182_oblvns");
  expect(draft.artId).toBe("char_4182_oblvns_avemujica#1");
  expect(draft.canvasSkin).toBe("strength-review");
  expect(draft.layers.map((layer) => layer.id)).toEqual(TEMPLATE_ELEMENTS["strength-review"].map((layer) => layer.id));
  expect(draft.layers.find((layer) => layer.id === "operator")).toMatchObject({
    artId: "char_4182_oblvns_avemujica#1",
    operatorId: "char_4182_oblvns",
    artGrade: { enabled: true, contrast: 5, saturate: 10, brightness: 2, fringe: 100 },
  });
  expect(draft.layers.find((layer) => layer.id === "operator-b")).toBeUndefined();
  const chibi = draft.layers.find((layer): layer is ImageLayer => layer.id === "chibi" && layer.kind === "image");
  expect(chibi?.source).toBe("chibi");
  expect(chibi?.imageUrl).toBe(chibiUrl("char_4182_oblvns"));
  expect(chibi?.artId).toBe("char_4182_oblvns_1");
  expect(chibi).toMatchObject({
    x: 812,
    y: 268,
    w: 248,
    h: 400,
    scale: 119,
    imageX: -33,
    imageY: 29,
    artGrade: { enabled: true, contrast: 5, saturate: 4, brightness: 2, fringe: 100 },
  });
  expect(draft.effects.grain).toEqual({ enabled: true, amount: 8 });
  expect(draft.effects.artGrade.enabled).toBe(false);
  expect(draft.layers.find((layer) => layer.id === "skill-1")).toMatchObject({ x: 1010, y: 381 });
  expect(draft.layers.find((layer) => layer.id === "skill-2")).toMatchObject({ x: 1288, y: 380 });
  expect(draft.layers.find((layer) => layer.id === "skill-3")).toMatchObject({ x: 1554, y: 378 });
  expect(draft.layers.find((layer) => layer.id === "atmosphere")).toMatchObject({ hidden: true, removed: true });
});

test("没开背景调色时背景图不加暗", async () => {
  const base = emptyDraft("strength-review");
  const screen = await renderCover(
    stubDraft({
      bgPreset: "lungmen-street",
      effects: { ...base.effects, bgGrade: { ...base.effects.bgGrade, enabled: false } },
    }),
  );
  const bg = screen.container.querySelector("[data-sr-bg]");
  if (!(bg instanceof HTMLElement)) throw new Error("背景图必须在");
  expect(bg.style.filter === "" || bg.style.filter === "none").toBe(true);
});

test("打开背景调色才改背景亮度", async () => {
  const base = emptyDraft("strength-review");
  const screen = await renderCover(
    stubDraft({
      bgPreset: "lungmen-street",
      effects: { ...base.effects, bgGrade: { enabled: true, blur: 0, grayscale: 0, contrast: 0, brightness: 50 } },
    }),
  );
  const bg = screen.container.querySelector("[data-sr-bg]");
  if (!(bg instanceof HTMLElement)) throw new Error("背景图必须在");
  expect(bg.style.filter).toContain("brightness");
});

test("默认主立绘与三技能位，立绘低于标题，不渲染立绘B", async () => {
  const screen = await renderCover(stubDraft());
  await document.fonts.ready;
  const canvas = screen.container.querySelector("[data-strength-review-canvas]")!;
  expect(screen.container.querySelector('[data-cover-el="operator"]')).toBeTruthy();
  expect(screen.container.querySelector('[data-cover-el="operator-b"]')).toBeNull();
  expect(screen.container.querySelector("[data-operator-slot-b]")).toBeNull();
  const icons = [...screen.container.querySelectorAll<HTMLImageElement>("[data-skill-icon]")];
  expect(icons.map((img) => img.dataset.skillId)).toEqual(["skchr_oblvns_1", "skchr_oblvns_2", "skchr_oblvns_3"]);
  expect(icons[0].getAttribute("src")).toBe(skillUrl("skchr_oblvns_1"));
  expect(screen.container.textContent).not.toContain("从立绘库点选");
  const frame = canvas.getBoundingClientRect();
  const chibiSlot = screen.container.querySelector("[data-chibi-slot]") as HTMLElement;
  expect(chibiSlot.querySelector("img")?.getAttribute("src")).toBe(chibiUrl("char_4182_oblvns"));
  const chibiBox = chibiSlot.getBoundingClientRect();
  const skillBox = (screen.container.querySelector('[data-cover-el="skill-1"]') as HTMLElement).getBoundingClientRect();
  expect(chibiBox.width).toBeGreaterThan(200);
  expect(chibiBox.left).toBeGreaterThan(frame.left + frame.width * 0.35);
  expect(chibiBox.left).toBeLessThan(skillBox.left + 80);
  const left = screen.container.querySelector("[data-operator-slot]") as HTMLElement;
  const name = screen.container.querySelector('[data-cover-el="name"]') as HTMLElement;
  expect(Number(getComputedStyle(left).zIndex)).toBeLessThan(Number(getComputedStyle(name).zIndex) || 8);
  const nameBox = name.getBoundingClientRect();
  const series = screen.container.querySelector('[data-cover-el="series"]')!.getBoundingClientRect();
  expect(nameBox.right).toBeLessThan(frame.right - 40);
  expect(series.right).toBeLessThan(frame.right - 40);
  expect(series.bottom).toBeLessThan(frame.bottom + 8);
  expect(name.textContent).toContain("丰川祥子");
  expect(screen.container.querySelector('[data-cover-el="series"]')?.textContent).toContain("强度测评");
  expect(screen.container.querySelector('[data-cover-el="name"] [data-type-face]')).toBeTruthy();
  expect(screen.container.querySelector('[data-cover-el="atmosphere"]')).toBeNull();
  expect(screen.container.querySelector("[data-sr-atmosphere]")).toBeNull();
  const slotA = screen.container.querySelector("[data-operator-slot]") as HTMLElement;
  const slotABox = slotA.getBoundingClientRect();
  expect(slotABox.left).toBeLessThan(frame.left + 8);
  expect(slotABox.width).toBeGreaterThan(frame.width * 0.6);
  const operatorPan = screen.container.querySelector('[data-cover-el="operator"] [data-art-pan]');
  const chibiPan = screen.container.querySelector('[data-cover-el="chibi"] [data-art-pan]');
  if (!(operatorPan instanceof HTMLElement) || !(chibiPan instanceof HTMLElement)) throw new Error("立绘调色层必须在");
  expect(getComputedStyle(operatorPan).filter).toContain("saturate");
  expect(getComputedStyle(operatorPan).filter).toContain("contrast");
  expect(getComputedStyle(chibiPan).filter).toContain("saturate");
  expect(getComputedStyle(chibiPan).filter).toContain("contrast");
});

test("旧稿去掉立绘B，精零主立绘换成皮肤", () => {
  const draft = emptyDraft("strength-review");
  saveDraft("strength-review", {
    ...draft,
    artId: "char_4182_oblvns_1",
    imageScale: 228,
    imageX: -28,
    imageY: -12,
    layers: [
      ...draft.layers.map((layer) =>
        layer.id === "operator" && layer.kind === "image"
          ? { ...layer, artId: "char_4182_oblvns_1", scale: 228, imageX: -28, imageY: -12 }
          : layer,
      ),
      {
        id: "operator-b",
        kind: "image" as const,
        source: "operator" as const,
        label: "立绘B",
        x: 960,
        y: 0,
        w: 960,
        h: 1080,
        artId: "char_4182_oblvns_avemujica#1",
        scale: 358,
        imageX: -8,
        imageY: -246,
      },
    ],
  });
  const loaded = loadDraft("strength-review");
  expect(loaded.artId).toBe("char_4182_oblvns_avemujica#1");
  expect(loaded.layers.find((layer) => layer.id === "operator")).toMatchObject({
    artId: "char_4182_oblvns_avemujica#1",
    scale: 378,
  });
  expect(loaded.layers.find((layer) => layer.id === "operator-b")).toBeUndefined();
});

test("长短标题不破框", async () => {
  const screen = await renderCover(
    stubDraft({
      title: "超长干员名字再加几个字",
      subtitle: "强度测评栏目加长测试",
    }),
  );
  await document.fonts.ready;
  const canvas = screen.container.querySelector("[data-strength-review-canvas]")!.getBoundingClientRect();
  const name = screen.container.querySelector('[data-cover-el="name"]')!.getBoundingClientRect();
  const series = screen.container.querySelector('[data-cover-el="series"]')!.getBoundingClientRect();
  expect(name.left).toBeGreaterThan(canvas.left + 40);
  expect(name.right).toBeLessThan(canvas.right - 40);
  expect(series.right).toBeLessThan(canvas.right - 40);
  expect(series.bottom).toBeLessThan(canvas.bottom + 12);
});

test("两行标题清晰分隔、技能栏在标题上方，所有字面留在画布内", async () => {
  const screen = await renderCover(stubDraft());
  await document.fonts.ready;
  const bounds = (selector: string) => screen.container.querySelector(selector)!.getBoundingClientRect();
  const frame = bounds("[data-strength-review-canvas]");
  const name = bounds('[data-cover-el="name"] [data-type-face]');
  const series = bounds('[data-cover-el="series"] [data-type-face]');
  const skill = bounds('[data-cover-el="skill-1"]');
  for (const id of ["name", "series"]) {
    const face = screen.container.querySelector(`[data-cover-el="${id}"] .sr-gold-fill`)!;
    expect(getComputedStyle(face).fontWeight).toBe("500");
    expect(parseFloat(getComputedStyle(face).letterSpacing)).toBeGreaterThan(5);
  }
  expect(name.left).toBeGreaterThan(frame.left + frame.width * 0.4);
  expect(series.top - name.bottom).toBeGreaterThan(0);
  expect(name.top - skill.bottom).toBeGreaterThan(0);
  expect(series.bottom).toBeLessThan(frame.bottom - 16);
  expect(series.right).toBeLessThan(frame.right - 70);
});

test("旧默认裁切更新，保存后的自定义位置、字号和颜色不被重置", () => {
  const draft = emptyDraft("strength-review");
  const oldCrop = {
    ...draft,
    imageX: -18,
    imageY: -268,
    layers: draft.layers.map((layer) => layer.id === "operator" && layer.kind === "image"
      ? { ...layer, imageX: -18, imageY: -268 } : layer),
  };
  saveDraft("strength-review", oldCrop);
  expect(loadDraft("strength-review").imageY).toBe(draft.imageY);
  const custom = {
    ...oldCrop,
    imageX: 42,
    layers: oldCrop.layers.map((layer) => layer.id === "operator" && layer.kind === "image"
      ? { ...layer, imageX: 42 } : layer),
    elementStyles: { name: { x: 20, y: 30, fontSize: 150, color: "#ee8080" } },
  };
  saveDraft("strength-review", custom);
  const loaded = loadDraft("strength-review");
  expect(loaded.imageX).toBe(42);
  expect(loaded.imageY).toBe(-268);
  expect(loaded.elementStyles.name).toEqual(custom.elementStyles.name);
  saveDraft("strength-review", loaded);
  expect(loadDraft("strength-review")).toEqual(loaded);
});

test("金属标题的 PNG 导出保留亮面和暗面", async () => {
  const screen = await renderCover(stubDraft());
  await document.fonts.ready;
  const title = screen.container.querySelector<HTMLElement>('[data-cover-el="name"]')!;
  const url = await toPng(title, {
    width: 1040,
    height: 340,
    pixelRatio: 1,
    // Standalone capture must ignore the inherited logical insets of the canvas title.
    style: { position: "static", transform: "none", paddingTop: "40px" },
  });
  const image = new Image();
  image.src = url;
  await image.decode();
  const canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;
  const context = canvas.getContext("2d")!;
  context.drawImage(image, 0, 0);
  const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
  let light = 0;
  let shade = 0;
  for (let i = 0; i < data.length; i += 4) {
    const [r, g, b, alpha] = data.slice(i, i + 4);
    if (alpha < 250) continue;
    // Count only the neutral letter face, excluding the gold rim and dark shadow.
    if (Math.max(r, g, b) - Math.min(r, g, b) > 45) continue;
    const brightness = (r + g + b) / 3;
    if (brightness > 226) light++;
    if (brightness > 130 && brightness < 197) shade++;
  }
  expect(light).toBeGreaterThan(800);
  expect(shade).toBeGreaterThan(800);
}, 30000);

test("旧技能栏采用新尺寸但保留自定义位置", () => {
  const draft = emptyDraft("strength-review");
  saveDraft("strength-review", {
    ...draft,
    layers: draft.layers.map((layer) => layer.id === "skill-1"
      ? { ...layer, x: 1080, y: 386, w: 220, h: 220 }
      : layer.id === "skill-2"
        ? { ...layer, x: 1195, y: 386, w: 220, h: 220 }
        : layer),
  });
  const loaded = loadDraft("strength-review");
  expect(loaded.layers.find((layer) => layer.id === "skill-1"))
    .toMatchObject({ x: 1010, y: 381, w: 236, h: 236 });
  expect(loaded.layers.find((layer) => layer.id === "skill-2"))
    .toMatchObject({ x: 1195, y: 380, w: 236, h: 236 });
});

function EditorHarness() {
  const cover = useCover();
  return (
    <>
      <button
        onClick={() => {
          cover.patchDraft({
            title: "暮落",
            operatorName: "暮落",
            operatorId: "char_512_aprot",
            artId: "char_512_aprot_1",
            imageDataUrl: stubArt,
          });
          cover.patchLayer("operator", {
            operatorId: "char_512_aprot",
            artId: "char_512_aprot_1",
            imageDataUrl: stubArt,
            imageUrl: "",
          });
        }}
      >
        换成暮落
      </button>
      <button onClick={() => cover.patchLayer("chibi", { hidden: true })}>隐藏小人</button>
      <div style={{ width: 1920, height: 1080 }}>
        <CoverView
          {...draftToRenderProps("strength-review", cover.draft, {
            previewScale: 1,
            onImageDrag: () => undefined,
            showPlaceholder: false,
          })}
        />
      </div>
    </>
  );
}

test("小人层选图后出现，隐藏后消失，且不会把全身立绘当小人", async () => {
  const withChibi = stubDraft({
    layers: stubDraft().layers.map((layer) =>
      layer.id === "chibi" && layer.kind === "image"
        ? { ...layer, source: "chibi" as const, imageDataUrl: stubArt, imageUrl: "" }
        : layer,
    ),
  });
  saveDraft("strength-review", withChibi);
  const screen = await render(
    <CoverProvider templateId="strength-review">
      <EditorHarness />
    </CoverProvider>,
  );
  await expect.poll(() => screen.container.querySelector("[data-chibi-slot] img")?.getAttribute("src")).toBe(stubArt);
  expect(screen.container.querySelector('[data-cover-el="chibi"]')).toBeTruthy();
  await screen.getByRole("button", { name: "隐藏小人" }).click();
  expect(screen.container.querySelector('[data-cover-el="chibi"]')).toBeNull();
  expect(screen.container.querySelector("[data-chibi-slot] img")).toBeNull();

  const leaked = stubDraft({
    layers: stubDraft().layers.map((layer) =>
      layer.id === "chibi" && layer.kind === "image"
        ? {
            ...layer,
            source: "chibi" as const,
            artId: "char_4182_oblvns_avemujica#1",
            imageUrl: artUrl("char_4182_oblvns_avemujica#1"),
            imageDataUrl: "",
          }
        : layer,
    ),
  });
  const leakedScreen = await renderCover(leaked);
  expect(leakedScreen.container.querySelector("[data-chibi-slot] img")?.getAttribute("src"))
    .toBe(chibiUrl("char_4182_oblvns_avemujica#1"));
});

test("换主立绘后小人跟着走，另选过的小人保留", async () => {
  saveDraft("strength-review", stubDraft());
  const screen = await render(
    <CoverProvider templateId="strength-review">
      <div style={{ display: "flex" }}>
        <EditorPanel />
        <EditorHarness />
      </div>
    </CoverProvider>,
  );
  await expect.poll(() => screen.container.querySelector("[data-chibi-slot] img")?.getAttribute("src"))
    .toBe(chibiUrl("char_4182_oblvns"));
  await screen.getByPlaceholder("搜中文名 / 英文 / ID").fill("char_002_amiya");
  await screen.getByRole("button", { name: /^阿米娅/ }).click();
  await expect.poll(() => screen.container.querySelector("[data-chibi-slot] img")?.getAttribute("src"))
    .toBe(chibiUrl("char_002_amiya"));
  expect(loadDraft("strength-review").layers.find((layer) => layer.id === "chibi")).toMatchObject({
    source: "chibi",
    operatorId: "char_002_amiya",
    imageUrl: chibiUrl("char_002_amiya"),
  });
});

test("换干员后技能图标跟目录走，隐藏小人层", async () => {
  saveDraft("strength-review", stubDraft());
  const screen = await render(
    <CoverProvider templateId="strength-review">
      <EditorHarness />
    </CoverProvider>,
  );
  await screen.getByRole("button", { name: "换成暮落" }).click();
  await expect
    .poll(() =>
      [...screen.container.querySelectorAll<HTMLImageElement>("[data-skill-icon]")].map((img) => img.dataset.skillId),
    )
    .toEqual(["skchr_aprot_1"]);
  expect(screen.container.querySelector('[data-cover-el="skill-2"]')).toBeNull();
  expect(screen.container.querySelector('[data-cover-el="skill-3"]')).toBeNull();
  expect(screen.container.querySelector('[data-cover-el="name"]')?.textContent).toContain("暮落");
  await screen.getByRole("button", { name: "隐藏小人" }).click();
  expect(screen.container.querySelector('[data-cover-el="chibi"]')).toBeNull();
  expect(screen.container.textContent).not.toContain("从立绘库点选");
});

function DragHarness() {
  const stageRef = useRef<HTMLDivElement>(null);
  const { draft, selectElement } = useCover();
  return (
    <>
      <button onClick={() => selectElement("operator")}>选中立绘</button>
      <output data-testid="pan">{`${Math.round(draft.imageX)},${Math.round(draft.imageY)}`}</output>
      <div style={{ width: 960, height: 540 }}>
        <CoverStage stageRef={stageRef} />
      </div>
    </>
  );
}

test("选中立绘后拖动选中框会平移立绘", async () => {
  saveDraft("strength-review", stubDraft());
  const screen = await render(
    <CoverProvider templateId="strength-review">
      <DragHarness />
    </CoverProvider>,
  );
  await screen.getByRole("button", { name: "选中立绘" }).click();
  const overlay = screen.getByTestId("selection-overlay");
  await expect.element(overlay).toBeVisible();
  const beforePan = screen.getByTestId("pan").element().textContent;
  const wrap = screen.container.querySelector('[data-cover-el="operator"]') as HTMLElement;
  const panEl = () => wrap.querySelector("[data-art-pan]") as HTMLElement;
  const beforeTx = panEl().style.transform;
  const overlayElement = overlay.element();
  if (!(overlayElement instanceof HTMLElement)) throw new Error("选中框必须是 HTML 元素");
  drag(overlayElement, 80, 40);
  await expect.poll(() => screen.getByTestId("pan").element().textContent).not.toBe(beforePan);
  expect(panEl().style.transform).not.toBe(beforeTx);
});

function LayerFixture() {
  const stageRef = useRef<HTMLDivElement>(null);
  return (
    <>
      <InspectorPanel />
      <div style={{ width: 960, height: 540 }}>
        <CoverStage stageRef={stageRef} />
      </div>
    </>
  );
}

test("默认关掉背景立绘，删掉主立绘后画布不再留下人像", async () => {
  saveDraft("strength-review", stubDraft());
  const screen = await render(
    <CoverProvider templateId="strength-review">
      <LayerFixture />
    </CoverProvider>,
  );
  expect(screen.container.querySelector('[data-cover-el="atmosphere"]')).toBeNull();
  expect(screen.container.querySelector("[data-sr-atmosphere]")).toBeNull();
  await screen.getByRole("button", { name: /^立绘/ }).click();
  await screen.getByTitle("删除").click();
  expect(screen.container.querySelector('[data-cover-el="operator"]')).toBeNull();
});

test("立绘边缘虚化开关和宽度会改到可见立绘盒", async () => {
  saveDraft("strength-review", stubDraft());
  const screen = await render(
    <CoverProvider templateId="strength-review">
      <LayerFixture />
    </CoverProvider>,
  );
  await screen.getByRole("button", { name: /^立绘/ }).click();
  const wrap = () => screen.container.querySelector('[data-cover-el="operator"]') as HTMLElement;
  const fadeX = () => wrap().querySelector("[data-edge-fade-x]") as HTMLElement | null;
  const fadeY = () => wrap().querySelector("[data-edge-fade-y]") as HTMLElement | null;
  expect(wrap().dataset.edgeFade).toBeUndefined();
  expect(fadeX()).toBeNull();
  expect(getComputedStyle(wrap()).maskImage === "none" || !getComputedStyle(wrap()).maskImage).toBe(true);
  await screen.getByRole("checkbox", { name: "边缘虚化" }).click();
  await expect.poll(() => wrap().dataset.edgeFade).toBe("16");
  await expect.poll(() => wrap().dataset.edgeFadeMode).toBe("all");
  expect(getComputedStyle(fadeX()!).maskImage).toContain("16%");
  expect(getComputedStyle(fadeX()!).maskSize).toContain("100%");
  expect(getComputedStyle(fadeY()!).maskImage).toContain("16%");
  expect(getComputedStyle(fadeY()!).maskSize).toContain("100%");
  await screen.getByRole("button", { name: "左侧" }).click();
  await expect.poll(() => wrap().dataset.edgeFadeMode).toBe("left");
  expect(fadeY()).toBeNull();
  expect(getComputedStyle(fadeX()!).maskImage).toContain("100%");
  await screen.getByRole("button", { name: "右侧" }).click();
  await expect.poll(() => wrap().dataset.edgeFadeMode).toBe("right");
  expect(fadeY()).toBeNull();
  expect(getComputedStyle(fadeX()!).maskImage).toContain("0%");
  await screen.getByRole("button", { name: "四周" }).click();
  await expect.poll(() => wrap().dataset.edgeFadeMode).toBe("all");
  expect(fadeY()).toBeTruthy();
  await screen.getByRole("slider", { name: /虚化宽度/ }).fill("60");
  await expect.poll(() => wrap().dataset.edgeFade).toBe("60");
  expect(getComputedStyle(fadeX()!).maskImage).toContain("60%");
  expect(getComputedStyle(fadeY()!).maskImage).toContain("60%");
  expect(loadDraft("strength-review").imageEdgeFade).toBe(true);
  expect(loadDraft("strength-review").imageEdgeFadeAmount).toBe(60);
  expect(loadDraft("strength-review").imageEdgeFadeMode).toBe("all");
});


test("旧预留小人框迁到手动默认位置并补图", () => {
  const base = emptyDraft("strength-review");
  const old = {
    ...base,
    layers: base.layers.map((layer) =>
      layer.id === "chibi" && layer.kind === "image"
        ? { ...layer, x: 812, y: 268, w: 248, h: 400, scale: 100, imageX: 0, imageY: 0, imageUrl: "", artId: "", operatorId: "" }
        : layer,
    ),
  };
  saveDraft("strength-review", old);
  expect(loadDraft("strength-review").layers.find((layer) => layer.id === "chibi")).toMatchObject({
    source: "chibi",
    x: 812,
    y: 268,
    w: 248,
    h: 400,
    scale: 119,
    imageX: -33,
    imageY: 29,
    imageUrl: chibiUrl("char_4182_oblvns"),
    artId: "char_4182_oblvns_1",
  });
});

test("旧技能偏移写进默认坐标并清掉 elementStyles", () => {
  const base = emptyDraft("strength-review");
  saveDraft("strength-review", {
    ...base,
    layers: base.layers.map((layer) =>
      layer.id === "skill-1" ? { ...layer, x: 1000, y: 380 }
        : layer.id === "skill-2" ? { ...layer, x: 1230, y: 380 }
          : layer.id === "skill-3" ? { ...layer, x: 1460, y: 380 }
            : layer,
    ),
    elementStyles: { "skill-1": { x: 10, y: 1.1921965317919074 }, "skill-2": { x: 58 }, "skill-3": { x: 94, y: -2 } },
  });
  const loaded = loadDraft("strength-review");
  expect(loaded.layers.find((layer) => layer.id === "skill-1")).toMatchObject({ x: 1010, y: 381 });
  expect(loaded.layers.find((layer) => layer.id === "skill-2")).toMatchObject({ x: 1288, y: 380 });
  expect(loaded.layers.find((layer) => layer.id === "skill-3")).toMatchObject({ x: 1554, y: 378 });
  expect(loaded.elementStyles["skill-1"]).toBeUndefined();
  expect(loaded.elementStyles["skill-2"]).toBeUndefined();
  expect(loaded.elementStyles["skill-3"]).toBeUndefined();
});

test("旧默认皮肤小人改成精0站姿", () => {
  const base = emptyDraft("strength-review");
  saveDraft("strength-review", {
    ...base,
    layers: base.layers.map((layer) =>
      layer.id === "chibi" && layer.kind === "image"
        ? {
            ...layer,
            artId: "char_4182_oblvns_avemujica#1",
            imageUrl: chibiUrl("char_4182_oblvns_avemujica#1"),
            operatorId: "char_4182_oblvns",
          }
        : layer,
    ),
  });
  expect(loadDraft("strength-review").layers.find((layer) => layer.id === "chibi")).toMatchObject({
    source: "chibi",
    artId: "char_4182_oblvns_1",
    imageUrl: chibiUrl("char_4182_oblvns"),
  });
});

test("旧稿缺立绘调色时补上手调默认，自调过的保留", () => {
  const base = emptyDraft("strength-review");
  const custom = { enabled: true, contrast: 18, saturate: 2, brightness: 0, fringe: 40 };
  saveDraft("strength-review", {
    ...base,
    layers: base.layers.map((layer) => {
      if (layer.id === "operator" && layer.kind === "image") {
        const { artGrade: _dropped, ...rest } = layer;
        return rest;
      }
      if (layer.id === "chibi" && layer.kind === "image") return { ...layer, artGrade: custom };
      return layer;
    }),
  });
  const loaded = loadDraft("strength-review");
  expect(loaded.layers.find((layer) => layer.id === "operator")).toMatchObject({
    artGrade: { enabled: true, contrast: 5, saturate: 10, brightness: 2, fringe: 100 },
  });
  expect(loaded.layers.find((layer) => layer.id === "chibi")).toMatchObject({ artGrade: custom });
});

test("旧空小人层按已有干员补图，隐藏、自定义和未收录角色保留", () => {
  const base = emptyDraft("strength-review");
  const old = { ...base, layers: base.layers.map((layer) => layer.id === "chibi" && layer.kind === "image"
    ? { ...layer, imageUrl: "", artId: "", operatorId: "" } : layer) };
  saveDraft("strength-review", old);
  expect(loadDraft("strength-review").layers.find((layer) => layer.id === "chibi"))
    .toMatchObject({ source: "chibi", imageUrl: chibiUrl("char_4182_oblvns"), artId: "char_4182_oblvns_1" });
  for (const patch of [{ hidden: true }, { imageDataUrl: stubArt }, { imageUrl: "https://example.com/custom.png" }]) {
    const draft = { ...old, layers: old.layers.map((layer) => layer.id === "chibi" ? { ...layer, ...patch } : layer) };
    saveDraft("strength-review", draft);
    expect(loadDraft("strength-review").layers.find((layer) => layer.id === "chibi"))
      .toMatchObject({ ...patch, artId: "", operatorId: "" });
  }
  saveDraft("strength-review", { ...old, operatorId: "char_unknown", artId: "char_unknown_1",
    layers: old.layers.map((layer) => layer.id === "operator" && layer.kind === "image"
      ? { ...layer, operatorId: "char_unknown", artId: "char_unknown_1" } : layer) });
  expect(loadDraft("strength-review").layers.find((layer) => layer.id === "chibi"))
    .toMatchObject({ imageUrl: "", artId: "", operatorId: "" });
});
