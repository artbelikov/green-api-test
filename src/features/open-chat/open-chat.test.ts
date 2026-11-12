import { HttpResponse, http } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { useChatsStore } from '@/entities/chats'
import { useMessagesStore } from '@/entities/messages'
import { useSessionStore } from '@/entities/session'
import type { GreenApiCredentials } from '@/shared/api/greenapi'
import { handlers, mockGateway } from '@/shared/mocks'
import { openChat } from './open-chat'

const CREDENTIALS: GreenApiCredentials = {
  apiUrl: 'https://gateway.test',
  idInstance: '110100200',
  apiTokenInstance: 'token-1',
}

const server = setupServer(...handlers)

beforeAll(() => {
  server.listen({ onUnhandledFrame: 'error' })
})

afterEach(() => {
  server.resetHandlers()
  mockGateway.reset()
  window.localStorage.clear()
  useSessionStore.getState().disconnect()
  useChatsStore.getState().clear()
  useMessagesStore.getState().clear()
})

afterAll(() => {
  server.close()
})

const connectSession = (): void => {
  useSessionStore.setState({ credentials: CREDENTIALS, status: 'connected' })
}

const seedChat = (): void => {
  useChatsStore
    .getState()
    .upsertChats([{ id: 'chat-1', name: 'Chat', type: 'unknown', username: null, phone: null }])
}

describe('openChat', () => {
  it('opens the chat, resets unread, hydrates history, and mirrors the preview', async () => {
    mockGateway.messages.push({
      idMessage: 'm1',
      chatId: 'chat-1',
      direction: 'incoming',
      text: 'from history',
      timestamp: 1_736_000_000_000,
    })
    seedChat()
    useMessagesStore.getState().applyMessageEvent({
      kind: 'message',
      chatFallback: null,
      message: {
        id: 'older',
        chatId: 'chat-1',
        direction: 'incoming',
        text: 'live event',
        timestamp: 1_000,
        status: null,
      },
    })
    connectSession()

    await openChat('chat-1')

    const chats = useChatsStore.getState()
    expect(chats.activeChatId).toBe('chat-1')
    expect(chats.summaries[0]?.lastMessage?.text).toBe('from history')
    expect(chats.summaries[0]?.unread).toBe(0)

    const messages = useMessagesStore.getState()
    expect(messages.history['chat-1']).toBe('ready')
    expect(messages.byChat['chat-1']?.map((message) => message.id)).toEqual(['older', 'm1'])
  })

  it('marks the linked account chat read on open and does not refetch ready history', async () => {
    let historyCalls = 0
    let readCalls = 0
    const instanceBase = `${CREDENTIALS.apiUrl}/waInstance${CREDENTIALS.idInstance}`
    server.use(
      http.post(`${instanceBase}/getChatHistory/${CREDENTIALS.apiTokenInstance}`, () => {
        historyCalls += 1
        return HttpResponse.json([])
      }),
      http.post(`${instanceBase}/readChat/${CREDENTIALS.apiTokenInstance}`, () => {
        readCalls += 1
        return HttpResponse.json({ setRead: true })
      }),
    )
    seedChat()
    connectSession()

    await openChat('chat-1')
    await new Promise((resolve) => setTimeout(resolve, 400))
    expect(historyCalls).toBe(1)
    expect(readCalls).toBe(1)

    await openChat('chat-1')
    await new Promise((resolve) => setTimeout(resolve, 400))
    expect(historyCalls).toBe(1)
    expect(readCalls).toBe(2)
  })

  it('keeps the history phase failed when the gateway errors and allows a retry', async () => {
    let attempts = 0
    server.use(
      http.post(
        `${CREDENTIALS.apiUrl}/waInstance${CREDENTIALS.idInstance}/getChatHistory/${CREDENTIALS.apiTokenInstance}`,
        () => {
          attempts += 1
          if (attempts === 1) {
            return new HttpResponse('boom', { status: 500 })
          }
          return HttpResponse.json([])
        },
      ),
    )
    connectSession()

    await openChat('chat-1')
    expect(useMessagesStore.getState().history['chat-1']).toBe('failed')

    await openChat('chat-1')
    expect(useMessagesStore.getState().history['chat-1']).toBe('ready')
  })

  it('does nothing without a connected session', async () => {
    await openChat('chat-1')
    expect(useChatsStore.getState().activeChatId).toBeNull()
    expect(useMessagesStore.getState().history['chat-1']).toBeUndefined()
  })
})
