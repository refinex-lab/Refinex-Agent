import { useState, useRef, useEffect } from 'react'
import { ChevronRight, Folder, MoreHorizontal, Pencil, Trash2, FilePlus, Check, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import type { Folder as FolderType, Document } from '@/services/modules/ai'
import { DocumentListItem } from './DocumentListItem'
import { docSortId } from './use-tree-dnd'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'

interface FolderTreeItemProps {
  kbId: number
  folder: FolderType
  documents: Document[]
  selectedDocId: number | null
  onSelectDoc: (docId: number | null) => void
  onCreateDoc: () => void
  onRefresh: () => void
  sortableId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  isDropTarget?: boolean
}

export function FolderTreeItem({
  kbId, folder, documents, selectedDocId, onSelectDoc, onCreateDoc, onRefresh,
  sortableId, open, onOpenChange, isDropTarget,
}: FolderTreeItemProps) {
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
    id: sortableId,
    data: { type: 'FOLDER' as const, folder },
    disabled: renaming,
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
    setRenameName(folder.folderName)
    setRenaming(true)
  }

  const handleCancelRename = () => {
    setRenaming(false)
    setRenameName('')
  }

  const handleConfirmRename = async () => {
    if (!renameName.trim() || renameName.trim() === folder.folderName) {
      handleCancelRename()
      return
    }
    setSubmittingRename(true)
    try {
      const { aiApi } = await import('@/services')
      await aiApi.updateFolder(kbId, folder.id, { folderName: renameName.trim() })
      toast.success('文件夹已重命名')
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
      await aiApi.deleteFolder(kbId, folder.id)
      toast.success('文件夹已删除')
      onRefresh()
    } catch {
      // handled by interceptor
    }
  }

  const docSortIds = documents.map((d) => docSortId(d.id))

  return (
    <>
      <div ref={setNodeRef} style={style} {...attributes} {...(renaming ? {} : listeners)}>
        <div
          className={`group flex items-center rounded-md hover:bg-accent/50 ${
            isDragging ? 'opacity-40' : ''
          } ${isDropTarget ? 'bg-primary/10 ring-1 ring-primary/30' : ''}`}
        >
          {renaming ? (
            <div className="flex flex-1 items-center gap-1 px-2 py-1">
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
          ) : (
            <>
              <button
                type="button"
                className="flex flex-1 items-center gap-1.5 px-2 py-1.5 text-sm"
                onClick={() => onOpenChange(!open)}
              >
                <ChevronRight className={`size-3.5 shrink-0 transition-transform ${open ? 'rotate-90' : ''}`} />
                <Folder className="size-3.5 shrink-0 text-muted-foreground" />
                <span className="truncate">{folder.folderName}</span>
              </button>
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
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onCreateDoc() }}>
                    <FilePlus className="mr-2 size-4" />
                    新建文档
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleStartRename}>
                    <Pencil className="mr-2 size-4" />
                    重命名
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive" onClick={(e) => { e.stopPropagation(); setDeleteOpen(true) }}>
                    <Trash2 className="mr-2 size-4" />
                    删除
                  </DropdownMenuItem>
              </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
        {open && (
          <div className="ml-4 border-l pl-2">
            <SortableContext items={docSortIds} strategy={verticalListSortingStrategy}>
              {documents.map((doc) => (
                <DocumentListItem
                  key={doc.id}
                  kbId={kbId}
                  doc={doc}
                  isSelected={selectedDocId === doc.id}
                  onSelect={() => onSelectDoc(doc.id)}
                  onRefresh={onRefresh}
                  sortableId={docSortId(doc.id)}
                />
              ))}
            </SortableContext>
            {documents.length === 0 && (
              <p className="py-2 text-xs text-muted-foreground">空文件夹</p>
            )}
          </div>
        )}
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>删除文件夹</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除文件夹「{folder.folderName}」吗？此操作不可撤销。
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
