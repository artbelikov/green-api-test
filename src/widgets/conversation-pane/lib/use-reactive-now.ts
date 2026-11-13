import { useEffect, useState } from 'react'

const NOW_TICK_INTERVAL_MS = 60_000

export const useReactiveNow = (): number => {
  const [nowMs, setNowMs] = useState(() => Date.now())
  useEffect(() => {
    const timerId = window.setInterval(() => {
      setNowMs(Date.now())
    }, NOW_TICK_INTERVAL_MS)
    const onVisibilityChange = (): void => {
      if (document.visibilityState === 'visible') {
        setNowMs(Date.now())
      }
    }
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => {
      window.clearInterval(timerId)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [])
  return nowMs
}
