import { createBrowserRouter, createHashRouter } from 'react-router'
import { AuthLayout } from '@/components/auth/auth-layout'
import { AuthGuard } from '@/router/AuthGuard'
import { MainLayout } from '@/layouts/MainLayout'
import { SidebarOnlyLayout } from '@/layouts/SidebarOnlyLayout'

// Electron 生产模式从 file:// 加载，需使用 HashRouter
const createRouter = window.electronAPI?.isElectron
  ? createHashRouter
  : createBrowserRouter

export const router = createRouter([
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', lazy: () => import('@/pages/auth/Login') },
      { path: '/register', lazy: () => import('@/pages/auth/Register') },
      { path: '/forgot-password', lazy: () => import('@/pages/auth/ForgotPassword') },
    ],
  },
  {
    element: <AuthGuard />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { path: '/', lazy: () => import('@/App') },
        ],
      },
      {
        element: <SidebarOnlyLayout />,
        children: [
          { path: '/knowledge-base', lazy: () => import('@/pages/knowledge-base/KnowledgeBase') },
          { path: '/knowledge-base/:kbId', lazy: () => import('@/pages/knowledge-base/KnowledgeBase') },
        ],
      },
    ],
  },
  { path: '*', lazy: () => import('@/pages/NotFound') },
])
