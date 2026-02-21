import { ArrowUp, Paperclip, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function InputBar() {
  return (
    <div className="shrink-0 px-4 pb-4 pt-2">
      <div className="mx-auto max-w-[760px]">
        <div className="rounded-2xl border border-border bg-muted/50 p-3">
          {/* 输入区域占位 */}
          <div className="mb-3 min-h-[44px] rounded-lg bg-muted px-3 py-2.5 text-sm text-muted-foreground">
            输入消息...
          </div>
          {/* 底部工具栏 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="size-8 text-muted-foreground">
                <Paperclip className="size-4" />
              </Button>
              <Button variant="ghost" size="icon" className="size-8 text-muted-foreground">
                <Globe className="size-4" />
              </Button>
              <div className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
                工具按钮区
              </div>
            </div>
            <Button size="icon" className="size-8 rounded-full">
              <ArrowUp className="size-4" />
            </Button>
          </div>
        </div>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Refinex 可能会犯错，请核查重要信息。
        </p>
      </div>
    </div>
  )
}
