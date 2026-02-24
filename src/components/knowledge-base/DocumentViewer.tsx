import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { FileText, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Document } from '@/services/modules/ai'
import { useKbStore } from '@/stores/knowledge-base'

interface DocumentViewerProps {
  doc: Document
}

export function DocumentViewer({ doc }: DocumentViewerProps) {
  const docContent = useKbStore((s) => s.docContent)

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b px-4 py-2">
        <div className="flex items-center gap-2">
          <FileText className="size-4 text-muted-foreground" />
          <span className="truncate text-sm font-medium">{doc.docName}</span>
          <Badge variant="secondary" className="text-xs">{doc.docType}</Badge>
        </div>
        {doc.fileUrl && (
          <Button variant="ghost" size="sm" className="h-7" asChild>
            <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-1.5 size-3.5" />
              打开原文件
            </a>
          </Button>
        )}
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4">
          {docContent ? (
            <pre className="whitespace-pre-wrap text-sm">{docContent}</pre>
          ) : (
            <p className="text-sm text-muted-foreground">无法预览此文件类型的内容</p>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
