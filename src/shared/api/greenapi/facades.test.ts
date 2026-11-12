import { delay, HttpResponse, http } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import {
  deleteNotification,
  getAvatar,
  getChatHistory,
  getChats,
  getContactInfo,
  getSettings,
  getStateInstance,
  readChat,
  receiveNotification,
  sendMessage,
  setSettings,
} from './facades'
import { ApiError, type GreenApiCredentials } from './http-client'

const CREDENTIALS: GreenApiCredentials = {
  apiUrl: 'https://gateway.test',
  idInstance: '110100200',
  apiTokenInstance: 'token-1',
}

const base = `${CREDENTIALS.apiUrl}/waInstance${CREDENTIALS.idInstance}`

const server = setupServer()

beforeAll(() => {
  server.listen({ onUnhandledFrame: 'error' })
})

afterEach(() => {
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

describe('facades', () => {
  it('sends sendMessage as POST with chatId and message fields', async () => {
    let seenUrl = ''
    let seenBody: unknown = null
    server.use(
      http.post(`${base}/sendMessage/${CREDENTIALS.apiTokenInstance}`, async ({ request }) => {
        seenUrl = request.url
        seenBody = await request.json()
        return HttpResponse.json({ idMessage: '3EB0C767D097B7C7C030' })
      }),
    )

    const result = await sendMessage(CREDENTIALS, { chatId: '79161234567@c.us', text: 'Привет!' })

    expect(result).toEqual({ idMessage: '3EB0C767D097B7C7C030' })
    expect(seenUrl).toBe(`${base}/sendMessage/${CREDENTIALS.apiTokenInstance}`)
    expect(seenBody).toEqual({ chatId: '79161234567@c.us', message: 'Привет!' })
  })

  it('fetches chats with GET and passes both payload flavors through', async () => {
    server.use(
      http.get(`${base}/getChats/${CREDENTIALS.apiTokenInstance}`, () =>
        HttpResponse.json([
          {
            chatId: '79161234567',
            name: 'Иван',
            type: 'user',
            username: 'ivan',
            phoneNumber: '79161234567',
          },
          { id: '79001234567-1479621234@g.us', name: 'Моя группа', type: 'group', unreadCount: 0 },
        ]),
      ),
    )

    const chats = await getChats(CREDENTIALS)

    expect(chats).toHaveLength(2)
    expect(chats[0]).toEqual({
      chatId: '79161234567',
      name: 'Иван',
      type: 'user',
      username: 'ivan',
      phoneNumber: '79161234567',
    })
    expect(chats[1]?.id).toBe('79001234567-1479621234@g.us')
  })

  it('resolves contact info via POST body', async () => {
    let seenBody: unknown = null
    server.use(
      http.post(`${base}/getContactInfo/${CREDENTIALS.apiTokenInstance}`, async ({ request }) => {
        seenBody = await request.json()
        return HttpResponse.json({
          chatId: '79161234567',
          name: 'Иван',
          username: 'ivan',
          chatType: 'user',
        })
      }),
    )

    const info = await getContactInfo(CREDENTIALS, '79161234567@c.us')

    expect(seenBody).toEqual({ chatId: '79161234567@c.us' })
    expect(info).toEqual({
      chatId: '79161234567',
      name: 'Иван',
      username: 'ivan',
      chatType: 'user',
    })
  })

  it('long-polls receiveNotification with the receiveTimeout query and normalizes empty answers', async () => {
    const seenUrls: string[] = []
    server.use(
      http.get(`${base}/receiveNotification/${CREDENTIALS.apiTokenInstance}`, ({ request }) => {
        seenUrls.push(request.url)
        const timeout = new URL(request.url).searchParams.get('receiveTimeout')
        if (seenUrls.length === 1) {
          return HttpResponse.json({
            receiptId: 1234567,
            body: {
              typeWebhook: 'incomingMessageReceived',
              timestamp: 1588091580,
              idMessage: 'F7AEC1B7086ECDC7E6E45923F5EDB825',
              senderData: { chatId: '79001234567@c.us' },
              messageData: { typeMessage: 'textMessage', textMessageData: { textMessage: 'Hi' } },
            },
          })
        }
        return timeout === '25' ? new HttpResponse(null, { status: 200 }) : HttpResponse.json(null)
      }),
    )

    const receipt = await receiveNotification(CREDENTIALS, 25)
    expect(receipt?.typeWebhook).toBe('incomingMessageReceived')
    expect(seenUrls[0]).toContain('receiveTimeout=25')

    const emptyResponse = await receiveNotification(CREDENTIALS, 25)
    expect(emptyResponse).toBeNull()

    const nullBody = await receiveNotification(CREDENTIALS, 25)
    expect(nullBody).toBeNull()
    expect(seenUrls).toHaveLength(3)
  })

  it('surfaces gateway error notification bodies as ApiError', async () => {
    server.use(
      http.get(`${base}/receiveNotification/${CREDENTIALS.apiTokenInstance}`, () =>
        HttpResponse.json({
          code: 'INVALID_PARAM',
          message: 'Message cannot be received because custom webhook url is set.',
          status: 'error',
        }),
      ),
    )

    const failure = await receiveNotification(CREDENTIALS, 25).catch((reason: unknown) => reason)
    expect(failure).toBeInstanceOf(ApiError)
    expect((failure as ApiError).message).toContain('custom webhook url')
  })

  it('deletes notifications via DELETE with the receiptId path suffix', async () => {
    let seenUrl = ''
    server.use(
      http.delete(
        `${base}/deleteNotification/${CREDENTIALS.apiTokenInstance}/1234567`,
        ({ request }) => {
          seenUrl = request.url
          return HttpResponse.json({ result: true, reason: '' })
        },
      ),
    )

    const result = await deleteNotification(CREDENTIALS, 1234567)

    expect(result).toEqual({ result: true, reason: '' })
    expect(seenUrl).toBe(`${base}/deleteNotification/${CREDENTIALS.apiTokenInstance}/1234567`)
  })

  it('reads the instance state via GET', async () => {
    server.use(
      http.get(`${base}/getStateInstance/${CREDENTIALS.apiTokenInstance}`, () =>
        HttpResponse.json({ stateInstance: 'authorized' }),
      ),
    )

    const state = await getStateInstance(CREDENTIALS)
    expect(state).toEqual({ stateInstance: 'authorized' })
  })

  it('passes the chat history payload through and returns the journal array', async () => {
    let seenBody: unknown = null
    server.use(
      http.post(`${base}/getChatHistory/${CREDENTIALS.apiTokenInstance}`, async ({ request }) => {
        seenBody = await request.json()
        return HttpResponse.json([
          {
            type: 'outgoing',
            idMessage: 'BAE57784B879480F',
            timestamp: 1757583630,
            typeMessage: 'textMessage',
            chatId: '79876543210@c.us',
            textMessage: 'Привет!',
            statusMessage: 'read',
          },
        ])
      }),
    )

    const history = await getChatHistory(CREDENTIALS, { chatId: '79876543210@c.us', count: 100 })

    expect(seenBody).toEqual({ chatId: '79876543210@c.us', count: 100 })
    expect(history[0]?.idMessage).toBe('BAE57784B879480F')
  })

  it('fetches the avatar via POST body', async () => {
    let seenBody: unknown = null
    server.use(
      http.post(`${base}/getAvatar/${CREDENTIALS.apiTokenInstance}`, async ({ request }) => {
        seenBody = await request.json()
        return HttpResponse.json({
          urlAvatar: 'https://avatar.test/a.jpg',
          available: true,
          base64Avatar: '',
        })
      }),
    )

    const avatar = await getAvatar(CREDENTIALS, '79161234567@c.us')

    expect(seenBody).toEqual({ chatId: '79161234567@c.us' })
    expect(avatar).toEqual({
      urlAvatar: 'https://avatar.test/a.jpg',
      available: true,
      base64Avatar: '',
    })
  })

  it('reads the current settings via GET', async () => {
    server.use(
      http.get(`${base}/getSettings/${CREDENTIALS.apiTokenInstance}`, () =>
        HttpResponse.json({
          wid: '79876543210@c.us',
          incomingWebhook: 'no',
          outgoingMessageWebhook: 'no',
        }),
      ),
    )

    const settings = await getSettings(CREDENTIALS)
    expect(settings).toEqual({
      wid: '79876543210@c.us',
      incomingWebhook: 'no',
      outgoingMessageWebhook: 'no',
    })
  })

  it('applies settings patches via POST without coalescing', async () => {
    const seenBodies: unknown[] = []
    server.use(
      http.post(`${base}/setSettings/${CREDENTIALS.apiTokenInstance}`, async ({ request }) => {
        seenBodies.push(await request.json())
        return HttpResponse.json({})
      }),
    )

    await setSettings(CREDENTIALS, { incomingWebhook: 'yes', outgoingMessageWebhook: 'yes' })
    await setSettings(CREDENTIALS, { incomingWebhook: 'yes', outgoingMessageWebhook: 'yes' })

    expect(seenBodies).toEqual([
      { incomingWebhook: 'yes', outgoingMessageWebhook: 'yes' },
      { incomingWebhook: 'yes', outgoingMessageWebhook: 'yes' },
    ])
  })

  it('marks the chat read via POST body', async () => {
    let seenBody: unknown = null
    server.use(
      http.post(`${base}/readChat/${CREDENTIALS.apiTokenInstance}`, async ({ request }) => {
        seenBody = await request.json()
        return HttpResponse.json({ setRead: true })
      }),
    )

    const result = await readChat(CREDENTIALS, '79161234567@c.us')

    expect(seenBody).toEqual({ chatId: '79161234567@c.us' })
    expect(result).toEqual({ setRead: true })
  })

  it('converts HTTP failures into typed ApiError values', async () => {
    server.use(
      http.get(
        `${base}/getStateInstance/${CREDENTIALS.apiTokenInstance}`,
        () => new HttpResponse('Unauthorized', { status: 401 }),
      ),
    )

    const failure = await getStateInstance(CREDENTIALS).catch((reason: unknown) => reason)
    expect(failure).toBeInstanceOf(ApiError)
    expect((failure as ApiError).status).toBe(401)
    expect((failure as ApiError).message).toBe('Unauthorized')
  })

  it('keeps requests flowing after a rate limited attempt', async () => {
    let calls = 0
    server.use(
      http.post(`${base}/sendMessage/${CREDENTIALS.apiTokenInstance}`, async () => {
        calls += 1
        return calls === 1
          ? new HttpResponse('Too Many Requests', { status: 429 })
          : HttpResponse.json({ idMessage: 'AFTER' })
      }),
    )

    const first = await sendMessage(CREDENTIALS, { chatId: '79161234567@c.us', text: 'one' }).catch(
      (reason: unknown) => reason,
    )
    expect(first).toBeInstanceOf(ApiError)
    expect((first as ApiError).status).toBe(429)

    const retry = await sendMessage(CREDENTIALS, { chatId: '79161234567@c.us', text: 'two' })
    expect(retry).toEqual({ idMessage: 'AFTER' })
    expect(calls).toBe(2)
  })

  it('does not coalesce distinct contact lookups but shares identical in-flight ones', async () => {
    let contactCalls = 0
    server.use(
      http.post(`${base}/getContactInfo/${CREDENTIALS.apiTokenInstance}`, async ({ request }) => {
        contactCalls += 1
        const body = (await request.json()) as { chatId?: string }
        return HttpResponse.json({ chatId: body.chatId, name: `Contact ${contactCalls}` })
      }),
    )

    const [first, second, third] = await Promise.all([
      getContactInfo(CREDENTIALS, '79161234567@c.us'),
      getContactInfo(CREDENTIALS, '79161234567@c.us'),
      getContactInfo(CREDENTIALS, '79001234567'),
    ])

    expect(contactCalls).toBe(2)
    expect(first).toEqual({ chatId: '79161234567@c.us', name: 'Contact 1' })
    expect(second).toEqual({ chatId: '79161234567@c.us', name: 'Contact 1' })
    expect(third).toEqual({ chatId: '79001234567', name: 'Contact 2' })
  })

  it('passes an explicit timeout to long-poll receives', async () => {
    server.use(
      http.get(`${base}/receiveNotification/${CREDENTIALS.apiTokenInstance}`, async () => {
        await delay(150)
        return HttpResponse.json(null)
      }),
    )

    const failure = await receiveNotification(CREDENTIALS, 25, { timeoutMs: 50 }).catch(
      (reason: unknown) => reason,
    )
    expect(failure).toBeInstanceOf(ApiError)
    expect((failure as ApiError).kind).toBe('timeout')
  })
})
