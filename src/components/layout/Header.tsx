import { useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ModeToggle } from '@/components/mode-toggle'
import { SidebarToggleIcon } from '@/components/icons/SidebarToggleIcon'
import { GithubIcon } from '@/components/icons/GithubIcon'
import { useModelStore } from '@/stores/model'
import { useChatStore } from '@/stores/chat'
import { useConversationStore } from '@/stores/conversation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

function ConversationTitle() {
  const conversationId = useChatStore((s) => s.conversationId)
  const conversations = useConversationStore((s) => s.conversations)

  if (!conversationId) {
    return <div className="text-sm text-muted-foreground">新对话</div>
  }

  const conv = conversations.find((c) => c.conversationId === conversationId)
  return (
    <div className="max-w-[300px] truncate text-sm font-medium">
      {conv?.title || '对话'}
    </div>
  )
}

interface HeaderProps {
  onToggleSidebar: () => void
  sidebarCollapsed: boolean
}

export function Header({ onToggleSidebar, sidebarCollapsed }: HeaderProps) {
  const provisions = useModelStore((s) => s.provisions)
  const selectedProvisionId = useModelStore((s) => s.selectedProvisionId)
  const loading = useModelStore((s) => s.loading)
  const fetchProvisions = useModelStore((s) => s.fetchProvisions)
  const setSelectedProvision = useModelStore((s) => s.setSelectedProvision)

  useEffect(() => {
    fetchProvisions()
  }, [fetchProvisions])

  const selected = provisions.find((p) => p.id === selectedProvisionId)

  return (
    <header className="relative flex h-14 shrink-0 items-center justify-between bg-background px-4">
      {/* 左侧 */}
      <div className="flex items-center gap-2">
        {sidebarCollapsed && (
          <Button variant="ghost" size="icon" className="size-8" onClick={onToggleSidebar}>
            <SidebarToggleIcon className="size-4" />
          </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors hover:bg-muted"
    disabled={loading}
            >
              {selected ? (
                <>
                  <img
                    src={`/images/ai-providers/${selected.providerCode}.svg`}
                    alt={selected.providerCode}
                    className="size-5 shrink-0"
                  />
                  <span>{selected.modelName}</span>
                </>
              ) : (
                <span className="text-muted-foreground">
                  {loading ? '加载中...' : '选择模型'}
                </span>
              )}
              <ChevronDown className="size-3.5 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="max-h-80 w-64 overflow-y-auto">
            {provisions.map((p) => (
              <DropdownMenuItem
                key={p.id}
                className="gap-3 py-2.5"
                onClick={() => setSelectedProvision(p.id)}
              >
                <img
                  src={`/images/ai-providers/${p.providerCode}.svg`}
                  alt={p.providerCode}
                  className="size-4 shrink-0"
                />
                <span className="flex-1 truncate">{p.modelName}</span>
                {p.id === selectedProvisionId && (
                  <Check className="ml-auto size-4 shrink-0" />
                )}
              </DropdownMenuItem>
            ))}
            {provisions.length === 0 && !loading && (
              <div className="py-4 text-center text-sm text-muted-foreground">
                暂无可用模型
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 中间 - 对话标题（绝对定位居中） */}
      <div className="absolute inset-x-0 flex justify-center pointer-events-none">
        <div className="pointer-events-auto">
          <ConversationTitle />
        </div>
      </div>

      {/* 右侧 */}
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="size-8" asChild>
          <a href="https://github.com/refinex-lab/Refinex-Agent" target="_blank" rel="noopener noreferrer">
            <GithubIcon className="size-4" />
          </a>
        </Button>
        <ModeToggle />
      </div>
    </header>
  )
}
