import { Bot } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Spinner } from '@/components/ui/spinner'
import {
  Empty,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from '@/components/ui/empty'
import { useModelProvisions } from '@/hooks/use-ai-data'

export function ModelProvisionPanel() {
  const { items, loading } = useModelProvisions()

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner className="size-6" />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <Empty className="h-full border-none">
        <EmptyMedia variant="icon">
          <Bot className="size-5" />
        </EmptyMedia>
        <EmptyTitle>暂无模型开通</EmptyTitle>
        <EmptyDescription>请联系管理员在后台开通模型</EmptyDescription>
      </Empty>
    )
  }

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-2 p-1">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 rounded-lg border p-3"
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted">
              <img
                src={`/images/ai-providers/${item.providerCode}.svg`}
                alt={item.providerCode}
                className="size-5"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                  e.currentTarget.nextElementSibling?.classList.remove('hidden')
                }}
              />
              <Bot className="hidden size-4 text-muted-foreground" />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <span className="truncate text-sm font-medium">
                  {item.modelName}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span>{item.providerCode}</span>
                <span>·</span>
                <span>{item.modelCode}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                {item.apiBaseUrl && (
                  <span className="max-w-[200px] truncate">
                    API: {item.apiBaseUrl}
                  </span>
                )}
                {item.monthlyQuota != null && (
                  <>
                    {item.apiBaseUrl && <span>·</span>}
                    <span>配额: {item.monthlyQuota}/月</span>
                  </>
                )}
                {item.dailyQuota != null && (
                  <>
                    <span>·</span>
                    <span>{item.dailyQuota}/日</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              {item.isDefault === 1 && (
                <Badge variant="secondary">默认</Badge>
              )}
              <Badge variant={item.status === 1 ? 'default' : 'outline'}>
                {item.status === 1 ? '启用' : '停用'}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}
