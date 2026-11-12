import { render } from '@testing-library/react'
import { act, memo } from 'react'
import { describe, expect, it } from 'vitest'
import { useStore } from 'zustand'
import type { Message } from '@/shared/api/greenapi'
import type { KeyValueStore } from '@/shared/lib/storage'
import { createMessagesStore } from './create-messages-store'
import { selectChatMessages } from './selectors'

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

const MESSAGE_COUNT = 5_000

const seedChat = (store: ReturnType<typeof createMessagesStore>): void => {
  for (let index = 0; index < MESSAGE_COUNT; index += 1) {
    store.getState().applyMessageEvent({
      kind: 'message',
      chatFallback: null,
      message: {
        id: `m${index}`,
        chatId: 'chat-1',
        direction: index % 2 === 0 ? 'incoming' : 'outgoing',
        text: `message ${index}`,
        timestamp: index,
        status: index % 2 === 0 ? null : 'sent',
      },
    })
  }
}

const createPerfStore = () =>
  createMessagesStore({
    gateway: { getChatHistory: async () => [] },
    now: () => 1,
    storage: createMemoryStorage(),
    capacityPerChat: MESSAGE_COUNT,
  })

let rowRenders = 0

const Row = memo(function Row({ message }: { message: Message }) {
  rowRenders += 1
  return <li data-testid="perf-row">{message.text}</li>
})

function ChatList({
  store,
  chatId,
}: {
  store: ReturnType<typeof createMessagesStore>
  chatId: string
}) {
  const messages = useStore(store, (state) => selectChatMessages(state, chatId))
  return (
    <ul>
      {messages.map((message) => (
        <Row key={message.id} message={message} />
      ))}
    </ul>
  )
}

describe('messages store perf smoke', () => {
  it('renders and updates a memoized 5k-message list under 100ms per pass', () => {
    const store = createPerfStore()
    seedChat(store)

    rowRenders = 0
    const { unmount } = render(<ChatList store={store} chatId="chat-1" />)
    expect(rowRenders).toBe(MESSAGE_COUNT)

    const appendStart = performance.now()
    act(() => {
      store.getState().applyMessageEvent({
        kind: 'message',
        chatFallback: null,
        message: {
          id: `m${MESSAGE_COUNT}`,
          chatId: 'chat-1',
          direction: 'incoming',
          text: 'the newest one',
          timestamp: MESSAGE_COUNT,
          status: null,
        },
      })
    })
    const appendDuration = performance.now() - appendStart

    const unrelatedStart = performance.now()
    act(() => {
      store.getState().applyMessageEvent({
        kind: 'message',
        chatFallback: null,
        message: {
          id: 'other-chat-1',
          chatId: 'chat-2',
          direction: 'incoming',
          text: 'other chat',
          timestamp: MESSAGE_COUNT,
          status: null,
        },
      })
    })
    const unrelatedDuration = performance.now() - unrelatedStart

    expect(appendDuration).toBeLessThan(100)
    expect(unrelatedDuration).toBeLessThan(100)
    expect(rowRenders).toBe(MESSAGE_COUNT + 1)
    unmount()
  })
})
