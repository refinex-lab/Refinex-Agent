import { MessageSquare, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SidebarToggleIcon } from '@/components/icons/SidebarToggleIcon'
import { useAuthStore } from '@/stores/auth'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const loginUser = useAuthStore((s) => s.loginUser)
  const displayName = loginUser?.displayName || loginUser?.nickname || '用户'
  const avatarUrl = loginUser?.avatarUrl

  return (
    <aside
      className={`flex flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300${collapsed ? ' cursor-pointer' : ''}`}
      style={{ width: collapsed ? 56 : 260 }}
      {...(collapsed ? { onClick: onToggle, role: 'button' } : {})}
    >
      {/* 顶部区域 */}
      <div className="flex h-14 items-center justify-between px-3">
        {collapsed ? (
          <img
            src="/logo.svg"
            alt="Refinex"
            className="size-8 rounded-lg p-0.5 transition-colors hover:bg-sidebar-accent"
          />
        ) : (
          <>
            <img src="/logo.svg" alt="Refinex" className="size-8" />
            <Button variant="ghost" size="icon" className="size-8" onClick={onToggle}>
              <SidebarToggleIcon className="size-4" />
            </Button>
          </>
        )}
      </div>

      {/* 新建对话按钮 */}
      <div className="px-3 pb-2">
        {collapsed ? (
          <Button variant="ghost" size="icon" className="size-8">
            <Plus className="size-4" />
          </Button>
        ) : (
          <div className="flex h-9 items-center gap-2 rounded-lg bg-sidebar-accent px-3 text-sm text-sidebar-foreground/60">
            <Plus className="size-4 shrink-0" />
            新建对话
          </div>
        )}
      </div>

      {/* 中间区域 - 历史列表 */}
      <div className="flex-1 overflow-y-auto px-3 py-2">
        {collapsed ? (
          <div className="flex flex-col items-center gap-2">
            <Button variant="ghost" size="icon" className="size-8">
              <MessageSquare className="size-4" />
            </Button>
          </div>
        ) : (
          <div className="space-y-1.5">
            <p className="px-2 text-xs font-medium text-muted-foreground">今天</p>
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-9 rounded-lg bg-sidebar-accent px-3 text-sm leading-9 text-sidebar-foreground/60"
              >
                对话记录 {i + 1}
              </div>
            ))}
            <p className="mt-3 px-2 text-xs font-medium text-muted-foreground">昨天</p>
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-9 rounded-lg bg-sidebar-accent px-3 text-sm leading-9 text-sidebar-foreground/60"
              >
                对话记录 {i + 6}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 底部区域 - 用户信息 */}
      <div className="border-t border-sidebar-border p-3">
        {collapsed ? (
          <Avatar className="size-8">
            {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} />}
            <AvatarFallback className="text-xs">
              {displayName.charAt(0)}
            </AvatarFallback>
          </Avatar>
        ) : (
          <div className="flex items-center gap-3 rounded-lg p-2.5 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent">
            <Avatar className="size-8 shrink-0">
              {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} />}
              <AvatarFallback className="text-xs">
                {displayName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <span className="truncate">{displayName}</span>
          </div>
        )}
      </div>
    </aside>
  )
}
