import { describe, expect, it } from 'vitest'
import type { Message } from '@/shared/api/greenapi'
import { i18n } from '@/shared/config'
import { buildConversationRows } from './conversation-rows'
import { isPinnedToBottom, PINNED_EPSILON_PX } from './scroll-pinning'

const NOW = new Date(2026, 10, 13, 18, 30).getTime()

const message = (id: string, timestamp: number): Message => ({
  id,
  chatId: '79160000000',
  direction: 'incoming',
  text: 'Hello',
  timestamp,
  status: null,
})

const LABELS = i18n.messenger.conversation.date

describe('buildConversationRows', () => {
  it('inserts one date divider per day before its messages', () => {
    const rows = buildConversationRows(
      [
        message('m1', new Date(2026, 10, 12, 9, 0).getTime()),
        message('m2', new Date(2026, 10, 12, 11, 0).getTime()),
        message('m3', new Date(2026, 10, 13, 10, 0).getTime()),
      ],
      NOW,
      LABELS,
    )

    expect(rows).toHaveLength(5)
    expect(rows[0]?.kind).toBe('divider')
    expect(rows[3]?.kind).toBe('divider')
    const firstDivider = rows[0]
    const secondDivider = rows[3]
    if (firstDivider?.kind !== 'divider' || secondDivider?.kind !== 'divider') {
      throw new Error('expected dividers')
    }
    expect(firstDivider.label).toBe(LABELS.yesterday)
    expect(secondDivider.label).toBe(LABELS.today)
    expect(firstDivider.key).not.toBe(secondDivider.key)
    expect(firstDivider.key.startsWith('day:')).toBe(true)
    expect(secondDivider.key.startsWith('day:')).toBe(true)
  })

  it('keeps stable message keys', () => {
    const rows = buildConversationRows(
      [
        message('a', new Date(2026, 10, 13, 8, 0).getTime()),
        message('b', new Date(2026, 10, 13, 9, 30).getTime()),
      ],
      NOW,
      LABELS,
    )

    expect(rows.map((row) => (row.kind === 'message' ? row.message.id : row.label))).toEqual([
      'Today',
      'a',
      'b',
    ])
    expect(rows[1]?.key).toBe('msg:a')
    expect(rows[2]?.key).toBe('msg:b')
  })

  it('marks only the first message of each day group', () => {
    const sameDay = buildConversationRows(
      [message('a', new Date(2026, 10, 13, 0, 30).getTime())],
      NOW,
      LABELS,
    )
    expect(sameDay.filter((row) => row.kind === 'divider')).toHaveLength(1)
  })
})

describe('isPinnedToBottom', () => {
  it('treats the bottom edge as pinned', () => {
    expect(isPinnedToBottom(600, 400, 1000)).toBe(true)
    expect(isPinnedToBottom(1000 - 400 - PINNED_EPSILON_PX, 400, 1000)).toBe(true)
  })

  it('treats scrolled-up positions as unpinned', () => {
    expect(isPinnedToBottom(0, 400, 1000)).toBe(false)
    expect(isPinnedToBottom(1000 - 400 - PINNED_EPSILON_PX - 1, 400, 1000)).toBe(false)
  })

  it('treats short content without overflow as pinned', () => {
    expect(isPinnedToBottom(0, 400, 200)).toBe(true)
  })
})
