const TOKEN_KEY = 'refinex_token'

/** 获取 Token */
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

/** 设置 Token（登录成功后调用） */
export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

/** 移除 Token（退出登录时调用） */
export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}
