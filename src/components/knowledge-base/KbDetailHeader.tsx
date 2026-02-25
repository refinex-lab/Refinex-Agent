import { useNavigate } from 'react-router'
import { ArrowLeft, Zap, Search, Settings2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import { useKbStore } from '@/stores/knowledge-base'
import { getKbIcon } from './kb-icons'

interface KbDetailHeaderProps {
  kbId: number
  onOpenSearch: () => void
  onOpenSettings: () => void
}

export function KbDetailHeader({ kbId, onOpenSearch, onOpenSettings }: KbDetailHeaderProps) {
  const navigate = useNavigate()
  const currentKb = useKbStore((s) => s.currentKb)
  const hasEmbeddingModel = useKbStore((s) => s.hasEmbeddingModel)
  const KbIcon = getKbIcon(currentKb?.icon)

  const handleVectorizeAll = async () => {
    try {
      const { aiApi } = await import('@/services')
      await aiApi.vectorizeKnowledgeBase(kbId)
      toast.success('已触发全库向量化')
    } catch {
      // handled by interceptor
    }
  }

  return (
    <div className="flex h-14 shrink-0 items-center gap-3 border-b px-4">
      <Button variant="ghost" size="icon" className="size-8" onClick={() => navigate('/knowledge-base')}>
        <ArrowLeft className="size-4" />
      </Button>
      {currentKb ? (
        <>
          <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10">
            <KbIcon className="size-4 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-sm font-semibold">{currentKb.kbName}</h2>
            {currentKb.description && (
              <p className="truncate text-xs text-muted-foreground">{currentKb.description}</p>
            )}
          </div>
          <TooltipProvider>
            {hasEmbeddingModel && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={handleVectorizeAll}>
                    <Zap className="mr-1.5 size-3.5" />
                    向量化
                  </Button>
                </TooltipTrigger>
                <TooltipContent>向量化全部文档</TooltipContent>
              </Tooltip>
            )}
            {hasEmbeddingModel && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" className="size-8" onClick={onOpenSearch}>
                    <Search className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>RAG 搜索测试</TooltipContent>
              </Tooltip>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" className="size-8" onClick={onOpenSettings}>
                  <Settings2 className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>知识库设置</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </>
      ) : (
        <Spinner className="size-4" />
      )}
    </div>
  )
}
