import { ImageIcon, LayoutGrid } from 'lucide-react'
import { useConversationStore } from '@/stores/conversation'
import { Empty, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty'

export function MainContent() {
  const placeholderMode = useConversationStore((s) => s.placeholderMode)

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
