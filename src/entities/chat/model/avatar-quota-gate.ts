const AVATAR_QUOTA_TRIP_TTL_MS = 30 * 60_000

export type AvatarQuotaGateConfig = {
  readonly now: () => number
  readonly tripTtlMs: number
}

export type AvatarQuotaGate = {
  readonly isTripped: (fingerprint: string) => boolean
  readonly trip: (fingerprint: string) => void
}

export const createAvatarQuotaGate = (config: AvatarQuotaGateConfig): AvatarQuotaGate => {
  const trippedAt = new Map<string, number>()
  return {
    isTripped: (fingerprint) => {
      const at = trippedAt.get(fingerprint)
      if (at === undefined) {
        return false
      }
      if (config.now() - at >= config.tripTtlMs) {
        trippedAt.delete(fingerprint)
        return false
      }
      return true
    },
    trip: (fingerprint) => {
      trippedAt.set(fingerprint, config.now())
    },
  }
}

export const avatarQuotaGate = createAvatarQuotaGate({
  now: Date.now,
  tripTtlMs: AVATAR_QUOTA_TRIP_TTL_MS,
})
