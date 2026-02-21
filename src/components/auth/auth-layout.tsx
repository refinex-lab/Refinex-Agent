import { Outlet, Navigate } from 'react-router'
import { env } from '@/config/env'
import { useAuthStore } from '@/stores/auth'

export function AuthLayout() {
  const token = useAuthStore((s) => s.token)

  if (token) return <Navigate to="/" replace />

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="relative flex flex-col gap-4 p-6 md:p-10 overflow-hidden">
        {/* 左上角渐变光晕 */}
        <div
          className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full opacity-30 blur-3xl"
          style={{ background: 'radial-gradient(circle, oklch(0.7 0.15 250), transparent 70%)' }}
        />
        {/* 右下角渐变光晕 */}
        <div
          className="pointer-events-none absolute -right-32 -bottom-32 h-96 w-96 rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, oklch(0.75 0.12 310), transparent 70%)' }}
        />

        <div className="relative flex justify-center gap-2 md:justify-start">
          <a href="/" className="flex items-center gap-2 font-medium">
            <div className="flex h-6 w-6 items-center justify-center">
              <img src="/logo.svg" alt={env.APP_NAME} className="h-6 w-6" />
            </div>
            {env.APP_NAME}
          </a>
        </div>
        <div className="relative flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <Outlet />
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <img
          src="/images/login-bg.jpg"
          alt="装饰图片"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  )
}
