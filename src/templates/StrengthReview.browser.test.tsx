import { useRef } from "react";
import { toPng } from "html-to-image";
import { beforeEach, expect, test } from "vitest";
import { render } from "vitest-browser-react";
import "../index.css";
import { CoverStage, draftToRenderProps } from "../components/CoverStage";
import { InspectorPanel } from "../components/InspectorPanel";
import { TEMPLATE_ELEMENTS } from "../data/elements";
import { skillUrl } from "../data/arts";
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

test("新建稿使用丰川祥子主立绘、三技能位和空小人层", () => {
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
  });
  expect(draft.layers.find((layer) => layer.id === "operator-b")).toBeUndefined();
  const chibi = draft.layers.find((layer): layer is ImageLayer => layer.id === "chibi" && layer.kind === "image");
  expect(chibi?.imageUrl).toBe("");
  expect(chibi?.artId).toBe("");
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
  expect(screen.container.querySelector("[data-chibi-slot] img")).toBeNull();
  const left = screen.container.querySelector("[data-operator-slot]") as HTMLElement;
  const name = screen.container.querySelector('[data-cover-el="name"]') as HTMLElement;
  expect(Number(getComputedStyle(left).zIndex)).toBeLessThan(Number(getComputedStyle(name).zIndex) || 8);
  const nameBox = name.getBoundingClientRect();
  const series = screen.container.querySelector('[data-cover-el="series"]')!.getBoundingClientRect();
  const frame = canvas.getBoundingClientRect();
  expect(nameBox.right).toBeLessThan(frame.right - 40);
  expect(series.right).toBeLessThan(frame.right - 40);
  expect(series.bottom).toBeLessThan(frame.bottom + 8);
  expect(name.textContent).toContain("丰川祥子");
  expect(screen.container.querySelector('[data-cover-el="series"]')?.textContent).toContain("强度测评");
  expect(screen.container.querySelector('[data-cover-el="name"] [data-type-face]')).toBeTruthy();
  expect(screen.container.querySelector('[data-cover-el="atmosphere"]')).toBeTruthy();
  expect(screen.container.querySelector("[data-sr-atmosphere]")).toBeTruthy();
  const slotA = screen.container.querySelector("[data-operator-slot]") as HTMLElement;
  const slotABox = slotA.getBoundingClientRect();
  expect(slotABox.left).toBeLessThan(frame.left + 8);
  expect(slotABox.width).toBeGreaterThan(frame.width * 0.6);
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
    .toMatchObject({ x: 1000, y: 380, w: 236, h: 236 });
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
  const beforeTx = wrap.style.transform;
  const overlayElement = overlay.element();
  if (!(overlayElement instanceof HTMLElement)) throw new Error("选中框必须是 HTML 元素");
  drag(overlayElement, 80, 40);
  await expect.poll(() => screen.getByTestId("pan").element().textContent).not.toBe(beforePan);
  expect((screen.container.querySelector('[data-cover-el="operator"]') as HTMLElement).style.transform).not.toBe(beforeTx);
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

test("背景立绘在图层里，删掉后画布不再留下模糊底", async () => {
  saveDraft("strength-review", stubDraft());
  const screen = await render(
    <CoverProvider templateId="strength-review">
      <LayerFixture />
    </CoverProvider>,
  );
  await expect.element(screen.getByRole("button", { name: /背景立绘/ })).toBeVisible();
  expect(screen.container.querySelector("[data-sr-atmosphere]")).toBeTruthy();
  await screen.getByRole("button", { name: /背景立绘/ }).click();
  await screen.getByTitle("删除").click();
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
  expect(wrap().dataset.edgeFade).toBeUndefined();
  expect(getComputedStyle(wrap()).maskImage === "none" || !getComputedStyle(wrap()).maskImage).toBe(true);
  await screen.getByRole("checkbox", { name: "边缘虚化" }).click();
  await expect.poll(() => wrap().dataset.edgeFade).toBe("16");
  expect(getComputedStyle(wrap()).maskImage).toContain("16%");
  await screen.getByRole("slider", { name: /虚化宽度/ }).fill("36");
  await expect.poll(() => wrap().dataset.edgeFade).toBe("36");
  expect(getComputedStyle(wrap()).maskImage).toContain("36%");
  expect(loadDraft("strength-review").imageEdgeFade).toBe(true);
  expect(loadDraft("strength-review").imageEdgeFadeAmount).toBe(36);
});
