import { notifications } from '@mantine/notifications'
import { HttpResponse, http } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { useChatsStore } from '@/entities/chats'
import { useMessagesStore } from '@/entities/messages'
import { useSessionStore } from '@/entities/session'
import type { GreenApiCredentials } from '@/shared/api/greenapi'
import { handlers, mockGateway } from '@/shared/mocks'
import { retryChatText } from './retry-chat-text'
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
  mockGateway.autoReplyEnabled = false
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

const failedBubbleId = (): string => {
  const failed = (useMessagesStore.getState().byChat['chat-1'] ?? []).find(
    (message) => message.status === 'failed',
  )
  if (failed === undefined) {
    throw new Error('failed bubble missing')
  }
  return failed.id
}

const failSendMessage = (): void => {
  server.use(
    http.post(
      `${CREDENTIALS.apiUrl}/waInstance${CREDENTIALS.idInstance}/sendMessage/${CREDENTIALS.apiTokenInstance}`,
      () => new HttpResponse('boom', { status: 500 }),
    ),
  )
}

describe('retryChatText', () => {
  it('re-sends the failed message through the normal send flow', async () => {
    connectSession()
    failSendMessage()
    await sendChatText('chat-1', 'doomed line')
    expect(useMessagesStore.getState().failedSend).not.toBeNull()
    const seedToastCalls = vi.mocked(notifications.show).mock.calls.length

    server.resetHandlers()
    const outcome = await retryChatText('chat-1', failedBubbleId())

    expect(outcome).toMatchObject({ ok: true })
    const messages = useMessagesStore.getState().byChat['chat-1'] ?? []
    expect(messages).toHaveLength(1)
    expect(messages[0]).toMatchObject({ text: 'doomed line', status: 'sent' })
    expect(useMessagesStore.getState().failedSend).toBeNull()
    expect(notifications.show).toHaveBeenCalledTimes(seedToastCalls)
  })

  it('mirrors the retried message into the chat list preview', async () => {
    connectSession()
    failSendMessage()
    await sendChatText('chat-1', 'doomed line')
    server.resetHandlers()

    await retryChatText('chat-1', failedBubbleId())

    const preview = useChatsStore.getState().summaries.find((summary) => summary.id === 'chat-1')
    expect(preview?.lastMessage).toMatchObject({ text: 'doomed line', status: 'sent' })
  })

  it('keeps the failed bubble and shows the toast when the retry fails again', async () => {
    connectSession()
    failSendMessage()
    await sendChatText('chat-1', 'doomed line')

    const outcome = await retryChatText('chat-1', failedBubbleId())

    expect(outcome).toMatchObject({ ok: false })
    const messages = useMessagesStore.getState().byChat['chat-1'] ?? []
    expect(messages).toHaveLength(1)
    expect(messages[0]?.status).toBe('failed')
    expect(notifications.show).toHaveBeenCalled()
  })

  it('refuses to retry messages that are not failed outgoing bubbles', async () => {
    connectSession()
    await sendChatText('chat-1', 'already sent')
    const sentId = (useMessagesStore.getState().byChat['chat-1'] ?? [])[0]?.id
    if (sentId === undefined) {
      throw new Error('sent bubble missing')
    }

    const outcome = await retryChatText('chat-1', sentId)

    expect(outcome).toBeNull()
    expect(useMessagesStore.getState().byChat['chat-1']).toHaveLength(1)
    expect(mockGateway.messages).toHaveLength(1)
  })

  it('returns null for unknown message ids', async () => {
    connectSession()

    expect(await retryChatText('chat-1', 'ghost-id')).toBeNull()
  })
})
