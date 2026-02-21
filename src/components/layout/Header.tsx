import { Button } from '@/components/ui/button'
import { ModeToggle } from '@/components/mode-toggle'
import { SidebarToggleIcon } from '@/components/icons/SidebarToggleIcon'

interface HeaderProps {
  onToggleSidebar: () => void
  sidebarCollapsed: boolean
}

export function Header({ onToggleSidebar, sidebarCollapsed }: HeaderProps) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-background px-4">
      {/* 左侧 */}
      <div className="flex items-center gap-2">
        {sidebarCollapsed && (
          <Button variant="ghost" size="icon" className="size-8" onClick={onToggleSidebar}>
            <SidebarToggleIcon className="size-4" />
          </Button>
        )}
        <div className="rounded-lg bg-muted px-3 py-1.5 text-sm text-muted-foreground">
          模型选择区
        </div>
      </div>

      {/* 中间 */}
      <div className="rounded-lg bg-muted px-3 py-1.5 text-sm text-muted-foreground">
        标题区
      </div>

      {/* 右侧 */}
      <div className="flex items-center gap-2">
        <div className="rounded-lg bg-muted px-3 py-1.5 text-sm text-muted-foreground">
          操作按钮区
        </div>
        <ModeToggle />
      </div>
    </header>
  )
}
