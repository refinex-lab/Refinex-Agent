import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Spinner } from '@/components/ui/spinner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Empty,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from '@/components/ui/empty'
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
import { useMcpServers } from '@/hooks/use-ai-data'
import { McpServerForm } from './McpServerForm'
import type { McpServer } from '@/services/modules/ai'

export function McpServerPanel() {
  const { items, loading, handleCreate, handleUpdate, handleDelete } =
    useMcpServers()
  const [keyword, setKeyword] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [formOpen, setFormOpen] = useState(false)
  const [editItem, setEditItem] = useState<McpServer | null>(null)
  const [deleteItem, setDeleteItem] = useState<McpServer | null>(null)

  const filtered = items.filter((i) => {
    const matchKeyword =
      i.serverName.includes(keyword) || i.serverCode.includes(keyword)
    const matchType =
      typeFilter === 'all' || i.transportType === typeFilter
    return matchKeyword && matchType
  })

  const openCreate = () => {
    setEditItem(null)
    setFormOpen(true)
  }

  const openEdit = (item: McpServer) => {
    setEditItem(item)
    setFormOpen(true)
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner className="size-6" />
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-center gap-2">
        <Input
          placeholder="搜索服务器..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="flex-1"
        />
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部类型</SelectItem>
            <SelectItem value="stdio">stdio</SelectItem>
            <SelectItem value="sse">sse</SelectItem>
          </SelectContent>
        </Select>
        <Button size="sm" onClick={openCreate}>
          <Plus className="mr-1 size-4" />
          新建
        </Button>
      </div>

      {filtered.length === 0 ? (
        <Empty className="flex-1 border-none">
          <EmptyMedia variant="icon">
            <Plus className="size-5" />
          </EmptyMedia>
          <EmptyTitle>暂无 MCP 服务器</EmptyTitle>
          <EmptyDescription>点击"新建"添加第一个服务器</EmptyDescription>
        </Empty>
      ) : (
        <ScrollArea className="flex-1">
          <div className="flex flex-col gap-2 p-1">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-lg border p-3"
              >
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium">
                      {item.serverName}
                    </span>
                    <Badge variant="secondary">{item.transportType}</Badge>
                    <Badge
                      variant={item.status === 1 ? 'default' : 'outline'}
                    >
                      {item.status === 1 ? '启用' : '停用'}
                    </Badge>
                  </div>
                  <div className="truncate text-xs text-muted-foreground">
                    {item.transportType === 'stdio'
                      ? `command: ${item.command}${item.args ? ' ' + item.args : ''}`
                      : item.endpointUrl}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEdit(item)}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteItem(item)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}

      <McpServerForm
        open={formOpen}
        onOpenChange={setFormOpen}
        editItem={editItem}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
      />

      <AlertDialog
        open={!!deleteItem}
        onOpenChange={(open) => !open && setDeleteItem(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除 MCP 服务器「{deleteItem?.serverName}」吗？此操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                if (deleteItem) {
                  handleDelete(deleteItem.id)
                  setDeleteItem(null)
                }
              }}
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
