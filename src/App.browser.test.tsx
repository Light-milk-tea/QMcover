import { afterEach, expect, test } from "vitest";
import { render } from "vitest-browser-react";
import "./index.css";
import App from "./App";

afterEach(() => {
  window.location.hash = "";
  window.scrollTo(0, 0);
});

test("首页往下翻后点进模板，编辑器停在顶部；返回首页回到原来的位置", { timeout: 30_000 }, async () => {
  window.location.hash = "#/";
  const screen = await render(<App />);
  const card = screen.getByRole("button", { name: /仅需一人/ });
  await expect.element(card).toBeInTheDocument();

  window.scrollTo(0, 1500);
  await expect.poll(() => window.scrollY).toBeGreaterThan(1000);
  const homeScroll = window.scrollY;

  (card.element() as HTMLElement).click();
  await expect.element(screen.getByRole("button", { name: "导出封面" })).toBeVisible();
  await expect.element(screen.getByText("上传立绘")).toBeInTheDocument();
  expect(window.scrollY).toBe(0);
  expect(document.scrollingElement!.scrollHeight).toBeLessThanOrEqual(window.innerHeight);

  (screen.getByRole("button", { name: "模板", exact: true }).element() as HTMLElement).click();
  await expect.element(card).toBeInTheDocument();
  await expect.poll(() => Math.abs(window.scrollY - homeScroll)).toBeLessThan(2);
});

test("编辑器里只有画布和左右两栏内点击保留图层选择，其余地方都取消", { timeout: 30_000 }, async () => {
  window.location.hash = "#/t/all-out";
  const screen = await render(<App />);
  const layers = screen.getByRole("list", { name: "图层列表" });
  const overlay = screen.getByTestId("selection-overlay");
  const pick = async () => {
    if (!document.querySelector("[data-selection-overlay]")) await layers.getByRole("button", { name: /^立绘/ }).click();
    await expect.element(overlay).toBeInTheDocument();
  };
  const press = (element: Element) =>
    element.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, pointerId: 1 }));

  await pick();
  const [leftPanel, rightPanel] = [...document.querySelectorAll("aside")];
  press(leftPanel);
  press(rightPanel.querySelector("input, textarea") ?? rightPanel);
  await new Promise((resolve) => setTimeout(resolve, 100));
  await expect.element(overlay).toBeInTheDocument();

  await screen.getByText("1920 × 1080").click();
  await expect.element(overlay).not.toBeInTheDocument();

  await pick();
  press(document.querySelector("main")!.parentElement!);
  await expect.element(overlay).not.toBeInTheDocument();

  await pick();
  await screen.getByText(/全局叠层/).click();
  await expect.element(overlay).not.toBeInTheDocument();

  await pick();
  press(screen.getByRole("button", { name: "导出封面" }).element());
  await expect.element(overlay).not.toBeInTheDocument();
});
