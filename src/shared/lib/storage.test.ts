import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  createPersistThrottle,
  type KeyValueStore,
  localStorageStore,
  readJson,
  writeJson,
} from './storage'

type Payload = {
  value: number
}

describe('localStorageStore', () => {
  it('round-trips values through window.localStorage', () => {
    localStorageStore.write('test:key', 'raw')
    expect(localStorageStore.read('test:key')).toBe('raw')
    localStorageStore.remove('test:key')
    expect(localStorageStore.read('test:key')).toBeNull()
  })

  it('reads missing keys as null', () => {
    expect(localStorageStore.read('test:missing')).toBeNull()
  })

  it('swallows window storage access failures', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => {
        throw new Error('denied')
      },
      setItem: () => {
        throw new Error('denied')
      },
      removeItem: () => {
        throw new Error('denied')
      },
    })

    expect(localStorageStore.read('test:key')).toBeNull()
    expect(() => localStorageStore.write('test:key', 'raw')).not.toThrow()
    expect(() => localStorageStore.remove('test:key')).not.toThrow()

    vi.unstubAllGlobals()
  })

  it('ignores serialization failures of the backing store', () => {
    const throwingStore: KeyValueStore = {
      read: () => null,
      write: () => {
        throw new Error('denied')
      },
      remove: () => {},
    }

    expect(() => writeJson(throwingStore, 'test:key', { value: 1 })).not.toThrow()
  })
})

describe('readJson/writeJson', () => {
  it('serializes and parses stored values', () => {
    writeJson<Payload>(localStorageStore, 'test:json', { value: 42 })
    expect(readJson<Payload>(localStorageStore, 'test:json')).toEqual({ value: 42 })
  })

  it('returns null for missing or corrupted entries', () => {
    expect(readJson<Payload>(localStorageStore, 'test:missing')).toBeNull()
    localStorageStore.write('test:json', 'not-json{')
    expect(readJson<Payload>(localStorageStore, 'test:json')).toBeNull()
  })
})

describe('createPersistThrottle', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('runs the write once at the trailing edge of the window', () => {
    const write = vi.fn()
    const throttle = createPersistThrottle(write)

    vi.useFakeTimers()
    throttle.schedule()
    expect(write).not.toHaveBeenCalled()

    vi.advanceTimersByTime(499)
    expect(write).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1)
    expect(write).toHaveBeenCalledTimes(1)

    throttle.schedule()
    vi.advanceTimersByTime(500)
    expect(write).toHaveBeenCalledTimes(2)
  })

  it('coalesces repeated schedules within one window into a single write', () => {
    const write = vi.fn()
    const throttle = createPersistThrottle(write)

    vi.useFakeTimers()
    throttle.schedule()
    vi.advanceTimersByTime(200)
    throttle.schedule()
    vi.advanceTimersByTime(200)
    throttle.schedule()
    vi.advanceTimersByTime(200)

    expect(write).toHaveBeenCalledTimes(1)
  })

  it('cancels a pending write and flushes on beforeunload', () => {
    const write = vi.fn()
    const throttle = createPersistThrottle(write)

    vi.useFakeTimers()
    throttle.schedule()
    throttle.cancel()
    vi.advanceTimersByTime(1_000)
    expect(write).not.toHaveBeenCalled()

    throttle.schedule()
    expect(write).not.toHaveBeenCalled()

    window.dispatchEvent(new Event('beforeunload'))
    expect(write).toHaveBeenCalledTimes(1)
  })
})
