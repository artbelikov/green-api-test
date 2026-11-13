import { describe, expect, it, vi } from 'vitest'
import { ApiError, type GreenApiCredentials } from '@/shared/api/greenapi'
import type { KeyValueStore } from '@/shared/lib/storage'
import { SETTLE_DURATION_MS } from './bootstrap'
import { createSessionStore, type SessionGateway } from './create-session-store'
import type { ConnectInput } from './types'

const VALID_INPUT = {
  idInstance: ' 110100200 ',
  apiTokenInstance: ' token-1 ',
  apiUrl: ' https://gateway.test ',
}

const TRIMMED_CREDENTIALS: GreenApiCredentials = {
  apiUrl: 'https://gateway.test',
  idInstance: '110100200',
  apiTokenInstance: 'token-1',
}

const SETTINGS_STORAGE_KEY = 'green-api-messenger:session:v1'

const createMemoryStorage = (): KeyValueStore & { entries(): Map<string, string> } => {
  const map = new Map<string, string>()
  return {
    read: (key) => map.get(key) ?? null,
    write: (key, value) => {
      map.set(key, value)
    },
    remove: (key) => {
      map.delete(key)
    },
    entries: () => map,
  }
}

type GatewayOverrides = {
  state?: string
  stateError?: unknown
  settings?: Record<string, string | number | boolean>
  settingsError?: unknown
  settingsApplyError?: unknown
}

const createGateway = (overrides: GatewayOverrides = {}) => {
  const applied: unknown[] = []
  const gateway: SessionGateway = {
    state: {
      getStateInstance: vi.fn(async () => {
        if (overrides.stateError !== undefined) {
          throw overrides.stateError
        }
        return { stateInstance: overrides.state ?? 'authorized' }
      }),
    },
    settings: {
      getSettings: vi.fn(async () => {
        if (overrides.settingsError !== undefined) {
          throw overrides.settingsError
        }
        return {
          wid: '79000000000@c.us',
          webhookUrl: '',
          incomingWebhook: overrides.settings?.incomingWebhook ?? 'no',
          outgoingMessageWebhook: overrides.settings?.outgoingMessageWebhook ?? 'no',
          outgoingWebhook: overrides.settings?.outgoingWebhook ?? 'no',
          stateWebhook: overrides.settings?.stateWebhook ?? 'no',
        }
      }),
      setSettings: vi.fn(async (_credentials, patch) => {
        if (overrides.settingsApplyError !== undefined) {
          throw overrides.settingsApplyError
        }
        applied.push(patch)
      }),
    },
  }
  return { gateway, applied }
}

type StoreOptions = {
  gateway?: SessionGateway
  storage?: KeyValueStore
  now?: () => number
}

const createStore = (options: StoreOptions = {}) => {
  const store = createSessionStore({
    gateway: options.gateway ?? createGateway().gateway,
    storage: options.storage ?? createMemoryStorage(),
    now: options.now ?? (() => 1_000),
    settleDurationMs: SETTLE_DURATION_MS,
  })
  const state = () => store.getState()
  return {
    getState: state,
    connect: (input: ConnectInput) => state().connect(input),
    disconnect: () => state().disconnect(),
    resume: () => state().resume(),
    retryBootstrap: () => state().retryBootstrap(),
    refreshBootstrapPhase: () => state().refreshBootstrapPhase(),
  }
}

