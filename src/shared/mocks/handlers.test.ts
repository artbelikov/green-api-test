import { describe, expect, it } from 'vitest'
import { handlers } from './handlers'

describe('mock gateway handlers', () => {
  it('exposes the request handler registry for the mock worker', () => {
    expect(Array.isArray(handlers)).toBe(true)
  })
})
