import { useFileBlob } from '@/hooks/useFileBlob'
import { Button } from '@/components/ui/button'
import { Download, Loader2 } from 'lucide-react'
import { PdfPreview } from './PdfPreview'
import { DocxPreview } from './DocxPreview'
import { ExcelPreview } from './ExcelPreview'
import { HtmlPreview } from './HtmlPreview'

interface FilePreviewRouterProps {
  fileUrl: string
  docType: string
}

const PREVIEWABLE = new Set(['PDF', 'DOCX', 'XLSX', 'CSV', 'HTML'])

export function FilePreviewRouter({ fileUrl, docType }: FilePreviewRouterProps) {
  const type = docType.toUpperCase()
  const needBlob = PREVIEWABLE.has(type)
  const { blob, loading, error } = useFileBlob(needBlob ? fileUrl : undefined)

  // 不支持嵌入预览的类型 → 下载按钮
  if (!PREVIEWABLE.has(type)) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3">
        <p className="text-sm text-muted-foreground">
          {type} 文件暂不支持在线预览
        </p>
        <Button variant="outline" size="sm" asChild>
          <a href={fileUrl} target="_blank" rel="noopener noreferrer">
            <Download className="mr-1.5 size-3.5" />
            下载原文件
          </a>
        </Button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">加载文件中…</span>
      </div>
    )
  }

  if (error || !blob) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3">
        <p className="text-sm text-destructive">{error ?? '文件加载失败'}</p>
        <Button variant="outline" size="sm" asChild>
          <a href={fileUrl} target="_blank" rel="noopener noreferrer">
            <Download className="mr-1.5 size-3.5" />
            下载原文件
          </a>
        </Button>
      </div>
    )
  }

  switch (type) {
    case 'PDF':
      return <PdfPreview blob={blob} />
    case 'DOCX':
      return <DocxPreview blob={blob} />
    case 'XLSX':
    case 'CSV':
      return <ExcelPreview blob={blob} docType={type} />
    case 'HTML':
      return <HtmlPreview blob={blob} />
    default:
      return null
  }
}
