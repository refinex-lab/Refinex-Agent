import { useEffect, useSyncExternalStore } from 'react'
import { Outlet, Navigate, useLocation } from 'react-router'
import { useAuthStore } from '@/stores/auth'
import { Loader2 } from 'lucide-react'

/** 订阅 zustand persist 水合状态 */
function useHasHydrated() {
  return useSyncExternalStore(
    (cb) => useAuthStore.persist.onFinishHydration(cb),
    () => useAuthStore.persist.hasHydrated(),
    () => false,
  )
}

function LoadingScreen() {
  return (
    <div className="flex h-svh items-center justify-center">
      <Loader2 className="text-muted-foreground size-8 animate-spin" />
    </div>
  )
}

export function AuthGuard() {
  const location = useLocation()
  const hydrated = useHasHydrated()
  const token = useAuthStore((s) => s.token)
  const loginUser = useAuthStore((s) => s.loginUser)
  const loading = useAuthStore((s) => s.loading)
  const fetchUser = useAuthStore((s) => s.fetchUser)

  useEffect(() => {
    if (hydrated && token && !loginUser && !loading) {
      fetchUser()
    }
  }, [hydrated, token, loginUser, loading, fetchUser])

  // persist 尚未水合
  if (!hydrated) return <LoadingScreen />

  // 无 token → 跳转登录
  if (!token) return <Navigate to="/login" state={{ from: location }} replace />

  // 正在加载用户信息
  if (!loginUser) return <LoadingScreen />

  return <Outlet />
}
