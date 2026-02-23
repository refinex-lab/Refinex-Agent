import { useCallback, useRef, useState } from 'react'
import { CopyIcon, CheckIcon, Volume2Icon, RotateCcwIcon, Loader2Icon } from 'lucide-react'
import type { ChatMessageUI } from '@/types/chat'
import { useChatStore } from '@/stores/chat'
import {
  Message,
  MessageResponse,
  MessageToolbar,
  MessageActions,
  MessageAction,
} from '@/components/ai-elements/message'
import {
  Reasoning,
  ReasoningTrigger,
  ReasoningContent,
} from '@/components/ai-elements/reasoning'
import { Shimmer } from '@/components/ai-elements/shimmer'
import {
  AudioPlayer,
  AudioPlayerElement,
  AudioPlayerControlBar,
  AudioPlayerPlayButton,
  AudioPlayerTimeRange,
  AudioPlayerTimeDisplay,
  AudioPlayerDurationDisplay,
} from '@/components/ai-elements/audio-player'
import { GeneratedImage } from './GeneratedImage'
import { RagReferences } from './RagReferences'

interface AssistantMessageProps {
  message: ChatMessageUI
  isStreaming: boolean
  isLast: boolean
}

export function AssistantMessage({ message, isStreaming, isLast }: AssistantMessageProps) {
  const [copied, setCopied] = useState(false)
  const copyTimerRef = useRef<ReturnType<typeof setTimeout>>(null)

  const ttsLoadingId = useChatStore((s) => s.ttsLoadingId)
  const ttsPlayingId = useChatStore((s) => s.ttsPlayingId)
  const ttsAudioUrl = useChatStore((s) => s.ttsAudioUrl)
  const playTts = useChatStore((s) => s.playTts)
  const stopTts = useChatStore((s) => s.stopTts)
  const regenerateLastMessage = useChatStore((s) => s.regenerateLastMessage)
  const streamStatus = useChatStore((s) => s.streamStatus)

  const isStreamingReasoning = isStreaming && message.reasoningContent.length > 0 && message.content.length === 0

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(message.content)
    setCopied(true)
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current)
    copyTimerRef.current = setTimeout(() => setCopied(false), 2000)
  }, [message.content])

  const handleTts = useCallback(() => {
    if (ttsPlayingId === message.id) {
      stopTts()
    } else {
      playTts(message.id, message.content)
    }
  }, [message.id, message.content, ttsPlayingId, playTts, stopTts])

  const isTtsLoading = ttsLoadingId === message.id
  const isTtsPlaying = ttsPlayingId === message.id

  return (
    <Message from="assistant">
      {/* Reasoning */}
      {message.reasoningContent && (
        <Reasoning isStreaming={isStreamingReasoning}>
          <ReasoningTrigger
            getThinkingMessage={(streaming, duration) => {
              if (streaming || duration === 0) {
                return <Shimmer duration={1}>思考中...</Shimmer>
              }
              if (duration === undefined) {
                return <p>思考了几秒</p>
              }
              return <p>思考了 {duration} 秒</p>
            }}
          />
          <ReasoningContent>{message.reasoningContent}</ReasoningContent>
        </Reasoning>
      )}

      {/* Main content */}
      {message.content && (
        <MessageResponse>{message.content}</MessageResponse>
      )}

      {/* Generated images */}
      {message.imageUrls.map((url, idx) => (
        <GeneratedImage key={`${url}-${idx}`} url={url} />
      ))}

      {/* RAG references */}
      <RagReferences references={message.references} />

      {/* TTS audio player */}
      {isTtsPlaying && ttsAudioUrl && (
        <div className="mt-2">
          <AudioPlayer>
            <AudioPlayerElement src={ttsAudioUrl} autoPlay />
            <AudioPlayerControlBar>
              <AudioPlayerPlayButton />
              <AudioPlayerTimeDisplay />
              <AudioPlayerTimeRange />
              <AudioPlayerDurationDisplay />
            </AudioPlayerControlBar>
          </AudioPlayer>
        </div>
      )}

      {/* Toolbar (hidden during streaming) */}
      {!isStreaming && (message.content || message.imageUrls.length > 0) && (
        <MessageToolbar>
          <MessageActions>
            {message.content && (
              <MessageAction
                tooltip="复制"
                onClick={handleCopy}
              >
                {copied ? <CheckIcon className="size-4" /> : <CopyIcon className="size-4" />}
              </MessageAction>
            )}
            {message.content && (
              <MessageAction
                tooltip={isTtsPlaying ? '停止播放' : '朗读'}
                onClick={handleTts}
                disabled={isTtsLoading}
              >
                {isTtsLoading ? (
                  <Loader2Icon className="size-4 animate-spin" />
                ) : (
                  <Volume2Icon className="size-4" />
                )}
              </MessageAction>
            )}
            {isLast && streamStatus === 'idle' && (
              <MessageAction
                tooltip="重新生成"
                onClick={regenerateLastMessage}
              >
                <RotateCcwIcon className="size-4" />
              </MessageAction>
            )}
          </MessageActions>
        </MessageToolbar>
      )}
    </Message>
  )
}
