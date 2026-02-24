import { useEffect } from 'react'
import { FileText } from 'lucide-react'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty'
import { Spinner } from '@/components/ui/spinner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useKbStore } from '@/stores/knowledge-base'
import { DocumentEditor } from './DocumentEditor'
import { DocumentViewer } from './DocumentViewer'
import { DocumentChunksPanel } from './DocumentChunksPanel'

interface DocumentPanelProps {
  kbId: number
}

const MARKDOWN_TYPES = ['MARKDOWN', 'MD', 'TXT']

export function DocumentPanel({ kbId }: DocumentPanelProps) {
  const selectedDocId = useKbStore((s) => s.selectedDocId)
  const documents = useKbStore((s) => s.documents)
  const contentLoading = useKbStore((s) => s.contentLoading)
  const loadDocContent = useKbStore((s) => s.loadDocContent)

  const doc = documents.find((d) => d.id === selectedDocId)
  const isMarkdown = doc && MARKDOWN_TYPES.includes(doc.docType?.toUpperCase())

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
    <Tabs defaultValue="content" className="flex h-full flex-col">
      <div className="flex items-center border-b px-4">
        <TabsList variant="line" className="h-10">
          <TabsTrigger value="content">内容</TabsTrigger>
          <TabsTrigger value="chunks">切片</TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="content" className="flex-1 overflow-hidden m-0">
        {isMarkdown ? (
          <DocumentEditor kbId={kbId} doc={doc} />
        ) : (
          <DocumentViewer doc={doc} />
        )}
      </TabsContent>
      <TabsContent value="chunks" className="flex-1 overflow-hidden m-0">
        <DocumentChunksPanel kbId={kbId} docId={doc.id} />
      </TabsContent>
    </Tabs>
  )
}
