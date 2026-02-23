import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Spinner } from '@/components/ui/spinner'
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
import { usePromptTemplates } from '@/hooks/use-ai-data'
import { PromptTemplateForm } from './PromptTemplateForm'
import type { PromptTemplate } from '@/services/modules/ai'

export function PromptTemplatePanel() {
  const { items, loading, handleCreate, handleUpdate, handleDelete } =
    usePromptTemplates()
  const [keyword, setKeyword] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editItem, setEditItem] = useState<PromptTemplate | null>(null)
  const [deleteItem, setDeleteItem] = useState<PromptTemplate | null>(null)

  const filtered = items.filter(
    (i) =>
      i.promptName.includes(keyword) || i.promptCode.includes(keyword),
  )

  const openCreate = () => {
    setEditItem(null)
    setFormOpen(true)
  }

  const openEdit = (item: PromptTemplate) => {
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
          placeholder="搜索模板..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="flex-1"
        />
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
          <EmptyTitle>暂无 Prompt 模板</EmptyTitle>
          <EmptyDescription>点击"新建"创建第一个模板</EmptyDescription>
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
                  <span className="truncate text-sm font-medium">
                    {item.promptName}
                  </span>
                  <div className="text-xs text-muted-foreground">
                    {item.promptCode}
                    {item.language && ` · ${item.language}`}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  {item.category && (
                    <Badge variant="secondary">{item.category}</Badge>
                  )}
                  <Badge
                    variant={item.status === 1 ? 'default' : 'outline'}
                  >
                    {item.status === 1 ? '启用' : '停用'}
                  </Badge>
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
                        <TooltipContent>内置模板不可修改</TooltipContent>
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
                        <TooltipContent>内置模板不可删除</TooltipContent>
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

      <PromptTemplateForm
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
              确定要删除模板「{deleteItem?.promptName}」吗？此操作不可撤销。
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
