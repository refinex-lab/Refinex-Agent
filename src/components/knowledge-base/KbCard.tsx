import { useState } from 'react'
import { MoreHorizontal, Pencil, Trash2, FileText } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import type { KnowledgeBase } from '@/services/modules/ai'
import { useKbStore } from '@/stores/knowledge-base'
import { KbCreateDialog } from './KbCreateDialog'

interface KbCardProps {
  kb: KnowledgeBase
  onClick: () => void
  onRefresh: () => void
}

export function KbCard({ kb, onClick, onRefresh }: KbCardProps) {
  const [editOpen, setEditOpen] = useState(false)
  const hasEmbeddingModel = useKbStore((s) => s.hasEmbeddingModel)

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('确定要删除该知识库吗？删除后不可恢复。')) return
    try {
      const { aiApi } = await import('@/services')
      await aiApi.deleteKnowledgeBase(kb.id)
      toast.success('知识库已删除')
      onRefresh()
    } catch {
      // handled by interceptor
    }
  }

  return (
    <>
      <div
        className="group relative cursor-pointer rounded-lg border bg-card p-4 transition-colors hover:bg-accent/50"
        onClick={onClick}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="truncate text-sm font-medium">{kb.kbName}</h3>
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
              {kb.description || '暂无描述'}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="ml-2 shrink-0 rounded-md p-1 opacity-0 transition-opacity hover:bg-accent group-hover:opacity-100"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="size-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setEditOpen(true) }}>
                <Pencil className="mr-2 size-4" />
                编辑
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={handleDelete}>
                <Trash2 className="mr-2 size-4" />
                删除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            <FileText className="mr-1 size-3" />
            {kb.docCount ?? 0} 篇文档
          </Badge>
          {hasEmbeddingModel && kb.vectorized === 1 && (
            <Badge variant="outline" className="text-xs">已向量化</Badge>
          )}
        </div>
      </div>

      <KbCreateDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        editKb={kb}
        onCreated={onRefresh}
      />
    </>
  )
}
