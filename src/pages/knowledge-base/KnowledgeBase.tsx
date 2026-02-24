import { useParams } from 'react-router'
import { KbListPage } from '@/components/knowledge-base/KbListPage'
import { KbDetailPage } from '@/components/knowledge-base/KbDetailPage'

export function Component() {
  const { kbId } = useParams<{ kbId: string }>()

  if (kbId) {
    return <KbDetailPage kbId={Number(kbId)} />
  }

  return <KbListPage />
}
