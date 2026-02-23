import { useState } from 'react'
import { Plus, Pencil, Trash2, Shield } from 'lucide-react'
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useTools } from '@/hooks/use-ai-data'
import { ToolForm } from './ToolForm'
import type { Tool } from '@/services/modules/ai'

const TOOL_TYPE_BADGE: Record<string, 'default' | 'secondary' | 'outline'> = {
  FUNCTION: 'default',
  MCP: 'secondary',
  HTTP: 'outline',
}

export function ToolPanel() {
  const { items, loading, handleCreate, handleUpdate, handleDelete } =
    useTools()
  const [keyword, setKeyword] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [formOpen, setFormOpen] = useState(false)
  const [editItem, setEditItem] = useState<Tool | null>(null)
  const [deleteItem, setDeleteItem] = useState<Tool | null>(null)

  const filtered = items.filter((i) => {
    const matchKeyword =
      i.toolName.includes(keyword) || i.toolCode.includes(keyword)
    const matchType = typeFilter === 'all' || i.toolType === typeFilter
    return matchKeyword && matchType
  })

  const openCreate = () => {
    setEditItem(null)
    setFormOpen(true)
  }

  const openEdit = (item: Tool) => {
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
          placeholder="搜索工具..."
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
            <SelectItem value="FUNCTION">FUNCTION</SelectItem>
            <SelectItem value="MCP">MCP</SelectItem>
            <SelectItem value="HTTP">HTTP</SelectItem>
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
          <EmptyTitle>暂无工具</EmptyTitle>
          <EmptyDescription>点击"新建"创建第一个工具</EmptyDescription>
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
                      {item.toolName}
                    </span>
                    <Badge variant={TOOL_TYPE_BADGE[item.toolType] || 'outline'}>
                      {item.toolType}
                    </Badge>
                    {item.requireConfirm === 1 && (
                      <Shield className="size-3.5 text-amber-500" />
                    )}
                    <Badge
                      variant={item.status === 1 ? 'default' : 'outline'}
                    >
                      {item.status === 1 ? '启用' : '停用'}
                    </Badge>
                  </div>
                  <div className="truncate text-xs text-muted-foreground">
                    {item.description || item.toolCode}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {item.isBuiltin === 1 ? (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span>
                            <Button variant="ghost" size="icon" disabled>
                              <Pencil className="size-4" />
                            </Button>
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>内置工具不可修改</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEdit(item)}
                    >
                      <Pencil className="size-4" />
                    </Button>
                  )}
                  {item.isBuiltin === 1 ? (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span>
                            <Button variant="ghost" size="icon" disabled>
                              <Trash2 className="size-4" />
                            </Button>
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>内置工具不可删除</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteItem(item)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}

      <ToolForm
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
              确定要删除工具「{deleteItem?.toolName}」吗？此操作不可撤销。
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
