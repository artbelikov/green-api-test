import { afterEach, describe, expect, it, vi } from 'vitest'
import type { GreenApiCredentials, GreenApiHistoryItem, Message } from '@/shared/api/greenapi'
import { ApiError } from '@/shared/api/greenapi'
import type { KeyValueStore } from '@/shared/lib/storage'
import type { MessagesGateway } from './create-messages-store'
import { createMessagesStore } from './create-messages-store'

const CREDENTIALS: GreenApiCredentials = {
  apiUrl: 'https://gateway.test',
  idInstance: '110100200',
  apiTokenInstance: 'token-1',
}

const createMemoryStorage = (): KeyValueStore => {
  const map = new Map<string, string>()
  return {
    read: (key) => map.get(key) ?? null,
    write: (key, value) => {
      map.set(key, value)
    },
    remove: (key) => {
      map.delete(key)
    },
  }
}

const mulberry32 = (seed: number): (() => number) => {
  let state = seed
  return () => {
    state |= 0
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const shuffled = <T>(items: readonly T[], random: () => number): T[] => {
  const copy = [...items]
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1))
    const a = copy[index] as T
    const b = copy[swap] as T
    copy[index] = b
    copy[swap] = a
  }
  return copy
}

type StoreOptions = {
  readonly gateway?: MessagesGateway
  readonly capacityPerChat?: number
  readonly now?: () => number
  readonly storage?: KeyValueStore
}

const createLiveMessageEvent = (overrides: {
  readonly id: string
  readonly chatId?: string
  readonly direction?: 'incoming' | 'outgoing'
  readonly text?: string
  readonly timestamp?: number
  readonly status?: Message['status']
}) => ({
  kind: 'message' as const,
  chatFallback: null,
  message: {
    id: overrides.id,
    chatId: overrides.chatId ?? 'chat-1',
    direction: overrides.direction ?? ('incoming' as const),
    text: overrides.text ?? `text ${overrides.id}`,
    timestamp: overrides.timestamp ?? 1_000,
    status: overrides.status ?? null,
  },
})

const createLiveStatusEvent = (overrides: {
  readonly idMessage: string
  readonly chatId?: string
  readonly status: 'sent' | 'delivered' | 'read' | 'failed'
}) => ({
  kind: 'status' as const,
  idMessage: overrides.idMessage,
  chatId: overrides.chatId ?? 'chat-1',
  status: overrides.status,
  timestamp: 2_000,
})

const createStore = (options: StoreOptions = {}) => {
  let clock = 1_000
  const store = createMessagesStore({
    gateway: options.gateway ?? { getChatHistory: async () => [] },
    now: options.now ?? (() => (clock += 1)),
    storage: options.storage ?? createMemoryStorage(),
    capacityPerChat: options.capacityPerChat ?? 200,
  })
  return store
}

