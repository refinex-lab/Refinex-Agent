import type { ChatMessageUI } from '@/types/chat'
import { UserMessage } from './UserMessage'
import { AssistantMessage } from './AssistantMessage'

interface ChatMessageProps {
  message: ChatMessageUI
  isStreaming: boolean
  isLast: boolean
}

export function ChatMessage({ message, isStreaming, isLast }: ChatMessageProps) {
  if (message.role === 'user') {
    return <UserMessage message={message} />
  }
  return (
    <AssistantMessage
      message={message}
      isStreaming={isStreaming}
      isLast={isLast}
    />
  )
}
