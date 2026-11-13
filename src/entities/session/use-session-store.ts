import { getSettings, getStateInstance, setSettings } from '@/shared/api/greenapi'
import { localStorageStore } from '@/shared/lib/storage'
import { SETTLE_DURATION_MS } from './bootstrap'
import { createSessionStore, type SessionStoreDeps } from './create-session-store'

const defaultSessionStoreDeps: SessionStoreDeps = {
  gateway: {
    state: { getStateInstance },
    settings: { getSettings, setSettings },
  },
  storage: localStorageStore,
  now: () => Date.now(),
  settleDurationMs: SETTLE_DURATION_MS,
}

export const useSessionStore = createSessionStore(defaultSessionStoreDeps)
