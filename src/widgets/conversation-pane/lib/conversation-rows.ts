import type { Message } from '@/shared/api/greenapi'
import { type DayDividerLabels, dayKeyOf, formatDayDivider } from '@/shared/lib'

export type ConversationRow =
  | { readonly kind: 'divider'; readonly key: string; readonly label: string }
  | { readonly kind: 'message'; readonly key: string; readonly message: Message }

export const buildConversationRows = (
  messages: readonly Message[],
  nowMs: number,
  labels: DayDividerLabels,
): ConversationRow[] => {
  const rows: ConversationRow[] = []
  let dayKey: number | null = null
  for (const message of messages) {
    const messageDay = dayKeyOf(message.timestamp)
    if (messageDay !== dayKey) {
      dayKey = messageDay
      rows.push({
        kind: 'divider',
        key: `day:${dayKey}`,
        label: formatDayDivider(message.timestamp, nowMs, labels),
      })
    }
    rows.push({ kind: 'message', key: `msg:${message.id}`, message })
  }
  return rows
}
