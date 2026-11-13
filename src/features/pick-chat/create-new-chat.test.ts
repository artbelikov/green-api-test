import { HttpResponse, http } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { useChatsStore } from '@/entities/chats'
import { useMessagesStore } from '@/entities/messages'
import { useSessionStore } from '@/entities/session'
import type { GreenApiCredentials } from '@/shared/api/greenapi'
import { handlers, mockGateway } from '@/shared/mocks'
import { createNewChat } from './create-new-chat'

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

describe('createNewChat', () => {
  it('resolves the demo contact phone, creates the chat, and opens it', async () => {
    connectSession()

    const result = await createNewChat({ phone: '8 999 123-45-67', chatId: '' })

    expect(result).toEqual({ ok: true, chatId: '79991234567' })
    const chats = useChatsStore.getState()
    expect(chats.summaries).toHaveLength(1)
    expect(chats.summaries[0]).toMatchObject({ id: '79991234567', name: 'Demo Contact' })
    expect(chats.activeChatId).toBe('79991234567')
  })

  it('names the chat by the phone when the profile is empty', async () => {
    connectSession()

    const result = await createNewChat({ phone: '70000000000', chatId: '' })

    expect(result).toEqual({ ok: true, chatId: '70000000000@c.us' })
    expect(useChatsStore.getState().summaries[0]).toMatchObject({
      id: '70000000000@c.us',
      name: '70000000000',
    })
  })

  it('uses the raw chatId verbatim when it is provided', async () => {
    connectSession()

    const result = await createNewChat({ phone: '', chatId: ' -1001234567890 ' })

    expect(result).toEqual({ ok: true, chatId: '-1001234567890' })
    expect(useChatsStore.getState().summaries[0]).toMatchObject({
      id: '-1001234567890',
      name: '-1001234567890',
    })
  })

  it('maps phone validation failures to their codes', async () => {
    connectSession()

    expect(await createNewChat({ phone: '', chatId: '' })).toEqual({ ok: false, code: 'empty' })
    expect(await createNewChat({ phone: 'abc', chatId: '' })).toEqual({
      ok: false,
      code: 'notANumber',
    })
    expect(await createNewChat({ phone: '375291234567', chatId: '' })).toEqual({
      ok: false,
      code: 'unsupportedRegion',
    })
    expect(useChatsStore.getState().summaries).toHaveLength(0)
  })

  it('reports notConnected without a session', async () => {
    const result = await createNewChat({ phone: '79991234567', chatId: '' })

    expect(result).toEqual({ ok: false, code: 'notConnected' })
    expect(useChatsStore.getState().summaries).toHaveLength(0)
  })

  it('maps gateway status errors to friendly codes', async () => {
    connectSession()
    server.use(
      http.post(
        `${CREDENTIALS.apiUrl}/waInstance${CREDENTIALS.idInstance}/getContactInfo/${CREDENTIALS.apiTokenInstance}`,
        () => {
          return new HttpResponse('limit reached', { status: 403 })
        },
      ),
    )

    const result = await createNewChat({ phone: '79991234567', chatId: '' })

    expect(result).toEqual({ ok: false, code: 'statusError' })
    expect(useChatsStore.getState().summaries).toHaveLength(0)
  })

  it('maps 429 responses to the rateLimited code', async () => {
    connectSession()
    server.use(
      http.post(
        `${CREDENTIALS.apiUrl}/waInstance${CREDENTIALS.idInstance}/getContactInfo/${CREDENTIALS.apiTokenInstance}`,
        () => {
          return new HttpResponse('slow down', { status: 429 })
        },
      ),
    )

    expect(await createNewChat({ phone: '79991234567', chatId: '' })).toEqual({
      ok: false,
      code: 'rateLimited',
    })
  })

  it('rejects a bare-word nickname draft when the gateway echoes it back', async () => {
    connectSession()

    const result = await createNewChat({ phone: '', chatId: 'durov' })

    expect(result).toEqual({ ok: false, code: 'resolveFailed' })
    expect(useChatsStore.getState().summaries).toHaveLength(0)
  })

  it('resolves an @-prefixed nickname that the gateway maps to a distinct chatId', async () => {
    connectSession()

    const result = await createNewChat({ phone: '', chatId: '@demo_contact' })

    expect(result).toEqual({ ok: true, chatId: '79991234567' })
    expect(useChatsStore.getState().summaries[0]).toMatchObject({
      id: '79991234567',
      name: 'Demo Contact',
    })
  })

  it('routes a bare-digit draft that fails phone normalization to the verbatim chatId path', async () => {
    connectSession()

    const result = await createNewChat({ phone: '777000111', chatId: '' })

    expect(result).toEqual({ ok: true, chatId: '777000111' })
    expect(useChatsStore.getState().summaries[0]).toMatchObject({
      id: '777000111',
      name: '777000111',
    })
  })

  it('keeps region-restricted drafts on the phone path error', async () => {
    connectSession()

    const result = await createNewChat({ phone: '375291234567', chatId: '' })

    expect(result).toEqual({ ok: false, code: 'unsupportedRegion' })
    expect(useChatsStore.getState().summaries).toHaveLength(0)
  })
})
