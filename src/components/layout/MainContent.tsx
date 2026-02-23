import { Sparkles, ImageIcon, LayoutGrid } from 'lucide-react'
import { useConversationStore } from '@/stores/conversation'
import { Empty, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty'

export function MainContent() {
  const placeholderMode = useConversationStore((s) => s.placeholderMode)

  if (placeholderMode) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Empty className="border-0">
          <EmptyMedia variant="icon">
            {placeholderMode === 'image' ? <ImageIcon /> : <LayoutGrid />}
          </EmptyMedia>
          <EmptyTitle>敬请期待</EmptyTitle>
          <EmptyDescription>
            {placeholderMode === 'image' ? '图片生成功能' : '应用探索功能'}正在开发中
          </EmptyDescription>
        </Empty>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto p-6">
      <div className="flex flex-col items-center gap-4">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted">
          <Sparkles className="size-6 text-muted-foreground" />
        </div>
        <div className="rounded-lg bg-muted px-6 py-3 text-sm text-muted-foreground">
          主内容展示区 — 欢迎 / 对话消息
        </div>
        <div className="mt-4 flex gap-2">
          {['建议提示 1', '建议提示 2', '建议提示 3'].map((text) => (
            <div
              key={text}
              className="rounded-lg bg-muted px-4 py-2 text-sm text-muted-foreground"
            >
              {text}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
