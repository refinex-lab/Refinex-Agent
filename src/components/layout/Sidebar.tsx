import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router'
import { SquarePen, Search, ImageIcon, LayoutGrid, Sparkles, Settings, CircleHelp, LogOut, BookOpen, MessageCircleQuestion, ExternalLink, LibraryBig } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SidebarToggleIcon } from '@/components/icons/SidebarToggleIcon'
import { useAuthStore } from '@/stores/auth'
import { useConversationStore } from '@/stores/conversation'
import { groupConversationsByTime } from '@/lib/time-group'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Kbd } from '@/components/ui/kbd'
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
import { SearchDialog } from '@/components/layout/SearchDialog'
import { ConversationItem } from '@/components/layout/ConversationItem'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const isKbActive = location.pathname.startsWith('/knowledge-base')
  const loginUser = useAuthStore((s) => s.loginUser)
  const logout = useAuthStore((s) => s.logout)
  const displayName = loginUser?.displayName || loginUser?.nickname || '用户'
  const avatarUrl = loginUser?.avatarUrl

  const conversations = useConversationStore((s) => s.conversations)
  const activeConversationId = useConversationStore((s) => s.activeConversationId)
  const loading = useConversationStore((s) => s.loading)
  const loadingMore = useConversationStore((s) => s.loadingMore)
  const hasMore = useConversationStore((s) => s.hasMore)
  const fetchConversations = useConversationStore((s) => s.fetchConversations)
  const loadMore = useConversationStore((s) => s.loadMore)
  const setActiveConversation = useConversationStore((s) => s.setActiveConversation)
  const setPlaceholderMode = useConversationStore((s) => s.setPlaceholderMode)

  useEffect(() => {
    fetchConversations()
  }, [fetchConversations])

  const groups = groupConversationsByTime(conversations)

  const handleNewChat = useCallback(() => {
    setActiveConversation(null)
    setPlaceholderMode(null)
  }, [setActiveConversation, setPlaceholderMode])

  const handleOpenSearch = useCallback(() => {
    setSearchOpen(true)
  }, [])

  // 全局快捷键：Cmd+K 搜索聊天，Shift+Cmd+O 新聊天
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.metaKey && e.key === 'k') {
        e.preventDefault()
        handleOpenSearch()
      }
      if (e.metaKey && e.shiftKey && e.key === 'o') {
        e.preventDefault()
        handleNewChat()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handleNewChat, handleOpenSearch])

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

      {/* 功能按钮 */}
      <div className="px-2 pb-2">
        {collapsed ? (
          <TooltipProvider>
            <div className="flex flex-col items-center gap-0.5">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-8" onClick={(e) => { e.stopPropagation(); handleNewChat() }}>
                    <SquarePen className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">新聊天</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-8" onClick={(e) => { e.stopPropagation(); setSearchOpen(true) }}>
                    <Search className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">搜索聊天</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-8" onClick={(e) => { e.stopPropagation(); setPlaceholderMode('image') }}>
                    <ImageIcon className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">图片</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant={isKbActive ? 'secondary' : 'ghost'} size="icon" className="size-8" onClick={(e) => { e.stopPropagation(); navigate('/knowledge-base') }}>
                    <LibraryBig className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">知识库</TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        ) : (
          <div className="flex flex-col gap-0.5">
            <button
              type="button"
              className="group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent"
              onClick={handleNewChat}
            >
              <SquarePen className="size-4 shrink-0" />
              <span>新聊天</span>
              <Kbd className="ml-auto hidden group-hover:inline-flex">⇧⌘O</Kbd>
            </button>
            <button
              type="button"
              className="group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="size-4 shrink-0" />
              <span>搜索聊天</span>
              <Kbd className="ml-auto hidden group-hover:inline-flex">⌘K</Kbd>
            </button>
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent"
              onClick={() => setPlaceholderMode('image')}
            >
              <ImageIcon className="size-4 shrink-0" />
              <span>图片</span>
            </button>
            <button
              type="button"
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${isKbActive ? 'bg-sidebar-accent text-sidebar-foreground' : 'text-sidebar-foreground hover:bg-sidebar-accent'}`}
              onClick={() => navigate('/knowledge-base')}
            >
              <LibraryBig className="size-4 shrink-0" />
              <span>知识库</span>
            </button>
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent"
              onClick={() => setPlaceholderMode('app')}
            >
              <LayoutGrid className="size-4 shrink-0" />
              <span>应用</span>
            </button>
          </div>
        )}
      </div>

      {/* 对话列表（展开态） */}
      {!collapsed && (
        <>
          {!loading && conversations.length > 0 && (
            <div className="flex items-center gap-2 px-4 py-1.5">
              <Separator className="flex-1" />
              <span className="shrink-0 text-xs text-muted-foreground">你的聊天</span>
              <Separator className="flex-1" />
            </div>
          )}

          <ScrollArea className="flex-1 px-2">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Spinner className="size-5" />
              </div>
            ) : conversations.length > 0 ? (
              <div className="space-y-3 pb-2">
                {groups.map((group) => (
                  <div key={group.label}>
                    <p className="px-2 pb-1 text-xs font-medium text-muted-foreground">
                      {group.label}
                    </p>
                    <div className="space-y-0.5">
                      {group.conversations.map((conv) => (
                        <ConversationItem
                          key={conv.conversationId}
                          conversation={conv}
                          isActive={activeConversationId === conv.conversationId}
                          onSelect={setActiveConversation}
                        />
                      ))}
                    </div>
                  </div>
                ))}

                {/* 加载更多 */}
                {hasMore && (
                  <div className="flex justify-center py-2">
                    {loadingMore ? (
                      <Spinner className="size-4" />
                    ) : (
                      <button
                        type="button"
                        className="text-xs text-muted-foreground hover:text-foreground"
                        onClick={loadMore}
                      >
                        加载更多
                      </button>
                    )}
                  </div>
                )}
              </div>
            ) : null}
          </ScrollArea>
        </>
      )}

      {/* 折叠态占位 */}
      {collapsed && <div className="flex-1" />}

      {/* 底部区域 - 用户信息 */}
      <div className="border-t border-sidebar-border p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            {collapsed ? (
              <button type="button" className="cursor-pointer" onClick={(e) => e.stopPropagation()}>
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
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </aside>
  )
}
