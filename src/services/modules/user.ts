import { get, put } from '@/services/request'
import { env } from '@/config/env'
import type { PageParams } from '@/types/api'

/** 用户信息 */
export interface UserInfo {
  id: string
  username: string
  nickname: string
  avatar: string
  email: string
  roles: string[]
}

/** 用户更新参数 */
export interface UpdateUserParams {
  nickname?: string
  avatar?: string
  email?: string
}

/** 分页响应（解包后的结构） */
export interface PageData<T> {
  records: T[]
  total: number
  totalPage: number
  page: number
  size: number
}

const PREFIX = env.API_PREFIX_USER

/** 获取当前登录用户信息 */
export function getCurrentUser() {
  return get<UserInfo>(`${PREFIX}/api/v1/users/me`)
}

/** 分页查询用户列表 */
export function getUserList(params: PageParams) {
  return get<PageData<UserInfo>>(`${PREFIX}/api/v1/users`, params as unknown as Record<string, unknown>)
}

/** 更新用户信息 */
export function updateUser(id: string, data: UpdateUserParams) {
  return put<void>(`${PREFIX}/api/v1/users/${id}`, data)
}
