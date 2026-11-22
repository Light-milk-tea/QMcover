import { beforeEach, expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { boxLayer } from "../lib/document";
import { emptyDraft, saveDraft } from "../lib/storage";
import { CoverProvider, useCover } from "../store/CoverContext";
import { CoverStage } from "./CoverStage";
import { LayerStackList } from "./LayerStackList";
import { useRef } from "react";
import "../index.css";

function WorkbenchFixture() {
  const stageRef = useRef<HTMLDivElement>(null);
  const { draft } = useCover();
  const bottom = draft.layers.find((layer) => layer.id === "bottom");
  const locked = draft.layers.find((layer) => layer.id === "locked");
  const side = draft.layers.find((layer) => layer.id === "side");

  return (
    <>
      <div style={{ width: 960, height: 540 }}>
        <CoverStage stageRef={stageRef} />
      </div>
      <LayerStackList />
      <output data-testid="bottom-position">{bottom ? `${bottom.x},${bottom.y}` : ""}</output>
      <output data-testid="bottom-size">{bottom ? `${bottom.w},${bottom.h}` : ""}</output>
      <output data-testid="locked-position">{locked ? `${locked.x},${locked.y}` : ""}</output>
      <output data-testid="side-position">{side ? `${side.x},${side.y}` : ""}</output>
    </>
  );
}

function stageLayer(id: string): HTMLElement {
  const element = document.querySelector<HTMLElement>(`[data-cover-el="${id}"]`);
  if (!element) throw new Error(`missing layer ${id}`);
  return element;
}

function NativeFixture() {
  const stageRef = useRef<HTMLDivElement>(null);
  const { draft } = useCover();
  const position = draft.elementStyles.stage;

  return (
    <>
      <div style={{ width: 960, height: 540 }}>
        <CoverStage stageRef={stageRef} />
      </div>
      <LayerStackList />
      <output data-testid="native-position">{`${position?.x ?? 0},${position?.y ?? 0}`}</output>
    </>
  );
}

function seedLayers() {
  const draft = emptyDraft("blank");
  saveDraft("blank", {
    ...draft,
    layers: [
      boxLayer({ id: "bottom", label: "底层", x: 200, y: 160, w: 520, h: 300, fill: "#c41c1c" }),
      boxLayer({ id: "top", label: "上层", x: 200, y: 160, w: 520, h: 300, fill: "#141618" }),
      boxLayer({ id: "locked", label: "锁定层", x: 820, y: 160, w: 320, h: 240, fill: "#1d4ed8", locked: true }),
      boxLayer({ id: "side", label: "侧边层", x: 1300, y: 600, w: 360, h: 240, fill: "#15803d" }),
    ],
  });
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

beforeEach(() => {
  localStorage.clear();
  seedLayers();
});

test("从图层栏选择底层元素后，置顶交互框不受上层遮挡并可拖动", async () => {
  const screen = await render(
    <CoverProvider templateId="blank">
      <WorkbenchFixture />
    </CoverProvider>,
  );

  await screen.getByRole("button", { name: "底层", exact: true }).click();
  const overlay = screen.getByTestId("selection-overlay");
  await expect.element(overlay).toBeVisible();
  await expect.element(overlay).toHaveAttribute("data-selection-overlay", "bottom");

  const element = overlay.element() as HTMLElement;
  const rect = element.getBoundingClientRect();
  expect(document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2)?.closest("[data-selection-overlay]")).toBe(element);

  drag(element, 40, 20);
  await expect.element(screen.getByTestId("bottom-position")).not.toHaveTextContent("200,160");
});

test("锁定图层显示置顶选框，但不能拖动或旋转", async () => {
  const screen = await render(
    <CoverProvider templateId="blank">
      <WorkbenchFixture />
    </CoverProvider>,
  );

  await screen.getByRole("button", { name: "锁定层", exact: true }).click();
  const overlay = screen.getByTestId("selection-overlay");
  await expect.element(overlay).toHaveAttribute("data-selection-overlay", "locked");
  expect(overlay.element().querySelector("[data-rotate-handle]")).toBeNull();

  drag(overlay.element() as HTMLElement, 60, 30);
  await expect.element(screen.getByTestId("locked-position")).toHaveTextContent("820,160");
});

test("选中图层后在画布别处拖动，移动的仍是选中图层", async () => {
  const screen = await render(
    <CoverProvider templateId="blank">
      <WorkbenchFixture />
    </CoverProvider>,
  );

  await screen.getByRole("button", { name: "底层", exact: true }).click();
  await expect.element(screen.getByTestId("selection-overlay")).toHaveAttribute("data-selection-overlay", "bottom");

  drag(stageLayer("side"), 40, 20);
  await expect.element(screen.getByTestId("bottom-position")).toHaveTextContent("280,200");
  await expect.element(screen.getByTestId("side-position")).toHaveTextContent("1300,600");
  await expect.element(screen.getByTestId("selection-overlay")).toHaveAttribute("data-selection-overlay", "bottom");
});

test("点「取消选择」后，按到哪个图层就拖哪个", async () => {
  const screen = await render(
    <CoverProvider templateId="blank">
      <WorkbenchFixture />
    </CoverProvider>,
  );

  await screen.getByRole("button", { name: "底层", exact: true }).click();
  await screen.getByRole("button", { name: /取消选择/ }).click();
  await expect.element(screen.getByTestId("selection-overlay")).not.toBeInTheDocument();
  await expect.element(screen.getByRole("button", { name: /取消选择/ })).not.toBeInTheDocument();

  drag(stageLayer("side"), 40, 20);
  await expect.element(screen.getByTestId("side-position")).toHaveTextContent("1380,640");
  await expect.element(screen.getByTestId("bottom-position")).toHaveTextContent("200,160");
  await expect.element(screen.getByTestId("selection-overlay")).toHaveAttribute("data-selection-overlay", "side");
});

test("选中图层后点画布空白处或画布外即取消选择，提示只写已选哪层", async () => {
  const screen = await render(
    <CoverProvider templateId="blank">
      <WorkbenchFixture />
    </CoverProvider>,
  );

  await screen.getByRole("button", { name: "底层", exact: true }).click();
  const chip = screen.getByRole("button", { name: /取消选择/ });
  await expect.element(chip).toBeVisible();
  expect(chip.element().querySelector("span:not(.sr-only)")?.textContent).toBe("已选 底层");

  const stage = (screen.getByTestId("selection-overlay").element() as HTMLElement).parentElement as HTMLElement;
  const rect = stage.getBoundingClientRect();
  const scale = rect.width / stage.offsetWidth;
  const blank = document.elementFromPoint(rect.left + 100 * scale, rect.top + 900 * scale) as HTMLElement;
  expect(stage.contains(blank)).toBe(true);
  expect(blank.closest("[data-cover-el]")).toBeNull();
  drag(blank, 40, 20);
  await expect.element(screen.getByTestId("selection-overlay")).not.toBeInTheDocument();
  await expect.element(screen.getByTestId("bottom-position")).toHaveTextContent("200,160");

  await screen.getByRole("button", { name: "底层", exact: true }).click();
  await expect.element(screen.getByTestId("selection-overlay")).toBeVisible();
  const shell = stage.parentElement!.parentElement!.parentElement as HTMLElement;
  expect(stage.contains(shell)).toBe(false);
  shell.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, pointerId: 1 }));
  await expect.element(screen.getByTestId("selection-overlay")).not.toBeInTheDocument();
});

