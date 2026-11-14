import { describe, expect, it } from 'vitest'
import { createAvatarQuotaGate } from './avatar-quota-gate'

const BASE_NOW = 1_000_000
const TRIP_TTL_MS = 30 * 60_000

const createGateWithClock = () => {
  let now = BASE_NOW
  const gate = createAvatarQuotaGate({ now: () => now, tripTtlMs: TRIP_TTL_MS })
  return {
    gate,
    advance: (ms: number) => {
      now += ms
    },
  }
}

describe('createAvatarQuotaGate', () => {
  it('admits requests for instances that never tripped', () => {
    const { gate } = createGateWithClock()

    expect(gate.isTripped('instance-a')).toBe(false)
  })

  it('blocks after a trip and re-admits once the ttl elapses', () => {
    const { gate, advance } = createGateWithClock()

    gate.trip('instance-a')
    expect(gate.isTripped('instance-a')).toBe(true)

    advance(TRIP_TTL_MS - 1)
    expect(gate.isTripped('instance-a')).toBe(true)

    advance(1)
    expect(gate.isTripped('instance-a')).toBe(false)
  })

  it('re-trips with a fresh window after re-admission', () => {
    const { gate, advance } = createGateWithClock()

    gate.trip('instance-a')
    advance(TRIP_TTL_MS)
    expect(gate.isTripped('instance-a')).toBe(false)

    gate.trip('instance-a')
    advance(TRIP_TTL_MS - 1)
    expect(gate.isTripped('instance-a')).toBe(true)
  })

  it('keeps trips isolated per instance fingerprint', () => {
    const { gate } = createGateWithClock()

    gate.trip('instance-a')

    expect(gate.isTripped('instance-b')).toBe(false)
    expect(gate.isTripped('instance-a')).toBe(true)
  })
})
