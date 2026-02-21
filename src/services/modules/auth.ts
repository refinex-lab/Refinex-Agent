import { post } from '@/services/request'
import { env } from '@/config/env'

/** 登录请求参数 */
export interface LoginParams {
  username: string
  password: string
}

/** 登录响应数据 */
export interface LoginResult {
  token: string
  expires: number
}

const PREFIX = env.API_PREFIX_AUTH

/** 用户登录 */
export function login(data: LoginParams) {
  return post<LoginResult>(`${PREFIX}/api/v1/auth/login`, data)
}

/** 退出登录 */
export function logout() {
  return post<void>(`${PREFIX}/api/v1/auth/logout`)
}
