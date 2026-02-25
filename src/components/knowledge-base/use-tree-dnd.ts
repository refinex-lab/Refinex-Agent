import { useCallback, useRef, useState } from 'react'
import {
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates, arrayMove } from '@dnd-kit/sortable'
import { useKbStore } from '@/stores/knowledge-base'
import type { Folder, Document } from '@/services/modules/ai'

// ── Types ────────────────────────────────────────────────

export type DndItemType = 'FOLDER' | 'DOCUMENT'

export interface DndItemData {
  type: DndItemType
  folder?: Folder
  doc?: Document
  folderId?: number // container id (0 = root)
}

export interface ActiveItem {
  id: string
  data: DndItemData
}

export interface DropTarget {
  folderId: number // folder being hovered for "drop inside"
}

// ── Helpers ──────────────────────────────────────────────

/** Build a sortable id to avoid collisions between folders and docs */
export function folderSortId(id: number) {
  return `folder-${id}`
}
export function docSortId(id: number) {
  return `doc-${id}`
}

function parseId(sortId: string): { type: DndItemType; id: number } {
  if (sortId.startsWith('folder-')) return { type: 'FOLDER', id: Number(sortId.slice(7)) }
  return { type: 'DOCUMENT', id: Number(sortId.slice(4)) }
}

// ── Hook ─────────────────────────────────────────────────

