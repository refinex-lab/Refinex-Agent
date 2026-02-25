import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'
import { Crepe, CrepeFeature } from '@milkdown/crepe'
import { Milkdown, useEditor } from '@milkdown/react'
import { ZoomIn, ZoomOut, Maximize, RotateCcw, X } from 'lucide-react'
import { toast } from 'sonner'
import '@milkdown/crepe/theme/common/style.css'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/components/theme-provider'
import { useKbStore } from '@/stores/knowledge-base'
import { MarkdownToc } from './MarkdownToc'
import { oneLight, oneDark } from './cm-themes'
import type { Document } from '@/services/modules/ai'

interface DocumentEditorProps {
  doc: Document
  editing?: boolean
  editorContainerRef?: RefObject<HTMLDivElement | null>
}

const ZOOM_STEP = 0.25
const ZOOM_MIN = 0.25
const ZOOM_MAX = 5

function ImageLightbox({ src, onClose }: { src: string; onClose: () => void }) {
  const [scale, setScale] = useState(1)
  const [translate, setTranslate] = useState({ x: 0, y: 0 })
  const dragging = useRef(false)
  const lastPos = useRef({ x: 0, y: 0 })

  const reset = () => { setScale(1); setTranslate({ x: 0, y: 0 }) }

  const fitScreen = () => { reset() }

  const zoomIn = () => setScale((s) => Math.min(s + ZOOM_STEP, ZOOM_MAX))
  const zoomOut = () => setScale((s) => Math.max(s - ZOOM_STEP, ZOOM_MIN))

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      setScale((s) => Math.min(Math.max(s - e.deltaY * 0.001, ZOOM_MIN), ZOOM_MAX))
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === '+' || e.key === '=') zoomIn()
      if (e.key === '-') zoomOut()
      if (e.key === '0') reset()
    }
    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return
    e.preventDefault()
    dragging.current = true
    lastPos.current = { x: e.clientX, y: e.clientY }
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return
    setTranslate((t) => ({
      x: t.x + e.clientX - lastPos.current.x,
      y: t.y + e.clientY - lastPos.current.y,
    }))
    lastPos.current = { x: e.clientX, y: e.clientY }
  }

  const onPointerUp = () => { dragging.current = false }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Toolbar */}
      <div
        className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 rounded-xl border border-white/10 bg-black/70 px-2 py-1.5 shadow-lg backdrop-blur"
        onClick={(e) => e.stopPropagation()}
      >
        <Button variant="ghost" size="icon" className="size-8 text-white hover:bg-white/15" onClick={zoomOut} title="缩小">
          <ZoomOut className="size-4" />
        </Button>
        <span className="min-w-[3.5rem] select-none text-center text-xs text-white/80">
          {Math.round(scale * 100)}%
        </span>
        <Button variant="ghost" size="icon" className="size-8 text-white hover:bg-white/15" onClick={zoomIn} title="放大">
          <ZoomIn className="size-4" />
        </Button>
        <div className="mx-1 h-4 w-px bg-white/20" />
        <Button variant="ghost" size="icon" className="size-8 text-white hover:bg-white/15" onClick={fitScreen} title="自适应">
          <Maximize className="size-4" />
        </Button>
        <Button variant="ghost" size="icon" className="size-8 text-white hover:bg-white/15" onClick={reset} title="重置">
          <RotateCcw className="size-4" />
        </Button>
        <div className="mx-1 h-4 w-px bg-white/20" />
        <Button variant="ghost" size="icon" className="size-8 text-white hover:bg-white/15" onClick={onClose} title="关闭">
          <X className="size-4" />
        </Button>
      </div>

      {/* Image */}
      <img
        src={src}
        draggable={false}
        className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain shadow-2xl select-none"
        style={{
          transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
          cursor: dragging.current ? 'grabbing' : 'grab',
          transition: dragging.current ? 'none' : 'transform 0.15s ease',
        }}
        onClick={(e) => e.stopPropagation()}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      />
    </div>
  )
}

function CrepeEditor({ defaultValue, readonly, isDark, onChange }: { defaultValue: string; readonly?: boolean; isDark: boolean; onChange: (md: string) => void }) {
  const crepeRef = useRef<Crepe | null>(null)
  const readonlyRef = useRef(readonly)
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null)

  readonlyRef.current = readonly

  useEditor((root) => {
    const crepe = new Crepe({
      root,
      defaultValue,
      featureConfigs: {
        [CrepeFeature.Placeholder]: {
          text: '输入 / 唤起命令菜单...',
          mode: 'block',
        },
        [CrepeFeature.CodeMirror]: {
          theme: isDark ? oneDark : oneLight,
          onCopy: () => {
            toast.success('已复制到剪贴板')
          },
          renderPreview: (language: string, content: string, applyPreview: (preview: HTMLElement | string) => void) => {
            if (language !== 'mermaid') return null
            import('mermaid').then(({ default: mermaid }) => {
              mermaid.initialize({ startOnLoad: false, theme: 'default', securityLevel: 'strict' })
              const id = `mermaid-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
              mermaid.render(id, content)
                .then(({ svg }) => {
                  const el = document.createElement('div')
                  el.innerHTML = svg
                  applyPreview(el)
                })
                .catch(() => applyPreview('渲染失败'))
            })
          },
        },
      },
    })

    crepe.on((listener) => {
      listener.markdownUpdated((_ctx, markdown, prevMarkdown) => {
        if (markdown !== prevMarkdown) {
          onChange(markdown)
        }
      })
    })

    // Set initial readonly before editor view is created,
    // so the editable() callback returns the correct value from the start
    if (readonlyRef.current) {
      crepe.setReadonly(true)
    }

    crepeRef.current = crepe
    return crepe.editor
  }, [defaultValue, isDark])

  useEffect(() => {
    crepeRef.current?.setReadonly(!!readonly)
  }, [readonly])

  useEffect(() => {
    const handleImgClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === 'IMG' && target.closest('.milkdown-image-block, .milkdown-image-inline')) {
        const src = (target as HTMLImageElement).src
        if (src) setLightboxSrc(src)
      }
    }
    document.addEventListener('click', handleImgClick)
    return () => document.removeEventListener('click', handleImgClick)
  }, [])

  useEffect(() => {
    return () => {
      const crepe = crepeRef.current
      if (crepe) {
        crepe.destroy()
        crepeRef.current = null
      }
    }
  }, [])

  return (
    <>
      <Milkdown />
      {lightboxSrc && <ImageLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />}
    </>
  )
}

export function DocumentEditor({ doc: _doc, editing, editorContainerRef }: DocumentEditorProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  const docContent = useKbStore((s) => s.docContent)
  const setContentDirty = useKbStore((s) => s.setContentDirty)
  const scrollRef = useRef<HTMLDivElement>(null)
  const latestMarkdownRef = useRef(docContent ?? '')

  const handleChange = useCallback((md: string) => {
    latestMarkdownRef.current = md
    setContentDirty(true)
  }, [setContentDirty])

  return (
    <div className="flex h-full">
      <div ref={scrollRef} className="flex-1 min-w-0 overflow-auto">
        <div ref={editorContainerRef} className="milkdown-editor max-w-none p-4">
          <CrepeEditor defaultValue={docContent ?? ''} readonly={!editing} isDark={isDark} onChange={handleChange} />
        </div>
      </div>
      <MarkdownToc markdown={docContent ?? ''} scrollRef={scrollRef} />
    </div>
  )
}
