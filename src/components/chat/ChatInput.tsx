import { useCallback, useEffect, useState } from 'react'
import { PaperclipIcon, BookOpenIcon, ScrollTextIcon, CheckIcon, XIcon, ArrowUpIcon, SquareIcon } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useChatStore } from '@/stores/chat'
import { usePreferencesStore } from '@/stores/preferences'
import {
  usePromptInputAttachments,
  type PromptInputMessage,
} from '@/components/ai-elements/prompt-input'
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputHeader,
  PromptInputFooter,
  PromptInputTools,
  PromptInputButton,
} from '@/components/ai-elements/prompt-input'
import {
  Attachments,
  Attachment,
  AttachmentPreview,
  AttachmentInfo,
  AttachmentRemove,
} from '@/components/ai-elements/attachments'
import { VoiceInput } from './VoiceInput'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { TooltipProvider } from '@/components/ui/tooltip'
import type { KnowledgeBase, PromptTemplate } from '@/services/modules/ai'

/** 上传文件按钮（调用 PromptInput 内部的 file input） */
function UploadButton() {
  const { openFileDialog } = usePromptInputAttachments()
  return (
    <PromptInputButton tooltip="上传文件" onClick={openFileDialog}>
      <PaperclipIcon className="size-4" />
    </PromptInputButton>
  )
}

/** 输入框上方的附件预览区 */
function AttachmentBar() {
  const { files, remove } = usePromptInputAttachments()

  if (files.length === 0) return null

  return (
    <Attachments variant="inline" className="flex-wrap">
      {files.map((file) => (
        <Attachment
          key={file.id}
          data={file}
          onRemove={() => remove(file.id)}
        >
          <AttachmentPreview />
          <AttachmentInfo />
          <AttachmentRemove />
        </Attachment>
      ))}
    </Attachments>
  )
}

/** 选中的提示词标签（输入框上方） */
function PromptTemplateTag({
  name,
  onRemove,
}: {
  name: string
  onRemove: () => void
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/60 px-2 py-0.5 text-xs text-foreground">
      <ScrollTextIcon className="size-3 text-muted-foreground" />
      <span className="max-w-[160px] truncate">{name}</span>
      <button
        type="button"
        className="ml-0.5 rounded-sm p-0.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        onClick={onRemove}
      >
        <XIcon className="size-3" />
      </button>
    </span>
  )
}

/** 自定义发送按钮：圆形，无内容时灰色，有内容时黑色/白色 */
function ChatSubmitButton({
  status,
  onStop,
}: {
  status?: 'streaming' | 'submitted'
  onStop: () => void
}) {
  const { files } = usePromptInputAttachments()
  const [hasText, setHasText] = useState(false)

  // 监听 textarea 输入变化
  useEffect(() => {
    const textarea = document.querySelector<HTMLTextAreaElement>('[name="message"]')
    if (!textarea) return
    const handler = () => setHasText(textarea.value.trim().length > 0)
    handler()
    textarea.addEventListener('input', handler)
    return () => textarea.removeEventListener('input', handler)
  }, [])

  const isGenerating = status === 'submitted' || status === 'streaming'
  const hasContent = hasText || files.length > 0

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (isGenerating && onStop) {
        e.preventDefault()
        onStop()
      }
    },
    [isGenerating, onStop],
  )

  return (
    <button
      type={isGenerating ? 'button' : 'submit'}
      aria-label={isGenerating ? '停止' : '发送'}
      onClick={handleClick}
      className={cn(
        'flex size-8 items-center justify-center rounded-full transition-colors',
        isGenerating
          ? 'bg-foreground text-background'
          : hasContent
            ? 'bg-foreground text-background hover:bg-foreground/80'
            : 'bg-muted-foreground/20 text-muted-foreground cursor-default',
      )}
      disabled={!isGenerating && !hasContent}
    >
      {status === 'submitted' ? (
        <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : status === 'streaming' ? (
        <SquareIcon className="size-3.5" />
      ) : (
        <ArrowUpIcon className="size-4" />
      )}
    </button>
  )
}

