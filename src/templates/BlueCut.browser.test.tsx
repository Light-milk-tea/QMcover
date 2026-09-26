import { toPng } from "html-to-image";
import { useRef } from "react";
import { beforeEach, expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { CoverStage, draftToRenderProps } from "../components/CoverStage";
import { EditorPanel } from "../components/EditorPanel";
import "../index.css";
import { emptyDraft, loadState, saveState } from "../lib/storage";
import { CoverProvider, useCover } from "../store/CoverContext";
import { CoverView } from "./registry";
import { BlueCut } from "./BlueCut";

beforeEach(() => {
  localStorage.clear();
});

function relativeLuma(color: string) {
  const [red = 0, green = 0, blue = 0] = color.match(/\d+/g)?.map(Number) ?? [];
  const linear = (channel: number) => {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * linear(red) + 0.7152 * linear(green) + 0.0722 * linear(blue);
}

const stubArt =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='64'%3E%3Crect width='40' height='64' fill='%232a3a55'/%3E%3C/svg%3E";

function renderCover(patch: Partial<Parameters<typeof BlueCut>[0]> = {}) {
  return render(
    <div style={{ width: 1920, height: 1080 }}>
      <BlueCut
        title="三特种"
        subtitle="H16-4"
        signature="Specialist"
        mark=""
        episode={1}
        date="2026-09-26"
        operatorName=""
        imageUrl={stubArt}
        imageScale={175}
        imageX={0}
        imageY={40}
        previewScale={1}
        onImageDrag={() => undefined}
        showPlaceholder={false}
        {...patch}
      />
    </div>,
  );
}

test("斜切关卡显示阵容、英文标、关卡码和斜切", async () => {
  const screen = await renderCover();
  const canvas = screen.container.querySelector("[data-blue-cut-canvas]") as HTMLElement;
  const squad = screen.container.querySelector('[data-cover-el="squad"]') as HTMLElement;
  const stage = screen.container.querySelector('[data-cover-el="stage"]') as HTMLElement;
  const en = screen.container.querySelector('[data-cover-el="en"]') as HTMLElement;
  const slash = screen.container.querySelector("[data-slash]");
  const wedge = screen.container.querySelector("[data-wedge]");
  const operator = screen.container.querySelector("[data-operator-slot]") as HTMLElement;
  const canvasBox = canvas.getBoundingClientRect();
  const squadBox = squad.getBoundingClientRect();
  const stageBox = stage.getBoundingClientRect();
  const enBox = en.getBoundingClientRect();
  const operatorBox = operator.getBoundingClientRect();

  expect(squad.textContent).toContain("三特种");
  expect(stage.textContent).toContain("H16-4");
  expect(stage.querySelector("[data-stage-mark]")).toBeNull();
  const grain = stage.querySelector("[data-stage-grain]") as HTMLElement;
  expect(grain).not.toBeNull();
  expect(grain.getAttribute("data-grain-tint")).toBe("#f50039");
  await expect.poll(() => grain.getAttribute("data-grain-ready")).toBe("true");
  expect(getComputedStyle(grain).backgroundClip.split(", ").every((clip) => clip === "text")).toBe(true);
  expect(squad.querySelector("[data-stage-grain]")).toBeNull();
  expect(en.textContent).toContain("Specialist");
  expect(relativeLuma(getComputedStyle(en).color)).toBeGreaterThan(relativeLuma(getComputedStyle(squad).color));
  expect(relativeLuma(getComputedStyle(en).color)).toBeGreaterThan(relativeLuma(getComputedStyle(canvas.querySelector('[data-cover-el="slash"]') as HTMLElement).color));
  expect(slash?.querySelectorAll("polygon").length).toBeGreaterThan(0);
  expect(wedge?.querySelector("polygon")).not.toBeNull();
  expect(operator.querySelector("img")).not.toBeNull();

  expect(squadBox.left).toBeGreaterThan(canvasBox.left + canvasBox.width * 0.4);
  expect(stageBox.top).toBeGreaterThan(squadBox.top + squadBox.height * 0.45);
  expect(enBox.top).toBeGreaterThan(squadBox.top);
  expect(enBox.top).toBeLessThan(stageBox.bottom);
  expect(operatorBox.left).toBeLessThan(canvasBox.left + canvasBox.width * 0.2);
  expect(stageBox.right).toBeLessThanOrEqual(canvasBox.right + 1);
  expect(squadBox.right).toBeLessThanOrEqual(canvasBox.right + 1);

  const operatorZ = Number(getComputedStyle(operator).zIndex);
  const wedgeZ = Number(getComputedStyle(screen.container.querySelector('[data-cover-el="wedge"]') as HTMLElement).zIndex);
  const stageZ = Number(getComputedStyle(stage).zIndex);
  const enZ = Number(getComputedStyle(en).zIndex);
  expect(wedgeZ).toBeGreaterThan(operatorZ);
  expect(stageZ).toBeGreaterThan(wedgeZ);
  expect(enZ).toBeGreaterThan(stageZ);
  expect(canvas.getAttribute("data-colorway")).toBe("#f50039");
});

test("主题色会改斜切、英文标、立绘蓝边和关卡码纹理", async () => {
  const screen = await renderCover({ colorway: "#c41c1c" });
  const canvas = screen.container.querySelector("[data-blue-cut-canvas]") as HTMLElement;
  const slash = screen.container.querySelector('[data-cover-el="slash"]') as HTMLElement;
  const en = screen.container.querySelector('[data-cover-el="en"]') as HTMLElement;
  const operator = screen.container.querySelector("[data-operator-slot]") as HTMLElement;
  const grain = screen.container.querySelector("[data-stage-grain]") as HTMLElement;
  expect(canvas.getAttribute("data-colorway")).toBe("#c41c1c");
  expect(getComputedStyle(slash).color).toBe("rgb(196, 28, 28)");
  expect(getComputedStyle(en).color).not.toBe("rgb(47, 92, 255)");
  const squad = screen.container.querySelector('[data-cover-el="squad"]') as HTMLElement;
  expect(relativeLuma(getComputedStyle(en).color)).toBeGreaterThan(relativeLuma(getComputedStyle(squad).color));
  expect(relativeLuma(getComputedStyle(en).color)).toBeGreaterThan(relativeLuma(getComputedStyle(canvas.querySelector('[data-cover-el="slash"]') as HTMLElement).color));
  expect(getComputedStyle(operator).filter).toContain("196");
  expect(grain.getAttribute("data-grain-tint")).toBe("#c41c1c");
  await expect.poll(() => grain.getAttribute("data-grain-ready")).toBe("true");
});

test("导出的关卡码纹理跟着主题色", async () => {
  const screen = await renderCover({ colorway: "#c41c1c" });
  const node = screen.container.querySelector("[data-blue-cut-canvas]") as HTMLElement;
  const grain = node.querySelector("[data-stage-grain]") as HTMLElement;
  await document.fonts.ready;
  await expect.poll(() => grain.getAttribute("data-grain-ready")).toBe("true");
  const textureUrl = getComputedStyle(grain).backgroundImage.slice(5, -2);
  const texture = new Image();
  texture.src = textureUrl;
  await texture.decode();
  const probe = document.createElement("canvas");
  probe.width = texture.naturalWidth;
  probe.height = texture.naturalHeight;
  const probeCtx = probe.getContext("2d");
  if (!probeCtx) throw new Error("no canvas");
  probeCtx.drawImage(texture, 0, 0);
  const source = probeCtx.getImageData(0, 0, probe.width, probe.height).data;
  let rSum = 0;
  let gSum = 0;
  let bSum = 0;
  const count = source.length / 4;
  for (let i = 0; i < source.length; i += 4) {
    rSum += source[i] ?? 0;
    gSum += source[i + 1] ?? 0;
    bSum += source[i + 2] ?? 0;
  }
  expect(rSum / count).toBeGreaterThan(gSum / count + 25);
  expect(rSum / count).toBeGreaterThan(bSum / count + 40);

  const url = await toPng(node, { width: 1920, height: 1080, pixelRatio: 0.5, skipFonts: true });
  const image = new Image();
  image.src = url;
  await image.decode();
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no canvas");
  ctx.drawImage(image, 0, 0);
  const pixels = ctx.getImageData(520, 310, 180, 70).data;
  let red = 0;
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i] ?? 0;
    const g = pixels[i + 1] ?? 0;
    const b = pixels[i + 2] ?? 0;
    if (r > 120 && r > g + 25 && r > b + 25) red += 1;
  }
  expect(red).toBeGreaterThan(200);
});

