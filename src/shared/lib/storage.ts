export type KeyValueStore = {
  read(key: string): string | null
  write(key: string, value: string): void
  remove(key: string): void
}

export const localStorageStore: KeyValueStore = {
  read: (key) => {
    try {
      return window.localStorage.getItem(key)
    } catch {
      return null
    }
  },
  write: (key, value) => {
    try {
      window.localStorage.setItem(key, value)
    } catch {
      return
    }
  },
  remove: (key) => {
    try {
      window.localStorage.removeItem(key)
    } catch {
      return
    }
  },
}

export function readJson<T>(store: KeyValueStore, key: string): T | null {
  const raw = store.read(key)
  if (raw === null) {
    return null
  }
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export function writeJson<T>(store: KeyValueStore, key: string, value: T): void {
  try {
    store.write(key, JSON.stringify(value))
  } catch {
    return
  }
}

const PERSIST_THROTTLE_MS = 500

export type PersistThrottle = {
  readonly schedule: () => void
  readonly cancel: () => void
}

export function createPersistThrottle(
  write: () => void,
  delayMs: number = PERSIST_THROTTLE_MS,
): PersistThrottle {
  let timerId: ReturnType<typeof setTimeout> | null = null
  const clearTimer = (): void => {
    if (timerId !== null) {
      clearTimeout(timerId)
      timerId = null
    }
  }
  const writeNow = (): void => {
    clearTimer()
    write()
  }
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', writeNow)
  }
  return {
    schedule: () => {
      if (timerId !== null) {
        return
      }
      timerId = setTimeout(writeNow, delayMs)
    },
    cancel: clearTimer,
  }
}
