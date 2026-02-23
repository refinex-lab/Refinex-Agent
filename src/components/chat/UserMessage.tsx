import type { ChatMessageUI } from '@/types/chat'
import { Message, MessageContent } from '@/components/ai-elements/message'
import {
  Attachments,
  Attachment,
  AttachmentPreview,
  AttachmentInfo,
} from '@/components/ai-elements/attachments'

interface UserMessageProps {
  message: ChatMessageUI
}

export function UserMessage({ message }: UserMessageProps) {
  return (
    <Message from="user">
      {message.attachments.length > 0 && (
        <Attachments variant="inline">
          {message.attachments.map((att) => (
            <Attachment
              key={att.id}
              data={{
                id: att.id,
                type: 'file' as const,
                filename: att.name,
                mediaType: att.type,
                url: att.url,
              }}
            >
              <AttachmentPreview />
              <AttachmentInfo />
            </Attachment>
          ))}
        </Attachments>
      )}
      <MessageContent>{message.content}</MessageContent>
    </Message>
  )
}
