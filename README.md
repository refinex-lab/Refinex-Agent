# Refinex Agent

基于 shadcn/ui、Tailwind CSS 4.2 和 AI Elements 构建的现代 AI Agent 应用，支持 Web 浏览器和 Electron 桌面端双模式运行。

## 技术栈

| 类别 | 技术 |
| ---- | ---- |
| 框架 | React 19 + TypeScript 5.9 |
| 构建 | Vite 7 |
| 桌面端 | Electron 40（via vite-plugin-electron） |
| 样式 | Tailwind CSS 4.2（Vite 插件模式） |
| UI 组件 | shadcn/ui (new-york) + AI Elements |
| 图标 | Lucide React |
| 包管理 | pnpm |
| 代码规范 | ESLint 9 + typescript-eslint |

## 快速开始

```bash
# 安装依赖
pnpm install

# 启动 Web 开发服务器
pnpm dev

# 启动测试环境开发服务器
pnpm dev:test

# 启动 Electron 桌面端开发模式
pnpm dev:desktop

# 类型检查 + Web 生产构建
pnpm build

# 测试环境构建
pnpm build:test

# 生产环境构建
pnpm build:prod

# Electron 桌面端构建
pnpm build:desktop

# 预览 Web 生产构建
pnpm preview

# 预览 Electron 桌面端构建
pnpm preview:desktop

# 代码检查
pnpm lint
```

## 环境配置

项目使用 Vite 的 [环境变量与模式](https://cn.vite.dev/guide/env-and-mode.html) 机制管理多环境配置。

| 文件 | 用途 | 是否提交 |
| ---- | ---- | ---- |
| `.env` | 所有环境共享的默认值 | 是 |
| `.env.development` | 开发环境（`pnpm dev`） | 是 |
| `.env.test` | 测试环境（`pnpm dev:test` / `pnpm build:test`） | 是 |
| `.env.production` | 生产环境（`pnpm build`） | 是 |
| `.env.local` | 本地覆盖（优先级最高，已 gitignore） | 否 |

所有 `VITE_*` 变量在 `src/vite-env.d.ts` 中声明了类型，并通过 `src/config/env.ts` 统一导出，业务代码中应使用 `env.*` 而非直接访问 `import.meta.env`。

## 项目结构

```text
electron/                          # Electron 桌面端
├── main.ts                        # 主进程入口
└── preload.ts                     # 预加载脚本（contextBridge）
src/
├── main.tsx                   # 入口：挂载 React
├── App.tsx                    # 根组件 / 路由入口
├── index.css                  # 全局样式 + Tailwind 主题变量
├── vite-env.d.ts              # VITE_* 环境变量类型声明
├── config/
│   └── env.ts                 # 统一环境配置导出
├── types/
│   ├── api.ts                 # 统一响应类型、分页类型
│   └── electron.d.ts          # Electron API 全局类型声明
├── utils/
│   └── token.ts               # Token 存取工具
├── services/
│   ├── request.ts             # Axios 实例 + 拦截器
│   ├── index.ts               # 统一导出
│   └── modules/               # 按后端服务拆分的 API 模块
│       ├── auth.ts            # 认证服务（登录、退出）
│       └── user.ts            # 用户服务（用户信息、列表）
├── components/
│   ├── ui/                    # shadcn/ui 原子组件（CLI 生成，勿手动修改）
│   └── [模块名]/               # 业务组件，按模块组织
├── lib/
│   ├── utils.ts               # cn() 等通用工具函数
│   └── platform.ts            # 平台检测（isElectron / platform）
├── hooks/                     # 自定义 React Hooks
├── pages/                     # 页面级组件（对应路由）
├── stores/                    # 全局状态管理
└── types/                     # 共享 TypeScript 类型定义
```

## 请求层架构

项目基于 Axios 构建了分层的 HTTP 请求体系：

```
env.ts（环境变量） → request.ts（Axios 实例 + 拦截器） → modules/*（按服务拆分的 API） → 业务组件
```

- `src/services/request.ts` — Axios 实例，自动注入鉴权 Token、统一错误处理、响应解包
- `src/services/modules/*.ts` — 按后端微服务拆分，通过 `env.API_PREFIX_*` 动态拼接服务前缀
- `src/types/api.ts` — 统一响应结构 `ApiResponse<T>`、分页结构 `PageResponse<T>`，与后端 `Result<T>` / `PageResult<T>` 对齐

业务代码中通过 `import { authApi, userApi } from '@/services'` 调用，响应已自动解包。

## 路径别名

项目配置了 `@/*` → `src/*` 路径别名，在 tsconfig 和 Vite 中均已配置：

```typescript
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
```

## 添加 shadcn/ui 组件

```bash
npx shadcn@latest add [组件名]
```

组件将自动生成到 `src/components/ui/` 目录。配置详见 `components.json`。

## 相关项目

- [Refinex-Platform](https://github.com/refinex-lab/Refinex-Platform) — 后端服务，提供 API 接口能力

## License

[MIT](LICENSE)
