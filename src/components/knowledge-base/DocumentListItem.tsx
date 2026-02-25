import { useState, useRef, useEffect } from 'react'
import { FileText, MoreHorizontal, Pencil, Trash2, Zap, ZapOff, Check, X, Download, FileDown, FileType, FileImage } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
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
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { toast } from 'sonner'
import type { Document } from '@/services/modules/ai'
import { exportDocument, isMarkdownDoc, type ExportFormat } from './export-document'

import { useKbStore } from '@/stores/knowledge-base'

interface DocumentListItemProps {
  kbId: number
  doc: Document
  isSelected: boolean
  onSelect: () => void
  onRefresh: () => void
  sortableId?: string
}

export function DocumentListItem({ kbId, doc, isSelected, onSelect, onRefresh, sortableId }: DocumentListItemProps) {
  const hasEmbeddingModel = useKbStore((s) => s.hasEmbeddingModel)
  const [renaming, setRenaming] = useState(false)
  const [renameName, setRenameName] = useState('')
  const [submittingRename, setSubmittingRename] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const renameInputRef = useRef<HTMLInputElement>(null)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: sortableId ?? `doc-${doc.id}`,
    data: { type: 'DOCUMENT' as const, doc, folderId: doc.folderId || 0 },
    disabled: renaming || !sortableId,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  useEffect(() => {
    if (renaming) {
      renameInputRef.current?.focus()
      renameInputRef.current?.select()
    }
  }, [renaming])

  const handleStartRename = (e: React.MouseEvent) => {
    e.stopPropagation()
    setRenameName(doc.docName)
    setRenaming(true)
  }

  const handleCancelRename = () => {
    setRenaming(false)
    setRenameName('')
  }

  const handleConfirmRename = async () => {
    if (!renameName.trim() || renameName.trim() === doc.docName) {
      handleCancelRename()
      return
    }
    setSubmittingRename(true)
    try {
      const { aiApi } = await import('@/services')
      await aiApi.updateDocument(kbId, doc.id, { docName: renameName.trim() })
      toast.success('文档已重命名')
      setRenaming(false)
      onRefresh()
    } catch {
      // handled by interceptor
    } finally {
      setSubmittingRename(false)
    }
  }

  const handleDelete = async () => {
    try {
      const { aiApi } = await import('@/services')
      await aiApi.deleteDocument(kbId, doc.id)
      toast.success('文档已删除')
      onRefresh()
    } catch {
      // handled by interceptor
    }
  }

  const handleVectorize = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      const { aiApi } = await import('@/services')
      await aiApi.vectorizeDocument(kbId, doc.id)
      toast.success('已触发向量化')
      onRefresh()
    } catch {
      // handled by interceptor
    }
  }

  const handleDevectorize = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      const { aiApi } = await import('@/services')
      await aiApi.devectorizeDocument(kbId, doc.id)
      toast.success('已移除向量')
      onRefresh()
    } catch {
      // handled by interceptor
    }
  }

  const handleExport = async (format: ExportFormat) => {
    try {
      const { aiApi } = await import('@/services')
      const content = await aiApi.getDocumentContent(kbId, doc.id)
      const title = doc.docName?.replace(/\.[^.]+$/, '') || '文档'
      await exportDocument(format, content ?? '', null, title)
    } catch {
      // handled by interceptor
    }
  }

  if (renaming) {
    return (
      <div ref={setNodeRef} style={style} {...attributes} className="flex items-center gap-1 rounded-md bg-accent/50 px-2 py-1">
        <Input
          ref={renameInputRef}
          value={renameName}
          onChange={(e) => setRenameName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleConfirmRename()
            if (e.key === 'Escape') handleCancelRename()
          }}
          className="h-6 flex-1 border-none bg-transparent px-1 text-sm shadow-none focus-visible:ring-0"
          disabled={submittingRename}
        />
        <button
          type="button"
          className="shrink-0 rounded p-0.5 text-muted-foreground hover:text-foreground"
          onClick={handleConfirmRename}
          disabled={submittingRename}
        >
          <Check className="size-3.5" />
        </button>
        <button
          type="button"
          className="shrink-0 rounded p-0.5 text-muted-foreground hover:text-foreground"
          onClick={handleCancelRename}
          disabled={submittingRename}
        >
          <X className="size-3.5" />
        </button>
      </div>
    )
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...(renaming ? {} : listeners)}
        className={`group flex cursor-pointer items-center rounded-md py-1.5 text-sm transition-colors ${
          isSelected ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'
        } ${isDragging ? 'opacity-40' : ''}`}
        onClick={onSelect}
      >
        {/* px-2(8px) + chevron size-3.5(14px) + gap-1.5(6px) = 28px，与文件夹 Folder 图标对齐 */}
        <span className="shrink-0" style={{ width: 28 }} />
        <FileText className="size-3.5 shrink-0 text-muted-foreground" />
        <span className="ml-1.5 flex-1 truncate">{doc.docName}</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="mr-1 shrink-0 rounded p-0.5 opacity-0 hover:bg-accent group-hover:opacity-100"
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="size-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-36">
            {hasEmbeddingModel && (
              <DropdownMenuItem onClick={handleVectorize}>
                <Zap className="mr-2 size-4" />
                向量化
              </DropdownMenuItem>
            )}
            {hasEmbeddingModel && doc.vectorStatus === 2 && (
              <DropdownMenuItem onClick={handleDevectorize}>
                <ZapOff className="mr-2 size-4" />
                移除向量
              </DropdownMenuItem>
            )}
            {hasEmbeddingModel && <DropdownMenuSeparator />}
            {isMarkdownDoc(doc.docType) && (
              <>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Download className="mr-2 size-4" />
                    导出
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem onClick={() => handleExport('md')}>
                      <FileDown className="mr-2 size-4" />
                      Markdown
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport('html')}>
                      <FileType className="mr-2 size-4" />
                      HTML
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport('pdf')}>
                      <FileImage className="mr-2 size-4" />
                      PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport('docx')}>
                      <FileText className="mr-2 size-4" />
                      Word
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem onClick={handleStartRename}>
              <Pencil className="mr-2 size-4" />
              重命名
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive" onClick={(e) => { e.stopPropagation(); setDeleteOpen(true) }}>
              <Trash2 className="mr-2 size-4" />
              删除
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>删除文档</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除文档「{doc.docName}」吗？此操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
