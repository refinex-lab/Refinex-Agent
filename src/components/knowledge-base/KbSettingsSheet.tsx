import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet'
import { toast } from 'sonner'
import { useKbStore } from '@/stores/knowledge-base'

interface KbSettingsSheetProps {
  kbId: number
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function KbSettingsSheet({ kbId, open, onOpenChange }: KbSettingsSheetProps) {
  const currentKb = useKbStore((s) => s.currentKb)
  const loadKb = useKbStore((s) => s.loadKb)

  const [embeddingModelId, setEmbeddingModelId] = useState<number>(0)
  const [chunkSize, setChunkSize] = useState<number>(500)
  const [chunkOverlap, setChunkOverlap] = useState<number>(50)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (currentKb && open) {
      setEmbeddingModelId(currentKb.embeddingModelId ?? 0)
      setChunkSize(currentKb.chunkSize ?? 500)
      setChunkOverlap(currentKb.chunkOverlap ?? 50)
    }
  }, [currentKb, open])

  const handleSave = async () => {
    if (!currentKb) return
    setSubmitting(true)
    try {
      const { aiApi } = await import('@/services')
      await aiApi.updateKnowledgeBase(kbId, {
        kbName: currentKb.kbName,
        embeddingModelId,
        chunkSize,
        chunkOverlap,
      })
      toast.success('设置已保存')
      loadKb(kbId)
      onOpenChange(false)
    } catch {
      // handled by interceptor
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>知识库设置</SheetTitle>
        </SheetHeader>
        <div className="space-y-6 py-6">
          <div className="space-y-2">
            <Label>嵌入模型 ID</Label>
            <Input
              type="number"
              value={embeddingModelId}
              onChange={(e) => setEmbeddingModelId(Number(e.target.value))}
              placeholder="嵌入模型 ID"
            />
            <p className="text-xs text-muted-foreground">
              用于文档向量化的嵌入模型
            </p>
          </div>
          <div className="space-y-2">
            <Label>分片大小 (tokens)</Label>
            <Input
              type="number"
              min={100}
              max={4000}
              value={chunkSize}
              onChange={(e) => setChunkSize(Number(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">
              每个文档切片的 token 数量，建议 300-1000
            </p>
          </div>
          <div className="space-y-2">
            <Label>分片重叠 (tokens)</Label>
            <Input
              type="number"
              min={0}
              max={500}
              value={chunkOverlap}
              onChange={(e) => setChunkOverlap(Number(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">
              相邻切片之间的重叠 token 数量
            </p>
          </div>
        </div>
        <SheetFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
          <Button onClick={handleSave} disabled={submitting}>
            {submitting ? '保存中...' : '保存'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
