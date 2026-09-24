# Agent 约定

给之后改这个仓库的 Agent 看。用户口头约定优先于本文件。

## 仓库是什么

远程：[https://github.com/Light-milk-tea/QMcover.git](https://github.com/Light-milk-tea/QMcover.git)

QMcover：明日方舟 B 站横版封面工坊，纯前端（React 19 + Vite + TypeScript + Tailwind CSS 4）。草稿在 `localStorage`，不接后端。

相关文档：

- [README.md](README.md) 运行与模板说明
- [TEMPLATES.md](TEMPLATES.md) 如何加模板
- [doc/模仿参考图生成模板.md](doc/模仿参考图生成模板.md) 按参考图复刻构图
- [SKILL.md](SKILL.md) Commit-as-Prompt（用户要求提交时用）

## 新建、复刻或美化模板时先读

先读 [TEMPLATES.md](TEMPLATES.md) 确认工程接线，再读 [按参考图生成模板](doc/模仿参考图生成模板.md) 的工作顺序。视觉迭代和导出校对见 [参考图对比与紧急授课经验](doc/封面视觉迭代与验收.md)。这些要求也适用于优化已有模板。

- 把主参考图和当前画布缩到同一尺寸，先指出最大的视觉差距，再改对应层；每轮重新截图检查，不以代码改动量或测试通过代替视觉质量。
- 同时检查默认稿、整页编辑器和 `html-to-image` 实际导出。截图前等待字体和图片解码，不能只检查图片下载完成。
- 材质做法按参考图选，不把某张图的紫色光痕、宋体或晕染变成所有模板的默认风格。
- 根目录 `SKILL.md` 是提交规范；`.cursor/skills/vitest-browser-playwright/SKILL.md` 是测试技能；设计依据是上面的文档和主参考图。

## Git：直接在 main 上干活

远程就是上面的仓库。默认只在本地改，**用户说推再推**。推的时候 **直接推 `origin/main`**，不要另开功能分支，不要用 `cursor/`、`feat/`、`docs/` 这类前缀开分支。

| 动作 | 何时可以 |
| --- | --- |
| 改文件、跑起来验证 | 用户给了任务就可以 |
| `git commit` | 用户要提交，或任务告一段落需要落盘；按 [SKILL.md](SKILL.md) 写 WHAT/WHY/HOW |
| `git push` | **用户明确说「推」**：`git push origin main` |
| 开 / 更新 PR | **用户明确说开 PR 或更新 PR** |
| 合并 PR、force push、amend | 用户点名要求 |

已经开过的 PR 不要擅自关、改状态或合并。用户没说推，本地可以比远程超前。不要改 `git config`。

每次 `git commit` 必须用环境变量注入身份，**作者和提交者都只能是下面这组，不要出现 Cursor / cursoragent**：

| 字段 | 值 |
| --- | --- |
| Name | `Light-milk-tea` |
| Email | `2362519919@qq.com` |

```bash
GIT_AUTHOR_NAME='Light-milk-tea' \
GIT_AUTHOR_EMAIL='2362519919@qq.com' \
GIT_COMMITTER_NAME='Light-milk-tea' \
GIT_COMMITTER_EMAIL='2362519919@qq.com' \
git commit -m "$(cat <<'EOF'
...
EOF
)"
```

提交后用 `git log -1 --format='%an <%ae> | %cn <%ce>'` 核对。看到 `Cursor Agent` 或 `cursoragent@` 就立刻改掉再交（未推可以 `--amend`；已推必须用户同意才重写）。写法细节见 [SKILL.md](SKILL.md)。

## 内容红线

- 复刻构图，不搬别人的整张封面、官方标、参考 UP 的 logo。
- 不要把官方立绘、AVG、关卡图、别人封面、`references/` 下的参考 jpg 提交进 git。这些图已被 gitignore。
- 不要改稳定模板 id（`firstkill` / `lowspec` / `rogue` / `madness` / `nocore` / `endfield` / `specialist` / `highspec-nocore`）。改名只改 `name`。
- 立绘和 AVG 只走现有 CDN，不要把大图拷进仓库。
- 导出靠 `html-to-image`。描边、阴影用双层真实 DOM，不要用伪元素。

## 本地运行

```bash
npm install
npm run dev
```

默认 `http://localhost:5173/`。路由是 hash：`#/` 首页，`#/t/<模板id>` 编辑器。

改 UI 或模板时，用 Vitest Browser + Playwright **Chromium** 校对，不要用系统 Edge / MCP Edge 点一遍就算验收。

## UI 验收（Vitest Browser + Playwright）

改组件、交互或可见样式时：

- 写或更新 `*.browser.test.tsx`，在 Playwright Chromium 里跑，不用 jsdom，也不用 Edge。
- 校对：`npx vitest run <file> --browser.headless`，或 `npm test`。
- 要看窗口：`npm run test:browser`（同样是 Chromium）。
- 红就修再跑；没跑绿不准说做完。
- 需要打开整页编辑器时，Playwright MCP 也必须走这套 Chromium，禁止 `--browser=msedge`。
- 细则见 Cursor skill `vitest-browser-playwright`。
