import { notifications } from '@mantine/notifications'
import { HttpResponse, http } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { useChatsStore } from '@/entities/chats'
import { useMessagesStore } from '@/entities/messages'
import { useSessionStore } from '@/entities/session'
import {
  type GreenApiCredentials,
  getNotificationEngine,
  stopNotificationEngine,
} from '@/shared/api/greenapi'
import { handlers, mockGateway } from '@/shared/mocks'
import { bindChatStores } from './chat-stores'

const CREDENTIALS: GreenApiCredentials = {
  apiUrl: 'https://gateway.test',
  idInstance: '110100200',
  apiTokenInstance: 'token-1',
}

const base = `${CREDENTIALS.apiUrl}/waInstance${CREDENTIALS.idInstance}`

const server = setupServer(...handlers)

beforeAll(() => {
  server.listen({ onUnhandledFrame: 'error' })
})

afterEach(async () => {
  server.resetHandlers()
  mockGateway.reset()
  window.localStorage.clear()
  useSessionStore.getState().disconnect()
  useChatsStore.getState().clear()
  useMessagesStore.getState().clear()
  await stopNotificationEngine()
})

afterAll(() => {
  server.close()
})

const incomingEnvelope = (id: string, text: string, chatName: string | null) => ({
  typeWebhook: 'incomingMessageReceived',
  idMessage: id,
  timestamp: 1_736_000_000,
  senderData: chatName === null ? { chatId: 'chat-1' } : { chatId: 'chat-1', chatName },
  messageData: { typeMessage: 'textMessage', textMessageData: { textMessage: text } },
})

const outgoingEnvelope = (id: string, text: string) => ({
  typeWebhook: 'outgoingMessageReceived',
  idMessage: id,
  timestamp: 1_736_000_000,
  senderData: { chatId: 'chat-1' },
  messageData: { typeMessage: 'textMessage', textMessageData: { textMessage: text } },
})

const statusEnvelope = (id: string, status: string) => ({
  typeWebhook: 'outgoingMessageStatus',
  idMessage: id,
  chatId: 'chat-1',
  timestamp: 1_736_000_100,
  status,
  sendByApi: true,
})

const connectSession = (): void => {
  useSessionStore.setState({ credentials: CREDENTIALS, status: 'connected' })
  getNotificationEngine().start(CREDENTIALS)
}

