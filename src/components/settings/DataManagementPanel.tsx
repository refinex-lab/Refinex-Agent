import { useState } from 'react'
import { Archive, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
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
import { ArchivedChatsDialog } from './ArchivedChatsDialog'

interface DataManagementPanelProps {
  onCloseSettings?: () => void
}

export function DataManagementPanel({ onCloseSettings }: DataManagementPanelProps) {
  const [archivedOpen, setArchivedOpen] = useState(false)
  const [archiveAllOpen, setArchiveAllOpen] = useState(false)
  const [deleteAllOpen, setDeleteAllOpen] = useState(false)
  const [archiveAllLoading, setArchiveAllLoading] = useState(false)
  const [deleteAllLoading, setDeleteAllLoading] = useState(false)

  const fetchConversations = useConversationStore((s) => s.fetchConversations)

  const handleArchiveAll = async () => {
    setArchiveAllLoading(true)
    try {
      const { aiApi } = await import('@/services')
      await aiApi.archiveAllConversations()
      toast.success('已归档所有聊天')
      setArchiveAllOpen(false)
      await fetchConversations(true)
    } catch {
      // 全局拦截器已处理
    } finally {
      setArchiveAllLoading(false)
    }
  }

  const handleDeleteAll = async () => {
    setDeleteAllLoading(true)
    try {
      const { aiApi } = await import('@/services')
      await aiApi.deleteAllConversations()
      toast.success('已删除所有聊天')
      setDeleteAllOpen(false)
      useConversationStore.getState().setActiveConversation(null)
      await fetchConversations(true)
    } catch {
      // 全局拦截器已处理
    } finally {
      setDeleteAllLoading(false)
    }
  }

  return (
    <>
      <div className="space-y-1">
        {/* 已归档的聊天 */}
        <div className="flex items-center justify-between rounded-lg px-1 py-3">
          <div className="flex items-center gap-3">
            <Archive className="size-4 text-muted-foreground" />
            <span className="text-sm">已归档的聊天</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => setArchivedOpen(true)}>
            管理
          </Button>
        </div>

        {/* 归档所有聊天 */}
        <div className="flex items-center justify-between rounded-lg px-1 py-3">
          <div className="flex items-center gap-3">
            <Archive className="size-4 text-muted-foreground" />
            <span className="text-sm">归档所有聊天</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => setArchiveAllOpen(true)}>
            全部归档
          </Button>
        </div>

        {/* 删除所有聊天 */}
        <div className="flex items-center justify-between rounded-lg px-1 py-3">
          <div className="flex items-center gap-3">
            <Trash2 className="size-4 text-muted-foreground" />
            <span className="text-sm">删除所有聊天</span>
          </div>
          <Button variant="destructive" size="sm" onClick={() => setDeleteAllOpen(true)}>
            全部删除
          </Button>
        </div>
      </div>

      {/* 已归档聊天管理弹窗 */}
      <ArchivedChatsDialog open={archivedOpen} onOpenChange={setArchivedOpen} onCloseSettings={onCloseSettings} />

      {/* 归档所有确认 */}
      <AlertDialog open={archiveAllOpen} onOpenChange={setArchiveAllOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>归档所有聊天</AlertDialogTitle>
            <AlertDialogDescription>
              确定要归档所有进行中的聊天吗？归档后的聊天可以在此处管理和恢复。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleArchiveAll} disabled={archiveAllLoading}>
              {archiveAllLoading ? '归档中...' : '确认归档'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 删除所有确认 */}
      <AlertDialog open={deleteAllOpen} onOpenChange={setDeleteAllOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>删除所有聊天</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除所有聊天吗？此操作无法撤销，所有对话记录将被永久删除。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleDeleteAll} disabled={deleteAllLoading}>
              {deleteAllLoading ? '删除中...' : '确认删除'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