test("图层栏再点一次已选中的行即取消选择", async () => {
  const screen = await render(
    <CoverProvider templateId="blank">
      <WorkbenchFixture />
    </CoverProvider>,
  );

  const row = screen.getByRole("button", { name: "底层", exact: true });
  await row.click();
  await expect.element(screen.getByTestId("selection-overlay")).toBeVisible();
  await row.click();
  await expect.element(screen.getByTestId("selection-overlay")).not.toBeInTheDocument();
});

test("锁定图层选中时不抢拖动，按到别的图层照常拖那一层", async () => {
  const screen = await render(
    <CoverProvider templateId="blank">
      <WorkbenchFixture />
    </CoverProvider>,
  );

  await screen.getByRole("button", { name: "锁定层", exact: true }).click();
  drag(stageLayer("side"), 40, 20);
  await expect.element(screen.getByTestId("side-position")).toHaveTextContent("1380,640");
  await expect.element(screen.getByTestId("locked-position")).toHaveTextContent("820,160");
});

test("选中框描边和手柄按屏幕尺寸绘制，缩小预览里也看得清，手柄仍可缩放", async () => {
  const screen = await render(
    <CoverProvider templateId="blank">
      <WorkbenchFixture />
    </CoverProvider>,
  );

  await screen.getByRole("button", { name: "底层", exact: true }).click();
  const overlay = screen.getByTestId("selection-overlay").element() as HTMLElement;
  await expect.element(screen.getByTestId("selection-overlay")).toBeVisible();

  const stage = overlay.parentElement as HTMLElement;
  const scale = stage.getBoundingClientRect().width / stage.offsetWidth;
  expect(scale).toBeLessThan(0.6);
  const outline = overlay.querySelector<HTMLElement>("[data-selection-outline]");
  expect(parseFloat(getComputedStyle(outline!).borderTopWidth) * scale).toBeGreaterThanOrEqual(1.9);

  const handle = overlay.querySelector<HTMLElement>('[data-resize-handle="se"]')!;
  expect(handle.getBoundingClientRect().width).toBeGreaterThanOrEqual(9.5);
  const knob = overlay.querySelector<HTMLElement>("[data-rotate-handle]")!;
  expect(knob.getBoundingClientRect().width).toBeGreaterThanOrEqual(11.5);

  drag(handle, 30, 15);
  await expect.element(screen.getByTestId("bottom-size")).toHaveTextContent("580,330");
  await expect.element(screen.getByTestId("bottom-position")).toHaveTextContent("200,160");
});

test("内置模板元素也能通过置顶交互框移动", async () => {
  const screen = await render(
    <CoverProvider templateId="firstkill">
      <NativeFixture />
    </CoverProvider>,
  );

  await screen.getByRole("button", { name: /地图名/ }).click();
  const overlay = screen.getByTestId("selection-overlay");
  await expect.element(overlay).toHaveAttribute("data-selection-overlay", "stage");

  drag(overlay.element() as HTMLElement, 30, 15);
  await expect.element(screen.getByTestId("native-position")).not.toHaveTextContent("0,0");
});