describe('createMessagesStore — live events', () => {
  it('appends incoming messages and keeps chronological order', () => {
    const store = createStore()

    expect(
      store.getState().applyMessageEvent(createLiveMessageEvent({ id: 'm3', timestamp: 3_000 })),
    ).toBe(true)
    expect(
      store.getState().applyMessageEvent(createLiveMessageEvent({ id: 'm1', timestamp: 1_000 })),
    ).toBe(true)
    expect(
      store.getState().applyMessageEvent(createLiveMessageEvent({ id: 'm2', timestamp: 2_000 })),
    ).toBe(true)

    expect(store.getState().byChat['chat-1']?.map((message) => message.id)).toEqual([
      'm1',
      'm2',
      'm3',
    ])
  })

  it('replays the same notification idempotently', () => {
    const store = createStore()
    const event = createLiveMessageEvent({ id: 'm1', timestamp: 1_000 })

    expect(store.getState().applyMessageEvent(event)).toBe(true)
    expect(store.getState().applyMessageEvent(event)).toBe(false)

    expect(store.getState().byChat['chat-1']?.map((message) => message.id)).toEqual(['m1'])
  })

  it('is idempotent and deterministic under shuffled replays', () => {
    for (const seed of [1, 42, 1337]) {
      const random = mulberry32(seed)
      const events = Array.from({ length: 40 }, (_, index) =>
        createLiveMessageEvent({ id: `m${index}`, timestamp: (index % 7) * 1_000 + index }),
      )
      const first = createStore()
      const second = createStore()

      for (const event of shuffled(events, random)) {
        first.getState().applyMessageEvent(event)
      }
      for (const event of shuffled(events, random)) {
        second.getState().applyMessageEvent(event)
      }

      expect(first.getState().byChat['chat-1']).toEqual(second.getState().byChat['chat-1'])
      expect(first.getState().applyMessageEvent(events[0] as never)).toBe(false)
    }
  })

  it('replaces a matching pending bubble when the outgoing webhook arrives first', () => {
    const store = createStore()
    const pendingId = store.getState().appendPending('chat-1', 'Hello there')

    const webhook = createLiveMessageEvent({
      id: 'server-1',
      direction: 'outgoing',
      text: 'Hello there',
      status: 'sent',
    })
    expect(store.getState().applyMessageEvent(webhook)).toBe(true)

    const messages = store.getState().byChat['chat-1'] ?? []
    expect(messages).toHaveLength(1)
    expect(messages[0]).toMatchObject({ id: 'server-1', status: 'sent' })
    expect(messages.some((message) => message.id === pendingId)).toBe(false)
  })

  it('reconciles the pending bubble by the idMessage returned from sendMessage', () => {
    const store = createStore()
    const pendingId = store.getState().appendPending('chat-1', 'Hello there')

    expect(store.getState().reconcileSent('chat-1', pendingId, 'server-1')).toBe(true)

    const messages = store.getState().byChat['chat-1'] ?? []
    expect(messages).toHaveLength(1)
    expect(messages[0]).toMatchObject({ id: 'server-1', status: 'sent', text: 'Hello there' })
  })

  it('drops the pending bubble when the webhook already carries the reconciled id', () => {
    const store = createStore()
    const pendingId = store.getState().appendPending('chat-1', 'Hello there')

    expect(
      store.getState().applyMessageEvent(
        createLiveMessageEvent({
          id: 'server-1',
          direction: 'outgoing',
          text: 'Hello there',
          status: 'sent',
        }),
      ),
    ).toBe(true)
    expect(store.getState().reconcileSent('chat-1', pendingId, 'server-1')).toBe(false)

    expect(store.getState().byChat['chat-1']).toHaveLength(1)
  })

  it('keeps a failed bubble visible and records the failure for the toast', () => {
    const store = createStore()
    const pendingId = store.getState().appendPending('chat-1', 'Hello there')
    const error = ApiError.fromStatus(500, 'boom')

    store.getState().markSendFailed('chat-1', pendingId, error)

    const messages = store.getState().byChat['chat-1'] ?? []
    expect(messages).toHaveLength(1)
    expect(messages[0]).toMatchObject({ id: pendingId, status: 'failed' })
    expect(store.getState().failedSend).toEqual({ chatId: 'chat-1', pendingId, error })
  })

  it('escalates outgoing delivery statuses without downgrades', () => {
    const store = createStore()
    store
      .getState()
      .applyMessageEvent(
        createLiveMessageEvent({ id: 'own-1', direction: 'outgoing', status: 'sent' }),
      )

    expect(
      store
        .getState()
        .applyStatusEvent(createLiveStatusEvent({ idMessage: 'own-1', status: 'delivered' })),
    ).toBe(true)
    expect(
      store
        .getState()
        .applyStatusEvent(createLiveStatusEvent({ idMessage: 'own-1', status: 'sent' })),
    ).toBe(false)
    expect(
      store
        .getState()
        .applyStatusEvent(createLiveStatusEvent({ idMessage: 'own-1', status: 'read' })),
    ).toBe(true)
    expect(store.getState().byChat['chat-1']?.[0]?.status).toBe('read')
  })

  it('applies a failure status over any current delivery status', () => {
    const store = createStore()
    store
      .getState()
      .applyMessageEvent(
        createLiveMessageEvent({ id: 'own-1', direction: 'outgoing', status: 'sent' }),
      )

    expect(
      store
        .getState()
        .applyStatusEvent(createLiveStatusEvent({ idMessage: 'own-1', status: 'failed' })),
    ).toBe(true)
    expect(store.getState().byChat['chat-1']?.[0]?.status).toBe('failed')
  })

  it('escalates a pending bubble through the mandatory sent status event', () => {
    const store = createStore()
    const pendingId = store.getState().appendPending('chat-1', 'queued')
    expect(store.getState().byChat['chat-1']?.[0]?.status).toBe('pending')

    expect(
      store
        .getState()
        .applyStatusEvent(createLiveStatusEvent({ idMessage: pendingId, status: 'sent' })),
    ).toBe(true)
    expect(store.getState().byChat['chat-1']?.[0]?.status).toBe('sent')
  })

  it('ignores statuses for unknown messages and incoming messages', () => {
    const store = createStore()
    store
      .getState()
      .applyMessageEvent(createLiveMessageEvent({ id: 'in-1', direction: 'incoming' }))

    expect(
      store
        .getState()
        .applyStatusEvent(createLiveStatusEvent({ idMessage: 'ghost', status: 'read' })),
    ).toBe(false)
    expect(
      store
        .getState()
        .applyStatusEvent(createLiveStatusEvent({ idMessage: 'in-1', status: 'read' })),
    ).toBe(false)
  })
})

