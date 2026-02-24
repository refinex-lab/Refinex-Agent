import { useCallback, useEffect, useRef } from 'react'
import { Milkdown, MilkdownProvider, useEditor, useInstance } from '@milkdown/react'
import { Editor, rootCtx, defaultValueCtx } from '@milkdown/kit/core'
import { commonmark } from '@milkdown/kit/preset/commonmark'
import { listener, listenerCtx } from '@milkdown/kit/plugin/listener'
import { history } from '@milkdown/kit/plugin/history'
import { getMarkdown } from '@milkdown/kit/utils'
import { Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import { useKbStore } from '@/stores/knowledge-base'
import type { Document } from '@/services/modules/ai'

interface DocumentEditorProps {
  kbId: number
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

function EditorContent({ kbId, doc }: DocumentEditorProps) {
  const [loading, getEditor] = useInstance()
  const docContent = useKbStore((s) => s.docContent)
  const contentDirty = useKbStore((s) => s.contentDirty)
  const setContentDirty = useKbStore((s) => s.setContentDirty)
  const savingRef = useRef(false)

  const handleChange = useCallback((_md: string) => {
    setContentDirty(true)
  }, [setContentDirty])

  const handleSave = useCallback(async () => {
    if (savingRef.current || loading) return
    const editor = getEditor()
    if (!editor) return

    savingRef.current = true
    try {
      const markdown = editor.action(getMarkdown())

      const { aiApi } = await import('@/services')
      await aiApi.updateDocumentContent(kbId, doc.id, markdown)
      setContentDirty(false)
      toast.success('文档已保存')
    } catch {
      // handled by interceptor
    } finally {
      savingRef.current = false
    }
  }, [loading, getEditor, kbId, doc, setContentDirty])

  // Cmd+S save
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        handleSave()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handleSave])

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b px-4 py-2">
        <span className="truncate text-sm font-medium">{doc.docName}</span>
        <Button
          variant="outline"
          size="sm"
          className="h-7"
          disabled={!contentDirty}
          onClick={handleSave}
        >
          <Save className="mr-1.5 size-3.5" />
          保存
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="milkdown-editor max-w-none p-4">
          <MilkdownInner defaultValue={docContent ?? ''} onChange={handleChange} />
        </div>
      </ScrollArea>
    </div>
  )
}

export function DocumentEditor(props: DocumentEditorProps) {
  return (
    <MilkdownProvider>
      <EditorContent {...props} />
    </MilkdownProvider>
  )
}
