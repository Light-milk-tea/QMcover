import { useRef } from "react";
import { beforeEach, expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { CoverStage } from "../components/CoverStage";
import { EditorPanel } from "../components/EditorPanel";
import "../index.css";
import { CoverProvider } from "../store/CoverContext";
import { HighspecNocore } from "./HighspecNocore";

beforeEach(() => {
  localStorage.clear();
});

const stubArt =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='48'%3E%3Crect width='32' height='48' fill='%23b26f54'/%3E%3C/svg%3E";

function renderCover(patch: Partial<Parameters<typeof HighspecNocore>[0]> = {}) {
  return render(
    <div style={{ width: 1920, height: 1080 }}>
      <HighspecNocore
        title="首杀"
        subtitle="MT-EX-8"
        signature="众生行记"
        mark="无核"
        episode={1}
        date="2026-09-22"
        operatorName=""
        imageUrl={stubArt}
        imageScale={228}
        imageX={72}
        imageY={36}
        previewScale={1}
        onImageDrag={() => undefined}
        showPlaceholder={false}
        bgPreset="26_g1_laterano_cathedralfront"
        {...patch}
      />
    </div>,
  );
}

test("V我50 显示活动名、关卡箭头、色块和大字", async () => {
  const screen = await renderCover();
  const canvas = screen.container.querySelector("[data-highspec-canvas]") as HTMLElement;
  const event = screen.container.querySelector('[data-cover-el="event"]') as HTMLElement;
  const stage = screen.container.querySelector('[data-cover-el="stage"]') as HTMLElement;
  const tag = screen.container.querySelector('[data-cover-el="tag"]') as HTMLElement;
  const verb = screen.container.querySelector('[data-cover-el="verb"]') as HTMLElement;
  const arrow = screen.container.querySelector("[data-stage-arrow]");
  const chip = screen.container.querySelector('[data-cover-el="chip"]') as HTMLElement;
  const operator = screen.container.querySelector("[data-operator-slot]") as HTMLElement;

  expect(event.textContent).toContain("众生行记");
  expect(screen.container.querySelector('[data-cover-el="kicker"]')?.textContent).toContain("NEW SIDESTORY");
  expect(stage.textContent).toContain("MT-EX-8");
  expect(tag.textContent).toContain("无核");
  expect(verb.textContent).toContain("首杀");
  expect(arrow).not.toBeNull();
  expect(arrow?.querySelector("polygon")).not.toBeNull();
  expect(chip).not.toBeNull();
  expect(operator).not.toBeNull();

  const canvasBox = canvas.getBoundingClientRect();
  const stageBox = stage.getBoundingClientRect();
  const verbBox = verb.getBoundingClientRect();
  const chipBox = chip.getBoundingClientRect();
  expect(stageBox.left).toBeGreaterThan(canvasBox.left + 80);
  expect(stageBox.top).toBeGreaterThan(canvasBox.top + canvasBox.height * 0.28);
  expect(stageBox.bottom).toBeLessThan(canvasBox.top + canvasBox.height * 0.62);
  expect(chipBox.top).toBeGreaterThan(stageBox.bottom - 8);
  expect(verbBox.left).toBeGreaterThan(chipBox.left);
  expect(verbBox.right).toBeLessThanOrEqual(canvasBox.right);
  const operatorBox = operator.getBoundingClientRect();
  expect(operatorBox.left).toBeGreaterThan(canvasBox.left + canvasBox.width * 0.42);
  expect(operatorBox.right).toBeGreaterThan(canvasBox.right - 4);
  expect(stageBox.right).toBeLessThan(operatorBox.left + canvasBox.width * 0.22);
  expect(Number(getComputedStyle(operator).zIndex)).toBeGreaterThan(
    Number(getComputedStyle(screen.container.querySelector('[data-cover-el="arrow"]') as HTMLElement).zIndex),
  );
  expect(Number(getComputedStyle(stage).zIndex)).toBeGreaterThan(Number(getComputedStyle(operator).zIndex));
  expect(operator.querySelector("[style*='mask-image']")).toBeNull();
  expect(Number(getComputedStyle(verb).zIndex)).toBeGreaterThan(Number(getComputedStyle(operator).zIndex));
  expect(Number(getComputedStyle(tag).zIndex)).toBeGreaterThan(Number(getComputedStyle(operator).zIndex));
});

test("更长的大字会缩小并留在画布内", async () => {
  const short = await renderCover();
  const shortVerb = short.container.querySelector('[data-cover-el="verb"]') as HTMLElement;
  const shortSize = parseFloat(getComputedStyle(shortVerb).fontSize);

  const screen = await renderCover({ title: "无核首杀演示稿" });
  const canvas = screen.container.querySelector("[data-highspec-canvas]") as HTMLElement;
  const verb = screen.container.querySelector('[data-cover-el="verb"]') as HTMLElement;
  const canvasBox = canvas.getBoundingClientRect();
  const verbBox = verb.getBoundingClientRect();
  expect(verb.textContent).toContain("无核首杀演示稿");
  expect(parseFloat(getComputedStyle(verb).fontSize)).toBeLessThan(shortSize);
  expect(verbBox.right).toBeLessThanOrEqual(canvasBox.right + 1);
  expect(verbBox.bottom).toBeLessThanOrEqual(canvasBox.bottom);
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

test("编辑栏能改大字、关卡码、色块词和活动名", async () => {

  const screen = await render(
    <CoverProvider templateId="highspec-nocore">
      <EditorFixture />
    </CoverProvider>,
  );

  await expect.element(screen.getByRole("textbox", { name: "大字" })).toHaveValue("首杀");
  await screen.getByRole("textbox", { name: "大字" }).fill("通关");
  await screen.getByRole("textbox", { name: "关卡码" }).fill("H15-4");
  await screen.getByRole("textbox", { name: "色块词" }).fill("低配");
  await screen.getByRole("textbox", { name: "活动名" }).fill("孤星");

  await expect.poll(() => screen.container.querySelector('[data-cover-el="verb"]')?.textContent ?? "").toContain("通关");
  expect(screen.container.querySelector('[data-cover-el="stage"]')?.textContent).toContain("H15-4");
  expect(screen.container.querySelector('[data-cover-el="tag"]')?.textContent).toContain("低配");
  expect(screen.container.querySelector('[data-cover-el="event"]')?.textContent).toContain("孤星");
});
