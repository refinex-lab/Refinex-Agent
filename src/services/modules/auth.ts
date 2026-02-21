import { get, post } from '@/services/request'
import { env } from '@/config/env'

// ── 枚举常量 ─────────────────────────────────────────────

/** 登录/注册方式：2=手机号短信 4=邮箱验证码 */
export const IdentityType = { PHONE: 2, EMAIL: 4 } as const

/** 验证码场景 */
export const CodeScene = { LOGIN: 'login', REGISTER: 'register', RESET: 'reset' } as const

// ── Token 相关 ───────────────────────────────────────────

export interface TokenInfo {
  tokenName: string
  tokenValue: string
  tokenTimeout: number
  activeTimeout: number
  loginId: unknown
}

// ── 登录用户 ─────────────────────────────────────────────

export interface LoginUser {
  userId: number
  userCode: string
  username: string
  displayName: string
  nickname: string
  avatarUrl: string
  userType: string
  status: string
  estabId: number | null
  teamId: number | null
  primaryEstabId: number | null
  estabAdmin: boolean
  roleCodes: string[]
  permissionCodes: string[]
  loginTime: string
}

// ── 请求参数 ─────────────────────────────────────────────

export interface SmsSendParams {
  phone: string
  scene: string
}

export interface EmailSendParams {
  email: string
  scene: string
}

export interface LoginParams {
  loginType: number
  identifier: string
  code: string
  sourceType?: number
}

export interface RegisterParams {
  registerType: number
  identifier: string
  code: string
  password: string
}

export interface ResetPasswordParams {
  resetType: number
  identifier: string
  code: string
  newPassword: string
}

// ── 响应类型 ─────────────────────────────────────────────

export interface LoginResult {
  token: TokenInfo
  loginUser: LoginUser
}

// ── API 方法 ─────────────────────────────────────────────

const PREFIX = env.API_PREFIX_AUTH

/** 发送短信验证码 */
export function sendSms(data: SmsSendParams) {
  return post<void>(`${PREFIX}/auth/sms/send`, data)
}

/** 发送邮箱验证码 */
export function sendEmail(data: EmailSendParams) {
  return post<void>(`${PREFIX}/auth/email/send`, data)
}

/** 登录（手机号/邮箱 + 验证码） */
export function login(data: LoginParams) {
  return post<LoginResult>(`${PREFIX}/auth/login`, data)
}

/** 注册 */
export function register(data: RegisterParams) {
  return post<number>(`${PREFIX}/auth/register`, data)
}

/** 重置密码 */
export function resetPassword(data: ResetPasswordParams) {
  return post<void>(`${PREFIX}/auth/password/reset`, data)
}

/** 退出登录 */
export function logout() {
  return post<void>(`${PREFIX}/auth/logout`)
}

/** 获取当前 Token 信息 */
export function getTokenInfo() {
  return get<TokenInfo>(`${PREFIX}/token/info`)
}

/** 获取当前登录用户 */
export function getCurrentUser() {
  return get<LoginUser>(`${PREFIX}/token/current`)
}
