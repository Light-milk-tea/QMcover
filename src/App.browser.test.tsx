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
