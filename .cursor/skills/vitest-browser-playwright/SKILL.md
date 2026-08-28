---
name: vitest-browser-playwright
description: >-
  Verifies UI and component changes with Vitest Browser + Playwright (real
  Chromium, not jsdom). Use when writing or changing React/Vue components,
  fixing interaction bugs, adding click/focus/overlay behavior, or when the
  user mentions 测试、校对、验证、play、Vitest Browser、Playwright、browser test.
---

# Vitest Browser + Playwright 校对

改 UI 之后，**没跑绿浏览器测试就不算做完**。本仓库用 npm。

## 何时启用

- 写 / 改组件、页面交互、弹层、下拉、表单控件
- 修「点了没反应」「焦点不对」「弹层不关」这类 bug
- 用户说验证、校对、跑测试、play

不用于：纯函数、API mock、CSS-only 且无行为变化（仍建议跑相关已有测试防回归）。

## 必须流程

1. **先定测什么**：用户能看见的行为（点击、键盘、可见、禁用、报错文案）。
2. **写或改** 同目录 `*.browser.test.tsx`。没有测试文件就新建，不要只改实现。
3. **跑受影响测试**，不要先全量：

   ```bash
   npx vitest run <path-to-file>.browser.test.tsx --browser.headless
   ```

   项目已有 `npm test` 且很快时，也可以跑 `npm test -- <Name>`。
4. **红 → 修 → 再跑**。最多 3 轮。第 3 轮仍红：停，贴失败断言、相关代码、你认为的根因。
5. **绿才能**在回复里写「已验证」。必须写：跑了哪条命令、结果（通过数 / 失败数）。

禁止：

- 用 jsdom / `@testing-library/react` 的 Node 环境冒充本 skill 的验收
- 用 Playwright MCP **Edge**（`msedge`）或系统 Edge 预览代替 `npx vitest`
- `sleep` / 固定 `waitForTimeout` 代替 `expect.element(...).toBeVisible()`
- 没执行测试却写「应该通过」「逻辑上没问题」
- 为了变绿删断言或 `it.skip`

## 测试写法

```tsx
import { expect, test } from "vitest";
import { render } from "vitest-browser-react";

test("提交按钮在空表单时禁用", async () => {
  const screen = await render(<OrderForm />);
  await expect.element(screen.getByRole("button", { name: "提交" })).toBeDisabled();
});
```

- `render` 来自 `vitest-browser-react`
- 查询优先 `getByRole`，其次 label / text
- 断言用 `await expect.element(locator).toBeVisible()` 等可重试 matcher
- 一条测试一件事；覆盖主路径 + 一个失败/禁用路径即可，不要堆快照

## 环境不齐时

若没有 `vitest.config.ts` 的 `test.browser`，或没有 `playwright`：

1. 先按本机拷贝包 `Vitest Browser_Playwright/install.md` 补齐依赖和配置
2. `npx playwright install chromium chromium-headless-shell`
3. 再写测试、再跑

报 `browser closed` / `executable doesn't exist`：先装浏览器，不要改测试绕过。

## 和 E2E 的边界

| 场景 | 工具 |
| --- | --- |
| 组件 / 一块 UI 的点击与状态 | 本 skill（Vitest Browser） |
| 纯函数、数据处理 | `*.test.ts` + Node Vitest |
| 登录后跨多页下单 | `@playwright/test` E2E，不要塞进 browser unit |
