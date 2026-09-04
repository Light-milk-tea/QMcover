import { useRef } from "react";
import { beforeEach, expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { CoverStage } from "../components/CoverStage";
import { InspectorPanel } from "../components/InspectorPanel";
import { STAGE_BAR_WIDTH_DEFAULT } from "../constants";
import { emptyDraft } from "../lib/storage";
import { CoverProvider, useCover } from "../store/CoverContext";
import { FourstarNocore } from "./FourstarNocore";

beforeEach(() => {
  localStorage.clear();
});

test("四星无核模板显示主标题、关卡条和可编辑图层", async () => {
  const screen = await render(
    <div style={{ width: 1920, height: 1080 }}>
      <FourstarNocore
        title="四星无核"
        subtitle="QM-8"
        signature="NO CORE"
        mark=""
        episode={1}
        date="2026-09-04"
        operatorName=""
        imageUrl="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='48'%3E%3Crect width='32' height='48' fill='%233d8f8c'/%3E%3C/svg%3E"
        imageScale={231}
        imageX={28}
        imageY={121}
        previewScale={1}
        onImageDrag={() => undefined}
        showPlaceholder={false}
        bgPreset="39_g6_villagestreet"
      />
    </div>,
  );

  await expect.element(screen.getByText("QM-8", { exact: true })).toBeVisible();
  await expect.element(screen.getByText("NO CORE", { exact: true })).toBeVisible();

  const title = screen.container.querySelector('[data-cover-el="title"]');
  const operator = screen.container.querySelector('[data-cover-el="operator"]');
  const stageBar = screen.container.querySelector('[data-cover-el="stage-bar"]');
  const frame = screen.container.querySelector('[data-cover-el="frame"]');
  const paper = screen.container.querySelector('[data-cover-el="paper"]');
  const glow = screen.container.querySelector('[data-cover-el="glow"]');
  const fade = screen.container.querySelector('[data-cover-el="fade"]');
  expect(title?.textContent).toContain("四星无核");
  expect(operator).not.toBeNull();
  expect(stageBar).not.toBeNull();
  expect(frame).not.toBeNull();
  expect(paper).not.toBeNull();
  expect(glow).not.toBeNull();
  expect(fade).not.toBeNull();

  const titleBox = title!.getBoundingClientRect();
  const barBox = stageBar!.getBoundingClientRect();
  expect(barBox.top).toBeGreaterThan(titleBox.top);
  expect(barBox.top).toBeLessThan(titleBox.bottom + 180);
  expect(titleBox.top).toBeGreaterThan(370);
  const stageEl = screen.container.querySelector('[data-cover-el="stage"]');
  expect(stageEl?.querySelector(":scope > span")?.className).toContain("justify-center");
  expect(stageEl?.querySelector("i")).toBeNull();
  expect((stageBar as HTMLElement).offsetWidth).toBe(STAGE_BAR_WIDTH_DEFAULT);
  const scene = screen.container.querySelector("[data-cover-bg]") as HTMLElement | null;
  const veil = screen.container.querySelector("[data-cover-bg-veil]") as HTMLElement | null;
  expect(scene).not.toBeNull();
  expect(getComputedStyle(scene!).opacity).toBe("1");
  expect(veil?.style.background).toContain("0.22");
});

test("墨底没有场景图，黑罩更重", async () => {
  const screen = await render(
    <div style={{ width: 1920, height: 1080 }}>
      <FourstarNocore
        title="四星无核"
        subtitle="QM-8"
        signature="NO CORE"
        mark=""
        episode={1}
        date="2026-09-04"
        operatorName=""
        imageUrl="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='48'%3E%3Crect width='32' height='48' fill='%233d8f8c'/%3E%3C/svg%3E"
        imageScale={231}
        imageX={28}
        imageY={121}
        previewScale={1}
        onImageDrag={() => undefined}
        showPlaceholder={false}
        bgPreset="ink"
      />
    </div>,
  );

  await expect.element(screen.getByText("QM-8", { exact: true })).toBeVisible();
  expect(screen.container.querySelector("[data-cover-bg]")).toBeNull();
  const veil = screen.container.querySelector("[data-cover-bg-veil]") as HTMLElement | null;
  expect(veil?.style.background).toContain("0.7");
});

test("关卡条宽度跟随 elementStyles", async () => {
  const screen = await render(
    <div style={{ width: 1920, height: 1080 }}>
      <FourstarNocore
        title="四星无核"
        subtitle="QM-8"
        signature="NO CORE"
        mark=""
        episode={1}
        date="2026-09-04"
        operatorName=""
        imageUrl="data:image/svg+xml,%3Csvg xmlns='http://w3.org/2000/svg' width='32' height='48'%3E%3Crect width='32' height='48' fill='%233d8f8c'/%3E%3C/svg%3E"
        imageScale={248}
        imageX={-40}
        imageY={10}
        previewScale={1}
        onImageDrag={() => undefined}
        showPlaceholder={false}
        bgPreset="ink"
        elementStyles={{ "stage-bar": { w: 480 } }}
      />
    </div>,
  );

  await expect.element(screen.getByText("QM-8", { exact: true })).toBeVisible();
  const stageBar = screen.container.querySelector('[data-cover-el="stage-bar"]') as HTMLElement;
  expect(stageBar.offsetWidth).toBe(480);
});

function StageBarWidthFixture() {
  const { draft } = useCover();
  return (
    <>
      <InspectorPanel />
      <output data-testid="bar-width">{String(draft.elementStyles["stage-bar"]?.w ?? STAGE_BAR_WIDTH_DEFAULT)}</output>
    </>
  );
}

test("选中关卡条后可用宽度滑杆改长度", async () => {
  const screen = await render(
    <CoverProvider templateId="fourstar-nocore">
      <StageBarWidthFixture />
    </CoverProvider>,
  );

  await screen.getByRole("button", { name: /关卡条/ }).click();
  const slider = screen.getByLabelText(/宽度/);
  await expect.element(slider).toBeVisible();
  await slider.fill("520");
  await expect.element(screen.getByTestId("bar-width")).toHaveTextContent("520");
});

test("空稿带上跃跃的默认立绘和关卡码", () => {
  const draft = emptyDraft("fourstar-nocore");
  expect(draft.title).toBe("四星无核");
  expect(draft.subtitle).toBe("QM-8");
  expect(draft.signature).toBe("NO CORE");
  expect(draft.operatorId).toBe("char_4100_caper");
  expect(draft.artId).toBe("char_4100_caper_1");
  expect(draft.operatorName).toBe("跃跃");
  expect(draft.imageScale).toBe(231);
  expect(draft.imageX).toBe(28);
  expect(draft.imageY).toBe(121);
  expect(draft.bgPreset).toBe("39_g6_villagestreet");
  expect(draft.layers.some((layer) => layer.id === "stage-bar")).toBe(true);
  expect(draft.layers.some((layer) => layer.id === "puppets")).toBe(true);
  expect(draft.layers.some((layer) => layer.id === "paper")).toBe(true);
  expect(draft.layers.some((layer) => layer.id === "glow")).toBe(true);
  expect(draft.layers.some((layer) => layer.id === "fade")).toBe(true);
});

function DecorLayerFixture() {
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

test("撕纸、顶光晕、底压暗在图层里，删掉后画布不再出现", async () => {
  const screen = await render(
    <CoverProvider templateId="fourstar-nocore">
      <DecorLayerFixture />
    </CoverProvider>,
  );

  await expect.element(screen.getByRole("button", { name: /撕纸/ })).toBeVisible();
  await expect.element(screen.getByRole("button", { name: /顶光晕/ })).toBeVisible();
  await expect.element(screen.getByRole("button", { name: /底压暗/ })).toBeVisible();

  await screen.getByRole("button", { name: /撕纸/ }).click();
  await screen.getByTitle("删除").click();
  expect(screen.container.querySelector('[data-cover-el="paper"]')).toBeNull();

  await screen.getByRole("button", { name: /顶光晕/ }).click();
  await screen.getByTitle("删除").click();
  expect(screen.container.querySelector('[data-cover-el="glow"]')).toBeNull();

  await screen.getByRole("button", { name: /底压暗/ }).click();
  await screen.getByTitle("删除").click();
  expect(screen.container.querySelector('[data-cover-el="fade"]')).toBeNull();
});

test("图层里立绘在金框之上时，立绘槽 z-index 也高于金框", async () => {
  const screen = await render(
    <CoverProvider templateId="fourstar-nocore">
      <DecorLayerFixture />
    </CoverProvider>,
  );

  await expect.element(screen.getByRole("button", { name: /立绘/ })).toBeVisible();
  const frame = screen.container.querySelector('[data-cover-el="frame"]');
  const slot = screen.container.querySelector("[data-operator-slot]");
  expect(frame).not.toBeNull();
  expect(slot).not.toBeNull();
  const frameZ = Number(getComputedStyle(frame as HTMLElement).zIndex);
  const slotZ = Number(getComputedStyle(slot as HTMLElement).zIndex);
  expect(slotZ).toBeGreaterThan(frameZ);
});
