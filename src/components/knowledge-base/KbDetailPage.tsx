import { useEffect, useState } from 'react'
import { useKbStore } from '@/stores/knowledge-base'
import { KbDetailHeader } from './KbDetailHeader'
import { FolderDocTree } from './FolderDocTree'
import { DocumentPanel } from './DocumentPanel'
import { KbSearchDialog } from './KbSearchDialog'
import { KbSettingsSheet } from './KbSettingsSheet'

interface KbDetailPageProps {
  kbId: number
}

export function KbDetailPage({ kbId }: KbDetailPageProps) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const loadKb = useKbStore((s) => s.loadKb)
  const reset = useKbStore((s) => s.reset)

  useEffect(() => {
    loadKb(kbId)
    return () => reset()
  }, [kbId, loadKb, reset])

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <KbDetailHeader
        kbId={kbId}
        onOpenSearch={() => setSearchOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
      />
      <div className="flex flex-1 overflow-hidden">
        <div className="w-64 shrink-0 border-r">
          <FolderDocTree kbId={kbId} />
        </div>
        <div className="flex-1 overflow-hidden">
          <DocumentPanel kbId={kbId} />
        </div>
      </div>

      <KbSearchDialog kbId={kbId} open={searchOpen} onOpenChange={setSearchOpen} />
      <KbSettingsSheet kbId={kbId} open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  )
}
