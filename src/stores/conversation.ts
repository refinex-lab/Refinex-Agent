import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { Conversation } from '@/services/modules/ai'

// ── Types ───────────────────────────────────────────────

interface ConversationState {
  conversations: Conversation[]
  activeConversationId: string | null
  total: number
  currentPage: number
  hasMore: boolean
  loading: boolean
  loadingMore: boolean
  placeholderMode: 'image' | 'app' | null
}

interface ConversationActions {
  fetchConversations: (reset?: boolean) => Promise<void>
  loadMore: () => Promise<void>
  setActiveConversation: (id: string | null) => void
  deleteConversation: (id: string) => Promise<void>
  renameConversation: (id: string, title: string) => Promise<void>
  togglePin: (id: string) => Promise<void>
  setPlaceholderMode: (mode: 'image' | 'app' | null) => void
  refreshAfterStream: () => Promise<void>
}

type ConversationStore = ConversationState & ConversationActions

// ── Initial state ───────────────────────────────────────

const PAGE_SIZE = 50

const initialState: ConversationState = {
  conversations: [],
  activeConversationId: null,
  total: 0,
  currentPage: 1,
  hasMore: false,
  loading: false,
  loadingMore: false,
  placeholderMode: null,
}

// ── Store ───────────────────────────────────────────────

export const useConversationStore = create<ConversationStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      async fetchConversations(reset = true) {
        const page = reset ? 1 : get().currentPage
        set(reset ? { loading: true } : { loadingMore: true }, false, 'fetchConversations/start')
        try {
          const { aiApi } = await import('@/services')
          const data = await aiApi.listConversations({ currentPage: page, pageSize: PAGE_SIZE })
          const records = data.records ?? []
          const total = data.total ?? 0
          set({
            conversations: reset ? records : [...get().conversations, ...records],
            total,
            currentPage: page,
            hasMore: page * PAGE_SIZE < total,
            loading: false,
            loadingMore: false,
          }, false, 'fetchConversations/success')
        } catch {
          set({ loading: false, loadingMore: false }, false, 'fetchConversations/error')
        }
      },

      async loadMore() {
        const { hasMore, loadingMore } = get()
        if (!hasMore || loadingMore) return
        set({ currentPage: get().currentPage + 1 }, false, 'loadMore/page')
        await get().fetchConversations(false)
      },

      setActiveConversation(id) {
        set({ activeConversationId: id, placeholderMode: null }, false, 'setActiveConversation')
      },

      async deleteConversation(id) {
        try {
          const { aiApi } = await import('@/services')
          await aiApi.deleteConversation(id)
          const { conversations, activeConversationId } = get()
          set({
            conversations: conversations.filter((c) => c.conversationId !== id),
            total: get().total - 1,
            ...(activeConversationId === id ? { activeConversationId: null } : {}),
          }, false, 'deleteConversation')
        } catch {
          // 全局拦截器已处理错误提示
        }
      },

      async renameConversation(id, title) {
        try {
          const { aiApi } = await import('@/services')
          await aiApi.updateConversationTitle(id, { title })
          set({
            conversations: get().conversations.map((c) =>
              c.conversationId === id ? { ...c, title } : c,
            ),
          }, false, 'renameConversation')
        } catch {
          // 全局拦截器已处理错误提示
        }
      },

      async togglePin(id) {
        try {
          const { aiApi } = await import('@/services')
          await aiApi.toggleConversationPin(id)
          const conversations = get().conversations.map((c) =>
            c.conversationId === id ? { ...c, pinned: c.pinned === 1 ? 0 : 1 } : c,
          )
          // 置顶的排前面
          conversations.sort((a, b) => b.pinned - a.pinned)
          set({ conversations }, false, 'togglePin')
        } catch {
          // 全局拦截器已处理错误提示
        }
      },

      setPlaceholderMode(mode) {
        set({ placeholderMode: mode, activeConversationId: null }, false, 'setPlaceholderMode')
      },

      async refreshAfterStream() {
        await get().fetchConversations(true)
      },
    }),
    { name: 'ConversationStore', enabled: import.meta.env.DEV },
  ),
)
