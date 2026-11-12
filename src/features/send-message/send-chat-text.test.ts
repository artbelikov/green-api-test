import { notifications } from '@mantine/notifications'
import { HttpResponse, http } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { useChatsStore } from '@/entities/chats'
import { useMessagesStore } from '@/entities/messages'
import { useSessionStore } from '@/entities/session'
import type { GreenApiCredentials } from '@/shared/api/greenapi'
import { handlers, mockGateway } from '@/shared/mocks'
import { sendChatText } from './send-chat-text'

vi.mock('@mantine/notifications', () => ({
  notifications: { show: vi.fn() },
}))

const CREDENTIALS: GreenApiCredentials = {
  apiUrl: 'https://gateway.test',
  idInstance: '110100200',
  apiTokenInstance: 'token-1',
}

const server = setupServer(...handlers)

beforeAll(() => {
  server.listen({ onUnhandledFrame: 'error' })
})

beforeEach(() => {
  vi.mocked(notifications.show).mockClear()
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

describe('sendChatText', () => {
  it('appends a pending bubble, reconciles it with the returned id, and mirrors the preview', async () => {
    connectSession()

    const outcome = await sendChatText('chat-1', 'hello there')

    expect(outcome).toMatchObject({ ok: true })
    const messages = useMessagesStore.getState().byChat['chat-1'] ?? []
    expect(messages).toHaveLength(1)
    expect(messages[0]).toMatchObject({
      direction: 'outgoing',
      text: 'hello there',
      status: 'sent',
    })
    expect(mockGateway.messages).toHaveLength(1)

    const preview = useChatsStore.getState().summaries.find((summary) => summary.id === 'chat-1')
    expect(preview?.lastMessage).toMatchObject({
      id: (messages[0] as { id: string }).id,
      text: 'hello there',
      status: 'sent',
    })
    expect(preview?.unread).toBe(0)
  })

  it('keeps the failed bubble visible, marks it failed, and shows the toast', async () => {
    server.use(
      http.post(
        `${CREDENTIALS.apiUrl}/waInstance${CREDENTIALS.idInstance}/sendMessage/${CREDENTIALS.apiTokenInstance}`,
        () => new HttpResponse('boom', { status: 500 }),
      ),
    )
    connectSession()

    const outcome = await sendChatText('chat-1', 'doomed message')

    expect(outcome.ok).toBe(false)
    const messages = useMessagesStore.getState().byChat['chat-1'] ?? []
    expect(messages).toHaveLength(1)
    expect(messages[0]?.status).toBe('failed')
    expect(useMessagesStore.getState().failedSend).toMatchObject({
      chatId: 'chat-1',
      error: { kind: 'status' },
    })
    const preview = useChatsStore.getState().summaries.find((summary) => summary.id === 'chat-1')
    expect(preview?.lastMessage?.status).toBe('failed')
    expect(notifications.show).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Message was not sent. Check the connection and try again.',
      }),
    )
  })

  it('reports a failure without a bubble when the session is disconnected', async () => {
    const outcome = await sendChatText('chat-1', 'lost message')

    expect(outcome.ok).toBe(false)
    expect(useMessagesStore.getState().byChat['chat-1']).toBeUndefined()
    expect(notifications.show).toHaveBeenCalled()
  })
})
