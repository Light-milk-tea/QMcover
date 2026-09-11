# 如何加模板

首页列出 `src/data/templates.ts` 里的模板，点卡片进入编辑器。不要整图搬运别人的封面或官方立绘。

## 设计与校对入口

按参考图新建或改进模板，先读 [构图流程](doc/模仿参考图生成模板.md)；逐轮对比、材质取舍、图片解码及导出验收见 [视觉迭代指南](doc/封面视觉迭代与验收.md)。下面是工程接线，不代表接完线就完成了视觉设计。

## 加一个模板

1. 在 `src/types.ts` 的 `BuiltinTemplateId`、`CanvasSkin` 和 `src/constants.ts` 的 `BUILTIN_TEMPLATE_IDS` 里加稳定 id。
2. 新建 `src/templates/Xxx.tsx`，接收 `CoverRenderProps`，并在 `src/templates/registry.tsx` 注册。
3. 在 `src/data/templates.ts` 加 name / blurb / 默认文案、立绘、背景。
4. 新建 `src/data/seeds/<id>.ts` 并接入 `src/data/seeds/index.ts`，再在 `src/data/elements.ts` 登记原生图层。
5. 对照主参考逐轮调整并检查实际导出。涉及 UI 时新增或更新 `*.browser.test.tsx`，用 Vitest Browser 的 Playwright Chromium 跑绿。
6. 构图定了之后，打开 `#/__thumb/<id>` 导出 960×540 WebP，同时更新 `public/thumbs/`、`src/assets/thumbs/` 和 `src/lib/thumbs.ts`。

复刻的是构图（字在哪、条在哪），不是别人的整张封面。编辑器里的立绘和基建小人运行时加载，不进仓库。小人图层 `source: "chibi"`，地址走 `chibiUrl`，不要 fallback 成全身立绘。
