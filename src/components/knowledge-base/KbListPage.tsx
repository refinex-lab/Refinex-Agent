import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { Plus, Search, LibraryBig, LayoutGrid, List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useKbStore } from '@/stores/knowledge-base'
import { KbCard } from './KbCard'
import { KbCreateDialog } from './KbCreateDialog'

type ViewMode = 'grid' | 'list'
const VIEW_MODE_KEY = 'refinex-kb-view-mode'

export function KbListPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const saved = localStorage.getItem(VIEW_MODE_KEY)
    return saved === 'list' ? 'list' : 'grid'
  })
  const knowledgeBases = useKbStore((s) => s.knowledgeBases)
  const kbLoading = useKbStore((s) => s.kbLoading)
  const fetchKnowledgeBases = useKbStore((s) => s.fetchKnowledgeBases)
  const checkEmbeddingModel = useKbStore((s) => s.checkEmbeddingModel)

  useEffect(() => {
    fetchKnowledgeBases()
    checkEmbeddingModel()
  }, [fetchKnowledgeBases, checkEmbeddingModel])

  const handleViewModeChange = (value: string) => {
    if (value === 'grid' || value === 'list') {
      setViewMode(value)
      localStorage.setItem(VIEW_MODE_KEY, value)
    }
  }

  const filtered = search.trim()
    ? knowledgeBases.filter((kb) =>
        kb.kbName.toLowerCase().includes(search.toLowerCase()) ||
        kb.description?.toLowerCase().includes(search.toLowerCase())
      )
    : knowledgeBases

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b px-6 py-4">
        <h1 className="text-lg font-semibold">知识库</h1>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="搜索知识库..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-60 pl-8"
            />
          </div>
          <TooltipProvider delayDuration={200}>
            <ToggleGroup type="single" value={viewMode} onValueChange={handleViewModeChange} variant="outline" size="sm">
              <Tooltip>
                <TooltipTrigger asChild>
                  <ToggleGroupItem value="grid" aria-label="网格视图">
                    <LayoutGrid className="size-4" />
                  </ToggleGroupItem>
                </TooltipTrigger>
                <TooltipContent>网格视图</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <ToggleGroupItem value="list" aria-label="列表视图">
                    <List className="size-4" />
                  </ToggleGroupItem>
                </TooltipTrigger>
                <TooltipContent>列表视图</TooltipContent>
              </Tooltip>
            </ToggleGroup>
          </TooltipProvider>
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="mr-1.5 size-4" />
            新建知识库
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {kbLoading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner className="size-6" />
          </div>
        ) : filtered.length === 0 ? (
          <Empty className="py-20">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <LibraryBig />
              </EmptyMedia>
              <EmptyTitle>{search ? '没有匹配的知识库' : '还没有知识库'}</EmptyTitle>
              <EmptyDescription>
                {search ? '尝试调整搜索关键词' : '创建你的第一个知识库，开始管理文档和知识'}
              </EmptyDescription>
            </EmptyHeader>
            {!search && (
              <Button size="sm" onClick={() => setCreateOpen(true)}>
                <Plus className="mr-1.5 size-4" />
                新建知识库
              </Button>
            )}
          </Empty>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((kb) => (
              <KbCard
                key={kb.id}
                kb={kb}
                viewMode="grid"
                onClick={() => navigate(`/knowledge-base/${kb.id}`)}
                onRefresh={() => fetchKnowledgeBases()}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map((kb) => (
              <KbCard
                key={kb.id}
                kb={kb}
                viewMode="list"
                onClick={() => navigate(`/knowledge-base/${kb.id}`)}
                onRefresh={() => fetchKnowledgeBases()}
              />
            ))}
          </div>
        )}
      </div>

      <KbCreateDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={() => fetchKnowledgeBases()}
      />
    </div>
  )
}
