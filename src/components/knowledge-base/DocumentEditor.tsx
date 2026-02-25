import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'
import { Crepe, CrepeFeature } from '@milkdown/crepe'
import { Milkdown, MilkdownProvider, useEditor } from '@milkdown/react'
import { toast } from 'sonner'
import '@milkdown/crepe/theme/common/style.css'
import { useKbStore } from '@/stores/knowledge-base'
import { MarkdownToc } from './MarkdownToc'
import type { Document } from '@/services/modules/ai'

interface DocumentEditorProps {
  doc: Document
  editorContainerRef?: RefObject<HTMLDivElement | null>
}

function ImageLightbox({ src, onClose }: { src: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm cursor-zoom-out"
      onClick={onClose}
    >
      <img
        src={src}
        className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  )
}

function CrepeEditor({ defaultValue, onChange }: { defaultValue: string; onChange: (md: string) => void }) {
  const crepeRef = useRef<Crepe | null>(null)
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null)

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

    crepeRef.current = crepe
    return crepe.editor
  }, [defaultValue])

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

export function DocumentEditor({ doc: _doc, editorContainerRef }: DocumentEditorProps) {
  const docContent = useKbStore((s) => s.docContent)
  const setContentDirty = useKbStore((s) => s.setContentDirty)
  const scrollRef = useRef<HTMLDivElement>(null)

  const handleChange = useCallback((_md: string) => {
    setContentDirty(true)
  }, [setContentDirty])

  return (
    <div className="flex h-full">
      <div ref={scrollRef} className="flex-1 min-w-0 overflow-auto">
        <div ref={editorContainerRef} className="milkdown-editor max-w-none p-4">
          <MilkdownProvider>
            <CrepeEditor defaultValue={docContent ?? ''} onChange={handleChange} />
          </MilkdownProvider>
        </div>
      </div>
      <MarkdownToc markdown={docContent ?? ''} scrollRef={scrollRef} />
    </div>
  )
}
