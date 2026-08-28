import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import type { LightEffect } from "../types";
import { SpecialistLightUnderlay } from "./CoverEffectsStage";

const specialistBeam: LightEffect = {
  enabled: true,
  amount: 40,
  kind: "beam",
  x: 30,
  y: 0,
  rotate: -12,
};

test("斜光条从画布左上角铺开，并溢到条外", async () => {
  const screen = await render(
    <div
      role="region"
      aria-label="打光预览"
      style={{ position: "relative", width: 640, height: 360, overflow: "hidden", background: "#101216" }}
    >
      <SpecialistLightUnderlay effect={specialistBeam} />
    </div>,
  );
  const probe = screen.getByRole("region", { name: "打光预览" });
  await expect.element(probe).toBeVisible();
  const node = probe.element();
  const box = node.getBoundingClientRect();
  const wash = node.querySelector("[data-light-corner]");
  const slab = node.querySelector("[data-light-cone]");
  expect(wash).not.toBeNull();
  expect(slab).not.toBeNull();

  const fill = wash!.getBoundingClientRect();
  expect(fill.left).toBeLessThanOrEqual(box.left + 1);
  expect(fill.top).toBeLessThanOrEqual(box.top + 1);
  expect(fill.right).toBeGreaterThanOrEqual(box.right - 1);
  expect(fill.bottom).toBeGreaterThanOrEqual(box.bottom - 1);

  const slabBox = slab!.getBoundingClientRect();
  expect(slabBox.left).toBeLessThanOrEqual(box.left + 1);
  expect(slabBox.top).toBeLessThanOrEqual(box.top + 1);
  expect(slabBox.width).toBeGreaterThan(box.width);
  expect(getComputedStyle(slab!).transformOrigin.startsWith("0px 0px")).toBe(true);
});
