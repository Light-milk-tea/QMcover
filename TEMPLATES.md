# 如何加模板

首页列出 `src/data/templates.ts` 里的模板，点卡片进入编辑器。不要整图搬运别人的封面或官方立绘。

## 加一个模板

1. 在 `src/types.ts` 的 `TemplateId` 里加 id。
2. 新建 `src/templates/Xxx.tsx`，接收 `CoverRenderProps`。
3. 在 `src/templates/registry.tsx` 挂上组件。
4. 在 `src/data/templates.ts` 加一条 name / blurb / defaultSubtitle。
5. 构图定了之后，打开 `#/__thumb/<id>` 把预览导出到 `public/thumbs/`，首页用这张小图，不再当场拉立绘。

复刻的是构图（字在哪、条在哪），不是别人的整张封面。编辑器里的立绘运行时加载，不进仓库。
