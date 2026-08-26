# Agent 约定

给之后改这个仓库的 Agent 看。用户口头约定优先于本文件。

## 仓库是什么

QMcover：明日方舟 B 站横版封面工坊，纯前端（React 19 + Vite + TypeScript + Tailwind CSS 4）。草稿在 `localStorage`，不接后端。

相关文档：

- [README.md](README.md) 运行与模板说明
- [TEMPLATES.md](TEMPLATES.md) 如何加模板
- [doc/模仿参考图生成模板.md](doc/模仿参考图生成模板.md) 按参考图复刻构图
- [SKILL.md](SKILL.md) Commit-as-Prompt（用户要求提交时用）

## Git：你让推再推

默认只在本地干活，**不要自己推远程、不要自己开 PR、不要合并、不要动 `main`。**

| 动作 | 何时可以 |
| --- | --- |
| 改文件、跑起来验证 | 用户给了任务就可以 |
| `git commit` | 用户要提交，或任务告一段落需要落盘；按 [SKILL.md](SKILL.md) 写 WHAT/WHY/HOW |
| `git push` | **用户明确说「推」** |
| 开 / 更新 PR | **用户明确说开 PR 或更新 PR** |
| 合并 PR、推 `main`、force push、amend | 用户点名要求 |

已经开过的 PR 不要擅自关、改状态或合并。用户没说推，本地可以比远程超前。

从 `main` 拉功能分支再改。分支名用小写，用 `docs/`、`feat/`、`chore/` 这类前缀，**不要用 `cursor/`**（GitHub 分支页会看起来像 Cursor 的分支）。不要改 `git config`。

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
- 不要改稳定模板 id（`firstkill` / `lowspec` / `rogue` / `madness` / `nocore` / `endfield`）。改名只改 `name`。
- 立绘和 AVG 只走现有 CDN，不要把大图拷进仓库。
- 导出靠 `html-to-image`。描边、阴影用双层真实 DOM，不要用伪元素。

## 本地运行

```bash
npm install
npm run dev
```

默认 `http://localhost:5173/`。路由是 hash：`#/` 首页，`#/t/<模板id>` 编辑器。

改 UI 或模板时，在浏览器里点一遍相关页面，不要只看代码。
