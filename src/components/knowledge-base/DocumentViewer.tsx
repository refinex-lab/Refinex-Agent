import { ScrollArea } from '@/components/ui/scroll-area'
import { useKbStore } from '@/stores/knowledge-base'

export function DocumentViewer() {
  const docContent = useKbStore((s) => s.docContent)

  return (
    <ScrollArea className="h-full">
      <div className="p-4">
        {docContent ? (
          <pre className="whitespace-pre-wrap text-sm">{docContent}</pre>
        ) : (
          <p className="text-sm text-muted-foreground">无法预览此文件类型的内容</p>
        )}
      </div>
    </ScrollArea>
  )
}
