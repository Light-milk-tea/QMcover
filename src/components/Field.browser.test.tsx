import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { Field } from "./Field";

test("Field 把 label 绑到输入框并显示提示", async () => {
  const screen = await render(
    <Field label="阵容" hint="封面左侧大字">
      <input />
    </Field>,
  );
  const input = screen.getByLabelText("阵容");
  await expect.element(input).toBeVisible();
  await expect.element(screen.getByText("封面左侧大字")).toBeVisible();
  await input.fill("五特种");
  await expect.element(input).toHaveValue("五特种");
});
