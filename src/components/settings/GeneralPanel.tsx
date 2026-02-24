import { Check, Monitor, Moon, Sun } from 'lucide-react'
import { useTheme } from '@/components/theme-provider'
import type { AccentColor, Theme } from '@/components/theme-provider'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

const themeOptions: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: '浅色', icon: Sun },
  { value: 'dark', label: '深色', icon: Moon },
  { value: 'system', label: '跟随系统', icon: Monitor },
]

const accentOptions: { value: AccentColor; label: string; color: string }[] = [
  { value: 'default', label: '默认', color: 'bg-[oklch(0.205_0_0)] dark:bg-[oklch(0.922_0_0)]' },
  { value: 'blue', label: '蓝色', color: 'bg-[oklch(0.546_0.245_262.881)]' },
  { value: 'green', label: '绿色', color: 'bg-[oklch(0.586_0.19_163.222)]' },
  { value: 'yellow', label: '黄色', color: 'bg-[oklch(0.795_0.184_86.047)]' },
  { value: 'pink', label: '粉色', color: 'bg-[oklch(0.592_0.249_0.584)]' },
  { value: 'orange', label: '橙色', color: 'bg-[oklch(0.646_0.222_41.116)]' },
]

export function GeneralPanel() {
  const { theme, setTheme, accentColor, setAccentColor } = useTheme()

  return (
    <div className="space-y-6">
      {/* 外观 */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">外观</Label>
        <div className="grid grid-cols-3 gap-3">
          {themeOptions.map((opt) => {
            const active = theme === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setTheme(opt.value)}
                className={cn(
                  'relative flex flex-col items-center gap-2 rounded-lg border p-4 transition-colors hover:bg-muted/50',
                  active ? 'border-primary bg-muted/50' : 'border-border',
                )}
              >
                {active && (
                  <div className="absolute top-2 right-2 flex size-4 items-center justify-center rounded-full bg-primary">
                    <Check className="size-2.5 text-primary-foreground" />
                  </div>
                )}
                <opt.icon className="size-5 text-muted-foreground" />
                <span className="text-xs">{opt.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      <Separator />

      {/* 重点色 */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">重点色</Label>
        <div className="grid grid-cols-6 gap-3">
          {accentOptions.map((opt) => {
            const active = accentColor === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setAccentColor(opt.value)}
                className="flex flex-col items-center gap-2"
              >
                <div
                  className={cn(
                    'flex size-8 items-center justify-center rounded-full transition-all',
                    opt.color,
                    active ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : '',
                  )}
                >
                  {active && <Check className="size-3.5 text-white dark:text-black" />}
                </div>
                <span className={cn('text-xs', active ? 'font-medium' : 'text-muted-foreground')}>
                  {opt.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
