import { beforeEach, expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { HomePage } from "./HomePage";

beforeEach(() => {
  localStorage.clear();
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
