/**
 * 应用环境配置（构建时注入，运行时只读）
 *
 * 业务代码中统一使用本模块导出的 `env` 对象，
 * 避免散落的 `import.meta.env.VITE_*` 调用。
 */

const m = import.meta.env

export const env = {
  /** 当前模式：development | test | production */
  MODE: m.MODE,
  /** 是否为生产构建 */
  PROD: m.PROD,
  /** 是否为开发模式 */
  DEV: m.DEV,

  // ── 应用基础信息 ──────────────────────────────
  APP_NAME: m.VITE_APP_NAME,
  APP_SUBTITLE: m.VITE_APP_SUBTITLE,
  APP_LOGO_URL: m.VITE_APP_LOGO_URL,

  // ── API 网关 ─────────────────────────────────
  API_BASE_URL: m.VITE_API_BASE_URL,
  API_TIMEOUT_MS: Number(m.VITE_API_TIMEOUT_MS),

  // ── 后端模块前缀 ─────────────────────────────
  API_PREFIX_AUTH: m.VITE_API_PREFIX_AUTH,
  API_PREFIX_USER: m.VITE_API_PREFIX_USER,
  API_PREFIX_TOKEN: m.VITE_API_PREFIX_TOKEN,
  API_PREFIX_SYSTEM: m.VITE_API_PREFIX_SYSTEM,

  // ── 认证 ─────────────────────────────────────
  AUTH_TOKEN_HEADER: m.VITE_AUTH_TOKEN_HEADER,
} as const
