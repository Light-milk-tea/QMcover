import { beforeEach, expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { HomePage } from "./HomePage";

beforeEach(() => {
  localStorage.clear();
});

test("首页列出先锋六人模板并能打开", async () => {
  let opened = "";
  const screen = await render(<HomePage onOpen={(id) => { opened = id; }} />);
  await screen.getByRole("button", { name: "先锋六人 灰金网点职业队模板" }).click();
  expect(opened).toBe("six-vanguard");
});

test("首页列出模板，点职业队会打开 specialist", async () => {
  let opened = "";
  const screen = await render(<HomePage onOpen={(id) => { opened = id; }} />);

  await expect.element(screen.getByRole("heading", { name: "选择模板" })).toBeVisible();
  await expect.element(screen.getByRole("button", { name: "导入 JSON" })).toBeVisible();
  await expect.element(screen.getByRole("button", { name: "危机合约模板 危机合约向模板" })).toBeVisible();

  await screen.getByText("职业队", { exact: true }).click();
  expect(opened).toBe("specialist");
});

test("首页列出干员前瞻分析模板并能打开", async () => {
  let opened = "";
  const screen = await render(<HomePage onOpen={(id) => { opened = id; }} />);

  await expect
    .element(screen.getByRole("button", { name: "干员前瞻分析 冷蓝战术分析模板" }))
    .toBeVisible();
  await screen.getByText("干员前瞻分析", { exact: true }).click();
  expect(opened).toBe("operator-preview");
});

test("首页列出四星无核模板并能打开", async () => {
  let opened = "";
  const screen = await render(<HomePage onOpen={(id) => { opened = id; }} />);

  await expect.element(screen.getByRole("button", { name: "四星无核 精一四星首杀拼贴模板" })).toBeVisible();
  await screen.getByText("四星无核", { exact: true }).click();
  expect(opened).toBe("fourstar-nocore");
});

test("首页列出仅需一人模板并能打开", async () => {
  let opened = "";
  const screen = await render(<HomePage onOpen={(id) => { opened = id; }} />);

  await expect.element(screen.getByRole("button", { name: "仅需一人 单人通关暗红氛围模板" })).toBeVisible();
  await screen.getByText("仅需一人", { exact: true }).click();
  expect(opened).toBe("solo");
});

test("首页列出强度测评模板并能打开", async () => {
  let opened = "";
  const screen = await render(<HomePage onOpen={(id) => { opened = id; }} />);
  await screen.getByRole("button", { name: "强度测评 单立绘技能测评模板" }).click();
  expect(opened).toBe("strength-review");
});

test("首页列出紧急授课模板并能打开", async () => {
  let opened = "";
  const screen = await render(<HomePage onOpen={(id) => { opened = id; }} />);

  await expect.element(screen.getByRole("button", { name: "紧急授课 五人无藏肉鸽模板" })).toBeVisible();
  await screen.getByText("紧急授课", { exact: true }).click();
  expect(opened).toBe("emergency-lesson");
});

test("首页列出全息作战矩阵并打开可调色模板", async () => {
  let opened = "";
  const screen = await render(<HomePage onOpen={(id) => { opened = id; }} />);
  await screen.getByRole("button", { name: "全息作战矩阵 可自选主题色的圆环战术模板" }).click();
  expect(opened).toBe("tactical-matrix");
});