export function ChatInput() {
  const wideMode = usePreferencesStore((s) => s.wideMode)
  const sendMessage = useChatStore((s) => s.sendMessage)
  const stopStreaming = useChatStore((s) => s.stopStreaming)
  const streamStatus = useChatStore((s) => s.streamStatus)
  const knowledgeBaseIds = useChatStore((s) => s.knowledgeBaseIds)
  const setKnowledgeBaseIds = useChatStore((s) => s.setKnowledgeBaseIds)
  const promptTemplateId = useChatStore((s) => s.promptTemplateId)
  const setPromptTemplateId = useChatStore((s) => s.setPromptTemplateId)

  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([])
  const [kbLoaded, setKbLoaded] = useState(false)

  const [promptTemplates, setPromptTemplates] = useState<PromptTemplate[]>([])
  const [ptLoaded, setPtLoaded] = useState(false)

  const loadKnowledgeBases = useCallback(async () => {
    if (kbLoaded) return
    try {
      const { aiApi } = await import('@/services')
      const list = await aiApi.listAllKnowledgeBases(1)
      setKnowledgeBases(list)
    } catch { /* ignore */ }
    setKbLoaded(true)
  }, [kbLoaded])

  const loadPromptTemplates = useCallback(async () => {
    if (ptLoaded) return
    try {
      const { aiApi } = await import('@/services')
      const list = await aiApi.listAllPromptTemplates(1)
      setPromptTemplates(list)
    } catch { /* ignore */ }
    setPtLoaded(true)
  }, [ptLoaded])

  const chatStatus = streamStatus === 'streaming'
    ? 'streaming' as const
    : streamStatus === 'uploading'
      ? 'submitted' as const
      : undefined

  const handleSubmit = useCallback(async (msg: PromptInputMessage) => {
    const text = msg.text.trim()
    const files = msg.files ?? []

    if (!text && files.length === 0) return

    const imageUrls: string[] = []
    let audioUrl: string | undefined

    if (files.length > 0) {
      useChatStore.setState({ streamStatus: 'uploading' })
      try {
        const { aiApi } = await import('@/services')
        for (const file of files) {
          if (!file.url) continue
          const blob = await fetch(file.url).then((r) => r.blob())
          const realFile = new File([blob], file.filename ?? 'file', { type: file.mediaType })
          const cdnUrl = await aiApi.uploadFile(realFile)

          if (file.mediaType?.startsWith('audio/')) {
            audioUrl = cdnUrl
          } else {
            imageUrls.push(cdnUrl)
          }
        }
      } catch {
        toast.error('文件上传失败')
        useChatStore.setState({ streamStatus: 'idle' })
        throw new Error('upload failed')
      }
    }

    await sendMessage(text, imageUrls, audioUrl)
  }, [sendMessage])

  const handleTranscription = useCallback((text: string) => {
    const textarea = document.querySelector<HTMLTextAreaElement>('[name="message"]')
    if (textarea) {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        HTMLTextAreaElement.prototype,
        'value',
      )?.set
      nativeInputValueSetter?.call(textarea, textarea.value + text)
      textarea.dispatchEvent(new Event('input', { bubbles: true }))
    }
  }, [])

  const toggleKb = useCallback((id: number) => {
    const current = useChatStore.getState().knowledgeBaseIds
    if (current.includes(id)) {
      setKnowledgeBaseIds(current.filter((k) => k !== id))
    } else {
      setKnowledgeBaseIds([...current, id])
    }
  }, [setKnowledgeBaseIds])

  const selectPromptTemplate = useCallback((id: number) => {
    setPromptTemplateId(promptTemplateId === id ? null : id)
  }, [promptTemplateId, setPromptTemplateId])

  const selectedPt = promptTemplates.find((pt) => pt.id === promptTemplateId)

  return (
    <div className="shrink-0 px-4 pb-4 pt-2">
      <div className={`mx-auto ${wideMode ? 'max-w-[1024px]' : 'max-w-[760px]'}`}>
        <TooltipProvider>
          <PromptInput
            accept="image/*,audio/*,.pdf,.doc,.docx,.txt,.md,.csv"
            multiple
            maxFiles={5}
            maxFileSize={10 * 1024 * 1024}
            onSubmit={handleSubmit}
            onError={(err) => toast.error(err.message)}
          >
            {/* 输入框上方：附件预览 + 提示词标签 */}
            <PromptInputHeader>
              <AttachmentBar />
              {selectedPt && (
                <PromptTemplateTag
                  name={selectedPt.promptName}
                  onRemove={() => setPromptTemplateId(null)}
                />
              )}
            </PromptInputHeader>

            <PromptInputTextarea placeholder="输入消息..." />

            <PromptInputFooter>
              <PromptInputTools>
                <UploadButton />

                {/* 提示词选择 */}
                <Popover>
                  <PopoverTrigger asChild>
                    <PromptInputButton
                      tooltip="提示词"
                      onClick={loadPromptTemplates}
                    >
                      <ScrollTextIcon className="size-4" />
                    </PromptInputButton>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-64 p-0">
                    <div className="border-b px-3 py-2 text-sm font-medium">选择提示词</div>
                    <ScrollArea className="max-h-48">
                      {promptTemplates.length === 0 ? (
                        <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                          {ptLoaded ? '暂无可用提示词' : '加载中...'}
                        </div>
                      ) : (
                        <div className="p-1">
                          {promptTemplates.map((pt) => (
                            <button
                              key={pt.id}
                              type="button"
                              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent"
                              onClick={() => selectPromptTemplate(pt.id)}
                            >
                              <span className="flex-1 truncate">{pt.promptName}</span>
                              {promptTemplateId === pt.id && (
                                <CheckIcon className="size-4 shrink-0 text-primary" />
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </PopoverContent>
                </Popover>

                {/* 知识库选择 */}
                <Popover>
                  <PopoverTrigger asChild>
                    <PromptInputButton
                      tooltip="知识库"
                      onClick={loadKnowledgeBases}
                      className="relative"
                    >
                      <BookOpenIcon className="size-4" />
                      {knowledgeBaseIds.length > 0 && (
                        <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                          {knowledgeBaseIds.length}
                        </span>
                      )}
                    </PromptInputButton>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-64 p-0">
                    <div className="border-b px-3 py-2 text-sm font-medium">选择知识库</div>
                    <ScrollArea className="max-h-48">
                      {knowledgeBases.length === 0 ? (
                        <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                          {kbLoaded ? '暂无可用知识库' : '加载中...'}
                        </div>
                      ) : (
                        <div className="p-1">
                          {knowledgeBases.map((kb) => (
                            <label
                              key={kb.id}
                              className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
                            >
                              <Checkbox
                                checked={knowledgeBaseIds.includes(kb.id)}
                                onCheckedChange={() => toggleKb(kb.id)}
                              />
                              <span className="truncate">{kb.kbName}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </PopoverContent>
                </Popover>
              </PromptInputTools>

              <div className="flex items-center gap-1">
                <VoiceInput
                  lang="zh-CN"
                  onTranscriptionChange={handleTranscription}
                />
                <ChatSubmitButton
                  status={chatStatus}
                  onStop={stopStreaming}
                />
              </div>
            </PromptInputFooter>
          </PromptInput>
        </TooltipProvider>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Refinex 可能会犯错，请核查重要信息。
        </p>
      </div>
    </div>
  )
}
