import { useCallback, useEffect, useRef, useState } from 'react'
import { MicIcon, SquareIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Spinner } from '@/components/ui/spinner'

// ── Types ──────────────────────────────────────────────

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionResultList {
  readonly length: number
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  readonly length: number
  [index: number]: SpeechRecognitionAlternative
  isFinal: boolean
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

// Re-use the global declarations from speech-input.tsx (no redeclare)

// ── Waveform Canvas ────────────────────────────────────

const BAR_COUNT = 40
const BAR_GAP = 1.5
const MIN_BAR_HEIGHT = 2

function AudioWaveform({
  analyser,
  className,
}: {
  analyser: AnalyserNode | null
  className?: string
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animFrameRef = useRef<number>(0)
  const smoothedRef = useRef<Float32Array | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !analyser) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dataArray = new Uint8Array(analyser.frequencyBinCount)
    // Per-instance smoothed values for fluid interpolation
    smoothedRef.current = new Float32Array(BAR_COUNT)

    const draw = () => {
      animFrameRef.current = requestAnimationFrame(draw)
      const smoothed = smoothedRef.current
      if (!smoothed) return

      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.scale(dpr, dpr)

      const w = rect.width
      const h = rect.height

      ctx.clearRect(0, 0, w, h)

      analyser.getByteFrequencyData(dataArray)

      const barWidth = (w - (BAR_COUNT - 1) * BAR_GAP) / BAR_COUNT
      const step = Math.floor(dataArray.length / BAR_COUNT)

      const style = getComputedStyle(canvas)
      const color = style.color

      for (let i = 0; i < BAR_COUNT; i++) {
        let sum = 0
        for (let j = 0; j < step; j++) {
          sum += dataArray[i * step + j]
        }
        const avg = sum / step
        const normalized = Math.pow(avg / 255, 0.8)

        // Smooth lerp toward target for fluid motion
        smoothed[i] += (normalized - smoothed[i]) * 0.18

        const maxBarHeight = h * 0.85
        const barHeight = Math.max(MIN_BAR_HEIGHT, smoothed[i] * maxBarHeight)

        const x = i * (barWidth + BAR_GAP)
        const y = (h - barHeight) / 2

        // Opacity varies with amplitude for depth
        ctx.globalAlpha = 0.4 + smoothed[i] * 0.6
        ctx.fillStyle = color
        ctx.beginPath()
        const radius = Math.min(barWidth / 2, barHeight / 2, 2)
        ctx.roundRect(x, y, barWidth, barHeight, radius)
        ctx.fill()
      }
      ctx.globalAlpha = 1
    }

    draw()

    return () => {
      cancelAnimationFrame(animFrameRef.current)
    }
  }, [analyser])

  return (
    <canvas
      ref={canvasRef}
      className={cn('h-full w-full text-foreground', className)}
    />
  )
}

// ── Duration Timer ──────────────────────────────────────

function RecordingTimer({ startTime }: { startTime: number }) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [startTime])

  const minutes = Math.floor(elapsed / 60)
  const seconds = elapsed % 60
  return (
    <span className="tabular-nums text-xs text-muted-foreground">
      {minutes}:{seconds.toString().padStart(2, '0')}
    </span>
  )
}

// ── Main Component ─────────────────────────────────────

export interface VoiceInputProps {
  onTranscriptionChange?: (text: string) => void
  onAudioRecorded?: (audioBlob: Blob) => Promise<string>
  lang?: string
  className?: string
}