describe('createSessionStore.connect', () => {
  it('rejects invalid inputs without calling the gateway', async () => {
    const { gateway } = createGateway()
    const store = createStore({ gateway })

    const results = await Promise.all([
      store.connect({
        idInstance: '11o100',
        apiTokenInstance: 't',
        apiUrl: 'https://gateway.test',
      }),
      store.connect({
        idInstance: '110100200',
        apiTokenInstance: '',
        apiUrl: 'https://gateway.test',
      }),
      store.connect({ idInstance: '110100200', apiTokenInstance: 't', apiUrl: 'not a url' }),
    ])

    expect(results).toEqual([
      { ok: false, code: 'invalidInstanceId' },
      { ok: false, code: 'missingToken' },
      { ok: false, code: 'invalidApiUrl' },
    ])
    expect(store.getState().status).toBe('disconnected')
    expect(vi.mocked(gateway.state.getStateInstance)).not.toHaveBeenCalled()
  })

  it('connects, bootstraps webhook flags, and persists the session', async () => {
    const { gateway, applied } = createGateway()
    const storage = createMemoryStorage()
    const store = createStore({ gateway, storage })

    const result = await store.connect(VALID_INPUT)

    expect(result).toEqual({ ok: true })
    expect(store.getState().status).toBe('connected')
    expect(store.getState().credentials).toEqual(TRIMMED_CREDENTIALS)
    expect(store.getState().bootstrapPhase).toBe('settling')
    expect(applied).toEqual([
      {
        incomingWebhook: 'yes',
        outgoingMessageWebhook: 'yes',
        outgoingWebhook: 'yes',
        stateWebhook: 'yes',
      },
    ])
    const persisted = JSON.parse(storage.entries().get(SETTINGS_STORAGE_KEY) ?? '') as {
      credentials: GreenApiCredentials
      settledAt: number
    }
    expect(persisted.credentials).toEqual(TRIMMED_CREDENTIALS)
    expect(persisted.settledAt).toBe(1_000)
  })

  it('marks bootstrap done when every flag is already enabled', async () => {
    const { gateway, applied } = createGateway({
      settings: {
        incomingWebhook: 'yes',
        outgoingMessageWebhook: 'yes',
        outgoingWebhook: 'yes',
        stateWebhook: 'yes',
      },
    })
    const store = createStore({ gateway })

    const result = await store.connect(VALID_INPUT)

    expect(result).toEqual({ ok: true })
    expect(store.getState().bootstrapPhase).toBe('done')
    expect(applied).toEqual([])
  })

  it('surfaces unauthorized and starting instances as typed failures', async () => {
    for (const [state, code] of [
      ['notAuthorized', 'notAuthorized'],
      ['starting', 'instanceStarting'],
      ['blocked', 'instanceUnavailable'],
      ['yellowCard', 'instanceUnavailable'],
      ['mystery', 'unexpected'],
    ] as const) {
      const { gateway } = createGateway({ state })
      const store = createStore({ gateway })

      const result = await store.connect(VALID_INPUT)

      expect(result).toEqual({ ok: false, code })
      expect(store.getState().status).toBe('disconnected')
    }
  })

  it('maps gateway failures to connect failure codes', async () => {
    for (const [error, code] of [
      [ApiError.fromStatus(401, 'Unauthorized'), 'invalidCredentials'],
      [ApiError.fromStatus(403, 'Forbidden'), 'invalidCredentials'],
      [ApiError.fromStatus(429, 'Too Many Requests'), 'rateLimited'],
      [ApiError.timeout(1_000), 'timeoutError'],
      [ApiError.network('offline'), 'networkError'],
      [new Error('boom'), 'unexpected'],
    ] as const) {
      const { gateway } = createGateway({ stateError: error })
      const store = createStore({ gateway })

      const result = await store.connect(VALID_INPUT)

      expect(result).toEqual({ ok: false, code })
    }
  })

  it('keeps the session connected when bootstrap fails and retries on demand', async () => {
    let settingsError: unknown = new Error('boom')
    const { gateway, applied } = createGateway()
    vi.mocked(gateway.settings.getSettings).mockImplementation(async () => {
      if (settingsError !== null) {
        throw settingsError
      }
      return {
        wid: '79000000000@c.us',
        webhookUrl: '',
        incomingWebhook: 'no',
        outgoingMessageWebhook: 'no',
        outgoingWebhook: 'no',
        stateWebhook: 'no',
      }
    })
    const store = createStore({ gateway })

    const result = await store.connect(VALID_INPUT)

    expect(result).toEqual({ ok: true })
    expect(store.getState().status).toBe('connected')
    expect(store.getState().bootstrapPhase).toBe('failed')

    settingsError = null
    await store.retryBootstrap()

    expect(store.getState().bootstrapPhase).toBe('settling')
    expect(applied).toHaveLength(1)
  })
})

describe('createSessionStore.reconnecting', () => {
  it('tracks the reconnecting flag and clears it on disconnect', async () => {
    const { gateway } = createGateway()
    const store = createStore({ gateway })

    await store.connect(VALID_INPUT)
    store.getState().setReconnecting(true)
    expect(store.getState().reconnecting).toBe(true)

    store.disconnect()
    expect(store.getState().reconnecting).toBe(false)

    store.getState().setReconnecting(true)
    await store.connect(VALID_INPUT)
    expect(store.getState().reconnecting).toBe(false)
  })
})

describe('createSessionStore.disconnect', () => {
  it('clears credentials, storage, and bootstrap state', async () => {
    const { gateway } = createGateway()
    const storage = createMemoryStorage()
    const store = createStore({ gateway, storage })

    await store.connect(VALID_INPUT)
    store.disconnect()

    expect(store.getState()).toMatchObject({
      credentials: null,
      status: 'disconnected',
      bootstrapPhase: 'idle',
      settledAt: null,
    })
    expect(storage.entries().size).toBe(0)
  })
})

