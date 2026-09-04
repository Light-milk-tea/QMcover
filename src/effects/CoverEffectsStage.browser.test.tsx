import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { normalizeCoverEffects } from "../lib/effects";
import type { LightEffect } from "../types";
import { CoverEffectsStage, SpecialistLightUnderlay } from "./CoverEffectsStage";

const specialistBeam: LightEffect = {
  enabled: true,
  amount: 40,
  kind: "beam",
  depth: "behind",
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

test("倾斜柔光层大于画布，旋转后仍盖住右上角", async () => {
  const effects = {
    ...normalizeCoverEffects("fourstar-nocore"),
    light: {
      enabled: true,
      amount: 42,
      kind: "bloom" as const,
      x: 58,
      y: 0,
      rotate: 20,
    },
    vignette: { enabled: false, amount: 0 },
    grain: { enabled: false, amount: 0 },
  };
  const screen = await render(
    <div
      role="region"
      aria-label="柔光预览"
      style={{ position: "relative", width: 640, height: 360, overflow: "hidden", background: "#101216" }}
    >
      <CoverEffectsStage effects={effects} skin="fourstar-nocore">
        <div />
      </CoverEffectsStage>
    </div>,
  );
  const probe = screen.getByRole("region", { name: "柔光预览" });
  await expect.element(probe).toBeVisible();
  const node = probe.element();
  const box = node.getBoundingClientRect();
  const bloom = node.querySelector("[data-light-bloom]");
  expect(bloom).not.toBeNull();

  expect(bloom!.offsetWidth).toBeGreaterThan(node.clientWidth);
  expect(bloom!.offsetHeight).toBeGreaterThan(node.clientHeight);

  const fill = bloom!.getBoundingClientRect();
  expect(fill.left).toBeLessThanOrEqual(box.left + 1);
  expect(fill.top).toBeLessThanOrEqual(box.top + 1);
  expect(fill.right).toBeGreaterThanOrEqual(box.right - 1);
  expect(fill.bottom).toBeGreaterThanOrEqual(box.bottom - 1);
});

test("分层柔光不盖在画布内容上面", async () => {
  const effects = {
    ...normalizeCoverEffects("solo"),
    light: {
      enabled: true,
      amount: 38,
      kind: "bloom" as const,
      x: 74,
      y: 0,
      rotate: 10,
    },
    vignette: { enabled: false, amount: 0 },
    grain: { enabled: false, amount: 0 },
  };
  const screen = await render(
    <div
      role="region"
      aria-label="分层柔光"
      style={{ position: "relative", width: 640, height: 360, overflow: "hidden", background: "#101216" }}
    >
      <CoverEffectsStage effects={effects} skin="solo" layeredLight>
        <div data-under="" />
      </CoverEffectsStage>
    </div>,
  );

  await expect.element(screen.getByRole("region", { name: "分层柔光" })).toBeVisible();
  const overlay = screen.container.querySelector("[data-effects-overlay]");
  expect(overlay?.querySelector("[data-light-bloom]")).toBeNull();
  expect(overlay?.querySelector("[data-effect=\"light\"]")).toBeNull();
});
