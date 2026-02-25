import { useCallback, useRef } from 'react'
import { Milkdown, useEditor } from '@milkdown/react'
import { Editor, rootCtx, defaultValueCtx } from '@milkdown/kit/core'
import { commonmark } from '@milkdown/kit/preset/commonmark'
import { listener, listenerCtx } from '@milkdown/kit/plugin/listener'
import { history } from '@milkdown/kit/plugin/history'
import { useKbStore } from '@/stores/knowledge-base'
import { MarkdownToc } from './MarkdownToc'
import type { Document } from '@/services/modules/ai'

interface DocumentEditorProps {
  doc: Document
}

function MilkdownInner({ defaultValue, onChange }: { defaultValue: string; onChange: (md: string) => void }) {
  useEditor((root) => {
    return Editor.make()
      .config((ctx) => {
        ctx.set(rootCtx, root)
        ctx.set(defaultValueCtx, defaultValue)
      })
      .config((ctx) => {
        const l = ctx.get(listenerCtx)
        l.markdownUpdated((_ctx, markdown, prevMarkdown) => {
          if (markdown !== prevMarkdown) {
            onChange(markdown)
          }
        })
      })
      .use(commonmark)
      .use(listener)
      .use(history)
  }, [defaultValue])

  return <Milkdown />
}

export function DocumentEditor({ doc: _doc }: DocumentEditorProps) {
  const docContent = useKbStore((s) => s.docContent)
  const setContentDirty = useKbStore((s) => s.setContentDirty)
  const scrollRef = useRef<HTMLDivElement>(null)

  const handleChange = useCallback((_md: string) => {
    setContentDirty(true)
  }, [setContentDirty])

  return (
    <div className="flex h-full">
      <div ref={scrollRef} className="flex-1 min-w-0 overflow-auto">
        <div className="milkdown-editor max-w-none p-4">
          <MilkdownInner defaultValue={docContent ?? ''} onChange={handleChange} />
        </div>
      </div>
      <MarkdownToc markdown={docContent ?? ''} scrollRef={scrollRef} />
    </div>
  )
}
