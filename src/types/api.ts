// src/types/api.ts

/**
 * 后端统一响应结构
 * 对应 cn.refinex.web.vo.Result<T>
 */
export interface ApiResponse<T = unknown> {
  /** 请求是否成功 */
  success: boolean
  /** 业务状态码（字符串，如 "SUCCESS"、"BIZ_ERROR"、"40001"） */
  code: string
  /** 响应描述信息 */
  message: string
  /** 响应数据主体 */
  data: T
}

/**
 * 分页查询参数
 * 对应 cn.refinex.base.request.PageRequest
 */
export interface PageParams {
  /** 当前页码（从 1 开始，默认 1） */
  currentPage?: number
  /** 每页条数（默认 10） */
  pageSize?: number
}

/**
 * 分页响应结构
 * 对应 cn.refinex.web.vo.PageResult<T>
 *
 * 继承自 ApiResponse<T[]>，额外携带分页元数据。
 */
export interface PageResponse<T = unknown> extends ApiResponse<T[]> {
  /** 总记录数 */
  total: number
  /** 总页数 */
  totalPage: number
  /** 当前页码 */
  page: number
  /** 每页条数 */
  size: number
}
