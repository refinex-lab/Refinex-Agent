import { useState } from 'react'
import type { ChatMessageUI } from '@/types/chat'
import { Message, MessageContent } from '@/components/ai-elements/message'
import {
  Attachments,
  Attachment,
  AttachmentPreview,
  AttachmentInfo,
} from '@/components/ai-elements/attachments'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'

interface UserMessageProps {
  message: ChatMessageUI
}

export function UserMessage({ message }: UserMessageProps) {
  const imageAtts = message.attachments.filter((a) => a.type.startsWith('image/'))
  const otherAtts = message.attachments.filter((a) => !a.type.startsWith('image/'))
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  return (
    <Message from="user">
      {imageAtts.length > 0 && (
        <Attachments variant="grid" className="ml-auto">
          {imageAtts.map((att) => (
            <Attachment
              key={att.id}
              data={{
                id: att.id,
                type: 'file' as const,
                filename: att.name,
                mediaType: att.type,
                url: att.url,
              }}
              className="cursor-pointer"
              onClick={() => setPreviewUrl(att.url)}
            >
              <AttachmentPreview />
            </Attachment>
          ))}
        </Attachments>
      )}
      {otherAtts.length > 0 && (
        <Attachments variant="inline" className="ml-auto">
          {otherAtts.map((att) => (
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

      <Dialog open={!!previewUrl} onOpenChange={(open) => { if (!open) setPreviewUrl(null) }}>
        <DialogContent className="max-w-4xl p-2">
          <DialogTitle className="sr-only">图片预览</DialogTitle>
          {previewUrl && <img src={previewUrl} alt="图片预览" className="w-full rounded" />}
        </DialogContent>
      </Dialog>
    </Message>
  )
}
