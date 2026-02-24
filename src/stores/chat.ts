import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { nanoid } from 'nanoid'
import { toast } from 'sonner'
import { fetchSSE } from '@/lib/sse'
import { useAuthStore } from '@/stores/auth'
import { useModelStore } from '@/stores/model'
import { useConversationStore } from '@/stores/conversation'
import type { ChatMessageUI, RagReference, StreamStatus } from '@/types/chat'

// ── Types ───────────────────────────────────────────────

interface ChatState {
  messages: ChatMessageUI[]
  conversationId: string | null
  streamStatus: StreamStatus
  abortController: AbortController | null
  isArchived: boolean

  // TTS
  ttsLoadingId: string | null
  ttsAudioUrl: string | null
  ttsPlayingId: string | null

  // RAG
  knowledgeBaseIds: number[]

  // Prompt Template
  promptTemplateId: number | null
}

interface ChatActions {
  sendMessage: (text: string, imageUrls?: string[], audioUrl?: string) => Promise<void>
  stopStreaming: () => void
  loadConversation: (conversationId: string) => Promise<void>
  clearChat: () => void
  playTts: (messageId: string, text: string) => Promise<void>
  stopTts: () => void
  setKnowledgeBaseIds: (ids: number[]) => void
  setPromptTemplateId: (id: number | null) => void
  regenerateLastMessage: () => Promise<void>
  unarchiveCurrentConversation: () => Promise<void>
}

type ChatStore = ChatState & ChatActions

// ── Initial state ───────────────────────────────────────

const initialState: ChatState = {
  messages: [],
  conversationId: null,
  streamStatus: 'idle',
  abortController: null,
  isArchived: false,
  ttsLoadingId: null,
  ttsAudioUrl: null,
  ttsPlayingId: null,
  knowledgeBaseIds: [],
  promptTemplateId: null,
}

// ── Helper: update last assistant message immutably ──────

function updateLastAssistant(
  messages: ChatMessageUI[],
  updater: (msg: ChatMessageUI) => Partial<ChatMessageUI>,
): ChatMessageUI[] {
  const result = [...messages]
  for (let i = result.length - 1; i >= 0; i--) {
    if (result[i].role === 'assistant') {
      result[i] = { ...result[i], ...updater(result[i]) }
      break
    }
  }
  return result
}

// ── Store ───────────────────────────────────────────────

