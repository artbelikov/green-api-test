import { describe, expect, it, vi } from 'vitest'
import { type KeyValueStore, localStorageStore, readJson, writeJson } from './storage'

interface Payload {
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