test("更长的阵容和关卡码会缩小并留在画布内", async () => {
  await document.fonts.ready;
  const short = await renderCover();
  const shortSquad = short.container.querySelector('[data-cover-el="squad"]') as HTMLElement;
  const shortStage = short.container.querySelector('[data-cover-el="stage"]') as HTMLElement;
  const shortSquadSize = parseFloat(getComputedStyle(shortSquad).fontSize);
  const shortStageSize = parseFloat(getComputedStyle(shortStage).fontSize);

  const screen = await renderCover({ title: "特种高配通关演示", subtitle: "H15-4-EX-8" });
  const canvas = screen.container.querySelector("[data-blue-cut-canvas]") as HTMLElement;
  const squad = screen.container.querySelector('[data-cover-el="squad"]') as HTMLElement;
  const stage = screen.container.querySelector('[data-cover-el="stage"]') as HTMLElement;
  const canvasBox = canvas.getBoundingClientRect();
  const squadBox = squad.getBoundingClientRect();
  const stageBox = stage.getBoundingClientRect();

  expect(squad.textContent).toContain("特种高配通关演示");
  expect(stage.textContent).toContain("H15-4-EX-8");
  expect(stage.querySelector("[data-stage-mark]")).toBeNull();
  expect(parseFloat(getComputedStyle(squad).fontSize)).toBeLessThan(shortSquadSize);
  expect(parseFloat(getComputedStyle(stage).fontSize)).toBeLessThan(shortStageSize);
  expect(squadBox.right).toBeLessThanOrEqual(canvasBox.right + 1);
  expect(stageBox.right).toBeLessThanOrEqual(canvasBox.right + 1);
  expect(squadBox.bottom).toBeLessThanOrEqual(canvasBox.bottom);
  expect(stageBox.bottom).toBeLessThanOrEqual(canvasBox.bottom);
});

