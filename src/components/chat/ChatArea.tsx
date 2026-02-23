import { useChatStore } from '@/stores/chat'
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation'
import { WelcomeScreen } from './WelcomeScreen'
import { ChatMessage } from './ChatMessage'

export function ChatArea() {
  const messages = useChatStore((s) => s.messages)
  const streamStatus = useChatStore((s) => s.streamStatus)

  const isStreaming = streamStatus === 'streaming'

  return (
    <Conversation className="flex-1">
      <ConversationContent className="mx-auto max-w-[760px] flex-1">
        {messages.length === 0 ? (
          <WelcomeScreen />
        ) : (
          messages.map((msg, idx) => (
            <ChatMessage
              key={msg.id}
              message={msg}
              isStreaming={isStreaming && idx === messages.length - 1 && msg.role === 'assistant'}
              isLast={idx === messages.length - 1 && msg.role === 'assistant'}
            />
          ))
        )}
      </ConversationContent>
      <ConversationScrollButton />
    </Conversation>
  )
}
