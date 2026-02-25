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
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import type { KnowledgeBase } from '@/services/modules/ai'
import { useKbStore } from '@/stores/knowledge-base'
import { KbCreateDialog } from './KbCreateDialog'
import { getKbIcon } from './kb-icons'

interface KbCardProps {
  kb: KnowledgeBase
  viewMode: 'grid' | 'list'
  onClick: () => void
  onRefresh: () => void
}

export function KbCard({ kb, viewMode, onClick, onRefresh }: KbCardProps) {
  const [editOpen, setEditOpen] = useState(false)
  const hasEmbeddingModel = useKbStore((s) => s.hasEmbeddingModel)
  const Icon = getKbIcon(kb.icon)

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

  const menuButton = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="shrink-0 rounded-md p-1 opacity-0 transition-opacity hover:bg-accent group-hover:opacity-100"
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
  )

  if (viewMode === 'list') {
    return (
      <>
        <div
          className="group flex cursor-pointer items-center gap-3 rounded-lg border bg-card px-4 py-3 transition-all hover:bg-accent/50 hover:shadow-sm"
          onClick={onClick}
        >
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="size-4.5 text-primary" />
          </div>
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <span className="shrink-0 text-sm font-medium">{kb.kbName}</span>
            {kb.description && (
              <span className="truncate text-xs text-muted-foreground">{kb.description}</span>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="text-xs text-muted-foreground/60">{kb.kbCode}</span>
            <Badge variant="secondary" className="text-xs">
              <FileText className="mr-1 size-3" />
              {kb.docCount ?? 0} 篇文档
            </Badge>
            {hasEmbeddingModel && kb.vectorized === 1 && (
              <Badge variant="outline" className="text-xs text-emerald-600 dark:text-emerald-400">已向量化</Badge>
            )}
            {menuButton}
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

  return (
    <>
      <div
        className={cn(
          'group relative cursor-pointer rounded-lg border bg-card p-4 transition-all',
          'hover:bg-accent/50 hover:shadow-sm',
        )}
        onClick={onClick}
      >
        <div className="flex items-start justify-between">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="size-5 text-primary" />
          </div>
          {menuButton}
        </div>
        <div className="mt-3 min-w-0">
          <h3 className="truncate text-sm font-medium">{kb.kbName}</h3>
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {kb.description || '暂无描述'}
          </p>
        </div>
        <div className="mt-3 flex items-center gap-2 border-t pt-3">
          <span className="truncate text-xs text-muted-foreground/60">{kb.kbCode}</span>
          <div className="flex-1" />
          <Badge variant="secondary" className="shrink-0 text-xs">
            <FileText className="mr-1 size-3" />
            {kb.docCount ?? 0} 篇文档
          </Badge>
          {hasEmbeddingModel && kb.vectorized === 1 && (
            <Badge variant="outline" className="shrink-0 text-xs text-emerald-600 dark:text-emerald-400">已向量化</Badge>
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
