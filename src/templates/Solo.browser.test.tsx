import { useRef } from "react";
import { beforeEach, expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { CoverStage } from "../components/CoverStage";
import { EditorPanel } from "../components/EditorPanel";
import { EffectsPanel } from "../components/EffectsPanel";
import { InspectorPanel } from "../components/InspectorPanel";
import "../index.css";
import { emptyDraft } from "../lib/storage";
import { CoverProvider } from "../store/CoverContext";
import { Solo } from "./Solo";

beforeEach(() => {
  localStorage.clear();
});

const stubArt =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='48'%3E%3Crect width='32' height='48' fill='%23801818'/%3E%3C/svg%3E";

test("仅需一人模板显示关卡码、宋体标题和英文标", async () => {
  const screen = await render(
    <div style={{ width: 1920, height: 1080 }}>
      <Solo
        title="酒神单人"
        subtitle="QM-EX-8"
        signature="ONE OPERATOR ONLY"
        mark=""
        episode={1}
        date="2026-09-04"
        operatorName=""
        imageUrl={stubArt}
        imageScale={203}
        imageX={24}
        imageY={121}
        previewScale={1}
        onImageDrag={() => undefined}
        showPlaceholder={false}
        bgPreset="38_g17_1"
      />
    </div>,
  );

  await expect.poll(() => screen.container.querySelector('[data-cover-el="stage"]')?.textContent ?? "").toContain("QM-EX-8");

  const title = screen.container.querySelector('[data-cover-el="title"]');
  const stage = screen.container.querySelector('[data-cover-el="stage"]');
  const slogan = screen.container.querySelector('[data-cover-el="slogan"]');
  const bar = screen.container.querySelector('[data-cover-el="title-bar"]');
  const rule = screen.container.querySelector('[data-cover-el="rule"]');
  const ruleRed = screen.container.querySelector('[data-cover-el="rule-red"]');
  const slashA = screen.container.querySelector('[data-cover-el="slash-a"]');
  const slashB = screen.container.querySelector('[data-cover-el="slash-b"]');
  const slashC = screen.container.querySelector('[data-cover-el="slash-c"]');
  const vortex = screen.container.querySelector('[data-cover-el="vortex"]');
  const washEl = screen.container.querySelector('[data-cover-el="wash"]') as HTMLElement | null;
  const embers = screen.container.querySelector('[data-cover-el="embers"]');
  const operator = screen.container.querySelector('[data-cover-el="operator"]');
  expect(title?.textContent).toContain("酒神单人");
  expect(stage?.textContent).toContain("QM-EX-8");
  expect(slogan?.textContent).toContain("ONE OPERATOR ONLY");
  expect(stage).not.toBeNull();
  expect(slogan).not.toBeNull();
  expect(bar).not.toBeNull();
  expect(rule).not.toBeNull();
  expect(ruleRed).not.toBeNull();
  expect(slashA).toBeNull();
  expect(slashB).toBeNull();
  expect(slashC).toBeNull();
  expect(vortex).toBeNull();
  expect(embers).toBeNull();
  expect(washEl).not.toBeNull();
  expect(getComputedStyle(washEl!).opacity).toBe("1");
  expect(screen.container.querySelector('[data-cover-el="light"]')).not.toBeNull();
  expect(screen.container.querySelector("[data-ak-mark]")?.textContent).toContain("明日方舟");
  expect(operator).not.toBeNull();

  const canvas = screen.container.querySelector("[data-solo-canvas]") as HTMLElement;
  const canvasBox = canvas.getBoundingClientRect();
  const stageBox = stage!.getBoundingClientRect();
  const titleBox = title!.getBoundingClientRect();
  const sloganBox = slogan!.getBoundingClientRect();
  expect(titleBox.top).toBeGreaterThan(stageBox.top);
  expect(sloganBox.top).toBeGreaterThan(titleBox.top);
  expect(stageBox.left).toBeLessThan(canvasBox.left + canvasBox.width * 0.45);
  expect(titleBox.left).toBeLessThan(canvasBox.left + canvasBox.width * 0.5);
  const barBox = bar!.getBoundingClientRect();
  expect(barBox.width).toBeGreaterThan(canvasBox.width * 0.95);
  expect(barBox.height).toBeGreaterThan(220);
  expect(Math.abs(barBox.left - canvasBox.left)).toBeLessThan(8);
  const titleFace = title!.querySelector("[data-solo-title-face]") as HTMLElement;
  const faceBox = titleFace.getBoundingClientRect();
  expect(faceBox.top).toBeGreaterThanOrEqual(barBox.top - 1);
  expect(faceBox.bottom).toBeLessThanOrEqual(barBox.bottom + 1);
  const barSlot = screen.container.querySelector("[data-solo-title-bar]") as HTMLElement;
  const operatorSlot = screen.container.querySelector("[data-operator-slot]") as HTMLElement;
  expect(Number(getComputedStyle(operatorSlot).zIndex)).toBeGreaterThan(Number(getComputedStyle(barSlot).zIndex));
  expect(Math.abs(rule!.getBoundingClientRect().height)).toBeLessThan(10);
  const ruleBox = rule!.getBoundingClientRect();
  const ruleRedBox = ruleRed!.getBoundingClientRect();
  expect(ruleBox.width).toBeGreaterThan(ruleBox.height * 40);
  expect(ruleBox.top).toBeGreaterThan(titleBox.bottom - 2);
  expect(ruleRedBox.top).toBeGreaterThan(ruleBox.bottom - 1);
  const mid = (box: DOMRect) => (box.left + box.right) / 2;
  const axis = mid(titleBox);
  expect(mid(stageBox)).toBeLessThan(axis);
  expect(Math.abs(mid(stageBox) - axis)).toBeLessThan(40);
  expect(Math.abs(mid(ruleBox) - axis)).toBeLessThan(16);
  expect(Math.abs(mid(ruleRedBox) - axis)).toBeLessThan(16);
  expect(Math.abs(mid(sloganBox) - axis)).toBeLessThan(16);
  expect(stage?.className).toContain("font-cn");

  const scene = screen.container.querySelector("[data-cover-bg]") as HTMLElement | null;
  const veil = screen.container.querySelector("[data-cover-bg-veil]") as HTMLElement | null;
  const wash = screen.container.querySelector('[data-cover-el="wash"]');
  expect(scene).not.toBeNull();
  expect(wash).not.toBeNull();
  expect(veil?.style.background).toContain("0.58");
});

test("红雾透明度跟 elementStyles", async () => {
  const screen = await render(
    <div style={{ width: 1920, height: 1080 }}>
      <Solo
        title="酒神单人"
        subtitle="QM-EX-8"
        signature="ONE OPERATOR ONLY"
        mark=""
        episode={1}
        date="2026-09-04"
        operatorName=""
        imageUrl={stubArt}
        imageScale={203}
        imageX={115}
        imageY={121}
        previewScale={1}
        onImageDrag={() => undefined}
        showPlaceholder={false}
        bgPreset="21_G5_victoria_street_n_ruins"
        elementStyles={{ wash: { opacity: 40 } }}
      />
    </div>,
  );

  const wash = screen.container.querySelector('[data-cover-el="wash"]') as HTMLElement;
  expect(wash).not.toBeNull();
  expect(Number(getComputedStyle(wash).opacity)).toBeCloseTo(0.4, 2);
});

test("墨底没有场景图，红罩更重", async () => {
  const screen = await render(
    <div style={{ width: 1920, height: 1080 }}>
      <Solo
        title="酒神单人"
        subtitle="QM-EX-8"
        signature="ONE OPERATOR ONLY"
        mark=""
        episode={1}
        date="2026-09-04"
        operatorName=""
        imageUrl={stubArt}
        imageScale={203}
        imageX={115}
        imageY={121}
        previewScale={1}
        onImageDrag={() => undefined}
        showPlaceholder={false}
        bgPreset="ink"
      />
    </div>,
  );

  expect(screen.container.querySelector('[data-cover-el="stage"]')?.textContent).toContain("QM-EX-8");
  expect(screen.container.querySelector("[data-cover-bg]")).toBeNull();
  const veil = screen.container.querySelector("[data-cover-bg-veil]") as HTMLElement | null;
  expect(veil?.style.background).toContain("0.78");
});

test("空稿带上酒神默认立绘和关卡码", () => {
  const draft = emptyDraft("solo");
  expect(draft.title).toBe("酒神单人");
  expect(draft.subtitle).toBe("QM-EX-8");
  expect(draft.signature).toBe("ONE OPERATOR ONLY");
  expect(draft.operatorId).toBe("char_1042_phatm2");
  expect(draft.artId).toBe("char_1042_phatm2_1");
  expect(draft.operatorName).toBe("酒神");
  expect(draft.imageScale).toBe(203);
  expect(draft.imageX).toBe(24);
  expect(draft.imageY).toBe(121);
  expect(draft.bgPreset).toBe("38_g17_1");
  expect(draft.textBgPreset).toBe("21_G5_victoria_street_n_ruins");
  expect(draft.layers.find((layer) => layer.id === "wash")?.opacity).toBe(74);
  expect(draft.layers.find((layer) => layer.id === "operator" && layer.kind === "image")?.imageX).toBe(24);
  expect(draft.effects.bgGrade.brightness).toBe(100);
  expect(draft.layers.some((layer) => layer.id === "slash-a")).toBe(false);
  expect(draft.layers.some((layer) => layer.id === "slash-b")).toBe(false);
  expect(draft.layers.some((layer) => layer.id === "slash-c")).toBe(false);
  expect(draft.layers.some((layer) => layer.id === "wash")).toBe(true);
  expect(draft.layers.some((layer) => layer.id === "light")).toBe(true);
  expect(draft.layers.some((layer) => layer.id === "ak-mark")).toBe(true);
  expect(draft.layers.some((layer) => layer.id === "vortex")).toBe(false);
  expect(draft.layers.some((layer) => layer.id === "embers")).toBe(false);
  expect(draft.layers.some((layer) => layer.id === "title-bar")).toBe(true);
  expect(draft.layers.some((layer) => layer.id === "rule-red")).toBe(true);
  expect(draft.layers.some((layer) => layer.id === "slogan")).toBe(true);
  const layerIds = draft.layers.map((layer) => layer.id);
  expect(layerIds.indexOf("light")).toBeLessThan(layerIds.indexOf("operator"));
  expect(layerIds.indexOf("title-bar")).toBeLessThan(layerIds.indexOf("operator"));
});

test("标题黑条贯穿画布，不缩成标题方框", async () => {
  const screen = await render(
    <div style={{ width: 1920, height: 1080 }}>
      <Solo
        title="酒神单人"
        subtitle="QM-EX-8"
        signature="ONE OPERATOR ONLY"
        mark=""
        episode={1}
        date="2026-09-04"
        operatorName=""
        imageUrl={stubArt}
        imageScale={203}
        imageX={115}
        imageY={121}
        previewScale={1}
        onImageDrag={() => undefined}
        showPlaceholder={false}
        bgPreset="ink"
        elementStyles={{ "title-bar": { w: 640 } }}
      />
    </div>,
  );

  expect(screen.container.querySelector('[data-cover-el="title"]')?.textContent).toContain("酒神单人");
  const canvas = screen.container.querySelector("[data-solo-canvas]") as HTMLElement;
  const bar = screen.container.querySelector('[data-cover-el="title-bar"]') as HTMLElement;
  const title = screen.container.querySelector('[data-cover-el="title"]') as HTMLElement;
  expect(bar.offsetWidth).toBeGreaterThan(canvas.offsetWidth * 0.95);
  expect(bar.offsetWidth).toBeGreaterThan(title.offsetWidth * 1.6);
});

function DecorLayerFixture() {
  const stageRef = useRef<HTMLDivElement>(null);
  return (
    <>
      <EffectsPanel />
      <InspectorPanel />
      <div style={{ width: 960, height: 540 }}>
        <CoverStage stageRef={stageRef} />
      </div>
    </>
  );
}

test("红雾可以关掉，背景不再罩红", async () => {
  const screen = await render(
    <CoverProvider templateId="solo">
      <WashToggleFixture />
    </CoverProvider>,
  );

  await expect.element(screen.getByRole("checkbox", { name: "红雾" })).toBeChecked();
  await expect.element(screen.getByRole("slider", { name: /透明度/ })).toBeVisible();
  expect(screen.container.querySelector("[data-cover-bg-veil]")).not.toBeNull();
  expect(screen.container.querySelector('[data-cover-el="wash"]')).not.toBeNull();

  await screen.getByRole("slider", { name: /透明度/ }).fill("35");
  const faded = screen.container.querySelector('[data-cover-el="wash"]') as HTMLElement;
  expect(Number(getComputedStyle(faded).opacity)).toBeCloseTo(0.35, 2);

  await screen.getByRole("checkbox", { name: "红雾" }).click();
  expect(screen.container.querySelector("[data-cover-bg-veil]")).toBeNull();
  expect(screen.container.querySelector('[data-cover-el="wash"]')).toBeNull();

  await screen.getByRole("checkbox", { name: "红雾" }).click();
  expect(screen.container.querySelector("[data-cover-bg-veil]")).not.toBeNull();
});

function WashToggleFixture() {
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

test("光效在立绘后面，垂直可调", async () => {
  const screen = await render(
    <CoverProvider templateId="solo">
      <DecorLayerFixture />
    </CoverProvider>,
  );

  await expect.element(screen.getByRole("button", { name: /光效/ })).toBeVisible();
  await expect.element(screen.getByRole("button", { name: /方舟标/ })).toBeVisible();
  await expect.element(screen.getByRole("button", { name: /立绘/ })).toBeVisible();
  await expect.element(screen.getByRole("button", { name: /标题黑条/ })).toBeVisible();
  expect(screen.getByRole("button", { name: /涡旋/ }).query()).toBeNull();
  const barSlot = screen.container.querySelector("[data-solo-title-bar]") as HTMLElement;
  const operatorSlot = screen.container.querySelector("[data-operator-slot]") as HTMLElement;
  const lightSlot = screen.container.querySelector("[data-solo-light]") as HTMLElement;
  const light = screen.container.querySelector('[data-cover-el="light"]') as HTMLElement;
  expect(Number(getComputedStyle(operatorSlot).zIndex)).toBeGreaterThan(Number(getComputedStyle(barSlot).zIndex));
  expect(Number(getComputedStyle(operatorSlot).zIndex)).toBeGreaterThan(Number(getComputedStyle(lightSlot).zIndex));
  expect(screen.container.querySelector("[data-effects-overlay] [data-light-bloom]")).toBeNull();
  expect(light.querySelector("[data-light-bloom]")).not.toBeNull();
  expect(screen.container.querySelector("[data-ak-mark]")?.textContent).toContain("明日方舟");

  await screen.getByRole("button", { name: /特效/ }).click();
  await expect.element(screen.getByRole("button", { name: "立绘下" })).toBeVisible();
  await screen.getByRole("button", { name: "立绘上" }).click();
  expect(Number(getComputedStyle(lightSlot).zIndex)).toBeGreaterThan(Number(getComputedStyle(operatorSlot).zIndex));

  await screen.getByRole("button", { name: /光效/ }).click();
  await expect.element(screen.getByRole("slider", { name: /垂直/ })).toBeVisible();
  await screen.getByRole("slider", { name: /垂直/ }).fill("80");
  expect(getComputedStyle(light).transform).toMatch(/80/);
});
