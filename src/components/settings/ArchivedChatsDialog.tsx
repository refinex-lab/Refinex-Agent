import { useCallback, useEffect, useState } from 'react'
import { ArchiveRestore, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
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
import { useConversationStore } from '@/stores/conversation'
import type { Conversation } from '@/services/modules/ai'

interface ArchivedChatsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCloseSettings?: () => void
}

export function ArchivedChatsDialog({ open, onOpenChange, onCloseSettings }: ArchivedChatsDialogProps) {
  const [archivedChats, setArchivedChats] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  const fetchArchived = useCallback(async () => {
    setLoading(true)
    try {
      const { aiApi } = await import('@/services')
      const data = await aiApi.listConversations({ currentPage: 1, pageSize: 200, status: 2 })
      setArchivedChats(data.records ?? [])
    } catch {
      // 全局拦截器已处理
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (open) fetchArchived()
  }, [open, fetchArchived])

  const handleUnarchive = async (id: string) => {
    try {
      const { aiApi } = await import('@/services')
      await aiApi.toggleConversationArchive(id)
      setArchivedChats((prev) => prev.filter((c) => c.conversationId !== id))
      toast.success('已取消归档')
      await useConversationStore.getState().fetchConversations(true)
    } catch {
      // 全局拦截器已处理
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      const { aiApi } = await import('@/services')
      await aiApi.deleteConversation(deleteTarget)
      setArchivedChats((prev) => prev.filter((c) => c.conversationId !== deleteTarget))
      toast.success('已删除')
    } catch {
      // 全局拦截器已处理
    } finally {
      setDeleteTarget(null)
    }
  }

  const handleViewChat = (id: string) => {
    onOpenChange(false)
    setTimeout(() => {
      onCloseSettings?.()
      setTimeout(() => {
        useConversationStore.getState().setActiveConversation(id)
      }, 100)
    }, 150)
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-'
    try {
      return new Date(dateStr).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
    } catch {
      return dateStr
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>已归档的聊天</DialogTitle>
            <DialogDescription>管理你的归档对话</DialogDescription>
          </DialogHeader>

          {loading ? (
            <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
              加载中...
            </div>
          ) : archivedChats.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
              暂无归档的聊天
            </div>
          ) : (
            <>
              {/* 表头 */}
              <div className="flex items-center border-b px-3 pb-2 text-xs font-medium text-muted-foreground">
                <span className="flex-1">名称</span>
                <span className="w-28 shrink-0 text-right">创建日期</span>
                <span className="w-18 shrink-0" />
              </div>

              <ScrollArea className="max-h-[360px]">
                <div className="divide-y">
                  {archivedChats.map((chat) => (
                    <div
                      key={chat.conversationId}
                      className="flex items-center px-3 py-2.5"
                    >
                      <div className="min-w-0 flex-1">
                        <button
                          type="button"
                          className="block max-w-full truncate text-sm text-primary hover:underline text-left"
                          onClick={() => handleViewChat(chat.conversationId)}
                        >
                          {chat.title}
                        </button>
                      </div>
                      <span className="w-28 shrink-0 text-right text-xs text-muted-foreground">
                        {formatDate(chat.gmtCreate)}
                      </span>
                      <div className="flex w-18 items-center justify-end gap-0.5 shrink-0">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-7"
                                onClick={() => handleUnarchive(chat.conversationId)}
                              >
                                <ArchiveRestore className="size-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>取消归档</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-7 text-destructive hover:text-destructive"
                                onClick={() => setDeleteTarget(chat.conversationId)}
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>删除</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* 删除确认 */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>删除归档对话</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除这个归档对话吗？此操作无法撤销。
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
