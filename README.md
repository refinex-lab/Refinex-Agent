# Refinex Agent

基于 shadcn/ui、Tailwind CSS 4.2 和 AI Elements 构建的现代 AI Agent 前端应用。

## 技术栈

| 类别 | 技术 |
| ---- | ---- |
| 框架 | React 19 + TypeScript 5.9 |
| 构建 | Vite 7 |
| 样式 | Tailwind CSS 4.2（Vite 插件模式） |
| UI 组件 | shadcn/ui (new-york) + AI Elements |
| 图标 | Lucide React |
| 包管理 | pnpm |
| 代码规范 | ESLint 9 + typescript-eslint |

## 快速开始

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 类型检查 + 生产构建
pnpm build

# 预览生产构建
pnpm preview

# 代码检查
pnpm lint
```

## 项目结构

```text
src/
├── main.tsx                   # 入口：挂载 React
├── App.tsx                    # 根组件 / 路由入口
├── index.css                  # 全局样式 + Tailwind 主题变量
├── components/
│   ├── ui/                    # shadcn/ui 原子组件（CLI 生成，勿手动修改）
│   └── [模块名]/               # 业务组件，按模块组织
├── lib/
│   └── utils.ts               # cn() 等通用工具函数
├── hooks/                     # 自定义 React Hooks
├── pages/                     # 页面级组件（对应路由）
├── services/                  # API 调用层
├── stores/                    # 全局状态管理
└── types/                     # 共享 TypeScript 类型定义
```

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

Private
