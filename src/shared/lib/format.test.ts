import { describe, expect, it } from 'vitest'
import { formatChatListTime, formatDayDivider, formatMessageTime } from './format'

const NOW = new Date(2026, 10, 13, 18, 30).getTime()

const at = (date: {
  readonly month: number
  readonly day: number
  readonly hour?: number
  readonly minute?: number
}): number => new Date(2026, date.month - 1, date.day, date.hour ?? 0, date.minute ?? 0).getTime()

describe('formatChatListTime', () => {
  it('shows the clock time for today', () => {
    expect(formatChatListTime(at({ month: 11, day: 13, hour: 9, minute: 5 }), NOW)).toBe('09:05')
  })

  it('shows the date for other days', () => {
    expect(formatChatListTime(at({ month: 8, day: 9, hour: 21 }), NOW)).toBe('9 Aug')
  })
})

describe('formatMessageTime', () => {
  it('shows the clock time', () => {
    expect(formatMessageTime(at({ month: 11, day: 12, hour: 21, minute: 7 }))).toBe('21:07')
  })
})

describe('formatDayDivider', () => {
  it('marks today', () => {
    expect(
      formatDayDivider(at({ month: 11, day: 13, hour: 10 }), NOW, {
        today: 'Today',
        yesterday: 'Yesterday',
      }),
    ).toBe('Today')
  })

  it('marks yesterday', () => {
    expect(
      formatDayDivider(at({ month: 11, day: 12, hour: 23, minute: 45 }), NOW, {
        today: 'Today',
        yesterday: 'Yesterday',
      }),
    ).toBe('Yesterday')
  })

  it('formats older days as dates', () => {
    expect(
      formatDayDivider(at({ month: 8, day: 9 }), NOW, { today: 'Today', yesterday: 'Yesterday' }),
    ).toBe('9 Aug')
  })

  it('formats older days by the message date', () => {
    const morning = new Date(2026, 10, 13, 0, 30).getTime()
    expect(
      formatDayDivider(new Date(2026, 10, 11, 22).getTime(), morning, {
        today: 'Today',
        yesterday: 'Yesterday',
      }),
    ).toBe('11 Nov')
  })
})
