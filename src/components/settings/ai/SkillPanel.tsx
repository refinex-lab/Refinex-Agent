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
import { useSkills } from '@/hooks/use-ai-data'
import { SkillForm } from './SkillForm'
import type { Skill } from '@/services/modules/ai'

export function SkillPanel() {
  const { items, loading, handleCreate, handleUpdate, handleDelete } =
    useSkills()
  const [keyword, setKeyword] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editItem, setEditItem] = useState<Skill | null>(null)
  const [deleteItem, setDeleteItem] = useState<Skill | null>(null)

  const filtered = items.filter(
    (i) =>
      i.skillName.includes(keyword) || i.skillCode.includes(keyword),
  )

  const openCreate = () => {
    setEditItem(null)
    setFormOpen(true)
  }

  const openEdit = (item: Skill) => {
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
          placeholder="搜索技能..."
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
          <EmptyTitle>暂无技能</EmptyTitle>
          <EmptyDescription>点击"新建"创建第一个技能</EmptyDescription>
        </Empty>
      ) : (
        <ScrollArea className="flex-1">
          <div className="flex flex-col gap-2 p-1">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-lg border p-3"
              >
                {item.icon && (
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-sm">
                    {item.icon}
                  </div>
                )}
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium">
                      {item.skillName}
                    </span>
                    <Badge
                      variant={item.status === 1 ? 'default' : 'outline'}
                    >
                      {item.status === 1 ? '启用' : '停用'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="truncate">
                      {item.description || item.skillCode}
                    </span>
                    {(item.toolIds?.length > 0 ||
                      item.knowledgeBaseIds?.length > 0) && (
                      <>
                        <span>·</span>
                        {item.toolIds?.length > 0 && (
                          <span>{item.toolIds.length}工具</span>
                        )}
                        {item.knowledgeBaseIds?.length > 0 && (
                          <span>{item.knowledgeBaseIds.length}知识库</span>
                        )}
                      </>
                    )}
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

      <SkillForm
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
              确定要删除技能「{deleteItem?.skillName}」吗？此操作不可撤销。
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
