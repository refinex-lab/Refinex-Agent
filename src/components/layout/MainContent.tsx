import { Sparkles } from 'lucide-react'

export function MainContent() {
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
