import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet'
import { toast } from 'sonner'
import { useKbStore } from '@/stores/knowledge-base'
import type { ModelProvision } from '@/services/modules/ai'

interface KbSettingsSheetProps {
  kbId: number
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function KbSettingsSheet({ kbId, open, onOpenChange }: KbSettingsSheetProps) {
  const currentKb = useKbStore((s) => s.currentKb)
  const loadKb = useKbStore((s) => s.loadKb)

  const [embeddingModels, setEmbeddingModels] = useState<ModelProvision[]>([])
  const [modelsLoading, setModelsLoading] = useState(false)
  const [embeddingModelId, setEmbeddingModelId] = useState<number>(0)
  const [chunkSize, setChunkSize] = useState<number>(500)
  const [chunkOverlap, setChunkOverlap] = useState<number>(50)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return

    // 加载嵌入模型列表（modelType=2 表示嵌入模型）
    setModelsLoading(true)
    import('@/services').then(({ aiApi }) => {
      aiApi.listProvisionsByModelType(2).then((models) => {
        setEmbeddingModels(models)

        // 初始化选中值
        if (currentKb?.embeddingModelId) {
          setEmbeddingModelId(currentKb.embeddingModelId)
        } else {
          // 没有设置过：选默认模型，否则选第一个
          const defaultModel = models.find((m) => m.isDefault === 1)
          setEmbeddingModelId(defaultModel?.id ?? models[0]?.id ?? 0)
        }
      }).finally(() => setModelsLoading(false))
    })

    if (currentKb) {
      setChunkSize(currentKb.chunkSize ?? 500)
      setChunkOverlap(currentKb.chunkOverlap ?? 50)
    }
  }, [open, currentKb])

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
        <div className="space-y-6 px-4 py-6">
          <div className="space-y-2">
            <Label>嵌入模型</Label>
            {modelsLoading ? (
              <div className="h-9 animate-pulse rounded-md bg-muted" />
            ) : embeddingModels.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                当前企业未授权任何嵌入模型，请联系管理员开通
              </p>
            ) : (
              <Select
                value={embeddingModelId ? String(embeddingModelId) : undefined}
                onValueChange={(v) => setEmbeddingModelId(Number(v))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择嵌入模型" />
                </SelectTrigger>
                <SelectContent>
                  {embeddingModels.map((m) => (
                    <SelectItem key={m.id} value={String(m.id)}>
                      <div className="flex items-center gap-2">
                        <img
                          src={`/images/ai-providers/${m.providerCode}.svg`}
                          alt={m.providerCode}
                          className="size-4 shrink-0"
                        />
                        <span>{m.modelName}</span>
                        {m.isDefault === 1 && (
                          <span className="text-xs text-muted-foreground">(默认)</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
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
        <SheetFooter className="px-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
          <Button onClick={handleSave} disabled={submitting}>
            {submitting ? '保存中...' : '保存'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
