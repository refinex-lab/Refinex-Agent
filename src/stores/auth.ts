import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { LoginUser, LoginParams, LoginResult } from '@/services/modules/auth'

// ── Types ───────────────────────────────────────────────

interface AuthState {
  token: string | null
  loginUser: LoginUser | null
  permissions: string[]
  loading: boolean
}

interface AuthActions {
  login: (params: LoginParams) => Promise<void>
  logout: () => Promise<void>
  fetchUser: () => Promise<void>
  isLoggedIn: () => boolean
  hasPermission: (code: string) => boolean
  _reset: () => void
}

type AuthStore = AuthState & AuthActions

// ── Initial state ───────────────────────────────────────

const initialState: AuthState = {
  token: null,
  loginUser: null,
  permissions: [],
  loading: false,
}

// ── Store ───────────────────────────────────────────────

export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        async login(params) {
          const { authApi } = await import('@/services')
          const result: LoginResult = await authApi.login(params)
          set({
            token: result.token.tokenValue,
            loginUser: result.loginUser,
            permissions: result.loginUser.permissionCodes ?? [],
          }, false, 'login')
        },

        async logout() {
          try {
            const { authApi } = await import('@/services')
            await authApi.logout()
          } catch {
            // 静默处理，无论成功与否都清除本地状态
          }
          get()._reset()
        },

        async fetchUser() {
          set({ loading: true }, false, 'fetchUser/start')
          try {
            const { authApi } = await import('@/services')
            const loginUser = await authApi.getCurrentUser()
            set({
              loginUser,
              permissions: loginUser.permissionCodes ?? [],
              loading: false,
            }, false, 'fetchUser/success')
          } catch {
            get()._reset()
          }
        },

        isLoggedIn() {
          return !!get().token
        },

        hasPermission(code) {
          return get().permissions.includes(code)
        },

        _reset() {
          set(initialState, false, 'reset')
        },
      }),
      {
        name: 'refinex-auth',
        partialize: (state) => ({ token: state.token }),
      },
    ),
    { name: 'AuthStore', enabled: import.meta.env.DEV },
  ),
)
