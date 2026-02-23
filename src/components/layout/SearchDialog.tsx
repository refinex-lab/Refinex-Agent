import { useState, useMemo } from 'react'
import { SquarePen, Pin, X } from 'lucide-react'
import { useConversationStore } from '@/stores/conversation'
import { groupConversationsByTime } from '@/lib/time-group'
import { Dialog as DialogPrimitive } from 'radix-ui'
import { cn } from '@/lib/utils'

interface SearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const conversations = useConversationStore((s) => s.conversations)
  const setActiveConversation = useConversationStore((s) => s.setActiveConversation)
  const setPlaceholderMode = useConversationStore((s) => s.setPlaceholderMode)
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search.trim()) return conversations
    const keyword = search.trim().toLowerCase()
    return conversations.filter((c) => c.title.toLowerCase().includes(keyword))
  }, [conversations, search])

  const groups = groupConversationsByTime(filtered)

  const handleSelect = (id: string) => {
    setActiveConversation(id)
    onOpenChange(false)
    setSearch('')
  }

  const handleNewChat = () => {
    setActiveConversation(null)
    setPlaceholderMode(null)
    onOpenChange(false)
    setSearch('')
  }

  const handleClose = () => {
    onOpenChange(false)
    setSearch('')
  }

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v)
        if (!v) setSearch('')
      }}
    >
      <DialogPrimitive.Portal>
        {/* 透明遮罩层（点击关闭，无背景色） */}
        <DialogPrimitive.Overlay className="fixed inset-0 z-50" />

        <DialogPrimitive.Content
          className={cn(
            'bg-background fixed top-[50%] left-[50%] z-50 flex translate-x-[-50%] translate-y-[-50%] flex-col gap-0 overflow-hidden rounded-2xl p-0 shadow-2xl outline-none border',
            'h-[min(560px,80vh)] w-full max-w-[min(700px,calc(100%-2rem))]',
            'data-[state=open]:animate-in data-[d]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 duration-200',
          )}
        >
          <DialogPrimitive.Title className="sr-only">搜索对话</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">搜索你的聊天记录</DialogPrimitive.Description>

          {/* 搜索输入框 */}
          <div className="flex items-center border-b px-5 py-4">
            <input
              type="text"
              className="flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground/60"
              placeholder="搜索聊天..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
            <button
              type="button"
              className="ml-3 flex size-7 shrink-0 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:text-foreground"
              onClick={handleClose}
            >
              <X className="size-5" />
            </button>
          </div>

          {/* 滚动列表区域 */}
          <div className="flex-1 overflow-y-auto px-3 py-2">
            {/* 新聊天 */}
            {!search.trim() && (
              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors hover:bg-accent"
                onClick={handleNewChat}
              >
                <SquarePen className="size-5 shrink-0" />
                <span className="font-medium">新聊天</span>
              </button>
            )}

            {/* 对话分组列表 */}
            {groups.length === 0 && search.trim() ? (
              <div className="py-16 text-center text-sm text-muted-foreground">
                没有找到相关对话
              </div>
            ) : (
              groups.map((group) => (
                <div key={group.label} className="mt-2">
                  <div className="sticky top-0 z-10 bg-background px-3 py-1.5">
                    <span className="text-xs font-medium text-muted-foreground">
                      {group.label}
                    </span>
                  </div>
                  {group.conversations.map((conv) => (
                    <button
                      key={conv.conversationId}
                      type="button"
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors hover:bg-accent"
                      onClick={() => handleSelect(conv.conversationId)}
                    >
                      <span className="truncate">{conv.title}</span>
                      {conv.pinned === 1 && (
                        <Pin className="ml-auto size-3.5 shrink-0 text-muted-foreground" />
                      )}
                    </button>
                  ))}
                </div>
              ))
            )}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
