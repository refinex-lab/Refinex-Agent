import { ArchiveRestore } from 'lucide-react'
import { useChatStore } from '@/stores/chat'
import { usePreferencesStore } from '@/stores/preferences'

export function ArchivedBanner() {
  const wideMode = usePreferencesStore((s) => s.wideMode)
  const unarchive = useChatStore((s) => s.unarchiveCurrentConversation)

  return (
    <div className="shrink-0 border-border px-4 py-4">
      <div className={`mx-auto flex flex-col items-center gap-2 ${wideMode ? 'max-w-[1024px]' : 'max-w-[760px]'}`}>
        <p className="text-sm text-muted-foreground">
          此对话已归档。要继续，请先将其取消归档。
        </p>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
          onClick={unarchive}
        >
          <ArchiveRestore className="size-4" />
          取消归档
        </button>
      </div>
    </div>
  )
}