describe('createMessagesStore — dropMessage', () => {
  it('removes only the addressed message from the chat', () => {
    const store = createStore()
    expect(
      store.getState().applyMessageEvent(createLiveMessageEvent({ id: 'm1', timestamp: 1_000 })),
    ).toBe(true)
    expect(
      store.getState().applyMessageEvent(createLiveMessageEvent({ id: 'm2', timestamp: 2_000 })),
    ).toBe(true)

    store.getState().dropMessage('chat-1', 'm1')

    expect(store.getState().byChat['chat-1']?.map((message) => message.id)).toEqual(['m2'])
  })

  it('clears the recorded failure when the failed message is dropped', () => {
    const store = createStore()
    const pendingId = store.getState().appendPending('chat-1', 'doomed')
    store.getState().markSendFailed('chat-1', pendingId, new ApiError('boom', { kind: 'status' }))
    expect(store.getState().failedSend).not.toBeNull()

    store.getState().dropMessage('chat-1', pendingId)

    expect(store.getState().byChat['chat-1']).toEqual([])
    expect(store.getState().failedSend).toBeNull()
  })

  it('keeps the recorded failure of another chat untouched', () => {
    const store = createStore()
    const pendingId = store.getState().appendPending('chat-1', 'doomed')
    store.getState().markSendFailed('chat-1', pendingId, new ApiError('boom', { kind: 'status' }))

    store.getState().dropMessage('chat-2', 'some-other-id')

    expect(store.getState().failedSend).toMatchObject({ chatId: 'chat-1', pendingId })
  })

  it('ignores unknown message ids and unknown chats', () => {
    const store = createStore()
    expect(
      store.getState().applyMessageEvent(createLiveMessageEvent({ id: 'm1', timestamp: 1_000 })),
    ).toBe(true)

    store.getState().dropMessage('chat-1', 'missing')
    store.getState().dropMessage('chat-unknown', 'm1')

    expect(store.getState().byChat['chat-1']?.map((message) => message.id)).toEqual(['m1'])
  })
})

