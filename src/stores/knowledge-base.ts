import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type {
  KnowledgeBase,
  Folder,
  Document,
  DocumentChunk,
} from '@/services/modules/ai'

// ── Types ───────────────────────────────────────────────

interface KbState {
  knowledgeBases: KnowledgeBase[]
  kbLoading: boolean
  currentKb: KnowledgeBase | null
  folders: Folder[]
  documents: Document[]
  foldersLoading: boolean
  documentsLoading: boolean
  selectedFolderId: number | null
  selectedDocId: number | null
  docContent: string | null
  contentLoading: boolean
  contentDirty: boolean
  chunks: DocumentChunk[]
  chunksLoading: boolean
}

interface KbActions {
  fetchKnowledgeBases: (keyword?: string) => Promise<void>
  loadKb: (kbId: number) => Promise<void>
  fetchFolders: (kbId: number) => Promise<void>
  fetchDocuments: (kbId: number, folderId?: number | null) => Promise<void>
  selectFolder: (folderId: number | null) => void
  selectDocument: (docId: number | null) => void
  loadDocContent: (kbId: number, docId: number) => Promise<void>
  setDocContent: (content: string) => void
  setContentDirty: (dirty: boolean) => void
  fetchChunks: (kbId: number, docId: number) => Promise<void>
  reset: () => void
}

type KbStore = KbState & KbActions

// ── Initial state ───────────────────────────────────────

const initialState: KbState = {
  knowledgeBases: [],
  kbLoading: false,
  currentKb: null,
  folders: [],
  documents: [],
  foldersLoading: false,
  documentsLoading: false,
  selectedFolderId: null,
  selectedDocId: null,
  docContent: null,
  contentLoading: false,
  contentDirty: false,
  chunks: [],
  chunksLoading: false,
}

// ── Store ───────────────────────────────────────────────

export const useKbStore = create<KbStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      async fetchKnowledgeBases(keyword?: string) {
        set({ kbLoading: true }, false, 'fetchKnowledgeBases/start')
        try {
          const { aiApi } = await import('@/services')
          const data = await aiApi.listKnowledgeBases({
            currentPage: 1,
            pageSize: 100,
            status: 1,
            ...(keyword ? { keyword } : {}),
          })
          set({
            knowledgeBases: data.records ?? [],
            kbLoading: false,
          }, false, 'fetchKnowledgeBases/success')
        } catch {
          set({ kbLoading: false }, false, 'fetchKnowledgeBases/error')
        }
      },

      async loadKb(kbId: number) {
        try {
          const { aiApi } = await import('@/services')
          const kb = await aiApi.getKnowledgeBase(kbId)
          set({ currentKb: kb }, false, 'loadKb/success')
          await Promise.all([
            get().fetchFolders(kbId),
            get().fetchDocuments(kbId),
          ])
        } catch {
          // handled by interceptor
        }
      },

      async fetchFolders(kbId: number) {
        set({ foldersLoading: true }, false, 'fetchFolders/start')
        try {
          const { aiApi } = await import('@/services')
          const folders = await aiApi.listFolders(kbId)
          set({ folders, foldersLoading: false }, false, 'fetchFolders/success')
        } catch {
          set({ foldersLoading: false }, false, 'fetchFolders/error')
        }
      },

      async fetchDocuments(kbId: number, folderId?: number | null) {
        set({ documentsLoading: true }, false, 'fetchDocuments/start')
        try {
          const { aiApi } = await import('@/services')
          const data = await aiApi.listDocuments(kbId, {
            currentPage: 1,
            pageSize: 500,
            ...(folderId != null ? { folderId } : {}),
          })
          set({
            documents: data.records ?? [],
            documentsLoading: false,
          }, false, 'fetchDocuments/success')
        } catch {
          set({ documentsLoading: false }, false, 'fetchDocuments/error')
        }
      },

      selectFolder(folderId: number | null) {
        set({ selectedFolderId: folderId, selectedDocId: null, docContent: null, contentDirty: false, chunks: [] }, false, 'selectFolder')
      },

      selectDocument(docId: number | null) {
        set({ selectedDocId: docId, docContent: null, contentDirty: false, chunks: [] }, false, 'selectDocument')
      },

      async loadDocContent(kbId: number, docId: number) {
        set({ contentLoading: true }, false, 'loadDocContent/start')
        try {
          const { aiApi } = await import('@/services')
          const content = await aiApi.getDocumentContent(kbId, docId)
          set({ docContent: content ?? '', contentLoading: false, contentDirty: false }, false, 'loadDocContent/success')
        } catch {
          set({ docContent: null, contentLoading: false }, false, 'loadDocContent/error')
        }
      },

      setDocContent(content: string) {
        set({ docContent: content, contentDirty: true }, false, 'setDocContent')
      },

      setContentDirty(dirty: boolean) {
        set({ contentDirty: dirty }, false, 'setContentDirty')
      },

      async fetchChunks(kbId: number, docId: number) {
        set({ chunksLoading: true }, false, 'fetchChunks/start')
        try {
          const { aiApi } = await import('@/services')
          const chunks = await aiApi.listDocumentChunks(kbId, docId)
          set({ chunks, chunksLoading: false }, false, 'fetchChunks/success')
        } catch {
          set({ chunksLoading: false }, false, 'fetchChunks/error')
        }
      },

      reset() {
        set(initialState, false, 'reset')
      },
    }),
    { name: 'KbStore', enabled: import.meta.env.DEV },
  ),
)
