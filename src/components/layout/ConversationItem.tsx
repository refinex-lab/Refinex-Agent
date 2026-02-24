import { useState, useRef, useEffect } from 'react'
import { Pin, Pencil, Archive, Trash2, Ellipsis } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useConversationStore } from '@/stores/conversation'
import type { Conversation } from '@/services/modules/ai'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface ConversationItemProps {
  conversation: Conversation
  isActive: boolean
  onSelect: (id: string) => void
}

export function ConversationItem({ conversation, isActive, onSelect }: ConversationItemProps) {
  const [isRenaming, setIsRenaming] = useState(false)
  const [renameValue, setRenameValue] = useState('')
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const renameConversation = useConversationStore((s) => s.renameConversation)
  const deleteConversation = useConversationStore((s) => s.deleteConversation)
  const togglePin = useConversationStore((s) => s.togglePin)
  const archiveConversation = useConversationStore((s) => s.archiveConversation)

  const isPinned = conversation.pinned === 1

  useEffect(() => {
    if (isRenaming) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [isRenaming])

  const handleStartRename = () => {
    setRenameValue(conversation.title)
    setIsRenaming(true)
  }

  const handleSubmitRename = async () => {
    const trimmed = renameValue.trim()
    if (!trimmed || trimmed === conversation.title) {
      setIsRenaming(false)
      return
    }
    await renameConversation(conversation.conversationId, trimmed)
    toast.success('已重命名')
    setIsRenaming(false)
  }

  const handleCancelRename = () => {
    setIsRenaming(false)
  }

  const handleDelete = async () => {
    await deleteConversation(conversation.conversationId)
    toast.success('已删除')
    setDeleteOpen(false)
  }

  const handleTogglePin = async () => {
    await togglePin(conversation.conversationId)
    toast.success(isPinned ? '已取消置顶' : '已置顶')
  }

  const handleArchive = async () => {
    await archiveConversation(conversation.conversationId)
    toast.success('已归档', { description: '你可以在"设置"中查看归档的聊天' })
  }

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        className={cn(
          'group relative flex h-9 min-w-0 cursor-pointer items-center rounded-lg px-3 text-sm transition-colors',
          isActive
            ? 'bg-sidebar-accent text-sidebar-foreground'
            : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/50',
        )}
        onClick={() => !isRenaming && onSelect(conversation.conversationId)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !isRenaming) onSelect(conversation.conversationId)
        }}
      >
        {/* 置顶图标 */}
        {isPinned && !isRenaming && (
          <Pin className="mr-1.5 size-3 shrink-0 text-muted-foreground" />
        )}

        {/* 标题 / 重命名输入框 */}
        {isRenaming ? (
          <input
            ref={inputRef}
            className="h-6 w-full rounded border border-input bg-background px-1.5 text-sm outline-none"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSubmitRename()
              if (e.key === 'Escape') handleCancelRename()
              e.stopPropagation()
            }}
            onClick={(e) => e.stopPropagation()}
            onBlur={handleSubmitRename}
          />
        ) : (
          <span className="truncate">{conversation.title}</span>
        )}

        {/* 右侧渐变遮罩 + 操作按钮 */}
        {!isRenaming && (
          <div
            className={cn(
              'absolute right-0 top-0 flex h-full items-center gap-0.5 pr-1 pl-6',
              isActive
                ? 'bg-gradient-to-l from-sidebar-accent from-60% to-transparent'
                : 'bg-gradient-to-l from-sidebar from-60% to-transparent',
              'opacity-0 group-hover:opacity-100',
              menuOpen && 'opacity-100',
            )}
          >
            <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-6 shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Ellipsis className="size-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="right" align="start" className="w-44">
                <DropdownMenuItem className="gap-2" onClick={handleStartRename}>
                  <Pencil className="size-4" />
                  重命名
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2" onClick={handleTogglePin}>
                  <Pin className="size-4" />
                  {isPinned ? '取消置顶' : '置顶聊天'}
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2" onClick={handleArchive}>
                  <Archive className="size-4" />
                  归档
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="gap-2 text-destructive focus:text-destructive"
                  onClick={() => setDeleteOpen(true)}
                >
                  <Trash2 className="size-4" />
                  删除
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {/* 删除确认弹窗 */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>删除对话</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除「{conversation.title}」吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleDelete}>
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
