import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { FolderPlus, FilePlus, Check, X, Search, Folder, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Spinner } from '@/components/ui/spinner'
import { DndContext, DragOverlay, closestCenter } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useKbStore } from '@/stores/knowledge-base'
import { FolderTreeItem } from './FolderTreeItem'
import { DocumentListItem } from './DocumentListItem'
import { DocumentCreateDialog } from './DocumentCreateDialog'
import { useTreeDnd, folderSortId, docSortId } from './use-tree-dnd'
import { toast } from 'sonner'

interface FolderDocTreeProps {
  kbId: number
}

export function FolderDocTree({ kbId }: FolderDocTreeProps) {
  const [docCreateOpen, setDocCreateOpen] = useState(false)
  const [docCreateFolderId, setDocCreateFolderId] = useState<number | null>(null)
  const [creatingFolder, setCreatingFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [submittingFolder, setSubmittingFolder] = useState(false)
  const [search, setSearch] = useState('')
  const [expandedFolders, setExpandedFolders] = useState<Record<number, boolean>>({})
  const newFolderInputRef = useRef<HTMLInputElement>(null)

  const folders = useKbStore((s) => s.folders)
  const documents = useKbStore((s) => s.documents)
  const foldersLoading = useKbStore((s) => s.foldersLoading)
  const documentsLoading = useKbStore((s) => s.documentsLoading)
  const selectedDocId = useKbStore((s) => s.selectedDocId)
  const selectDocument = useKbStore((s) => s.selectDocument)
  const fetchFolders = useKbStore((s) => s.fetchFolders)
  const fetchDocuments = useKbStore((s) => s.fetchDocuments)

  const isLoading = foldersLoading || documentsLoading

  const {
    sensors,
    activeItem,
    dropTarget,
    autoExpandCallbackRef,
    onDragStart,
    onDragOver,
    onDragEnd,
    onDragCancel,
  } = useTreeDnd(kbId)

  // Default all folders to expanded
  useEffect(() => {
    setExpandedFolders((prev) => {
      const next = { ...prev }
      let changed = false
      for (const f of folders) {
        if (!(f.id in next)) {
          next[f.id] = true
          changed = true
        }
      }
      return changed ? next : prev
    })
  }, [folders])

  // Wire up auto-expand callback
  useEffect(() => {
    autoExpandCallbackRef.current = (folderId: number) => {
      setExpandedFolders((prev) => ({ ...prev, [folderId]: true }))
    }
  }, [autoExpandCallbackRef])

  useEffect(() => {
    if (creatingFolder) {
      newFolderInputRef.current?.focus()
    }
  }, [creatingFolder])

  const handleStartCreateFolder = () => {
    setNewFolderName('')
    setCreatingFolder(true)
  }

  const handleCancelCreateFolder = () => {
    setCreatingFolder(false)
    setNewFolderName('')
  }

  const handleConfirmCreateFolder = async () => {
    if (!newFolderName.trim()) {
      handleCancelCreateFolder()
      return
    }
    setSubmittingFolder(true)
    try {
      const { aiApi } = await import('@/services')
      await aiApi.createFolder(kbId, { folderName: newFolderName.trim() })
      toast.success('文件夹已创建')
      setCreatingFolder(false)
      setNewFolderName('')
      fetchFolders(kbId)
    } catch {
      // handled by interceptor
    } finally {
      setSubmittingFolder(false)
    }
  }

  const handleCreateDoc = (folderId?: number | null) => {
    setDocCreateFolderId(folderId ?? null)
    setDocCreateOpen(true)
  }

  const rootDocs = documents.filter((d) => !d.folderId || d.folderId === 0)
  const getDocsForFolder = useCallback(
    (folderId: number) => documents.filter((d) => d.folderId === folderId),
    [documents],
  )

  const keyword = search.trim().toLowerCase()
  const isSearching = keyword.length > 0

  const searchResults = useMemo(() => {
    if (!isSearching) return []
    return documents.filter((d) => d.docName.toLowerCase().includes(keyword))
  }, [documents, keyword, isSearching])

  // Sortable IDs
  const folderSortIds = useMemo(() => folders.map((f) => folderSortId(f.id)), [folders])
  const rootDocSortIds = useMemo(() => rootDocs.map((d) => docSortId(d.id)), [rootDocs])

  const handleFolderOpenChange = useCallback((folderId: number, open: boolean) => {
    setExpandedFolders((prev) => ({ ...prev, [folderId]: open }))
  }, [])

  return (
    <div className="flex h-full flex-col">
      <div className="grid grid-cols-2 border-b">
        <Button
          variant="ghost"
          size="sm"
          className="h-9 rounded-none text-xs"
          onClick={handleStartCreateFolder}
        >
          <FolderPlus className="mr-1.5 size-3.5" />
          文件夹
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-9 rounded-none border-l text-xs"
          onClick={() => handleCreateDoc()}
        >
          <FilePlus className="mr-1.5 size-3.5" />
          文档
        </Button>
      </div>

      <div className="relative border-b px-2 py-1.5">
        <Search className="absolute left-4 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="搜索文档..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-7 pl-7 text-xs"
        />
      </div>

      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Spinner className="size-4" />
          </div>
        ) : isSearching ? (
          <div className="p-2">
            {searchResults.length > 0 ? (
              searchResults.map((doc) => (
                <DocumentListItem
                  key={doc.id}
                  kbId={kbId}
                  doc={doc}
                  isSelected={selectedDocId === doc.id}
                  onSelect={() => selectDocument(doc.id)}
                  onRefresh={() => fetchDocuments(kbId)}
                />
              ))
            ) : (
              <p className="py-8 text-center text-xs text-muted-foreground">
                未找到匹配的文档
              </p>
            )}
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDragEnd={onDragEnd}
            onDragCancel={onDragCancel}
          >
            <div className="p-2">
              {/* 新建文件夹 inline input */}
              {creatingFolder && (
                <div className="mb-1 flex items-center gap-1 rounded-md bg-accent/50 px-2 py-1">
                  <Input
                    ref={newFolderInputRef}
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleConfirmCreateFolder()
                      if (e.key === 'Escape') handleCancelCreateFolder()
                    }}
                    placeholder="文件夹名称"
                    className="h-6 flex-1 border-none bg-transparent px-1 text-sm shadow-none focus-visible:ring-0"
                    disabled={submittingFolder}
                  />
                  <button
                    type="button"
                    className="shrink-0 rounded p-0.5 text-muted-foreground hover:text-foreground"
                    onClick={handleConfirmCreateFolder}
                    disabled={submittingFolder}
                  >
                    <Check className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    className="shrink-0 rounded p-0.5 text-muted-foreground hover:text-foreground"
                    onClick={handleCancelCreateFolder}
                    disabled={submittingFolder}
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              )}

              <SortableContext items={folderSortIds} strategy={verticalListSortingStrategy}>
                {folders.map((folder) => (
                  <FolderTreeItem
                    key={folder.id}
                    kbId={kbId}
                    folder={folder}
                    documents={getDocsForFolder(folder.id)}
                    selectedDocId={selectedDocId}
                    onSelectDoc={selectDocument}
                    onCreateDoc={() => handleCreateDoc(folder.id)}
                    onRefresh={() => { fetchFolders(kbId); fetchDocuments(kbId) }}
                    sortableId={folderSortId(folder.id)}
                    open={expandedFolders[folder.id] ?? true}
                    onOpenChange={(open) => handleFolderOpenChange(folder.id, open)}
                    isDropTarget={dropTarget?.folderId === folder.id}
                  />
                ))}
              </SortableContext>

              <SortableContext items={rootDocSortIds} strategy={verticalListSortingStrategy}>
                {rootDocs.map((doc) => (
                  <DocumentListItem
                    key={doc.id}
                    kbId={kbId}
                    doc={doc}
                    isSelected={selectedDocId === doc.id}
                    onSelect={() => selectDocument(doc.id)}
                    onRefresh={() => fetchDocuments(kbId)}
                    sortableId={docSortId(doc.id)}
                  />
                ))}
              </SortableContext>

              {!creatingFolder && folders.length === 0 && rootDocs.length === 0 && (
                <p className="py-8 text-center text-xs text-muted-foreground">
                  暂无内容，点击上方按钮创建
                </p>
              )}
            </div>

            <DragOverlay dropAnimation={null}>
              {activeItem ? (
                <div className="flex items-center gap-1.5 rounded-md border bg-background px-2 py-1.5 text-sm shadow-md">
                  {activeItem.data.type === 'FOLDER' ? (
                    <>
                      <Folder className="size-3.5 shrink-0 text-muted-foreground" />
                      <span className="truncate">{activeItem.data.folder?.folderName}</span>
                    </>
                  ) : (
                    <>
                      <FileText className="size-3.5 shrink-0 text-muted-foreground" />
                      <span className="truncate">{activeItem.data.doc?.docName}</span>
                    </>
                  )}
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </ScrollArea>

      <DocumentCreateDialog
        kbId={kbId}
        folderId={docCreateFolderId}
        open={docCreateOpen}
        onOpenChange={setDocCreateOpen}
        onCreated={() => fetchDocuments(kbId)}
      />
    </div>
  )
}
