# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Refinex Agent 是一个基于 shadcn/ui、Tailwind CSS 4.2 和 AI Elements 构建的现代 AI Agent 前端项目。后端接口能力由 [Refinex-Platform](https://github.com/refinex-lab/Refinex-Platform) 提供。UI 语言为中文。

## Commands

- `pnpm dev` — 启动 Vite 开发服务器（development 模式）
- `pnpm dev:test` — 启动 Vite 开发服务器（test 模式）
- `pnpm build` — 类型检查（`tsc -b`）+ Vite 构建（production）
- `pnpm build:test` — 类型检查 + Vite 构建（test）
- `pnpm build:prod` — 类型检查 + Vite 构建（production，同 `build`）
- `pnpm lint` — ESLint 检查
- `pnpm preview` — 预览生产构建

尚未配置测试框架。

## Tech Stack

- **Runtime**: React 19, TypeScript 5.9 (strict mode)
- **Build**: Vite 7 with `@vitejs/plugin-react`
- **Package manager**: pnpm
- **CSS**: Tailwind CSS 4.2 (via `@tailwindcss/vite` plugin), 主题定义在 `src/index.css`，使用 oklch CSS 自定义属性
- **UI**: shadcn/ui (new-york style, lucide icons) + AI Elements
- **Linting**: ESLint 9 flat config with typescript-eslint, react-hooks, react-refresh

## Architecture

Entry: `index.html` → `src/main.tsx` → `<App />`

Path alias `@/*` maps to `src/*`（在 tsconfig 和 vite.config.ts 中均已配置）。

### 项目结构

```text
Refinex-Agent/
├── index.html
├── package.json
├── pnpm-lock.yaml
├── components.json                # shadcn/ui 配置
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts
├── .env                           # 所有环境共享的默认值
├── .env.development               # 开发环境配置
├── .env.test                      # 测试环境配置
├── .env.production                # 生产环境配置
├── .env.local                     # 本地覆盖（已 gitignore）
├── public/                        # 静态资源
└── src/
    ├── main.tsx                   # 入口：挂载 React
    ├── App.tsx                    # 根组件 / 路由入口
    ├── index.css                  # 全局样式（Tailwind CSS）
    ├── vite-env.d.ts              # VITE_* 环境变量类型声明
    ├── config/
    │   └── env.ts                 # 统一环境配置导出（禁止直接使用 import.meta.env）
    ├── components/
    │   ├── ui/                    # shadcn/ui 组件（CLI 自动生成）
    │   │   ├── button.tsx
    │   │   ├── card.tsx
    │   │   └── ...
    │   └── [业务组件]/             # 项目业务组件
    ├── lib/
    │   └── utils.ts               # cn() 等工具函数
    ├── hooks/                     # 自定义 Hooks
    ├── pages/                     # 页面级组件
    ├── services/                  # API 调用层（对接 Refinex-Platform）
    ├── stores/                    # 状态管理
    └── types/                     # TypeScript 类型定义
```

### 约定

- `src/components/ui/` 存放全量 shadcn/ui 原子组件，通过 `npx shadcn@latest add` 添加，不手动修改
- 构建页面时，必须优先检查 `src/components/ui/` 中已有的组件，基于已有组件进行组合和构造，避免重复造轮子
- `src/components/` 下按业务模块组织自定义组件
- `src/services/` 负责所有与 Refinex-Platform 后端的 API 交互
- `src/stores/` 存放全局状态管理逻辑
- `src/pages/` 存放路由对应的页面级组件
- `src/types/` 存放跨模块共享的 Type

### 环境变量规范

- 所有 `VITE_*` 环境变量必须在 `src/vite-env.d.ts` 的 `ImportMetaEnv` 接口中声明类型
- 业务代码中禁止直接使用 `import.meta.env.VITE_*`，统一通过 `import { env } from "@/config/env"` 访问
- 新增环境变量时需同步更新：`.env`（默认值）、`.env.development`、`.env.test`、`.env.production`、`src/vite-env.d.ts`（类型）、`src/config/env.ts`（导出）
- `.env.local` 用于本地覆盖，已被 `.gitignore` 忽略，不提交到仓库

## Key Config

- **shadcn/ui** (`components.json`): new-york style, CSS variables enabled, neutral base color. Components → `@/components/ui`, hooks → `@/hooks`.
- **TypeScript**: Strict mode with `noUnusedLocals`, `noUnusedParameters`, `erasableSyntaxOnly`. Uses project references (`tsconfig.app.json` for app, `tsconfig.node.json` for Vite config).
- **Tailwind 4.2**: 使用 Vite 插件方式集成，非 PostCSS。Dark mode via `.dark` class.
