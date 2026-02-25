import { useState, useMemo } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'

interface PdfPreviewProps {
  blob: Blob
}

export function PdfPreview({ blob }: PdfPreviewProps) {
  const [numPages, setNumPages] = useState(0)
  const [page, setPage] = useState(1)

  const file = useMemo(() => {
    return new window.File([blob], 'preview.pdf', { type: 'application/pdf' })
  }, [blob])

  return (
    <div className="flex h-full flex-col">
      {numPages > 1 && (
        <div className="flex items-center justify-center gap-2 border-b py-1.5">
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <span className="text-xs text-muted-foreground">
            {page} / {numPages}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            disabled={page >= numPages}
            onClick={() => setPage((p) => p + 1)}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      )}
      <div className="flex flex-1 items-start justify-center overflow-auto py-4">
        <Document
          file={file}
          onLoadSuccess={({ numPages: n }) => setNumPages(n)}
          loading={<p className="p-4 text-sm text-muted-foreground">加载 PDF 中…</p>}
          error={<p className="p-4 text-sm text-destructive">PDF 加载失败</p>}
        >
          <Page pageNumber={page} width={700} />
        </Document>
      </div>
    </div>
  )
}
