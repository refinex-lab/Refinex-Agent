// ── 聊天相关类型定义 ──────────────────────────────────────

export interface ChatMessageUI {
  id: string
  role: 'user' | 'assistant'
  content: string
  reasoningContent: string
  imageUrls: string[]
  references: RagReference[]
  attachments: ChatAttachment[]
  timestamp: number
}

export interface RagReference {
  content: string
  score: number
  documentId: string
  documentName: string
  knowledgeBaseId: string
  chunkIndex: number
}

export interface ChatAttachment {
  id: string
  name: string
  url: string
  type: string
  previewUrl?: string
}

export type StreamStatus = 'idle' | 'uploading' | 'streaming' | 'done' | 'error'
