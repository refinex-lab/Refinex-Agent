import { useCallback, useEffect, useRef } from 'react'
import { Save, ExternalLink, FileText, Download, FileDown, FileType, FileImage } from 'lucide-react'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty'
import { Spinner } from '@/components/ui/spinner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MilkdownProvider, useInstance } from '@milkdown/react'
import { getMarkdown } from '@milkdown/kit/utils'
import { toast } from 'sonner'
import { useKbStore } from '@/stores/knowledge-base'
import { DocumentEditor } from './DocumentEditor'
import { DocumentViewer } from './DocumentViewer'
import { DocumentChunksPanel } from './DocumentChunksPanel'
import { FilePreviewRouter } from './preview/FilePreviewRouter'
import { exportDocument, type ExportFormat } from './export-document'

interface DocumentPanelProps {
  kbId: number
}

const MARKDOWN_TYPES = ['MARKDOWN', 'MD', 'TXT']
const TEXT_ONLY_TYPES = new Set(['MD', 'MARKDOWN', 'TXT', 'JSON'])

function SaveButton({ kbId, docId }: { kbId: number; docId: number }) {
  const [loading, getEditor] = useInstance()
  const contentDirty = useKbStore((s) => s.contentDirty)
  const setContentDirty = useKbStore((s) => s.setContentDirty)
  const savingRef = useRef(false)

  const handleSave = useCallback(async () => {
    if (savingRef.current || loading) return
    const editor = getEditor()
    if (!editor) return

    savingRef.current = true
    try {
      const markdown = editor.action(getMarkdown())
      const { aiApi } = await import('@/services')
      await aiApi.updateDocumentContent(kbId, docId, markdown)
      setContentDirty(false)
      toast.success('文档已保存')
    } catch {
      // handled by interceptor
    } finally {
      savingRef.current = false
    }
  }, [loading, getEditor, kbId, docId, setContentDirty])

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
    <Button
      variant="ghost"
      size="sm"
      className="h-7"
      disabled={!contentDirty}
      onClick={handleSave}
    >
      <Save className="mr-1.5 size-3.5" />
      保存
    </Button>
  )
}

function DocumentPanelInner({ kbId }: DocumentPanelProps) {
  const selectedDocId = useKbStore((s) => s.selectedDocId)
  const documents = useKbStore((s) => s.documents)
  const contentLoading = useKbStore((s) => s.contentLoading)
  const loadDocContent = useKbStore((s) => s.loadDocContent)
  const hasEmbeddingModel = useKbStore((s) => s.hasEmbeddingModel)
  const docContent = useKbStore((s) => s.docContent)
  const editorContainerRef = useRef<HTMLDivElement>(null)

  const doc = documents.find((d) => d.id === selectedDocId)
  const isMarkdown = doc && MARKDOWN_TYPES.includes(doc.docType?.toUpperCase())
  const showPreviewTab = doc && !!doc.fileUrl && !TEXT_ONLY_TYPES.has(doc.docType?.toUpperCase())

  const handleExport = useCallback((format: ExportFormat) => {
    if (!doc) return
    const title = doc.docName?.replace(/\.[^.]+$/, '') || '文档'
    exportDocument(format, docContent ?? '', editorContainerRef.current, title)
  }, [doc, docContent])

  useEffect(() => {
    if (selectedDocId && kbId) {
      loadDocContent(kbId, selectedDocId)
    }
  }, [selectedDocId, kbId, loadDocContent])

  if (!selectedDocId || !doc) {
    return (
      <div className="flex h-full items-center justify-center">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileText />
            </EmptyMedia>
            <EmptyTitle>选择一个文档</EmptyTitle>
            <EmptyDescription>从左侧选择文档查看或编辑内容</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    )
  }

  if (contentLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner className="size-6" />
      </div>
    )
  }

  return (
    <Tabs defaultValue={showPreviewTab ? 'preview' : 'content'} className="flex h-full flex-col">
      <div className="flex items-center border-b px-4">
        <TabsList variant="line" className="h-10">
          {showPreviewTab && <TabsTrigger value="preview">预览</TabsTrigger>}
          <TabsTrigger value="content">内容</TabsTrigger>
          {hasEmbeddingModel && <TabsTrigger value="chunks">切片</TabsTrigger>}
        </TabsList>
        <div className="ml-auto flex items-center gap-1">
          {isMarkdown && <SaveButton kbId={kbId} docId={doc.id} />}
          {isMarkdown ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7">
                  <Download className="mr-1.5 size-3.5" />
                  导出
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExport('md')}>
                  <FileDown className="mr-2 size-4" />
                  Markdown (.md)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('html')}>
                  <FileType className="mr-2 size-4" />
                  HTML (.html)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('pdf')}>
                  <FileImage className="mr-2 size-4" />
                  PDF (.pdf)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('docx')}>
                  <FileText className="mr-2 size-4" />
                  Word (.docx)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : doc.fileUrl && (
            <Button variant="ghost" size="sm" className="h-7" asChild>
              <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-1.5 size-3.5" />
                原文件
              </a>
            </Button>
          )}
        </div>
      </div>
      {showPreviewTab && (
        <TabsContent value="preview" className="flex-1 overflow-hidden m-0">
          <FilePreviewRouter fileUrl={doc.fileUrl} docType={doc.docType} />
        </TabsContent>
      )}
      <TabsContent value="content" className="flex-1 overflow-hidden m-0">
        {isMarkdown ? (
          <DocumentEditor doc={doc} editorContainerRef={editorContainerRef} />
        ) : (
          <DocumentViewer />
        )}
      </TabsContent>
      {hasEmbeddingModel && (
        <TabsContent value="chunks" className="flex-1 overflow-hidden m-0">
          <DocumentChunksPanel kbId={kbId} docId={doc.id} />
        </TabsContent>
      )}
    </Tabs>
  )
}

export function DocumentPanel(props: DocumentPanelProps) {
  return (
    <MilkdownProvider>
      <DocumentPanelInner {...props} />
    </MilkdownProvider>
  )
}
