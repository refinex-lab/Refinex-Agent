import { useState, useMemo } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { KB_ICON_CATEGORIES, getKbIcon, DEFAULT_KB_ICON } from './kb-icons'

interface KbIconPickerProps {
  value?: string
  onChange: (iconName: string) => void
}

export function KbIconPicker({ value, onChange }: KbIconPickerProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return KB_ICON_CATEGORIES
    return KB_ICON_CATEGORIES
      .map((cat) => ({
        ...cat,
        icons: cat.icons.filter((i) => i.name.includes(q)),
      }))
      .filter((cat) => cat.icons.length > 0)
  }, [search])

  const current = value || DEFAULT_KB_ICON
  const CurrentIcon = getKbIcon(current)

  const handleSelect = (iconName: string) => {
    onChange(iconName)
    setOpen(false)
    setSearch('')
  }

  return (
    <Popover open={open} onOpenChange={(v) => { setOpen(v); if (!v) setSearch('') }}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex size-10 items-center justify-center rounded-lg border bg-primary/10 transition-colors hover:bg-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <CurrentIcon className="size-5 text-primary" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-3 pb-0">
          <Input
            placeholder="搜索图标..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 text-sm"
          />
        </div>
        <div className="h-64 overflow-y-auto overscroll-contain p-3">
          <TooltipProvider delayDuration={300}>
            {filtered.length === 0 ? (
              <p className="py-8 text-center text-xs text-muted-foreground">没有匹配的图标</p>
            ) : (
              filtered.map((cat) => (
                <div key={cat.label} className="mb-3 last:mb-0">
                  <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
                    {cat.label}
                  </p>
                  <div className="grid grid-cols-8 gap-0.5">
                    {cat.icons.map((item) => {
                      const Icon = item.icon
                      const isSelected = current === item.name
                      return (
                        <Tooltip key={item.name}>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              className={cn(
                                'flex size-8 items-center justify-center rounded-md transition-colors',
                                isSelected
                                  ? 'bg-primary text-primary-foreground shadow-sm'
                                  : 'text-foreground/70 hover:bg-accent hover:text-foreground',
                              )}
                              onClick={() => handleSelect(item.name)}
                            >
                              <Icon className="size-4" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" className="text-xs">
                            {item.name}
                          </TooltipContent>
                        </Tooltip>
                      )
                    })}
                  </div>
                </div>
              ))
            )}
          </TooltipProvider>
        </div>
      </PopoverContent>
    </Popover>
  )
}