describe('bindChatStores', () => {
  it('routes engine message events into both stores, naming unknown chats', async () => {
    const unbind = bindChatStores()
    connectSession()

    mockGateway.deliverNotification(incomingEnvelope('m1', 'first hello', 'Дейл'))

    await vi.waitFor(() => {
      expect(useMessagesStore.getState().byChat['chat-1']).toHaveLength(1)
    })
    expect(useChatsStore.getState().summaries).toHaveLength(1)
    const summary = useChatsStore.getState().summaries[0]
    expect(summary).toMatchObject({
      id: 'chat-1',
      name: 'Дейл',
      unread: 1,
      lastMessage: { id: 'm1', text: 'first hello' },
    })
    unbind()
  })

  it('does not double-count unread on redelivery of the same notification', async () => {
    const unbind = bindChatStores()
    connectSession()

    mockGateway.deliverNotification(incomingEnvelope('m1', 'hello', 'Дейл'))
    await vi.waitFor(() => {
      expect(useMessagesStore.getState().byChat['chat-1']).toHaveLength(1)
    })

    mockGateway.deliverNotification(incomingEnvelope('m1', 'hello', 'Дейл'))
    await new Promise((resolve) => setTimeout(resolve, 80))

    expect(useMessagesStore.getState().byChat['chat-1']).toHaveLength(1)
    expect(useChatsStore.getState().summaries[0]?.unread).toBe(1)
    unbind()
  })

  it('escalates delivery ticks on the preview when a status event applies', async () => {
    const unbind = bindChatStores()
    connectSession()

    mockGateway.deliverNotification(outgoingEnvelope('own-1', 'ping'))
    await vi.waitFor(() => {
      expect(useMessagesStore.getState().byChat['chat-1']).toHaveLength(1)
    })

    mockGateway.deliverNotification(statusEnvelope('own-1', 'delivered'))
    await vi.waitFor(() => {
      expect(useChatsStore.getState().summaries[0]?.lastMessage?.status).toBe('delivered')
    })
    unbind()
  })

  it('stays quiet on a single poll failure and flags reconnecting only after two', async () => {
    const unbind = bindChatStores()
    connectSession()
    let callCount = 0

    server.use(
      http.get(`${base}/receiveNotification/${CREDENTIALS.apiTokenInstance}`, () => {
        callCount += 1
        return new HttpResponse('boom', { status: 500 })
      }),
    )
    await vi.waitFor(
      () => {
        expect(callCount).toBeGreaterThanOrEqual(1)
        expect(useSessionStore.getState().reconnecting).toBe(true)
      },
      { timeout: 5_000 },
    )
    unbind()
  })

  it('marks the session reconnecting while polling fails and the session stays connected', async () => {
    const unbind = bindChatStores()
    connectSession()

    server.use(
      http.get(
        `${base}/receiveNotification/${CREDENTIALS.apiTokenInstance}`,
        () => new HttpResponse('boom', { status: 500 }),
      ),
    )
    await vi.waitFor(
      () => {
        expect(useSessionStore.getState().reconnecting).toBe(true)
      },
      { timeout: 5_000 },
    )
    expect(useSessionStore.getState().status).toBe('connected')

    server.use(
      http.get(`${base}/receiveNotification/${CREDENTIALS.apiTokenInstance}`, () =>
        HttpResponse.json(null),
      ),
    )
    await vi.waitFor(
      () => {
        expect(useSessionStore.getState().reconnecting).toBe(false)
      },
      { timeout: 5_000 },
    )
    expect(useSessionStore.getState().status).toBe('connected')
    unbind()
  })

  it('toasts incoming messages for background chats without clearing the unread badge', async () => {
    const unbind = bindChatStores()
    connectSession()
    const showSpy = vi.spyOn(notifications, 'show')
    useChatsStore.setState({ activeChatId: 'chat-other' })

    mockGateway.deliverNotification(incomingEnvelope('m1', 'hello from the background', 'Дейл'))

    await vi.waitFor(() => {
      expect(showSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Дейл',
          message: 'hello from the background',
        }),
      )
    })
    expect(useChatsStore.getState().summaries[0]).toMatchObject({
      unread: 1,
      lastMessage: { id: 'm1' },
    })
    showSpy.mockRestore()
    unbind()
  })

  it('truncates toast previews of long incoming texts', async () => {
    const unbind = bindChatStores()
    connectSession()
    const showSpy = vi.spyOn(notifications, 'show')
    useChatsStore.setState({ activeChatId: 'chat-other' })
    const longText = 'x'.repeat(200)

    mockGateway.deliverNotification(incomingEnvelope('m1', longText, 'Дейл'))

    await vi.waitFor(() => {
      expect(showSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringMatching(/^x{120}…$/),
        }),
      )
    })
    showSpy.mockRestore()
    unbind()
  })

  it('does not toast messages arriving in the open chat', async () => {
    const unbind = bindChatStores()
    connectSession()
    const showSpy = vi.spyOn(notifications, 'show')
    useChatsStore.setState({ activeChatId: 'chat-1' })

    mockGateway.deliverNotification(incomingEnvelope('m1', 'reply while open', 'Дейл'))

    await vi.waitFor(() => {
      expect(useMessagesStore.getState().byChat['chat-1']).toHaveLength(1)
    })
    expect(showSpy).not.toHaveBeenCalled()
    expect(useChatsStore.getState().summaries[0]).toMatchObject({ unread: 0 })
    showSpy.mockRestore()
    unbind()
  })

  it('disconnects the session when the engine reports sessionInvalidated', async () => {
    server.use(
      http.get(
        `${base}/receiveNotification/${CREDENTIALS.apiTokenInstance}`,
        () => new HttpResponse('Unauthorized', { status: 401 }),
      ),
    )
    const unbind = bindChatStores()
    connectSession()

    await vi.waitFor(() => {
      expect(useSessionStore.getState().status).toBe('disconnected')
    })
    unbind()
  })

  it('clears both stores when the session disconnects', () => {
    const unbind = bindChatStores()
    connectSession()
    useChatsStore.getState().applyNewMessage({
      message: {
        id: 'm1',
        chatId: 'chat-1',
        direction: 'incoming',
        text: 'hello',
        timestamp: 1,
        status: null,
      },
      fallbackName: null,
    })
    useMessagesStore.getState().appendPending('chat-1', 'unsent')
    expect(useChatsStore.getState().summaries).toHaveLength(1)

    useSessionStore.setState({ status: 'disconnected', credentials: null })

    expect(useChatsStore.getState().summaries).toEqual([])
    expect(useMessagesStore.getState().byChat).toEqual({})
    expect(window.localStorage.getItem('green-api-messenger:chats:v1')).toBeNull()
    expect(window.localStorage.getItem('green-api-messenger:messages:v1')).toBeNull()
    unbind()
  })
})
