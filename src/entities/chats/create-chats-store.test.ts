import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Chat, Message } from '@/shared/api/greenapi'
import type { KeyValueStore } from '@/shared/lib/storage'
import { createChatsStore } from './create-chats-store'

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

const memory = (): { storage: KeyValueStore; now: () => number } => {
  const clock = 1_736_000_000_000
  return { storage: createMemoryStorage(), now: () => clock }
}

const chat = (id: string, overrides: Partial<Chat> = {}): Chat => ({
  id,
  name: `Chat ${id}`,
  type: 'private',
  username: null,
  phone: null,
  ...overrides,
})

const incoming = (id: string, chatId: string, text: string, timestamp: number): Message => ({
  id,
  chatId,
  direction: 'incoming',
  text,
  timestamp,
  status: null,
})

describe('createChatsStore', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('upserts chats sorted by last activity with a deterministic tiebreak', () => {
    const { storage, now } = memory()
    const store = createChatsStore({ storage })

    store.getState().upsertChats([chat('111'), chat('222')])
    expect(store.getState().summaries.map((summary) => summary.id)).toEqual(['111', '222'])

    store.getState().applyNewMessage({
      message: incoming('m1', '222', 'hello', now() + 1_000),
      fallbackName: null,
    })
    expect(store.getState().summaries.map((summary) => summary.id)).toEqual(['222', '111'])
  })

  it('upserts preserve runtime counters for known chats and refresh identity fields', () => {
    const { storage, now } = memory()
    const store = createChatsStore({ storage })

    store.getState().applyNewMessage({
      message: incoming('m1', '111', 'first', now()),
      fallbackName: null,
    })
    expect(store.getState().summaries[0]?.unread).toBe(1)

    store.getState().upsertChats([chat('111', { name: 'Renamed', username: 'handle' })])
    const summary = store.getState().summaries.find((entry) => entry.id === '111')
    expect(summary?.name).toBe('Renamed')
    expect(summary?.username).toBe('handle')
    expect(summary?.unread).toBe(1)
    expect(summary?.lastMessage?.text).toBe('first')
  })

  it('upserts fall back to the chat id when the incoming name is empty', () => {
    const { storage } = memory()
    const store = createChatsStore({ storage })

    store.getState().upsertChats([chat('111', { name: '' })])
    expect(store.getState().summaries[0]?.name).toBe('111')
  })

  it('upserts an unknown chat from an incoming message using the fallback name', () => {
    const { storage, now } = memory()
    const store = createChatsStore({ storage })

    store.getState().applyNewMessage({
      message: incoming('m1', 'unknown-chat', 'is anyone there?', now()),
      fallbackName: 'Незнакомец',
    })
    const summary = store.getState().summaries[0]
    expect(summary).toMatchObject({
      id: 'unknown-chat',
      name: 'Незнакомец',
      type: 'unknown',
      username: null,
      phone: null,
      unread: 1,
      lastMessage: { id: 'm1', text: 'is anyone there?', direction: 'incoming', status: null },
    })
  })

  it('falls back to the chat id when no fallback name is available', () => {
    const { storage, now } = memory()
    const store = createChatsStore({ storage })

    store.getState().applyNewMessage({
      message: incoming('m1', 'unknown-chat', 'hello', now()),
      fallbackName: null,
    })
    expect(store.getState().summaries[0]?.name).toBe('unknown-chat')
  })

  it('does not count unread for outgoing messages', () => {
    const { storage, now } = memory()
    const store = createChatsStore({ storage })

    store.getState().applyNewMessage({
      message: {
        id: 'm1',
        chatId: '111',
        direction: 'outgoing',
        text: 'sent from another device',
        timestamp: now(),
        status: 'sent',
      },
      fallbackName: null,
    })
    expect(store.getState().summaries[0]?.unread).toBe(0)
    expect(store.getState().summaries[0]?.lastMessage?.direction).toBe('outgoing')
  })

  it('does not count unread when the preview is backfilled as a known-read history item', () => {
    const { storage, now } = memory()
    const store = createChatsStore({ storage })

    store.getState().applyNewMessage({
      message: incoming('m1', '111', 'from history sweep', now()),
      fallbackName: null,
      markUnread: false,
    })
    expect(store.getState().summaries[0]?.unread).toBe(0)
    expect(store.getState().summaries[0]?.lastMessage?.text).toBe('from history sweep')
  })

  it('does not count unread while the chat is open', () => {
    const { storage, now } = memory()
    const store = createChatsStore({ storage })

    store.getState().upsertChats([chat('111')])
    store.getState().openChat('111')
    store.getState().applyNewMessage({
      message: incoming('m1', '111', 'while open', now()),
      fallbackName: null,
    })
    expect(store.getState().summaries[0]?.unread).toBe(0)
  })

  it('enriches a derived chat name from the fallback but keeps resolved names', () => {
    const { storage, now } = memory()
    const store = createChatsStore({ storage })

    store
      .getState()
      .upsertChats([
        chat('79991234567', { name: '79991234567', phone: '79991234567' }),
        chat('resolved-chat', { name: 'Real Name' }),
      ])
    const messageFor = (id: string, chatId: string): Message => incoming(id, chatId, 'text', now())
    store
      .getState()
      .applyNewMessage({ message: messageFor('m1', '79991234567'), fallbackName: 'Иван' })
    store
      .getState()
      .applyNewMessage({ message: messageFor('m2', 'resolved-chat'), fallbackName: 'Другой' })

    expect(store.getState().summaries.find((s) => s.id === '79991234567')?.name).toBe('Иван')
    expect(store.getState().summaries.find((s) => s.id === 'resolved-chat')?.name).toBe('Real Name')
  })

  it('escalates the status tick of the last outgoing preview message', () => {
    const { storage, now } = memory()
    const store = createChatsStore({ storage })

    store.getState().applyNewMessage({
      message: {
        id: 'own-1',
        chatId: '111',
        direction: 'outgoing',
        text: 'ping',
        timestamp: now(),
        status: 'sent',
      },
      fallbackName: null,
    })
    store.getState().applyStatusUpdate({ idMessage: 'own-1', status: 'delivered' })
    expect(store.getState().summaries[0]?.lastMessage?.status).toBe('delivered')

    store.getState().applyStatusUpdate({ idMessage: 'own-1', status: 'sent' })
    expect(store.getState().summaries[0]?.lastMessage?.status).toBe('delivered')

    store.getState().applyStatusUpdate({ idMessage: 'own-1', status: 'read' })
    expect(store.getState().summaries[0]?.lastMessage?.status).toBe('read')
  })

  it('marks delivery failure on the preview tick regardless of current rank', () => {
    const { storage, now } = memory()
    const store = createChatsStore({ storage })

    store.getState().applyNewMessage({
      message: {
        id: 'own-1',
        chatId: '111',
        direction: 'outgoing',
        text: 'ping',
        timestamp: now(),
        status: 'sent',
      },
      fallbackName: null,
    })
    store.getState().applyStatusUpdate({ idMessage: 'own-1', status: 'failed' })
    expect(store.getState().summaries[0]?.lastMessage?.status).toBe('failed')
  })

  it('ignores status updates for messages that are not the chat preview', () => {
    const { storage, now } = memory()
    const store = createChatsStore({ storage })

    store.getState().applyNewMessage({
      message: incoming('m1', '111', 'hello', now()),
      fallbackName: null,
    })
    store.getState().applyStatusUpdate({ idMessage: 'own-older', status: 'read' })
    expect(store.getState().summaries[0]?.lastMessage?.status).toBeNull()
  })

  it('opening a chat resets its unread and tracks the active chat', () => {
    const { storage, now } = memory()
    const store = createChatsStore({ storage })

    store.getState().applyNewMessage({
      message: incoming('m1', '111', 'hello', now()),
      fallbackName: null,
    })
    store.getState().applyNewMessage({
      message: incoming('m2', '222', 'hello too', now() + 1),
      fallbackName: null,
    })
    store.getState().openChat('111')

    expect(store.getState().activeChatId).toBe('111')
    expect(store.getState().summaries.find((s) => s.id === '111')?.unread).toBe(0)
    expect(store.getState().summaries.find((s) => s.id === '222')?.unread).toBe(1)
  })

  it('sets the active chat even when the summary is unknown and clears it on close', () => {
    const { storage } = memory()
    const store = createChatsStore({ storage })

    store.getState().openChat('ghost')
    expect(store.getState().activeChatId).toBe('ghost')
    store.getState().closeChat()
    expect(store.getState().activeChatId).toBeNull()
  })

  it('persists summaries and reloads them in a fresh store instance once the write window elapses', () => {
    const { storage, now } = memory()
    const store = createChatsStore({ storage })

    vi.useFakeTimers()
    store.getState().applyNewMessage({
      message: incoming('m1', '111', 'persisted', now()),
      fallbackName: 'Persisted Chat',
    })

    expect(storage.read('green-api-messenger:chats:v1')).toBeNull()

    vi.advanceTimersByTime(500)

    const revived = createChatsStore({ storage })
    expect(revived.getState().summaries).toEqual(store.getState().summaries)
    expect(revived.getState().summaries[0]).toMatchObject({
      id: '111',
      name: 'Persisted Chat',
      lastMessage: { id: 'm1' },
    })
  })

  it('ignores malformed persisted payloads', () => {
    const { storage } = memory()
    storage.write('green-api-messenger:chats:v1', '{"version":1,"chats":"nope"}')
    storage.write('green-api-messenger:chats:v1', 'not json')

    const store = createChatsStore({ storage })
    expect(store.getState().summaries).toEqual([])
  })

  it('clears summaries, active chat, and persisted storage on disconnect', () => {
    const { storage, now } = memory()
    const store = createChatsStore({ storage })

    store.getState().applyNewMessage({
      message: incoming('m1', '111', 'hello', now()),
      fallbackName: null,
    })
    store.getState().openChat('111')
    store.getState().clear()

    expect(store.getState().summaries).toEqual([])
    expect(store.getState().activeChatId).toBeNull()
    expect(storage.read('green-api-messenger:chats:v1')).toBeNull()
  })

  it('keeps the ids ordering stable when timestamps tie', () => {
    const { storage, now } = memory()
    const store = createChatsStore({ storage })
    const at = now()

    store
      .getState()
      .applyNewMessage({ message: incoming('m1', 'bbb', 'x', at), fallbackName: null })
    store
      .getState()
      .applyNewMessage({ message: incoming('m2', 'aaa', 'y', at), fallbackName: null })
    store
      .getState()
      .applyNewMessage({ message: incoming('m3', 'ccc', 'z', at), fallbackName: null })

    expect(store.getState().summaries.map((summary) => summary.id)).toEqual(['aaa', 'bbb', 'ccc'])
  })

  it('ignores an event older than the current preview so the sort position never regresses', () => {
    const { storage, now } = memory()
    const store = createChatsStore({ storage })

    store.getState().applyNewMessage({
      message: incoming('new', '222', 'fresh', now() + 2_000),
      fallbackName: null,
    })
    store.getState().applyNewMessage({
      message: incoming('old', '111', 'stale', now() + 1_000),
      fallbackName: null,
    })
    store.getState().applyNewMessage({
      message: incoming('older', '222', 'late out-of-order', now() + 1_000),
      fallbackName: null,
    })

    const summary = store.getState().summaries.find((entry) => entry.id === '222')
    expect(summary?.lastMessage).toMatchObject({ id: 'new', text: 'fresh' })
    expect(summary?.lastActivityAt).toBe(now() + 2_000)
    expect(summary?.unread).toBe(1)
    expect(store.getState().summaries.map((summary) => summary.id)).toEqual(['222', '111'])
  })

  it('still applies a same-timestamp preview and unknown-chat upserts from out-of-order events', () => {
    const { storage, now } = memory()
    const store = createChatsStore({ storage })

    store
      .getState()
      .applyNewMessage({ message: incoming('m1', '111', 'first', now()), fallbackName: null })
    store
      .getState()
      .applyNewMessage({ message: incoming('m2', '111', 'second', now()), fallbackName: null })

    expect(
      store.getState().summaries.find((entry) => entry.id === '111')?.lastMessage,
    ).toMatchObject({ id: 'm2', text: 'second' })

    store.getState().applyNewMessage({
      message: incoming('m0', 'unknown-chat', 'never existed', now() - 5_000),
      fallbackName: 'Stranger',
    })
    expect(store.getState().summaries.find((entry) => entry.id === 'unknown-chat')).toMatchObject({
      name: 'Stranger',
    })
  })

  it('flushes the pending summary write on beforeunload', () => {
    const { storage, now } = memory()
    const store = createChatsStore({ storage })

    store.getState().applyNewMessage({
      message: incoming('m1', '111', 'persisted', now()),
      fallbackName: null,
    })
    expect(storage.read('green-api-messenger:chats:v1')).toBeNull()

    window.dispatchEvent(new Event('beforeunload'))

    expect(storage.read('green-api-messenger:chats:v1')).not.toBeNull()
  })

  it('cancels the pending write on clear', () => {
    const { storage, now } = memory()
    const store = createChatsStore({ storage })

    vi.useFakeTimers()
    store.getState().applyNewMessage({
      message: incoming('m1', '111', 'persisted', now()),
      fallbackName: null,
    })
    store.getState().clear()
    vi.advanceTimersByTime(1_000)

    expect(storage.read('green-api-messenger:chats:v1')).toBeNull()
  })

  it('allows one preview attempt per chat per credentials session', () => {
    const { storage } = memory()
    const store = createChatsStore({ storage })
    const credentials = {
      apiUrl: 'https://gateway.test',
      idInstance: '110100200',
      apiTokenInstance: 'token-a',
    }

    expect(store.getState().claimPreviewAttempt('111', credentials)).toBe(true)
    expect(store.getState().claimPreviewAttempt('111', credentials)).toBe(false)
    expect(store.getState().claimPreviewAttempt('222', credentials)).toBe(true)
  })

  it('re-attempts a chat when the credentials session changes', () => {
    const { storage } = memory()
    const store = createChatsStore({ storage })
    const first = {
      apiUrl: 'https://gateway.test',
      idInstance: '110100200',
      apiTokenInstance: 'token-a',
    }
    const second = { ...first, apiTokenInstance: 'token-b' }

    expect(store.getState().claimPreviewAttempt('111', first)).toBe(true)
    expect(store.getState().claimPreviewAttempt('111', first)).toBe(false)
    expect(store.getState().claimPreviewAttempt('111', second)).toBe(true)
    expect(store.getState().claimPreviewAttempt('111', first)).toBe(true)
  })

  it('clear() resets preview attempts and the session key', () => {
    const { storage } = memory()
    const store = createChatsStore({ storage })
    const credentials = {
      apiUrl: 'https://gateway.test',
      idInstance: '110100200',
      apiTokenInstance: 'token-a',
    }

    expect(store.getState().claimPreviewAttempt('111', credentials)).toBe(true)
    store.getState().clear()
    expect(store.getState().claimPreviewAttempt('111', credentials)).toBe(true)
  })
})