describe('createMessagesStore — history hydration', () => {
  const historyItem = (overrides: Partial<GreenApiHistoryItem>): GreenApiHistoryItem => ({
    type: 'incoming',
    idMessage: 'h1',
    timestamp: 100,
    typeMessage: 'textMessage',
    chatId: 'chat-1',
    textMessage: 'from history',
    ...overrides,
  })

  it('hydrates history, merges with live messages, and sorts chronologically', async () => {
    let calls = 0
    const store = createStore({
      gateway: {
        getChatHistory: async () => {
          calls += 1
          return [
            historyItem({ idMessage: 'h3', timestamp: 300, textMessage: 'third' }),
            historyItem({ idMessage: 'h1', timestamp: 100, textMessage: 'first' }),
          ]
        },
      },
    })
    store.getState().applyMessageEvent(createLiveMessageEvent({ id: 'live', timestamp: 250_000 }))

    const phase = await store.getState().loadChatHistory('chat-1', CREDENTIALS)

    expect(phase).toBe('ready')
    expect(store.getState().history['chat-1']).toBe('ready')
    expect(store.getState().byChat['chat-1']?.map((message) => message.id)).toEqual([
      'h1',
      'live',
      'h3',
    ])
    expect(store.getState().byChat['chat-1']?.[2]?.timestamp).toBe(300_000)
    expect(calls).toBe(1)
  })

  it('does not refetch when the chat history is already hydrated', async () => {
    let calls = 0
    const store = createStore({
      gateway: {
        getChatHistory: async () => {
          calls += 1
          return [historyItem({})]
        },
      },
    })

    await store.getState().loadChatHistory('chat-1', CREDENTIALS)
    const second = await store.getState().loadChatHistory('chat-1', CREDENTIALS)

    expect(calls).toBe(1)
    expect(second).toBe('ready')
  })

  it('coalesces concurrent hydrations into a single request', async () => {
    let calls = 0
    const gateRef: { release: () => void } = { release: () => undefined }
    const gate = new Promise<void>((resolve) => {
      gateRef.release = resolve
    })
    const store = createStore({
      gateway: {
        getChatHistory: async () => {
          calls += 1
          await gate
          return [historyItem({ idMessage: 'h1' })]
        },
      },
    })

    const first = store.getState().loadChatHistory('chat-1', CREDENTIALS)
    const second = store.getState().loadChatHistory('chat-1', CREDENTIALS)
    expect(store.getState().history['chat-1']).toBe('loading')
    gateRef.release()

    expect(await first).toBe('ready')
    expect(await second).toBe('ready')
    expect(calls).toBe(1)
  })

  it('keeps the failed phase for a retry and tolerates a broken gateway', async () => {
    let attempts = 0
    const store = createStore({
      gateway: {
        getChatHistory: async () => {
          attempts += 1
          if (attempts === 1) {
            throw ApiError.fromStatus(500, 'boom')
          }
          return [historyItem({})]
        },
      },
    })

    expect(await store.getState().loadChatHistory('chat-1', CREDENTIALS)).toBe('failed')
    expect(store.getState().history['chat-1']).toBe('failed')

    expect(await store.getState().loadChatHistory('chat-1', CREDENTIALS)).toBe('ready')
    expect(store.getState().history['chat-1']).toBe('ready')
  })

  it('skips non-text and deleted history entries', async () => {
    const mediaItem: GreenApiHistoryItem = {
      type: 'incoming',
      idMessage: 'h2',
      timestamp: 200,
      typeMessage: 'imageMessage',
      chatId: 'chat-1',
    }
    const store = createStore({
      gateway: {
        getChatHistory: async () => [
          historyItem({ idMessage: 'h1' }),
          mediaItem,
          historyItem({ idMessage: 'h3', isDeleted: true }),
        ],
      },
    })

    await store.getState().loadChatHistory('chat-1', CREDENTIALS)
    expect(store.getState().byChat['chat-1']?.map((message) => message.id)).toEqual(['h1'])
  })
})

