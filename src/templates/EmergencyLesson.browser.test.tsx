import { beforeEach, expect, test } from "vitest";
import { render } from "vitest-browser-react";
import "../index.css";
import { emptyDraft } from "../lib/storage";
import { EmergencyLesson } from "./EmergencyLesson";

beforeEach(() => {
  localStorage.clear();
});

const stubArt =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='64'%3E%3Crect width='48' height='64' fill='%23d8b6ca'/%3E%3C/svg%3E";

test("紧急授课模板复现中央立绘、人数和底部错位主标题", async () => {
  const screen = await render(
    <div style={{ width: 1920, height: 1080 }}>
      <EmergencyLesson
        title="带船紧急授课"
        subtitle="无藏"
        signature="人"
        mark=""
        episode={5}
        date="2026-09-07"
        operatorName="佩佩"
        imageUrl={stubArt}
        imageScale={230}
        imageX={120}
        imageY={-100}
        previewScale={1}
        onImageDrag={() => undefined}
        showPlaceholder={false}
        bgPreset="ink"
      />
    </div>,
  );

  const canvas = screen.container.querySelector("[data-emergency-lesson-canvas]") as HTMLElement;
  const operatorSlot = screen.container.querySelector("[data-operator-slot]") as HTMLElement;
  const operator = screen.container.querySelector('[data-cover-el="operator"]') as HTMLElement;
  const count = screen.container.querySelector('[data-cover-el="count"]') as HTMLElement;
  const unit = screen.container.querySelector('[data-cover-el="unit"]') as HTMLElement;
  const condition = screen.container.querySelector('[data-cover-el="condition"]') as HTMLElement;
  const title = screen.container.querySelector('[data-cover-el="title"]') as HTMLElement;
  const seriesMark = screen.container.querySelector('[data-cover-el="series-mark"]') as HTMLElement;
  const shards = screen.container.querySelector('[data-cover-el="shards"]');
  const artVeil = screen.container.querySelector('[data-cover-el="art-veil"]');
  const glitchDebris = screen.container.querySelector('[data-cover-el="glitch-debris"]');

  await expect.poll(() => condition?.textContent ?? "").toContain("无藏");
  expect(operator).not.toBeNull();
  expect(shards).not.toBeNull();
  expect(artVeil).not.toBeNull();
  expect(glitchDebris).not.toBeNull();
  expect(count.textContent).toContain("5");
  expect(unit.textContent).toContain("人");
  expect(title.textContent).toContain("带船紧急授课");
  expect(seriesMark.textContent).toContain("ROGUELIKE");
  expect(title.querySelectorAll("span")).toHaveLength(7);
  const face = title.querySelector("[data-title-face]") as HTMLElement;
  expect(getComputedStyle(face).backgroundClip.split(", ").every((clip) => clip === "text")).toBe(true);
  expect(getComputedStyle(face).backgroundImage).toContain("linear-gradient");
  expect(screen.container.textContent).not.toContain("萨卡兹的无终奇语");

  const canvasBox = canvas.getBoundingClientRect();
  const titleBox = title.getBoundingClientRect();
  const titleFaceBox = (title.querySelector(":scope > span") as HTMLElement).getBoundingClientRect();
  const conditionBox = condition.getBoundingClientRect();
  const countBox = count.getBoundingClientRect();
  expect(titleBox.top).toBeGreaterThan(canvasBox.top + canvasBox.height * 0.6);
  expect(titleFaceBox.width).toBeGreaterThan(canvasBox.width * 0.65);
  expect(conditionBox.top).toBeLessThan(titleBox.top);
  expect(titleFaceBox.right).toBeLessThan(canvasBox.right - 30);
  expect(titleFaceBox.bottom).toBeLessThan(canvasBox.bottom - 60);
  expect(conditionBox.bottom).toBeLessThan(titleBox.top + 24);
  expect(countBox.left).toBeGreaterThan(canvasBox.left + canvasBox.width * 0.45);
  expect(Number(getComputedStyle(operatorSlot).zIndex)).toBeLessThan(Number(getComputedStyle(title).zIndex));
});

test("空稿使用温蒂倾听皮肤和参考图文案", () => {
  const draft = emptyDraft("emergency-lesson");

  expect(draft.title).toBe("带船紧急授课");
  expect(draft.subtitle).toBe("无藏");
  expect(draft.episode).toBe(5);
  expect(draft.signature).toBe("人");
  expect(draft.operatorId).toBe("char_400_weedy");
  expect(draft.artId).toBe("char_400_weedy_sightseer#1");
  expect(draft.operatorName).toBe("温蒂");
  expect(draft.imageScale).toBe(230);
  expect(draft.imageX).toBe(120);
  expect(draft.imageY).toBe(-100);
  expect(draft.bgPreset).toBe("battlefield");
  expect(draft.canvasSkin).toBe("emergency-lesson");
});


test("较长文案仍完整留在画布内，人数与单位保持分离", async () => {
  const screen = await render(
    <div style={{ width: 1920, height: 1080 }}>
      <EmergencyLesson
        title="萨卡兹肉鸽紧急授课" subtitle="全程无藏" signature="人" episode={5}
        mark="" date="2026-09-09" operatorName="" imageUrl=""
        imageScale={230} imageX={120} imageY={-100} previewScale={1}
        onImageDrag={() => undefined} showPlaceholder={false} bgPreset="ink"
      />
    </div>,
  );
  await document.fonts.ready;
  const canvas = screen.container.querySelector("[data-emergency-lesson-canvas]")!.getBoundingClientRect();
  const title = screen.container.querySelector("[data-title-face]")!.getBoundingClientRect();
  const condition = screen.container.querySelector('[data-cover-el="condition"]')!.getBoundingClientRect();
  const count = screen.container.querySelector('[data-cover-el="count"]')!.getBoundingClientRect();
  const unit = screen.container.querySelector('[data-cover-el="unit"]')!.getBoundingClientRect();
  expect(title.right).toBeLessThan(canvas.right - 30);
  expect(title.bottom).toBeLessThan(canvas.bottom - 60);
  expect(condition.bottom).toBeLessThan(title.top);
  expect(count.left).toBeLessThan(unit.left);
  expect(condition.right).toBeLessThan(count.left + 40);
});