export const useChatStore = create<ChatStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      async sendMessage(text, imageUrls = [], audioUrl) {
        const { conversationId, knowledgeBaseIds, promptTemplateId } = get()
        const modelState = useModelStore.getState()
        const selectedProvision = modelState.provisions.find((p) => p.id === modelState.selectedProvisionId)
        const modelId = selectedProvision?.modelId ?? null
        const token = useAuthStore.getState().token

        if (!text.trim() && imageUrls.length === 0 && !audioUrl) return

        // 1. Push user message
        const userMsg: ChatMessageUI = {
          id: nanoid(),
          role: 'user',
          content: text,
          reasoningContent: '',
          imageUrls: [],
          references: [],
          attachments: imageUrls.map((url) => ({
            id: nanoid(),
            name: 'image',
            url,
            type: 'image/*',
          })),
          timestamp: Date.now(),
        }

        // 2. Push empty assistant message
        const assistantMsg: ChatMessageUI = {
          id: nanoid(),
          role: 'assistant',
          content: '',
          reasoningContent: '',
          imageUrls: [],
          references: [],
          attachments: [],
          timestamp: Date.now(),
        }

        const abortController = new AbortController()

        set(
          (s) => ({
            messages: [...s.messages, userMsg, assistantMsg],
            streamStatus: 'streaming' as StreamStatus,
            abortController,
          }),
          false,
          'sendMessage/start',
        )

        // 3. Build request body
        const body: Record<string, unknown> = {
          message: text,
          modelId,
        }
        if (conversationId) body.conversationId = conversationId
        if (imageUrls.length > 0) body.imageUrls = imageUrls
        if (audioUrl) body.audioUrl = audioUrl
        if (knowledgeBaseIds.length > 0) body.knowledgeBaseIds = knowledgeBaseIds
        if (promptTemplateId) body.promptTemplateId = promptTemplateId

        // 4. SSE stream
        const { aiApi } = await import('@/services')
        const url = aiApi.getChatStreamUrl()
        const headers: Record<string, string> = {}
        if (token) {
          const headerName = (await import('@/config/env')).env.AUTH_TOKEN_HEADER
          headers[headerName] = token
        }

        await fetchSSE(url, body, headers, abortController.signal, {
          onEvent(event, data) {
            const state = get()
            switch (event) {
              case 'reasoning':
                set(
                  { messages: updateLastAssistant(state.messages, (m) => ({ reasoningContent: m.reasoningContent + data })) },
                  false,
                  'stream/reasoning',
                )
                break
              case 'answer':
                set(
                  { messages: updateLastAssistant(state.messages, (m) => ({ content: m.content + data })) },
                  false,
                  'stream/answer',
                )
                break
              case 'image':
                set(
                  { messages: updateLastAssistant(state.messages, (m) => ({ imageUrls: [...m.imageUrls, data.trim()] })) },
                  false,
                  'stream/image',
                )
                break
              case 'references':
                try {
                  const refs: RagReference[] = JSON.parse(data)
                  set(
                    { messages: updateLastAssistant(state.messages, () => ({ references: refs })) },
                    false,
                    'stream/references',
                  )
                } catch { /* ignore parse error */ }
                break
            }
          },
          onDone() {
            set({ streamStatus: 'idle', abortController: null }, false, 'stream/done')

            // Refresh conversation list after delay (wait for backend async title generation)
            const currentConvId = get().conversationId
            setTimeout(async () => {
              const convStore = useConversationStore.getState()
              await convStore.fetchConversations(true)

              // If this was a new conversation, pick up the new conversationId
              if (!currentConvId) {
                const latest = useConversationStore.getState().conversations[0]
                if (latest) {
                  set({ conversationId: latest.conversationId }, false, 'stream/newConvId')
                  useConversationStore.getState().setActiveConversation(latest.conversationId)
                }
              }
            }, 1500)
          },
          onError(error) {
            set({ streamStatus: 'error', abortController: null }, false, 'stream/error')
            toast.error(error.message || '对话请求失败')
          },
        })
      },

      stopStreaming() {
        const { abortController } = get()
        abortController?.abort()
        set({ streamStatus: 'idle', abortController: null }, false, 'stopStreaming')
      },

      async loadConversation(conversationId) {
        try {
          const { aiApi } = await import('@/services')
          const detail = await aiApi.getConversation(conversationId)

          const messages: ChatMessageUI[] = (detail.messages ?? []).map((msg) => ({
            id: nanoid(),
            role: msg.type === 'USER' ? 'user' : 'assistant',
            content: msg.content ?? '',
            reasoningContent: msg.reasoningContent ?? '',
            imageUrls: [],
            references: [],
            attachments: [],
            timestamp: msg.timestamp ? new Date(msg.timestamp).getTime() : Date.now(),
          }))

          // Restore knowledgeBaseIds from extJson
          let knowledgeBaseIds: number[] = []
          if (detail.extJson) {
            try {
              const ext = JSON.parse(detail.extJson)
              if (Array.isArray(ext.knowledgeBaseIds)) {
                knowledgeBaseIds = ext.knowledgeBaseIds
              }
            } catch { /* ignore */ }
          }

          set(
            {
              messages,
              conversationId,
              streamStatus: 'idle',
              abortController: null,
              knowledgeBaseIds,
              isArchived: detail.status === 2,
            },
            false,
            'loadConversation',
          )
        } catch {
          toast.error('加载对话失败')
        }
      },

      clearChat() {
        const { abortController } = get()
        abortController?.abort()
        set({ ...initialState }, false, 'clearChat')
      },

      async playTts(messageId, text) {
        set({ ttsLoadingId: messageId }, false, 'tts/loading')
        try {
          const { aiApi } = await import('@/services')
          const audioUrl = await aiApi.textToSpeech({ text })
          set({ ttsLoadingId: null, ttsAudioUrl: audioUrl, ttsPlayingId: messageId }, false, 'tts/play')
        } catch {
          set({ ttsLoadingId: null }, false, 'tts/error')
          toast.error('语音合成失败')
        }
      },

      stopTts() {
        set({ ttsAudioUrl: null, ttsPlayingId: null }, false, 'tts/stop')
      },

      setKnowledgeBaseIds(ids) {
        set({ knowledgeBaseIds: ids }, false, 'setKnowledgeBaseIds')
      },

      setPromptTemplateId(id) {
        set({ promptTemplateId: id }, false, 'setPromptTemplateId')
      },

      async regenerateLastMessage() {
        const { messages, conversationId } = get()
        // Find the last user message
        let lastUserIdx = -1
        for (let i = messages.length - 1; i >= 0; i--) {
          if (messages[i].role === 'user') {
            lastUserIdx = i
            break
          }
        }
        if (lastUserIdx === -1) return

        const lastUserMsg = messages[lastUserIdx]
        // Remove the last assistant message
        const trimmed = messages.slice(0, lastUserIdx + 1)
        set({ messages: trimmed, conversationId }, false, 'regenerate/trim')

        // Re-send
        const imageUrls = lastUserMsg.attachments
          .filter((a) => a.type.startsWith('image'))
          .map((a) => a.url)
        await get().sendMessage(lastUserMsg.content, imageUrls)
      },

      async unarchiveCurrentConversation() {
        const { conversationId } = get()
        if (!conversationId) return
        try {
          const { aiApi } = await import('@/services')
          await aiApi.toggleConversationArchive(conversationId)
          set({ isArchived: false }, false, 'unarchive')
          toast.success('已取消归档')
          // 刷新对话列表
          await useConversationStore.getState().fetchConversations(true)
        } catch {
          // 全局拦截器已处理
        }
      },
    }),
    { name: 'ChatStore', enabled: import.meta.env.DEV },
  ),
)