describe('createMessagesStore — cross-source dedupe', () => {
  const nearMatchId = (timestampMs: number, millisecondSuffix: number): string =>
    `${Math.floor(timestampMs / 1000)}${String(millisecondSuffix).padStart(3, '0')}`

  it('drops the journal copy of a message that already arrived through a webhook', async () => {
    const timestampMs = 1_794_647_009_000
    const store = createStore({
      gateway: {
        getChatHistory: async () => [
          {
            type: 'incoming',
            idMessage: nearMatchId(timestampMs, 25),
            timestamp: timestampMs / 1000,
            typeMessage: 'textMessage',
            chatId: 'chat-1',
            textMessage: 'same text',
          },
        ],
      },
    })
    expect(
      store.getState().applyMessageEvent(
        createLiveMessageEvent({
          id: nearMatchId(timestampMs, 871),
          text: 'same text',
          timestamp: timestampMs,
        }),
      ),
    ).toBe(true)

    expect(await store.getState().loadChatHistory('chat-1', CREDENTIALS)).toBe('ready')

    expect(store.getState().byChat['chat-1']).toHaveLength(1)
    expect(store.getState().byChat['chat-1']?.[0]?.id).toBe(nearMatchId(timestampMs, 871))
  })

  it('keeps a single bubble when the history copy lands before the webhook redelivery', () => {
    const timestampMs = 1_794_647_009_500
    const store = createStore()
    expect(
      store.getState().applyMessageEvent(
        createLiveMessageEvent({
          id: 'journal-id-1',
          text: 'same text',
          timestamp: timestampMs,
        }),
      ),
    ).toBe(true)

    expect(
      store.getState().applyMessageEvent(
        createLiveMessageEvent({
          id: nearMatchId(timestampMs, 123),
          text: 'same text',
          timestamp: timestampMs + 300,
        }),
      ),
    ).toBe(false)
    expect(store.getState().byChat['chat-1']).toHaveLength(1)
  })

  it('escalates the delivery status when the journal knows more than the webhook copy', async () => {
    const timestampMs = 1_794_647_009_000
    const store = createStore({
      gateway: {
        getChatHistory: async () => [
          {
            type: 'outgoing',
            idMessage: nearMatchId(timestampMs, 25),
            timestamp: timestampMs / 1000,
            typeMessage: 'textMessage',
            chatId: 'chat-1',
            textMessage: 'same text',
            statusMessage: 'delivered',
          },
        ],
      },
    })
    expect(
      store.getState().applyMessageEvent(
        createLiveMessageEvent({
          id: 'webhook-id-1',
          direction: 'outgoing',
          text: 'same text',
          timestamp: timestampMs,
          status: 'sent',
        }),
      ),
    ).toBe(true)

    expect(await store.getState().loadChatHistory('chat-1', CREDENTIALS)).toBe('ready')

    const messages = store.getState().byChat['chat-1'] ?? []
    expect(messages).toHaveLength(1)
    expect(messages[0]).toMatchObject({ id: 'webhook-id-1', status: 'delivered' })
  })

  it('keeps genuinely repeated identical texts outside the timestamp window', () => {
    const store = createStore()
    expect(
      store
        .getState()
        .applyMessageEvent(createLiveMessageEvent({ id: 'a-1', text: 'ok', timestamp: 100_000 })),
    ).toBe(true)
    expect(
      store
        .getState()
        .applyMessageEvent(createLiveMessageEvent({ id: 'a-2', text: 'ok', timestamp: 103_500 })),
    ).toBe(true)

    expect(store.getState().byChat['chat-1']).toHaveLength(2)
  })

  it('honours direction when matching across sources', () => {
    const timestampMs = 1_794_647_009_000
    const store = createStore()
    expect(
      store.getState().applyMessageEvent(
        createLiveMessageEvent({
          id: 'out-1',
          direction: 'outgoing',
          text: 'same text',
          timestamp: timestampMs,
        }),
      ),
    ).toBe(true)
    expect(
      store.getState().applyMessageEvent(
        createLiveMessageEvent({
          id: 'in-1',
          direction: 'incoming',
          text: 'same text',
          timestamp: timestampMs,
        }),
      ),
    ).toBe(true)

    expect(store.getState().byChat['chat-1']).toHaveLength(2)
  })

  it('requests user priority for the opened-chat history fetch', async () => {
    const seenOptions: Array<unknown> = []
    const store = createStore({
      gateway: {
        getChatHistory: async (_credentials, _args, options) => {
          seenOptions.push(options)
          return []
        },
      },
    })

    await store.getState().loadChatHistory('chat-1', CREDENTIALS)

    expect(seenOptions).toEqual([{ priority: 'user' }])
  })

  it('still dedupes exact identical ids across sources', async () => {
    const store = createStore({
      gateway: {
        getChatHistory: async () => [
          {
            type: 'incoming',
            idMessage: 'same-id',
            timestamp: 1_000,
            typeMessage: 'textMessage',
            chatId: 'chat-1',
            textMessage: 'same text',
          },
        ],
      },
    })
    expect(
      store
        .getState()
        .applyMessageEvent(
          createLiveMessageEvent({ id: 'same-id', text: 'same text', timestamp: 1_000 }),
        ),
    ).toBe(true)

    expect(await store.getState().loadChatHistory('chat-1', CREDENTIALS)).toBe('ready')

    expect(store.getState().byChat['chat-1']).toHaveLength(1)
  })
})

