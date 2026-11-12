import { create } from 'zustand'
import type { GreenApiCredentials, GreenApiInstanceState } from '@/shared/api/greenapi'
import { type KeyValueStore, readJson, writeJson } from '@/shared/lib/storage'
import { bootstrapWebhookFlags, type SettingsGateway } from './bootstrap'
import { mapConnectError, mapInstanceState } from './errors'
import type {
  BootstrapPhase,
  ConnectFailureCode,
  ConnectInput,
  ConnectResult,
  SessionStatus,
} from './types'

const SESSION_STORAGE_KEY = 'green-api-messenger:session:v1'

interface PersistedSession {
  readonly credentials: GreenApiCredentials
  readonly settledAt: number | null
}

export interface StateGateway {
  getStateInstance(credentials: GreenApiCredentials): Promise<GreenApiInstanceState>
}

export interface SessionGateway {
  readonly state: StateGateway
  readonly settings: SettingsGateway
}

export interface SessionStoreDeps {
  readonly gateway: SessionGateway
  readonly storage: KeyValueStore
  readonly now: () => number
  readonly settleDurationMs: number
}

export interface SessionState {
  readonly credentials: GreenApiCredentials | null
  readonly status: SessionStatus
  readonly bootstrapPhase: BootstrapPhase
  readonly settledAt: number | null
  connect(input: ConnectInput): Promise<ConnectResult>
  disconnect(): void
  resume(): Promise<void>
  retryBootstrap(): Promise<void>
  refreshBootstrapPhase(): void
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const isPersistedSession = (value: unknown): value is PersistedSession => {
  if (!isRecord(value)) {
    return false
  }
  const credentials = value.credentials
  return (
    isRecord(credentials) &&
    typeof credentials.apiUrl === 'string' &&
    typeof credentials.idInstance === 'string' &&
    typeof credentials.apiTokenInstance === 'string' &&
    (typeof value.settledAt === 'number' || value.settledAt === null)
  )
}

const validateConnectInput = (input: ConnectInput): ConnectFailureCode | null => {
  if (!/^\d+$/.test(input.idInstance.trim())) {
    return 'invalidInstanceId'
  }
  if (input.apiTokenInstance.trim().length === 0) {
    return 'missingToken'
  }
  try {
    const url = new URL(input.apiUrl.trim())
    if (url.protocol !== 'https:' && url.protocol !== 'http:') {
      return 'invalidApiUrl'
    }
  } catch {
    return 'invalidApiUrl'
  }
  return null
}

export function createSessionStore(deps: SessionStoreDeps) {
  let resumeAttempted = false
  let settleTimerId: ReturnType<typeof setTimeout> | null = null

  const clearSettleTimer = (): void => {
    if (settleTimerId !== null) {
      clearTimeout(settleTimerId)
      settleTimerId = null
    }
  }

  const scheduleSettleTimer = (refresh: () => void): void => {
    clearSettleTimer()
    settleTimerId = setTimeout(() => {
      settleTimerId = null
      refresh()
    }, deps.settleDurationMs)
  }

  const persist = (credentials: GreenApiCredentials | null, settledAt: number | null): void => {
    if (credentials === null) {
      deps.storage.remove(SESSION_STORAGE_KEY)
      return
    }
    writeJson(deps.storage, SESSION_STORAGE_KEY, { credentials, settledAt })
  }

  const loadPersisted = (): PersistedSession | null => {
    const value = readJson<unknown>(deps.storage, SESSION_STORAGE_KEY)
    return isPersistedSession(value) ? value : null
  }

  return create<SessionState>()((set, get) => {
    const phaseFor = (settledAt: number | null, now: number): BootstrapPhase => {
      if (settledAt === null) {
        return 'idle'
      }
      return now - settledAt < deps.settleDurationMs ? 'settling' : 'done'
    }

    const ensureBootstrap = async (credentials: GreenApiCredentials): Promise<void> => {
      set({ bootstrapPhase: 'running' })
      try {
        const outcome = await bootstrapWebhookFlags(credentials, deps.gateway.settings, deps.now)
        const phase: BootstrapPhase = outcome.appliedFlags.length === 0 ? 'done' : 'settling'
        set({ settledAt: outcome.settledAt, bootstrapPhase: phase })
        persist(credentials, outcome.settledAt)
        if (phase === 'settling') {
          scheduleSettleTimer(get().refreshBootstrapPhase)
        }
      } catch (error) {
        console.warn('[session] webhook settings bootstrap failed', error)
        set({ bootstrapPhase: 'failed' })
      }
    }

    const validateState = async (
      credentials: GreenApiCredentials,
    ): Promise<ConnectFailureCode | null> => {
      const state = await deps.gateway.state.getStateInstance(credentials)
      return mapInstanceState(state.stateInstance)
    }

    return {
      credentials: null,
      status: 'disconnected',
      bootstrapPhase: 'idle',
      settledAt: null,

      async connect(input) {
        const validationError = validateConnectInput(input)
        if (validationError !== null) {
          return { ok: false, code: validationError }
        }
        const credentials: GreenApiCredentials = {
          apiUrl: input.apiUrl.trim(),
          idInstance: input.idInstance.trim(),
          apiTokenInstance: input.apiTokenInstance.trim(),
        }
        set({ status: 'connecting' })
        try {
          const failure = await validateState(credentials)
          if (failure !== null) {
            set({ status: 'disconnected' })
            return { ok: false, code: failure }
          }
        } catch (error) {
          set({ status: 'disconnected' })
          return { ok: false, code: mapConnectError(error) }
        }
        set({ credentials, status: 'connected', bootstrapPhase: 'running', settledAt: null })
        persist(credentials, null)
        await ensureBootstrap(credentials)
        return { ok: true }
      },

      disconnect() {
        clearSettleTimer()
        resumeAttempted = false
        deps.storage.remove(SESSION_STORAGE_KEY)
        set({ credentials: null, status: 'disconnected', bootstrapPhase: 'idle', settledAt: null })
      },

      async resume() {
        if (resumeAttempted || get().status !== 'disconnected') {
          return
        }
        resumeAttempted = true
        const persisted = loadPersisted()
        if (persisted === null) {
          return
        }
        set({ credentials: persisted.credentials, status: 'connecting' })
        try {
          const failure = await validateState(persisted.credentials)
          if (failure !== null) {
            set({ status: 'disconnected' })
            return
          }
          const resumedPhase = phaseFor(persisted.settledAt, deps.now())
          set({ status: 'connected', bootstrapPhase: resumedPhase, settledAt: persisted.settledAt })
          if (persisted.settledAt === null) {
            await ensureBootstrap(persisted.credentials)
          } else if (resumedPhase === 'settling') {
            scheduleSettleTimer(get().refreshBootstrapPhase)
          }
        } catch (error) {
          console.warn('[session] session resume failed', error)
          set({ status: 'disconnected' })
        }
      },

      async retryBootstrap() {
        const credentials = get().credentials
        if (credentials === null || get().bootstrapPhase === 'running') {
          return
        }
        await ensureBootstrap(credentials)
      },

      refreshBootstrapPhase() {
        const { settledAt, bootstrapPhase } = get()
        if (bootstrapPhase !== 'settling') {
          return
        }
        if (deps.now() - (settledAt ?? 0) < deps.settleDurationMs) {
          return
        }
        set({ bootstrapPhase: 'done' })
      },
    }
  })
}