function EditorTheme() {
  const { draft, templateId } = useCover();
  return (
    <>
      <EditorPanel />
      <div style={{ width: 960, height: 540 }}>
        <CoverView
          {...draftToRenderProps(templateId, draft, {
            previewScale: 0.5,
            onImageDrag: () => undefined,
            showPlaceholder: false,
          })}
        />
      </div>
    </>
  );
}

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

test("编辑栏能改阵容、关卡码和英文标", async () => {
  const screen = await render(
    <CoverProvider templateId="blue-cut">
      <EditorFixture />
    </CoverProvider>,
  );

  await expect.element(screen.getByRole("textbox", { name: "阵容" })).toHaveValue("三近卫");
  await screen.getByRole("textbox", { name: "阵容" }).fill("四先锋");
  await screen.getByRole("textbox", { name: "关卡码" }).fill("H12-1");
  await screen.getByRole("textbox", { name: "英文标" }).fill("Vanguard");

  await expect.poll(() => screen.container.querySelector('[data-cover-el="squad"]')?.textContent ?? "").toContain("四先锋");
  expect(screen.container.querySelector('[data-cover-el="stage"]')?.textContent).toContain("H12");
  expect(screen.container.querySelector('[data-cover-el="stage"]')?.textContent).toContain("1");
  expect(screen.container.querySelector('[data-cover-el="en"]')?.textContent).toContain("Vanguard");
});

test("编辑栏能改斜切关卡主题色", async () => {
  const screen = await render(
    <CoverProvider templateId="blue-cut">
      <EditorTheme />
    </CoverProvider>,
  );
  await expect.element(screen.getByRole("textbox", { name: "主题色" })).toHaveValue("#f50039");
  await screen.getByRole("textbox", { name: "主题色" }).fill("#c41c1c");
  const canvas = screen.container.querySelector("[data-blue-cut-canvas]") as HTMLElement;
  await expect.poll(() => canvas.getAttribute("data-colorway")).toBe("#c41c1c");
  expect(getComputedStyle(canvas.querySelector('[data-cover-el="slash"]') as HTMLElement).color).toBe("rgb(196, 28, 28)");
  const grain = canvas.querySelector("[data-stage-grain]") as HTMLElement;
  expect(grain.getAttribute("data-grain-tint")).toBe("#c41c1c");
  await expect.poll(() => grain.getAttribute("data-grain-ready")).toBe("true");
});

test("安装斜切关卡配置时清掉已固化的偏移", () => {
  const draft = emptyDraft("blue-cut");
  draft.colorway = "#0c884a";
  draft.imageX = -116.2943863759617;
  draft.imageY = -55.77916235478211;
  draft.elementStyles = {
    squad: { x: -2.3573463397790055, y: 40.073592886740336 },
    en: { x: -80, y: -15, color: "#112233" },
    wedge: { x: 43.19042369631901, y: -498.6504265720862 },
    stage: { x: -63 },
  };
  saveState({ defaultsVersion: 40, drafts: { "blue-cut": draft } });
  const migrated = loadState().drafts["blue-cut"];
  expect(migrated?.elementStyles).toEqual({ en: { color: "#112233" } });
  expect(migrated?.imageX).toBe(-116.3);
  expect(migrated?.imageY).toBe(-55.8);
  expect(migrated?.colorway).toBe("#f50039");
  expect(migrated?.title).toBe("三近卫");
  expect(migrated?.signature).toBe("Guard");
});