export function VoiceInput({
  onTranscriptionChange,
  onAudioRecorded,
  lang = 'zh-CN',
  className,
}: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null)
  const [recordStartTime, setRecordStartTime] = useState(0)

  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  const onTranscriptionChangeRef = useRef(onTranscriptionChange)
  const onAudioRecordedRef = useRef(onAudioRecorded)
  onTranscriptionChangeRef.current = onTranscriptionChange
  onAudioRecordedRef.current = onAudioRecorded

  // Detect mode
  const hasSpeechRecognition =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)

  // Setup audio analyser from microphone stream
  const setupAnalyser = useCallback((stream: MediaStream) => {
    const audioCtx = new AudioContext()
    const source = audioCtx.createMediaStreamSource(stream)
    const analyser = audioCtx.createAnalyser()
    analyser.fftSize = 256
    analyser.smoothingTimeConstant = 0.7
    source.connect(analyser)
    audioCtxRef.current = audioCtx
    setAnalyserNode(analyser)
  }, [])

  const cleanupAudio = useCallback(() => {
    if (audioCtxRef.current) {
      audioCtxRef.current.close()
      audioCtxRef.current = null
    }
    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) {
        track.stop()
      }
      streamRef.current = null
    }
    setAnalyserNode(null)
  }, [])

  // Start listening
  const startListening = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      setupAnalyser(stream)
      setRecordStartTime(Date.now())

      if (hasSpeechRecognition) {
        // Use Web Speech API
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition
        const recognition = new SR()
        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = lang

        recognition.addEventListener('result', (event: Event) => {
          const e = event as SpeechRecognitionEvent
          let finalTranscript = ''
          for (let i = e.resultIndex; i < e.results.length; i++) {
            if (e.results[i].isFinal) {
              finalTranscript += e.results[i][0]?.transcript ?? ''
            }
          }
          if (finalTranscript) {
            onTranscriptionChangeRef.current?.(finalTranscript)
          }
        })

        recognition.addEventListener('error', () => {
          stopListening()
        })

        recognition.addEventListener('end', () => {
          // Auto-restart if still listening (browser may stop after silence)
          // We don't auto-restart; user controls via button
        })

        recognitionRef.current = recognition
        recognition.start()
      } else if (onAudioRecordedRef.current) {
        // Fallback: MediaRecorder
        const mediaRecorder = new MediaRecorder(stream)
        audioChunksRef.current = []

        mediaRecorder.addEventListener('dataavailable', (event: BlobEvent) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data)
          }
        })

        mediaRecorder.addEventListener('stop', async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
          if (audioBlob.size > 0 && onAudioRecordedRef.current) {
            setIsProcessing(true)
            try {
              const transcript = await onAudioRecordedRef.current(audioBlob)
              if (transcript) {
                onTranscriptionChangeRef.current?.(transcript)
              }
            } catch { /* caller handles */ }
            finally { setIsProcessing(false) }
          }
        })

        mediaRecorderRef.current = mediaRecorder
        mediaRecorder.start()
      }

      setIsListening(true)
    } catch {
      cleanupAudio()
    }
  }, [lang, hasSpeechRecognition, setupAnalyser, cleanupAudio])

  // Stop listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current = null
    }
    cleanupAudio()
    setIsListening(false)
  }, [cleanupAudio])

  const toggle = useCallback(() => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }, [isListening, startListening, stopListening])

  // Cleanup on unmount
  useEffect(() => () => {
    if (recognitionRef.current) recognitionRef.current.stop()
    if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.stop()
    cleanupAudio()
  }, [cleanupAudio])

  const isDisabled =
    typeof window === 'undefined' ||
    (!hasSpeechRecognition && !onAudioRecorded) ||
    isProcessing

  // Not listening: just a mic icon button
  if (!isListening) {
    return (
      <button
        type="button"
        disabled={isDisabled}
        onClick={toggle}
        className={cn(
          'flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40',
          className,
        )}
        aria-label="语音输入"
      >
        {isProcessing ? <Spinner /> : <MicIcon className="size-4" />}
      </button>
    )
  }

  // Listening: expanded waveform bar with stop button + timer
  return (
    <div className={cn(
      'flex h-8 items-center gap-2 rounded-full bg-foreground/5 px-3 transition-all duration-300 animate-in fade-in slide-in-from-right-2',
      className,
    )}>
      {/* Pulsing red dot */}
      <span className="relative flex size-2 shrink-0">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-destructive/60" />
        <span className="relative inline-flex size-2 rounded-full bg-destructive" />
      </span>

      {/* Timer */}
      <RecordingTimer startTime={recordStartTime} />

      {/* Waveform */}
      <div className="h-6 w-32">
        <AudioWaveform analyser={analyserNode} />
      </div>

      {/* Stop button */}
      <button
        type="button"
        onClick={toggle}
        className="flex size-6 shrink-0 items-center justify-center rounded-full bg-destructive text-white transition-colors hover:bg-destructive/80"
        aria-label="停止录音"
      >
        <SquareIcon className="size-3" />
      </button>
    </div>
  )
}
