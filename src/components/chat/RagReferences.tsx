import type { RagReference } from '@/types/chat'
import { useState } from 'react'
import { BookOpenIcon, ChevronDownIcon } from 'lucide-react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Badge } from '@/components/ui/badge'

interface RagReferencesProps {
  references: RagReference[]
}

export function RagReferences({ references }: RagReferencesProps) {
  const [open, setOpen] = useState(false)

  if (references.length === 0) return null

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="mt-3">
      <CollapsibleTrigger className="flex w-full items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
        <BookOpenIcon className="size-4" />
        <span>引用了 {references.length} 个知识库片段</span>
        <ChevronDownIcon
          className={`size-4 transition-transform ${open ? 'rotate-180' : 'rotate-0'}`}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-3 space-y-2">
        {references.map((ref, idx) => (
          <div key={`${ref.documentId}-${ref.chunkIndex}-${idx}`} className="rounded-lg border p-3">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-sm font-medium truncate">{ref.documentName}</span>
              <Badge variant="secondary" className="ml-2 shrink-0">
                {Math.round(ref.score * 100)}% 相关
              </Badge>
            </div>
            <p className="line-clamp-3 text-sm text-muted-foreground">{ref.content}</p>
          </div>
        ))}
      </CollapsibleContent>
    </Collapsible>
  )
}
