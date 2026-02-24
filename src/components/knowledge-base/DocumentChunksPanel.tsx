import { useEffect } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Spinner } from '@/components/ui/spinner'
import { Badge } from '@/components/ui/badge'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty'
import { Layers } from 'lucide-react'
import { useKbStore } from '@/stores/knowledge-base'

interface DocumentChunksPanelProps {
  kbId: number
  docId: number
}

export function DocumentChunksPanel({ kbId, docId }: DocumentChunksPanelProps) {
  const chunks = useKbStore((s) => s.chunks)
  const chunksLoading = useKbStore((s) => s.chunksLoading)
  const fetchChunks = useKbStore((s) => s.fetchChunks)

  useEffect(() => {
    fetchChunks(kbId, docId)
  }, [kbId, docId, fetchChunks])

  if (chunksLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner className="size-5" />
      </div>
    )
  }

  if (chunks.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Layers />
            </EmptyMedia>
            <EmptyTitle>暂无切片</EmptyTitle>
            <EmptyDescription>该文档尚未向量化，向量化后可查看切片内容</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    )
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-3 p-4">
        {chunks.map((chunk) => (
          <div key={chunk.id} className="rounded-lg border p-3">
            <div className="mb-2 flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                #{chunk.chunkIndex}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {chunk.tokenCount} tokens
              </span>
              <span className="text-xs text-muted-foreground">
                offset {chunk.startOffset}-{chunk.endOffset}
              </span>
            </div>
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{chunk.content}</p>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}
