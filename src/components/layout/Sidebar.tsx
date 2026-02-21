import { useState } from 'react'
import { MessageSquare, Plus, Sparkles, Settings, CircleHelp, LogOut, BookOpen, MessageCircleQuestion, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SidebarToggleIcon } from '@/components/icons/SidebarToggleIcon'
import { useAuthStore } from '@/stores/auth'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SettingsDialog } from '@/components/settings/SettingsDialog'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const loginUser = useAuthStore((s) => s.loginUser)
  const logout = useAuthStore((s) => s.logout)
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            {collapsed ? (
              <button type="button" className="cursor-pointer">
                <Avatar className="size-8">
                  {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} />}
                  <AvatarFallback className="text-xs">
                    {displayName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </button>
            ) : (
              <button
                type="button"
                className="flex w-full cursor-pointer items-center gap-3 rounded-lg p-2.5 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent"
              >
                <Avatar className="size-8 shrink-0">
                  {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} />}
                  <AvatarFallback className="text-xs">
                    {displayName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate">{displayName}</span>
              </button>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="top"
            align="start"
            className="mb-1 w-[240px]"
          >
            <DropdownMenuItem className="gap-3 py-2.5">
              <Sparkles className="size-4" />
              个性化
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-3 py-2.5" onClick={() => setSettingsOpen(true)}>
              <Settings className="size-4" />
              设置
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="gap-3 py-2.5">
                <CircleHelp className="size-4" />
                帮助
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent sideOffset={8}>
                <DropdownMenuItem className="gap-3 py-2.5" asChild>
                  <a href="https://github.com/refinex-lab/Refinex-Agent/wiki" target="_blank" rel="noopener noreferrer">
                    <BookOpen className="size-4" />
                    帮助文档
                    <ExternalLink className="ml-auto size-3 text-muted-foreground" />
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-3 py-2.5" asChild>
                  <a href="https://github.com/refinex-lab/Refinex-Agent/issues/new" target="_blank" rel="noopener noreferrer">
                    <MessageCircleQuestion className="size-4" />
                    意见反馈
                    <ExternalLink className="ml-auto size-3 text-muted-foreground" />
                  </a>
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-3 py-2.5" onClick={() => logout()}>
              <LogOut className="size-4" />
              退出登录
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </aside>
  )
}