export function useTreeDnd(kbId: number) {
  const reorderFolders = useKbStore((s) => s.reorderFolders)
  const reorderDocuments = useKbStore((s) => s.reorderDocuments)
  const moveDocumentToFolder = useKbStore((s) => s.moveDocumentToFolder)
  const fetchFolders = useKbStore((s) => s.fetchFolders)
  const fetchDocuments = useKbStore((s) => s.fetchDocuments)

  const [activeItem, setActiveItem] = useState<ActiveItem | null>(null)
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null)

  // Auto-expand timer for collapsed folders
  const autoExpandTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const autoExpandCallbackRef = useRef<((folderId: number) => void) | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const clearAutoExpand = useCallback(() => {
    if (autoExpandTimer.current) {
      clearTimeout(autoExpandTimer.current)
      autoExpandTimer.current = null
    }
  }, [])

  const onDragStart = useCallback((event: DragStartEvent) => {
    const data = event.active.data.current as DndItemData
    setActiveItem({ id: String(event.active.id), data })
  }, [])

  const onDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event
      if (!over) {
        setDropTarget(null)
        clearAutoExpand()
        return
      }

      const activeData = active.data.current as DndItemData
      const overData = over.data.current as DndItemData | undefined

      // If dragging a document over a folder's main area → show drop-into indicator
      if (
        activeData.type === 'DOCUMENT' &&
        overData?.type === 'FOLDER' &&
        overData.folder
      ) {
        const folderId = overData.folder.id
        setDropTarget({ folderId })

        // Auto-expand collapsed folder after 500ms
        clearAutoExpand()
        autoExpandTimer.current = setTimeout(() => {
          autoExpandCallbackRef.current?.(folderId)
          autoExpandTimer.current = null
        }, 500)
        return
      }

      setDropTarget(null)
      clearAutoExpand()
    },
    [clearAutoExpand],
  )

  const onDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event
      setActiveItem(null)
      setDropTarget(null)
      clearAutoExpand()

      if (!over || active.id === over.id) return

      const activeData = active.data.current as DndItemData
      const overData = over.data.current as DndItemData | undefined
      if (!overData) return

      const { aiApi } = await import('@/services')
      const folders = useKbStore.getState().folders
      const documents = useKbStore.getState().documents

      // ── Case 1: Folder reorder (same parentId only) ──
      if (activeData.type === 'FOLDER' && overData.type === 'FOLDER') {
        const activeFolderId = parseId(String(active.id)).id
        const overFolderId = parseId(String(over.id)).id
        const activeFolder = folders.find((f) => f.id === activeFolderId)
        const overFolder = folders.find((f) => f.id === overFolderId)
        if (!activeFolder || !overFolder) return
        // Only allow reorder among siblings (same parentId)
        const activeParent = activeFolder.parentId || 0
        const overParent = overFolder.parentId || 0
        if (activeParent !== overParent) return
        // Filter siblings, reorder within that subset, then rebuild full list
        const siblings = folders.filter((f) => (f.parentId || 0) === activeParent)
        const siblingIds = siblings.map((f) => f.id)
        const oldIdx = siblingIds.indexOf(activeFolderId)
        const newIdx = siblingIds.indexOf(overFolderId)
        if (oldIdx === -1 || newIdx === -1) return
        const newSiblingOrder = arrayMove(siblingIds, oldIdx, newIdx)
        // Rebuild full folder order: replace siblings in-place
        const siblingSet = new Set(siblingIds)
        let sibIdx = 0
        const newOrder = folders.map((f) => {
          if (siblingSet.has(f.id)) return newSiblingOrder[sibIdx++]
          return f.id
        })
        reorderFolders(newOrder)

        const sortItems = newSiblingOrder.map((id, i) => ({
          id,
          type: 'FOLDER' as const,
          sort: i * 1000,
        }))
        try {
          await aiApi.sortItems(kbId, { items: sortItems })
        } catch {
          fetchFolders(kbId)
        }
        return
      }

      // ── Case 2: Document dropped onto a folder → move into folder ──
      if (activeData.type === 'DOCUMENT' && overData.type === 'FOLDER' && overData.folder) {
        const docId = parseId(String(active.id)).id
        const targetFolderId = overData.folder.id
        const doc = documents.find((d) => d.id === docId)
        if (!doc || (doc.folderId || 0) === targetFolderId) return

        moveDocumentToFolder(docId, targetFolderId)
        try {
          await aiApi.updateDocument(kbId, docId, {
            docName: doc.docName,
            folderId: targetFolderId,
          })
          // Re-sort docs in target folder
          const targetDocs = useKbStore.getState().documents.filter(
            (d) => (d.folderId || 0) === targetFolderId,
          )
          const docSortItems = targetDocs.map((d, i) => ({
            id: d.id,
            type: 'DOCUMENT' as const,
            sort: i * 1000,
          }))
          if (docSortItems.length > 0) {
            await aiApi.sortItems(kbId, { items: docSortItems })
          }
        } catch {
          fetchDocuments(kbId)
        }
        return
      }

      // ── Case 3: Document reorder within same container ──
      if (activeData.type === 'DOCUMENT' && overData.type === 'DOCUMENT') {
        const activeDocId = parseId(String(active.id)).id
        const overDocId = parseId(String(over.id)).id
        const activeDoc = documents.find((d) => d.id === activeDocId)
        const overDoc = documents.find((d) => d.id === overDocId)
        if (!activeDoc || !overDoc) return

        const activeFolderId = activeDoc.folderId || 0
        const overFolderId = overDoc.folderId || 0

        if (activeFolderId !== overFolderId) {
          // Cross-container: move doc to target container first
          moveDocumentToFolder(activeDocId, overFolderId)
          try {
            await aiApi.updateDocument(kbId, activeDocId, {
              docName: activeDoc.docName,
              folderId: overFolderId,
            })
          } catch {
            fetchDocuments(kbId)
            return
          }
        }

        // Reorder within the target container
        const containerDocs = useKbStore.getState().documents.filter(
          (d) => (d.folderId || 0) === overFolderId,
        )
        const ids = containerDocs.map((d) => d.id)
        const oldIdx = ids.indexOf(activeDocId)
        const newIdx = ids.indexOf(overDocId)
        if (oldIdx === -1 || newIdx === -1) return
        const newOrder = arrayMove(ids, oldIdx, newIdx)
        reorderDocuments(overFolderId, newOrder)

        const sortItems = newOrder.map((id, i) => ({
          id,
          type: 'DOCUMENT' as const,
          sort: i * 1000,
        }))
        try {
          await aiApi.sortItems(kbId, { items: sortItems })
        } catch {
          fetchDocuments(kbId)
        }
        return
      }

      // ── Case 4: Folder dropped on document → treat as folder reorder (ignore) ──
    },
    [kbId, reorderFolders, reorderDocuments, moveDocumentToFolder, fetchFolders, fetchDocuments, clearAutoExpand],
  )

  const onDragCancel = useCallback(() => {
    setActiveItem(null)
    setDropTarget(null)
    clearAutoExpand()
    // Restore server state
    fetchFolders(kbId)
    fetchDocuments(kbId)
  }, [kbId, fetchFolders, fetchDocuments, clearAutoExpand])

  return {
    sensors,
    activeItem,
    dropTarget,
    autoExpandCallbackRef,
    onDragStart,
    onDragOver,
    onDragEnd,
    onDragCancel,
  }
}