describe('createMessagesStore — capacity and persistence', () => {
  it('caps each chat at the configured capacity keeping the newest messages', () => {
    const store = createStore({ capacityPerChat: 200 })

    for (let index = 0; index < 250; index += 1) {
      store
        .getState()
        .applyMessageEvent(createLiveMessageEvent({ id: `m${index}`, timestamp: index }))
    }

    const messages = store.getState().byChat['chat-1'] ?? []
    expect(messages).toHaveLength(200)
    expect(messages[0]?.id).toBe('m50')
    expect(messages[199]?.id).toBe('m249')
  })

  it('persists capped messages and reloads them without pending bubbles once the write window elapses', async () => {
    const storage = createMemoryStorage()
    let clock = 1_000
    const historyEntry = {
      type: 'incoming',
      idMessage: 'h1',
      timestamp: 1,
      typeMessage: 'textMessage',
      chatId: 'chat-1',
      textMessage: 'from history',
    } satisfies GreenApiHistoryItem
    const store = createMessagesStore({
      gateway: { getChatHistory: async () => [historyEntry] },
      now: () => (clock += 1),
      storage,
      capacityPerChat: 200,
    })

    vi.useFakeTimers()
    try {
      store.getState().applyMessageEvent(createLiveMessageEvent({ id: 'm1', timestamp: 5_000 }))
      const pendingId = store.getState().appendPending('chat-1', 'unsent yet')
      await store.getState().loadChatHistory('chat-1', CREDENTIALS)

      vi.advanceTimersByTime(500)

      const revived = createMessagesStore({
        gateway: { getChatHistory: async () => [] },
        now: () => 0,
        storage,
        capacityPerChat: 200,
      })

      const messages = revived.getState().byChat['chat-1'] ?? []
      expect(messages.map((message) => message.id)).toEqual(['h1', 'm1'])
      expect(messages.some((message) => message.id === pendingId)).toBe(false)
      expect(revived.getState().history['chat-1']).toBe('ready')
    } finally {
      vi.useRealTimers()
    }
  })

  it('ignores malformed persisted payloads', () => {
    const storage = createMemoryStorage()
    storage.write('green-api-messenger:messages:v1', 'not json')

    const revived = createMessagesStore({
      gateway: { getChatHistory: async () => [] },
      now: () => 0,
      storage,
      capacityPerChat: 200,
    })

    expect(revived.getState().byChat).toEqual({})
    expect(revived.getState().history).toEqual({})
  })

  it('clears all state and storage', async () => {
    const storage = createMemoryStorage()
    const store = createMessagesStore({
      gateway: { getChatHistory: async () => [] },
      now: () => 1,
      storage,
      capacityPerChat: 200,
    })

    store.getState().appendPending('chat-1', 'hello')
    store.getState().clear()

    expect(store.getState().byChat).toEqual({})
    expect(store.getState().history).toEqual({})
    expect(store.getState().failedSend).toBeNull()
    expect(storage.read('green-api-messenger:messages:v1')).toBeNull()
  })
})

describe('createMessagesStore — selectors', () => {
  it('returns stable references across unrelated state changes', () => {
    const store = createStore()
    store.getState().applyMessageEvent(createLiveMessageEvent({ id: 'a1', chatId: 'chat-a' }))
    const stateBefore = store.getState()
    const referenceBefore = store.getState().byChat['chat-a']

    store.getState().applyMessageEvent(createLiveMessageEvent({ id: 'b1', chatId: 'chat-b' }))
    const stateAfter = store.getState()

    expect(store.getState().byChat['chat-a']).toBe(referenceBefore)
    expect(stateAfter).not.toBe(stateBefore)
  })
})

