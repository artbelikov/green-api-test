const TIME_FORMAT = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' })
const DAY_FORMAT = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' })

const startOfDay = (ms: number): number => {
  const date = new Date(ms)
  date.setHours(0, 0, 0, 0)
  return date.getTime()
}

export const dayKeyOf = (timestampMs: number): number => startOfDay(timestampMs)

export const formatChatListTime = (timestampMs: number, nowMs: number): string => {
  if (startOfDay(timestampMs) === startOfDay(nowMs)) {
    return TIME_FORMAT.format(timestampMs)
  }
  return DAY_FORMAT.format(timestampMs)
}

export const formatMessageTime = (timestampMs: number): string => TIME_FORMAT.format(timestampMs)

export type DayDividerLabels = {
  readonly today: string
  readonly yesterday: string
}

const yesterdayStart = (nowMs: number): number => {
  const date = new Date(nowMs)
  date.setDate(date.getDate() - 1)
  return startOfDay(date.getTime())
}

export const formatDayDivider = (
  timestampMs: number,
  nowMs: number,
  labels: DayDividerLabels,
): string => {
  const day = startOfDay(timestampMs)
  if (day === startOfDay(nowMs)) {
    return labels.today
  }
  if (day === yesterdayStart(nowMs)) {
    return labels.yesterday
  }
  return DAY_FORMAT.format(timestampMs)
}
