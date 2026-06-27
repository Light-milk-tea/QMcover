# 封面喵

模板 + AI + 深度编辑的一体化智能封面制作产品。

## 项目结构

```text
apps/web        Next.js 前端，包含工作台、模板库、生成表单和 react-konva 编辑器
apps/api        NestJS 后端，包含模板、项目、生成任务、素材和 AI provider
packages/shared 前后端共享的 CanvasDocument、Layer、生成任务等类型
```

## 本地启动

1. 安装依赖：

```bash
npm install
```

2. 配置环境变量：

```bash
cp .env.example .env
```

3. 生成 Prisma Client 并迁移数据库：

```bash
npm run prisma:generate
npm run prisma:migrate
```

4. 启动服务：

```bash
npm run dev:api
npm run dev:web
```

当前 AI provider 使用 mock 实现，已经能跑通“生成候选封面 -> 创建项目 -> 画布编辑 -> 保存/导出”的 F0 闭环。后续可将 provider 替换为 GPT、Qwen2.5-VL、FLUX 和 SAM 2 的真实接口。
