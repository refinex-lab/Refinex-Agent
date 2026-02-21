import axios from 'axios'
import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios'
import { env } from '@/config/env'
import { getToken, removeToken } from '@/utils/token'
import type { ApiResponse, PageResponse } from '@/types/api'

/**
 * 创建 Axios 实例
 * - baseURL 和 timeout 从 env 配置读取
 * - Content-Type 默认 JSON
 */
const service: AxiosInstance = axios.create({
  baseURL: env.API_BASE_URL,
  timeout: env.API_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json;charset=UTF-8',
  },
})

// ── 请求拦截器 ──────────────────────────────────────────

service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken()
    if (token) {
      config.headers.set(env.AUTH_TOKEN_HEADER, token)
    }
    return config
  },
  (error) => Promise.reject(error),
)

// ── 响应拦截器 ──────────────────────────────────────────

/** HTTP 状态码 → 用户友好提示 */
const HTTP_ERROR_MAP: Record<number, string> = {
  400: '请求参数错误',
  401: '登录已过期，请重新登录',
  403: '没有权限访问该资源',
  404: '请求的资源不存在',
  408: '请求超时',
  500: '服务器内部错误',
  502: '网关错误',
  503: '服务暂时不可用',
  504: '网关超时',
}

service.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const res = response.data

    // 业务成功：解包返回 data
    if (res.success) {
      // 分页响应：保留分页元数据，将 data 作为 records 返回
      if ('total' in res) {
        const pageRes = res as unknown as PageResponse
        return {
          records: pageRes.data,
          total: pageRes.total,
          totalPage: pageRes.totalPage,
          page: pageRes.page,
          size: pageRes.size,
        } as any
      }
      return res.data as any
    }

    // 业务异常（HTTP 200 但 success=false）
    console.error(`[API 业务异常] code=${res.code}, message=${res.message}`)

    if (res.code === 'UNAUTHORIZED' || res.code === '401') {
      handleUnauthorized()
    }

    return Promise.reject(new Error(res.message || '请求失败'))
  },
  (error) => {
    if (error.response) {
      const status = error.response.status
      const msg = HTTP_ERROR_MAP[status] || `请求失败 (${status})`
      console.error(`[API HTTP 错误] ${status}: ${msg}`)

      if (status === 401) {
        handleUnauthorized()
      }
    } else if (error.code === 'ECONNABORTED') {
      console.error('[API 超时] 请求超时，请检查网络或稍后重试')
    } else {
      console.error('[API 网络错误]', error.message)
    }

    return Promise.reject(error)
  },
)

/** 鉴权失败统一处理：清除 Token，跳转登录页 */
function handleUnauthorized(): void {
  removeToken()
  if (window.location.pathname !== '/login') {
    window.location.href = '/login'
  }
}

// ── 导出类型安全的请求方法 ────────────────────────────────

export function get<T = unknown>(
  url: string,
  params?: Record<string, unknown>,
  config?: AxiosRequestConfig,
): Promise<T> {
  return service.get(url, { params, ...config })
}

export function post<T = unknown>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  return service.post(url, data, config)
}

export function put<T = unknown>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  return service.put(url, data, config)
}

export function del<T = unknown>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<T> {
  return service.delete(url, config)
}

/** 导出原始 Axios 实例（用于特殊场景，如文件上传进度监听） */
export default service
