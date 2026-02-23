import { useEffect } from 'react'
import { useConversationStore } from '@/stores/conversation'
import { useChatStore } from '@/stores/chat'
import { MainContent } from '@/components/layout/MainContent'
import { ChatArea } from '@/components/chat/ChatArea'
import { ChatInput } from '@/components/chat/ChatInput'

export function Component() {
  const placeholderMode = useConversationStore((s) => s.placeholderMode)
  const activeConversationId = useConversationStore((s) => s.activeConversationId)
  const loadConversation = useChatStore((s) => s.loadConversation)
  const clearChat = useChatStore((s) => s.clearChat)

  useEffect(() => {
    if (activeConversationId) {
      loadConversation(activeConversationId)
    } else if (!placeholderMode) {
      clearChat()
    }
  }, [activeConversationId, placeholderMode, loadConversation, clearChat])

  if (placeholderMode) {
    return <MainContent />
  }

  return (
    <>
      <ChatArea />
      <ChatInput />
    </>
  )
}
