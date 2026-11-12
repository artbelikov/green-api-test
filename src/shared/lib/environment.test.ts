import { afterEach, describe, expect, it, vi } from 'vitest'
import { isMockRuntime } from './environment'

const setUrl = (search: string): void => {
  window.history.replaceState(null, '', search)
}

afterEach(() => {
  setUrl('/')
  vi.unstubAllEnvs()
})

describe('isMockRuntime', () => {
  it('stays off by default', () => {
    setUrl('/')
    expect(isMockRuntime()).toBe(false)
  })

  it('activates via the ?mock=1 URL parameter', () => {
    setUrl('/?mock=1')
    expect(isMockRuntime()).toBe(true)
  })

  it('ignores other values of the mock parameter', () => {
    setUrl('/?mock=0')
    expect(isMockRuntime()).toBe(false)
  })

  it('activates via the build-time environment variable', () => {
    setUrl('/')
    vi.stubEnv('VITE_API_MODE', 'mock')
    expect(isMockRuntime()).toBe(true)
  })
})
