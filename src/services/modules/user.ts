import { get, post, put } from '@/services/request'
import { env } from '@/config/env'

// ── 类型定义 ─────────────────────────────────────────────

/** 用户基础信息（对应 BasicUserInfo） */
export interface BasicUserInfo {
  userId: number
  displayName: string
  nickname: string
  avatarUrl: string
}

/** 用户详细信息（对应 UserInfo，继承 BasicUserInfo） */
export interface UserInfo extends BasicUserInfo {
  userCode: string
  username: string
  gender: number
  birthday: string | null
  primaryPhone: string
  phoneVerified: boolean
  primaryEmail: string
  emailVerified: boolean
  status: string
  userType: string
  registerTime: string
  lastLoginTime: string | null
  lastLoginIp: string | null
  primaryEstabId: number | null
  primaryTeamId: number | null
  estabAdmin: boolean
}

/** 用户账号信息（对应 UserAccountVO） */
export interface UserAccountInfo {
  userId: number
  userCode: string
  username: string
  primaryPhone: string
  phoneVerified: boolean
  primaryEmail: string
  emailVerified: boolean
  status: string
  userType: string
  registerTime: string
  lastLoginTime: string | null
  lastLoginIp: string | null
  usernamePasswordEnabled: boolean
  emailPasswordEnabled: boolean
}

/** 更新用户资料参数（对应 UserProfileUpdateRequest） */
export interface UpdateProfileParams {
  displayName: string
  nickname?: string
  avatarUrl?: string
  gender?: number
  birthday?: string | null
}

/** 修改密码参数（对应 UserPasswordChangeRequest） */
export interface ChangePasswordParams {
  oldPassword: string
  newPassword: string
}

// ── API 方法 ─────────────────────────────────────────────

const PREFIX = env.API_PREFIX_USER

/** 获取当前登录用户信息 */
export function getCurrentUserInfo() {
  return get<UserInfo>(`${PREFIX}/users/me/info`)
}

/** 获取当前用户账号信息 */
export function getCurrentUserAccount() {
  return get<UserAccountInfo>(`${PREFIX}/users/me/account`)
}

/** 上传当前登录用户头像 */
export function uploadAvatar(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return post<UserInfo>(`${PREFIX}/users/me/avatar`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

/** 更新当前登录用户资料 */
export function updateProfile(data: UpdateProfileParams) {
  return put<UserInfo>(`${PREFIX}/users/me/profile`, data)
}

/** 修改当前登录用户密码 */
export function changePassword(data: ChangePasswordParams) {
  return post<void>(`${PREFIX}/users/me/password/change`, data)
}

/** 重置密码参数（对应 UserPasswordResetRequest） */
export interface ResetPasswordParams {
  newPassword: string
}

/** 重置当前登录用户密码（无需旧密码） */
export function resetPassword(data: ResetPasswordParams) {
  return post<void>(`${PREFIX}/users/me/password/reset`, data)
}
