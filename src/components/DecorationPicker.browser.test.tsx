import { useRef } from "react";
import { beforeEach, expect, test } from "vitest";
import { render } from "vitest-browser-react";
import "../index.css";
import { BG_PRESETS } from "../data/backgrounds";
import { boxLayer } from "../lib/document";
import { emptyDraft, loadDraft, saveDraft } from "../lib/storage";
import { CoverProvider, useCover } from "../store/CoverContext";
import { CoverStage } from "./CoverStage";
import { InspectorPanel } from "./InspectorPanel";

function DecorationFixture() {
  const stageRef = useRef<HTMLDivElement>(null);
  const { selectedId, selectedLayer } = useCover();
  const chrome = selectedLayer?.kind === "box" ? selectedLayer.chrome : "";

  return (
    <>
      <div style={{ display: "flex", width: 1200, height: 700, gap: 16 }}>
        <InspectorPanel />
        <div style={{ width: 900, height: 600 }}>
          <CoverStage stageRef={stageRef} />
        </div>
      </div>
      <output data-testid="selected-decoration">
        {selectedLayer ? `${selectedId}|${selectedLayer.label}|${chrome}|${selectedLayer.x},${selectedLayer.y}` : ""}
      </output>
      <output data-testid="selected-frame">
        {selectedLayer?.kind === "image" ? `${selectedLayer.frame ?? ""}|${selectedLayer.frameBgPreset ?? ""}` : ""}
      </output>
    </>
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

beforeEach(() => {
  localStorage.clear();
});

test("添加菜单用装饰图库替代单一色块", async () => {
  const screen = await render(
    <CoverProvider templateId="blank">
      <DecorationFixture />
    </CoverProvider>,
  );

  await screen.getByText("添加", { exact: true }).click();
  await expect.element(screen.getByRole("button", { name: "装饰", exact: true })).toBeVisible();
  expect(screen.getByText("色块", { exact: true }).query()).toBeNull();

  await screen.getByRole("button", { name: "装饰", exact: true }).click();
  await expect.element(screen.getByText("添加装饰", { exact: true })).toBeVisible();
  await expect.element(screen.getByText("方舟饰件", { exact: true })).toBeVisible();
  await expect.element(screen.getByRole("button", { name: "方舟标", exact: true })).toBeVisible();
  for (const name of ["先锋", "近卫", "重装", "狙击", "术师", "医疗", "辅助", "特种"]) {
    await expect.element(screen.getByRole("button", { name, exact: true })).toBeVisible();
  }
  await expect.element(screen.getByRole("button", { name: "四角星", exact: true })).toBeVisible();
  await expect.element(screen.getByRole("button", { name: "雷达弧", exact: true })).toBeVisible();
  await expect.element(screen.getByRole("button", { name: "源石棱", exact: true })).toBeVisible();
  await expect.element(screen.getByRole("button", { name: "准星", exact: true })).toBeVisible();
  await expect.element(screen.getByRole("button", { name: "合约三角", exact: true })).toBeVisible();
  await expect.element(screen.getByRole("button", { name: "拍立得", exact: true })).toBeVisible();
  await expect.element(screen.getByRole("button", { name: "红白角片", exact: true })).toBeInTheDocument();
  await expect.element(screen.getByRole("button", { name: "古典角花", exact: true })).toBeInTheDocument();
  await expect.element(screen.getByRole("button", { name: "分隔线", exact: true })).toBeInTheDocument();
  await expect.element(screen.getByRole("button", { name: "横向纸带", exact: true })).toBeInTheDocument();

  const picker = screen.getByTestId("decoration-picker").element();
  const aside = picker.closest("aside");
  expect(aside).not.toBeNull();
  const pickerRect = picker.getBoundingClientRect();
  const asideRect = aside!.getBoundingClientRect();
  expect(pickerRect.left).toBeGreaterThanOrEqual(asideRect.left);
  expect(pickerRect.right).toBeLessThanOrEqual(asideRect.right);
});

test("选择模板装饰后加入画布、自动选中并可拖动", async () => {
  const screen = await render(
    <CoverProvider templateId="blank">
      <DecorationFixture />
    </CoverProvider>,
  );

  await screen.getByText("添加", { exact: true }).click();
  await screen.getByRole("button", { name: "装饰", exact: true }).click();
  await screen.getByRole("button", { name: "地形三角", exact: true }).click();

  const status = screen.getByTestId("selected-decoration");
  await expect.element(status).toHaveTextContent("|地形三角|ef-triangle|520,250");
  const overlay = screen.getByTestId("selection-overlay");
  await expect.element(overlay).toBeVisible();
  const selectedId = status.element().textContent?.split("|")[0];
  const frame = document.querySelector<HTMLElement>(`[data-cover-el="${selectedId}"]`);
  expect(frame).not.toBeNull();
  expect(getComputedStyle(frame!).color).toBe("rgb(253, 254, 62)");

  drag(overlay.element() as HTMLElement, 30, 15);
  await expect.element(status).not.toHaveTextContent("|520,250");
});

test("职业角标可以加入画布并改色", async () => {
  const screen = await render(
    <CoverProvider templateId="blank">
      <DecorationFixture />
    </CoverProvider>,
  );

  await screen.getByText("添加", { exact: true }).click();
  await screen.getByRole("button", { name: "装饰", exact: true }).click();
  await screen.getByRole("button", { name: "特种", exact: true }).click();

  const status = screen.getByTestId("selected-decoration");
  await expect.element(status).toHaveTextContent("|特种|class-specialist|80,64");
  const selectedId = status.element().textContent?.split("|")[0];
  const frame = document.querySelector<HTMLElement>(`[data-cover-el="${selectedId}"]`);
  const icon = frame?.querySelector("[data-class-icon='class-specialist']") as HTMLElement | null;
  expect(icon).not.toBeNull();
  expect(getComputedStyle(icon!).maskImage).toContain("prts.wiki");
  expect(getComputedStyle(frame!).color).toBe("rgb(255, 255, 255)");

  const layers = loadDraft("blank").layers;
  const plate = layers.find((layer) => layer.label === "特种底");
  const mark = layers.find((layer) => layer.label === "特种");
  expect(plate?.kind).toBe("box");
  expect(plate && plate.kind === "box" ? plate.fill : "").toBe("#000000");
  expect(mark?.color).toBe("#ffffff");
  expect(layers.findIndex((layer) => layer.id === plate?.id)).toBeLessThan(layers.findIndex((layer) => layer.id === mark?.id));
});

test("明日方舟四角星可以加入画布", async () => {
  const screen = await render(
    <CoverProvider templateId="blank">
      <DecorationFixture />
    </CoverProvider>,
  );

  await screen.getByText("添加", { exact: true }).click();
  await screen.getByRole("button", { name: "装饰", exact: true }).click();
  await screen.getByRole("button", { name: "四角星", exact: true }).click();

  const status = screen.getByTestId("selected-decoration");
  await expect.element(status).toHaveTextContent("|四角星|ak-star|80,64");
  const selectedId = status.element().textContent?.split("|")[0];
  const frame = document.querySelector<HTMLElement>(`[data-cover-el="${selectedId}"]`);
  expect(frame?.querySelector("path")).not.toBeNull();
  expect(getComputedStyle(frame!).color).toBe("rgb(216, 232, 196)");
});

test("职业队模板的工业碎片可以作为独立装饰加入", async () => {
  const screen = await render(
    <CoverProvider templateId="blank">
      <DecorationFixture />
    </CoverProvider>,
  );

  await screen.getByText("添加", { exact: true }).click();
  await screen.getByRole("button", { name: "装饰", exact: true }).click();
  await screen.getByRole("button", { name: "红白角片", exact: true }).click();

  const status = screen.getByTestId("selected-decoration");
  await expect.element(status).toHaveTextContent("|红白角片|corner-shards|1480,520");
  const selectedId = status.element().textContent?.split("|")[0];
  const frame = document.querySelector<HTMLElement>(`[data-cover-el="${selectedId}"]`);
  expect(frame?.querySelectorAll("polygon")).toHaveLength(6);
});

test("拍立得包含可独立调整的背景槽和立绘槽", async () => {
  const screen = await render(
    <CoverProvider templateId="blank">
      <DecorationFixture />
    </CoverProvider>,
  );

  await screen.getByText("添加", { exact: true }).click();
  await screen.getByRole("button", { name: "装饰", exact: true }).click();
  await screen.getByRole("button", { name: "拍立得", exact: true }).click();

  await expect.element(screen.getByTestId("selected-decoration")).toHaveTextContent("|拍立得||640,130");
  await expect.element(screen.getByTestId("selected-frame")).toHaveTextContent("polaroid|ink");
  await expect.element(screen.getByText("拍立得内容", { exact: true })).toBeVisible();
  await expect.element(screen.getByText("画框背景", { exact: true })).toBeVisible();
  expect(document.querySelector("[data-polaroid-background]")).not.toBeNull();
  expect(document.querySelector("[data-polaroid-art]")).not.toBeNull();

  const background = BG_PRESETS.find((item) => item.url);
  expect(background).toBeDefined();
  await screen.getByRole("button", { name: "图库 · 墨底", exact: true }).click();
  await screen.getByRole("button", { name: background!.name, exact: true }).click();
  await expect.element(screen.getByTestId("selected-frame")).toHaveTextContent(`polaroid|${background!.id}`);
});

test("旧版纯纸板拍立得会升级为可编辑画框", () => {
  const draft = emptyDraft("blank");
  saveDraft("blank", {
    ...draft,
    layers: [
      boxLayer({
        id: "el-old-polaroid",
        label: "拍立得",
        x: 640,
        y: 130,
        w: 640,
        h: 800,
        chrome: "paper",
        effect: "polaroid",
      }),
    ],
  });

  const layer = loadDraft("blank").layers[0];
  expect(layer.kind).toBe("image");
  expect(layer.kind === "image" ? layer.frame : undefined).toBe("polaroid");
});
