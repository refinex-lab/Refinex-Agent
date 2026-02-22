/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 应用名称 */
  readonly VITE_APP_NAME: string
  /** 应用副标题 */
  readonly VITE_APP_SUBTITLE: string
  /** 应用 Logo URL */
  readonly VITE_APP_LOGO_URL: string

  /** 网关地址（统一入口） */
  readonly VITE_API_BASE_URL: string
  /** 请求超时时间（毫秒） */
  readonly VITE_API_TIMEOUT_MS: string

  /** 认证模块前缀 */
  readonly VITE_API_PREFIX_AUTH: string
  /** 用户模块前缀 */
  readonly VITE_API_PREFIX_USER: string
  /** Token 模块前缀 */
  readonly VITE_API_PREFIX_TOKEN: string
  /** 系统模块前缀 */
  readonly VITE_API_PREFIX_SYSTEM: string
  /** AI 模块前缀 */
  readonly VITE_API_PREFIX_AI: string

  /** Token 请求头名称 */
  readonly VITE_AUTH_TOKEN_HEADER: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