describe('createSessionStore.resume', () => {
  it('restores a persisted session and finishes a pending bootstrap', async () => {
    const { gateway, applied } = createGateway()
    const storage = createMemoryStorage()
    storage.write(
      SETTINGS_STORAGE_KEY,
      JSON.stringify({ credentials: TRIMMED_CREDENTIALS, settledAt: null }),
    )
    const store = createStore({ gateway, storage })

    await store.resume()

    expect(store.getState().status).toBe('connected')
    expect(store.getState().bootstrapPhase).toBe('settling')
    expect(store.getState().credentials).toEqual(TRIMMED_CREDENTIALS)
    expect(applied).toHaveLength(1)
  })

  it('treats a fresh settle window as settling and a stale one as done', async () => {
    const recentStorage = createMemoryStorage()
    recentStorage.write(
      SETTINGS_STORAGE_KEY,
      JSON.stringify({ credentials: TRIMMED_CREDENTIALS, settledAt: 1_000 }),
    )
    const recentStore = createStore({ storage: recentStorage })

    await recentStore.resume()

    expect(recentStore.getState().bootstrapPhase).toBe('settling')

    const staleStorage = createMemoryStorage()
    staleStorage.write(
      SETTINGS_STORAGE_KEY,
      JSON.stringify({ credentials: TRIMMED_CREDENTIALS, settledAt: 1_000 - SETTLE_DURATION_MS }),
    )
    const staleStore = createStore({ storage: staleStorage })

    await staleStore.resume()

    expect(staleStore.getState().bootstrapPhase).toBe('done')
  })

  it('ignores malformed persisted sessions', async () => {
    const { gateway } = createGateway()
    const storage = createMemoryStorage()
    storage.write(SETTINGS_STORAGE_KEY, 'not-json{')
    const store = createStore({ gateway, storage })

    await store.resume()

    expect(store.getState().status).toBe('disconnected')
    expect(store.getState().credentials).toBeNull()
    expect(vi.mocked(gateway.state.getStateInstance)).not.toHaveBeenCalled()
  })

  it('keeps stored credentials when validation fails so the form can prefill', async () => {
    const { gateway } = createGateway({ stateError: ApiError.fromStatus(401, 'Unauthorized') })
    const storage = createMemoryStorage()
    storage.write(
      SETTINGS_STORAGE_KEY,
      JSON.stringify({ credentials: TRIMMED_CREDENTIALS, settledAt: null }),
    )
    const store = createStore({ gateway, storage })

    await store.resume()

    expect(store.getState().status).toBe('disconnected')
    expect(store.getState().credentials).toEqual(TRIMMED_CREDENTIALS)
  })

  it('guards against repeated resume attempts for one mount cycle', async () => {
    const { gateway } = createGateway()
    const storage = createMemoryStorage()
    storage.write(
      SETTINGS_STORAGE_KEY,
      JSON.stringify({ credentials: TRIMMED_CREDENTIALS, settledAt: null }),
    )
    const store = createStore({ gateway, storage })

    await store.resume()
    await store.resume()

    expect(vi.mocked(gateway.state.getStateInstance)).toHaveBeenCalledTimes(1)
  })

  it('resolves the session decision on every resume exit so the UI can gate the connect screen', async () => {
    const emptyStore = createStore()
    expect(emptyStore.getState().sessionResolved).toBe(false)
    await emptyStore.resume()
    expect(emptyStore.getState().sessionResolved).toBe(true)

    const failingStore = createStore({
      gateway: createGateway({ stateError: ApiError.fromStatus(401, 'Unauthorized') }).gateway,
      storage: (() => {
        const storage = createMemoryStorage()
        storage.write(
          SETTINGS_STORAGE_KEY,
          JSON.stringify({ credentials: TRIMMED_CREDENTIALS, settledAt: null }),
        )
        return storage
      })(),
    })
    await failingStore.resume()
    expect(failingStore.getState().status).toBe('disconnected')
    expect(failingStore.getState().sessionResolved).toBe(true)

    const connectedStore = createStore()
    await connectedStore.resume()
    expect(connectedStore.getState().sessionResolved).toBe(true)

    connectedStore.disconnect()
    expect(connectedStore.getState().sessionResolved).toBe(true)
  })
})

describe('createSessionStore.settle phase', () => {
  it('completes the settle window on refresh', async () => {
    let currentNow = 1_000
    const { gateway } = createGateway()
    const store = createStore({ gateway, now: () => currentNow })

    await store.connect(VALID_INPUT)
    expect(store.getState().bootstrapPhase).toBe('settling')

    currentNow = 1_000 + SETTLE_DURATION_MS - 1
    store.refreshBootstrapPhase()
    expect(store.getState().bootstrapPhase).toBe('settling')

    currentNow = 1_000 + SETTLE_DURATION_MS
    store.refreshBootstrapPhase()
    expect(store.getState().bootstrapPhase).toBe('done')
  })

  it('ignores refresh calls outside the settling phase', () => {
    const store = createStore()

    store.refreshBootstrapPhase()

    expect(store.getState().bootstrapPhase).toBe('idle')
  })

  it('flips to done once the settle timer elapses', async () => {
    vi.useFakeTimers()
    try {
      const { gateway } = createGateway()
      const store = createStore({ gateway, now: () => Date.now() })

      await store.connect(VALID_INPUT)
      expect(store.getState().bootstrapPhase).toBe('settling')

      await vi.advanceTimersByTimeAsync(SETTLE_DURATION_MS + 1)
      expect(store.getState().bootstrapPhase).toBe('done')
    } finally {
      vi.useRealTimers()
    }
  })
})
