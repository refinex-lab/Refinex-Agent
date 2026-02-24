import { useState } from 'react'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Spinner } from '@/components/ui/spinner'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { SearchResult } from '@/services/modules/ai'

interface KbSearchDialogProps {
  kbId: number
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function KbSearchDialog({ kbId, open, onOpenChange }: KbSearchDialogProps) {
  const [query, setQuery] = useState('')
  const [topK, setTopK] = useState(5)
  const [threshold, setThreshold] = useState(0.7)
  const [results, setResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSearch = async () => {
    if (!query.trim()) return
    setSearching(true)
    setSearched(true)
    try {
      const { aiApi } = await import('@/services')
      const data = await aiApi.searchKnowledgeBase(kbId, {
        query: query.trim(),
        topK,
        similarityThreshold: threshold,
      })
      setResults(data ?? [])
    } catch {
      setResults([])
    } finally {
      setSearching(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSearch()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>RAG 搜索测试</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="输入搜索内容..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={searching || !query.trim()}>
              {searching ? <Spinner className="mr-1.5 size-4" /> : <Search className="mr-1.5 size-4" />}
              搜索
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label className="text-xs whitespace-nowrap">Top K</Label>
              <Input
                type="number"
                min={1}
                max={20}
                value={topK}
                onChange={(e) => setTopK(Number(e.target.value))}
                className="h-7 w-16 text-xs"
              />
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-xs whitespace-nowrap">相似度阈值</Label>
              <Input
                type="number"
                min={0}
                max={1}
                step={0.05}
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="h-7 w-20 text-xs"
              />
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1 min-h-0 mt-2">
          {searching ? (
            <div className="flex items-center justify-center py-8">
              <Spinner className="size-5" />
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-3 pr-2">
              {results.map((result, i) => (
                <div key={i} className="rounded-lg border p-3">
                  <div className="mb-2 flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      #{i + 1}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      相似度 {(result.score * 100).toFixed(1)}%
                    </Badge>
                  </div>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{result.content}</p>
                </div>
              ))}
            </div>
          ) : searched ? (
            <p className="py-8 text-center text-sm text-muted-foreground">没有找到相关内容</p>
          ) : null}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
