import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import { List, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TocItem {
  level: number
  text: string
  index: number
}

interface MarkdownTocProps {
  markdown: string
  scrollRef: RefObject<HTMLDivElement | null>
}

function extractHeadings(markdown: string): TocItem[] {
  const headings: TocItem[] = []
  const regex = /^(#{1,6})\s+(.+)$/gm
  let match
  let index = 0
  while ((match = regex.exec(markdown)) !== null) {
    headings.push({
      level: match[1].length,
      text: match[2].trim(),
      index: index++,
    })
  }
  return headings
}

function useActiveHeading(scrollRef: RefObject<HTMLDivElement | null>, headingCount: number) {
  const [activeIndex, setActiveIndex] = useState(-1)

  const updateActive = useCallback(() => {
    const container = scrollRef.current
    if (!container || headingCount === 0) return

    const allHeadings = container.querySelectorAll('h1, h2, h3, h4, h5, h6')
    if (allHeadings.length === 0) return

    const containerTop = container.getBoundingClientRect().top
    let current = -1

    for (let i = 0; i < allHeadings.length; i++) {
      const rect = allHeadings[i].getBoundingClientRect()
      if (rect.top - containerTop <= 8) {
        current = i
      } else {
        break
      }
    }

    setActiveIndex(current)
  }, [scrollRef, headingCount])

  useEffect(() => {
    const container = scrollRef.current
    if (!container || headingCount === 0) return

    updateActive()

    container.addEventListener('scroll', updateActive, { passive: true })
    return () => container.removeEventListener('scroll', updateActive)
  }, [scrollRef, headingCount, updateActive])

  return activeIndex
}

export function MarkdownToc({ markdown, scrollRef }: MarkdownTocProps) {
  const [expanded, setExpanded] = useState(false)
  const headings = useMemo(() => extractHeadings(markdown), [markdown])
  const activeIndex = useActiveHeading(scrollRef, headings.length)
  const navRef = useRef<HTMLElement>(null)

  // 活跃项自动滚入目录可视区
  useEffect(() => {
    if (!expanded || activeIndex < 0 || !navRef.current) return
    const activeBtn = navRef.current.children[activeIndex] as HTMLElement | undefined
    activeBtn?.scrollIntoView({ block: 'nearest' })
  }, [expanded, activeIndex])

  if (headings.length === 0) return null

  const handleClick = (item: TocItem) => {
    const container = scrollRef.current
    if (!container) return
    const allHeadings = container.querySelectorAll('h1, h2, h3, h4, h5, h6')
    const target = allHeadings[item.index]
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  if (!expanded) {
    return (
      <div className="flex-shrink-0 border-l flex flex-col items-center pt-2 w-8">
        <button
          onClick={() => setExpanded(true)}
          className="p-1 rounded hover:bg-accent text-muted-foreground"
          title="展开目录"
        >
          <List className="h-4 w-4" />
        </button>
      </div>
    )
  }

  return (
    <div className="flex-shrink-0 border-l w-[200px] flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b">
        <span className="text-sm font-medium text-foreground">目录</span>
        <button
          onClick={() => setExpanded(false)}
          className="p-1 rounded hover:bg-accent text-muted-foreground"
          title="收起目录"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <nav ref={navRef} className="flex-1 overflow-auto py-2">
        {headings.map((item) => (
          <button
            key={item.index}
            onClick={() => handleClick(item)}
            className={cn(
              "block w-full text-left text-sm truncate px-3 py-1 transition-colors",
              item.index === activeIndex
                ? "bg-accent text-foreground font-medium"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
            style={{ paddingLeft: `${(item.level - 1) * 12 + 12}px` }}
            title={item.text}
          >
            {item.text}
          </button>
        ))}
      </nav>
    </div>
  )
}
