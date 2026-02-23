import type { Conversation } from '@/services/modules/ai'

export interface ConversationGroup {
  label: string
  conversations: Conversation[]
}

export function groupConversationsByTime(conversations: Conversation[]): ConversationGroup[] {
  const pinned: Conversation[] = []
  const today: Conversation[] = []
  const yesterday: Conversation[] = []
  const last7Days: Conversation[] = []
  const last30Days: Conversation[] = []
  const older: Conversation[] = []

  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfYesterday = new Date(startOfToday.getTime() - 86_400_000)
  const startOf7DaysAgo = new Date(startOfToday.getTime() - 7 * 86_400_000)
  const startOf30DaysAgo = new Date(startOfToday.getTime() - 30 * 86_400_000)

  for (const conv of conversations) {
    if (conv.pinned === 1) {
      pinned.push(conv)
      continue
    }
    const t = new Date(conv.gmtCreate).getTime()
    if (t >= startOfToday.getTime()) today.push(conv)
    else if (t >= startOfYesterday.getTime()) yesterday.push(conv)
    else if (t >= startOf7DaysAgo.getTime()) last7Days.push(conv)
    else if (t >= startOf30DaysAgo.getTime()) last30Days.push(conv)
    else older.push(conv)
  }

  const groups: ConversationGroup[] = []
  if (pinned.length) groups.push({ label: '置顶', conversations: pinned })
  if (today.length) groups.push({ label: '今天', conversations: today })
  if (yesterday.length) groups.push({ label: '昨天', conversations: yesterday })
  if (last7Days.length) groups.push({ label: '近7天', conversations: last7Days })
  if (last30Days.length) groups.push({ label: '近30天', conversations: last30Days })
  if (older.length) groups.push({ label: '更早', conversations: older })
  return groups
}
