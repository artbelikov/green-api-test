const TIME_FORMAT = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' })
const DAY_FORMAT = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' })

const startOfDay = (ms: number): number => {
  const date = new Date(ms)
  date.setHours(0, 0, 0, 0)
  return date.getTime()
}

export const formatChatListTime = (timestampMs: number, nowMs: number): string => {
  if (startOfDay(timestampMs) === startOfDay(nowMs)) {
    return TIME_FORMAT.format(timestampMs)
  }
  return DAY_FORMAT.format(timestampMs)
}
