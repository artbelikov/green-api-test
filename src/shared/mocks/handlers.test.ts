import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { getContacts } from '@/shared/api/greenapi'
import { handlers, mockGateway } from './handlers'

const BASE = 'https://gateway.test/waInstance110100200'
const TOKEN = 'token-1'

const server = setupServer(...handlers)

beforeAll(() => {
  server.listen({ onUnhandledFrame: 'error' })
})

afterEach(() => {
  server.resetHandlers()
  mockGateway.reset()
})

afterAll(() => {
  server.close()
})

describe('mock gateway handlers', () => {
  it('authorizes any non-invalid token for getStateInstance', async () => {
    const response = await fetch(`${BASE}/getStateInstance/${TOKEN}`)

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ stateInstance: 'authorized' })
  })

  it('rejects invalid tokens with 401 on every method', async () => {
    const stateResponse = await fetch(`${BASE}/getStateInstance/invalid-token`)
    const settingsResponse = await fetch(`${BASE}/getSettings/invalid-token`)
    const applyResponse = await fetch(`${BASE}/setSettings/invalid-token`, {
      method: 'POST',
      body: JSON.stringify({ incomingWebhook: 'yes' }),
    })
    const contactResponse = await fetch(`${BASE}/getContactInfo/invalid-token`, {
      method: 'POST',
      body: JSON.stringify({ chatId: '79991234567' }),
    })

    expect(stateResponse.status).toBe(401)
    expect(settingsResponse.status).toBe(401)
    expect(applyResponse.status).toBe(401)
    expect(contactResponse.status).toBe(401)
  })

  it('serves webhook settings and applies setSettings patches in memory', async () => {
    const initial = (await (await fetch(`${BASE}/getSettings/${TOKEN}`)).json()) as Record<
      string,
      string
    >
    expect(initial.incomingWebhook).toBe('no')
    expect(initial.webhookUrl).toBe('')

    const applyResponse = await fetch(`${BASE}/setSettings/${TOKEN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ incomingWebhook: 'yes', outgoingWebhook: 'yes' }),
    })
    expect(applyResponse.status).toBe(200)

    const updated = (await (await fetch(`${BASE}/getSettings/${TOKEN}`)).json()) as Record<
      string,
      string
    >
    expect(updated.incomingWebhook).toBe('yes')
    expect(updated.outgoingWebhook).toBe('yes')
    expect(updated.outgoingMessageWebhook).toBe('no')
    expect(updated.webhookUrl).toBe('')
  })

  it('resolves the demo contact and returns an empty profile otherwise', async () => {
    const known = await (
      await fetch(`${BASE}/getContactInfo/${TOKEN}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId: '79991234567@c.us' }),
      })
    ).json()
    expect(known).toMatchObject({ chatId: '79991234567', name: 'Demo Contact' })

    const unknown = await (
      await fetch(`${BASE}/getContactInfo/${TOKEN}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId: '70000000000@c.us' }),
      })
    ).json()
    expect(unknown).toEqual({ chatId: '70000000000@c.us' })
  })

  it('serves the chat list, registering chats contacted via getContactInfo or sendMessage', async () => {
    mockGateway.autoReplyEnabled = false
    const empty = await (await fetch(`${BASE}/getChats/${TOKEN}`)).json()
    expect(empty).toEqual([])

    await fetch(`${BASE}/getContactInfo/${TOKEN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatId: '79991234567@c.us' }),
    })
    await fetch(`${BASE}/sendMessage/${TOKEN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatId: '79160000000', message: 'hi' }),
    })

    const chats = (await (await fetch(`${BASE}/getChats/${TOKEN}`)).json()) as Array<
      Record<string, string>
    >
    expect(chats).toHaveLength(2)
    expect(chats[0]).toMatchObject({ chatId: '79991234567', name: 'Demo Contact', type: 'user' })
    expect(chats[1]).toMatchObject({ chatId: '79160000000', name: '79160000000' })

    const unauthorizedResponse = await fetch(`${BASE}/getChats/invalid-token`)
    expect(unauthorizedResponse.status).toBe(401)
  })

  it('serves contacts derived from the chat list through the facade', async () => {
    const contacts = await getContacts({
      apiUrl: 'https://gateway.test',
      idInstance: '110100200',
      apiTokenInstance: TOKEN,
    })
    expect(contacts).toEqual([])

    await fetch(`${BASE}/getContactInfo/${TOKEN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatId: '79991234567@c.us' }),
    })
    const withChats = await getContacts({
      apiUrl: 'https://gateway.test',
      idInstance: '110100200',
      apiTokenInstance: TOKEN,
    })
    expect(withChats).toEqual([{ id: '79991234567', name: 'Demo Contact', type: 'user' }])

    const unauthorizedResponse = await fetch(`${BASE}/getContacts/invalid-token`)
    expect(unauthorizedResponse.status).toBe(401)
  })

  it('answers getAvatar without a photo so clients fall back to initials', async () => {
    const avatar = await (
      await fetch(`${BASE}/getAvatar/${TOKEN}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId: '79991234567' }),
      })
    ).json()
    expect(avatar).toEqual({ urlAvatar: '', available: false })

    const unauthorizedResponse = await fetch(`${BASE}/getAvatar/invalid-token`, {
      method: 'POST',
      body: JSON.stringify({ chatId: '79991234567' }),
    })
    expect(unauthorizedResponse.status).toBe(401)
  })

  it('resets settings state back to the defaults', async () => {
    await fetch(`${BASE}/setSettings/${TOKEN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ incomingWebhook: 'yes' }),
    })
    mockGateway.reset()

    const settings = (await (await fetch(`${BASE}/getSettings/${TOKEN}`)).json()) as Record<
      string,
      string
    >
    expect(settings.incomingWebhook).toBe('no')
  })

  it('serves queued notifications FIFO and removes them on acknowledge', async () => {
    mockGateway.deliverNotification({
      typeWebhook: 'incomingMessageReceived',
      idMessage: 'm1',
      timestamp: 1_700_000_000,
      senderData: { chatId: '79001234567' },
      messageData: { typeMessage: 'textMessage', textMessageData: { textMessage: 'first' } },
    })
    mockGateway.deliverNotification({
      typeWebhook: 'incomingMessageReceived',
      idMessage: 'm2',
      timestamp: 1_700_000_010,
      senderData: { chatId: '79001234567' },
      messageData: { typeMessage: 'textMessage', textMessageData: { textMessage: 'second' } },
    })

    const first = await (
      await fetch(`${BASE}/receiveNotification/${TOKEN}?receiveTimeout=25`)
    ).json()
    expect(first).toMatchObject({ receiptId: 1, body: { idMessage: 'm1' } })

    const repeated = await (
      await fetch(`${BASE}/receiveNotification/${TOKEN}?receiveTimeout=25`)
    ).json()
    expect(repeated).toMatchObject({ receiptId: 1 })

    const removeFirst = await fetch(`${BASE}/deleteNotification/${TOKEN}/1`, { method: 'DELETE' })
    expect(await removeFirst.json()).toEqual({ result: true, reason: '' })

    const second = await (
      await fetch(`${BASE}/receiveNotification/${TOKEN}?receiveTimeout=25`)
    ).json()
    expect(second).toMatchObject({ receiptId: 2, body: { idMessage: 'm2' } })

    const unknownAck = await fetch(`${BASE}/deleteNotification/${TOKEN}/999`, { method: 'DELETE' })
    expect(await unknownAck.json()).toEqual({ result: false, reason: 'Notification not found' })

    mockGateway.reset()
    const empty = await (
      await fetch(`${BASE}/receiveNotification/${TOKEN}?receiveTimeout=0`)
    ).json()
    expect(empty).toBeNull()
  })

  it('rejects invalid tokens on the notification methods', async () => {
    const receiveResponse = await fetch(
      `${BASE}/receiveNotification/invalid-token?receiveTimeout=25`,
    )
    const deleteResponse = await fetch(`${BASE}/deleteNotification/invalid-token/1`, {
      method: 'DELETE',
    })

    expect(receiveResponse.status).toBe(401)
    expect(deleteResponse.status).toBe(401)
  })

  it('records sent messages, echoes the webhook, and serves chat history newest-first', async () => {
    mockGateway.autoReplyEnabled = false
    const send = (await (
      await fetch(`${BASE}/sendMessage/${TOKEN}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId: '79991234567', message: 'hello' }),
      })
    ).json()) as { idMessage: string }
    expect(send.idMessage).toBe('mock-1')

    const history = (await (
      await fetch(`${BASE}/getChatHistory/${TOKEN}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId: '79991234567' }),
      })
    ).json()) as Array<Record<string, unknown>>
    expect(history).toHaveLength(1)
    expect(history[0]).toMatchObject({
      type: 'outgoing',
      idMessage: 'mock-1',
      textMessage: 'hello',
      statusMessage: 'sent',
    })

    const read = await (
      await fetch(`${BASE}/readChat/${TOKEN}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId: '79991234567' }),
      })
    ).json()
    expect(read).toEqual({ setRead: true })

    expect(mockGateway.receipts).toHaveLength(1)
    expect(mockGateway.receipts[0]?.body?.typeWebhook).toBe('outgoingMessageReceived')
  })

  it('rejects invalid tokens and malformed payloads on the chat methods', async () => {
    const sendMessageResponse = await fetch(`${BASE}/sendMessage/invalid-token`, {
      method: 'POST',
      body: JSON.stringify({ chatId: 'x', message: 'y' }),
    })
    const historyResponse = await fetch(`${BASE}/getChatHistory/invalid-token`, {
      method: 'POST',
      body: JSON.stringify({ chatId: 'x' }),
    })
    const readResponse = await fetch(`${BASE}/readChat/invalid-token`, {
      method: 'POST',
      body: JSON.stringify({ chatId: 'x' }),
    })
    const malformed = await fetch(`${BASE}/sendMessage/${TOKEN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })

    expect(sendMessageResponse.status).toBe(401)
    expect(historyResponse.status).toBe(401)
    expect(readResponse.status).toBe(401)
    expect(malformed.status).toBe(400)
  })

  it('delivers a scripted auto-reply so the demo flow can receive a response', async () => {
    await fetch(`${BASE}/sendMessage/${TOKEN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatId: '79991234567', message: 'hello' }),
    })
    expect(mockGateway.receipts).toHaveLength(1)

    await new Promise((resolve) => setTimeout(resolve, 1_500))

    expect(mockGateway.messages).toHaveLength(2)
    expect(mockGateway.receipts).toHaveLength(2)
    expect(mockGateway.receipts[1]?.body?.typeWebhook).toBe('incomingMessageReceived')
  })
})
