import { beforeEach, expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { boxLayer } from "../lib/document";
import { emptyDraft, saveDraft } from "../lib/storage";
import { CoverProvider, useCover } from "../store/CoverContext";
import { CoverStage } from "./CoverStage";
import { LayerStackList } from "./LayerStackList";
import { useRef } from "react";

function WorkbenchFixture() {
  const stageRef = useRef<HTMLDivElement>(null);
  const { draft } = useCover();
  const bottom = draft.layers.find((layer) => layer.id === "bottom");
  const locked = draft.layers.find((layer) => layer.id === "locked");

  return (
    <>
      <div style={{ width: 960, height: 540 }}>
        <CoverStage stageRef={stageRef} />
      </div>
      <LayerStackList />
      <output data-testid="bottom-position">{bottom ? `${bottom.x},${bottom.y}` : ""}</output>
      <output data-testid="locked-position">{locked ? `${locked.x},${locked.y}` : ""}</output>
    </>
  );
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
