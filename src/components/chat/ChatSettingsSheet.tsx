import { Settings2Icon, MonitorIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from '@/components/ui/sheet'
import { usePreferencesStore } from '@/stores/preferences'

export function ChatSettingsSheet() {
  const wideMode = usePreferencesStore((s) => s.wideMode)
  const setWideMode = usePreferencesStore((s) => s.setWideMode)

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8">
          <Settings2Icon className="size-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="gap-0">
        <div className="flex flex-col gap-1.5 border-b p-4">
          <SheetTitle>对话设置</SheetTitle>
          <SheetDescription>调整聊天界面的显示偏好</SheetDescription>
        </div>
        <div className="flex flex-col gap-4 p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <MonitorIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <Label htmlFor="wide-mode" className="flex flex-1 flex-col gap-1 text-left items-start">
                <span>宽屏模式</span>
                <span className="text-xs font-normal text-muted-foreground">
                  扩大聊天区域的内容宽度
                </span>
              </Label>
            </div>
            <Switch
              id="wide-mode"
              checked={wideMode}
              onCheckedChange={setWideMode}
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