describe('createMessagesStore — persistence throttling', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('defers the write to the trailing window instead of persisting synchronously', () => {
    const storage = createMemoryStorage()
    const store = createStore({ storage })

    vi.useFakeTimers()
    store.getState().applyMessageEvent(createLiveMessageEvent({ id: 'm1', timestamp: 1_000 }))

    expect(storage.read('green-api-messenger:messages:v1')).toBeNull()

    vi.advanceTimersByTime(500)

    expect(storage.read('green-api-messenger:messages:v1')).not.toBeNull()
  })

  it('coalesces a burst of events within the window into a single write', () => {
    const storage = createMemoryStorage()
    const store = createStore({ storage })

    vi.useFakeTimers()
    const writeSpy = vi.spyOn(storage, 'write')
    for (let index = 0; index < 5; index += 1) {
      store
        .getState()
        .applyMessageEvent(createLiveMessageEvent({ id: `m${index}`, timestamp: index }))
    }

    vi.advanceTimersByTime(500)

    expect(writeSpy).toHaveBeenCalledTimes(1)
    const persisted = storage.read('green-api-messenger:messages:v1')
    expect(persisted).not.toBeNull()
  })

  it('writes once per window under a continuous event stream', () => {
    const storage = createMemoryStorage()
    const store = createStore({ storage })

    vi.useFakeTimers()
    const writeSpy = vi.spyOn(storage, 'write')
    for (let tick = 0; tick < 3; tick += 1) {
      store
        .getState()
        .applyMessageEvent(createLiveMessageEvent({ id: `m-${tick}`, timestamp: tick }))
      vi.advanceTimersByTime(500)
    }

    expect(writeSpy).toHaveBeenCalledTimes(3)
  })

  it('captures the latest state of the window, not the state at schedule time', () => {
    const storage = createMemoryStorage()
    const store = createStore({ storage })

    vi.useFakeTimers()
    store.getState().applyMessageEvent(createLiveMessageEvent({ id: 'm1', timestamp: 1_000 }))
    store.getState().applyMessageEvent(createLiveMessageEvent({ id: 'm2', timestamp: 2_000 }))
    vi.advanceTimersByTime(499)
    store.getState().applyMessageEvent(createLiveMessageEvent({ id: 'm3', timestamp: 3_000 }))
    vi.advanceTimersByTime(1)

    const persisted = JSON.parse(storage.read('green-api-messenger:messages:v1') ?? '{}') as {
      chats: Record<string, { id: string }[]>
    }
    expect(persisted.chats['chat-1']?.map((message) => message.id)).toEqual(['m1', 'm2', 'm3'])
  })

  it('flushes pending persistence on beforeunload', () => {
    const storage = createMemoryStorage()
    const store = createStore({ storage })

    store.getState().applyMessageEvent(createLiveMessageEvent({ id: 'm1', timestamp: 1_000 }))
    expect(storage.read('green-api-messenger:messages:v1')).toBeNull()

    window.dispatchEvent(new Event('beforeunload'))

    expect(storage.read('green-api-messenger:messages:v1')).not.toBeNull()
  })

  it('cancels the pending write on clear so a re-connected session cannot resurrect data', () => {
    const storage = createMemoryStorage()
    const store = createStore({ storage })

    vi.useFakeTimers()
    store.getState().applyMessageEvent(createLiveMessageEvent({ id: 'm1', timestamp: 1_000 }))
    store.getState().clear()
    vi.advanceTimersByTime(1_000)

    expect(storage.read('green-api-messenger:messages:v1')).toBeNull()
    expect(store.getState().byChat).toEqual({})
  })

  it('discards an in-flight history load that resolves after a clear', async () => {
    let release: () => void = () => undefined
    const gate = new Promise<void>((resolve) => {
      release = resolve
    })
    const storage = createMemoryStorage()
    const store = createMessagesStore({
      gateway: {
        getChatHistory: async () => {
          await gate
          return [
            {
              type: 'incoming',
              idMessage: 'h1',
              timestamp: 100,
              typeMessage: 'textMessage',
              chatId: 'chat-1',
              textMessage: 'late arrival',
            } satisfies GreenApiHistoryItem,
          ]
        },
      },
      now: () => 1,
      storage,
      capacityPerChat: 200,
    })

    vi.useFakeTimers()
    const loadPromise = store.getState().loadChatHistory('chat-1', CREDENTIALS)
    store.getState().clear()
    release()

    expect(await loadPromise).toBe('failed')
    vi.advanceTimersByTime(500)

    expect(store.getState().byChat).toEqual({})
    expect(store.getState().history).toEqual({})
    expect(storage.read('green-api-messenger:messages:v1')).toBeNull()
  })

  it('warns on a failed history request without changing the returned phase', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    try {
      const store = createStore({
        gateway: {
          getChatHistory: async () => {
            throw ApiError.fromStatus(500, 'boom')
          },
        },
      })

      expect(await store.getState().loadChatHistory('chat-1', CREDENTIALS)).toBe('failed')
      expect(store.getState().history['chat-1']).toBe('failed')
      expect(warnSpy).toHaveBeenCalledTimes(1)
      expect(warnSpy.mock.calls[0]?.[0]).toContain('history')
    } finally {
      warnSpy.mockRestore()
    }
  })
})
