import { delay, HttpResponse, http } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { ApiError, type GreenApiCredentials, greenApiRequest } from './http-client'

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

describe('greenApiRequest', () => {
  it('builds the waInstance endpoint URL with credentials in the path', async () => {
    let seenUrl = ''
    server.use(
      http.get(`${base}/getStateInstance/${CREDENTIALS.apiTokenInstance}`, ({ request }) => {
        seenUrl = request.url
        return HttpResponse.json({ stateInstance: 'authorized' })
      }),
    )

    const result = await greenApiRequest<{ stateInstance: string }>(CREDENTIALS, {
      endpoint: 'getStateInstance',
      verb: 'GET',
    })

    expect(result).toEqual({ stateInstance: 'authorized' })
    expect(seenUrl).toBe(`${base}/getStateInstance/${CREDENTIALS.apiTokenInstance}`)
  })

  it('serializes query params for GET requests', async () => {
    let seenUrl = ''
    server.use(
      http.get(`${base}/receiveNotification/${CREDENTIALS.apiTokenInstance}`, ({ request }) => {
        seenUrl = request.url
        return HttpResponse.json(null)
      }),
    )

    await greenApiRequest<null>(CREDENTIALS, {
      endpoint: 'receiveNotification',
      verb: 'GET',
      query: { receiveTimeout: 25 },
    })

    expect(seenUrl).toBe(
      `${base}/receiveNotification/${CREDENTIALS.apiTokenInstance}?receiveTimeout=25`,
    )
  })

  it('sends JSON payloads with the JSON content type', async () => {
    let seenBody: unknown = null
    server.use(
      http.post(`${base}/sendMessage/${CREDENTIALS.apiTokenInstance}`, async ({ request }) => {
        seenBody = await request.json()
        return HttpResponse.json({ idMessage: '1' })
      }),
    )

    await greenApiRequest<{ idMessage: string }>(CREDENTIALS, {
      endpoint: 'sendMessage',
      payload: { chatId: '79161234567@c.us', message: 'привет' },
    })

    expect(seenBody).toEqual({ chatId: '79161234567@c.us', message: 'привет' })
  })

  it('resolves undefined for an empty success body', async () => {
    server.use(
      http.get(
        `${base}/getChats/${CREDENTIALS.apiTokenInstance}`,
        () => new HttpResponse(null, { status: 200 }),
      ),
    )

    const result = await greenApiRequest<unknown>(CREDENTIALS, {
      endpoint: 'getChats',
      verb: 'GET',
    })
    expect(result).toBeUndefined()
  })

  it('maps non-2xx responses to ApiError with parsed message and Retry-After', async () => {
    server.use(
      http.post(
        `${base}/sendMessage/${CREDENTIALS.apiTokenInstance}`,
        () =>
          new HttpResponse(JSON.stringify({ message: 'Validation failed' }), {
            status: 429,
            headers: { 'Retry-After': '3' },
          }),
      ),
    )

    const failure = await greenApiRequest<unknown>(CREDENTIALS, {
      endpoint: 'sendMessage',
      payload: { chatId: '79161234567@c.us', message: 'x' },
    }).catch((reason: unknown) => reason)

    expect(failure).toBeInstanceOf(ApiError)
    expect((failure as ApiError).kind).toBe('status')
    expect((failure as ApiError).status).toBe(429)
    expect((failure as ApiError).message).toBe('Validation failed')
    expect((failure as ApiError).retryAfterSeconds).toBe(3)
  })

  it('falls back to the raw body and status text when the error body is not JSON', async () => {
    server.use(
      http.get(
        `${base}/getStateInstance/${CREDENTIALS.apiTokenInstance}`,
        () => new HttpResponse('Unauthorized', { status: 401 }),
      ),
    )

    const failure = await greenApiRequest<unknown>(CREDENTIALS, {
      endpoint: 'getStateInstance',
      verb: 'GET',
    }).catch((reason: unknown) => reason)
    expect((failure as ApiError).message).toBe('Unauthorized')
    expect((failure as ApiError).retryAfterSeconds).toBeNull()
  })

  it('classifies timeouts, external aborts, network failures, and malformed bodies', async () => {
    server.use(
      http.get(`${base}/getChats/${CREDENTIALS.apiTokenInstance}`, async () => {
        await delay(300)
        return HttpResponse.json([])
      }),
    )

    const timeoutFailure = await greenApiRequest<unknown>(CREDENTIALS, {
      endpoint: 'getChats',
      verb: 'GET',
      timeoutMs: 50,
    }).catch((reason: unknown) => reason)
    expect((timeoutFailure as ApiError).kind).toBe('timeout')

    const controller = new AbortController()
    const abortPending = greenApiRequest<unknown>(CREDENTIALS, {
      endpoint: 'getChats',
      verb: 'GET',
      signal: controller.signal,
      timeoutMs: 5000,
    })
    await delay(20)
    controller.abort()
    const abortFailure = await abortPending.catch((reason: unknown) => reason)
    expect((abortFailure as ApiError).kind).toBe('aborted')

    server.use(
      http.get(`${base}/getChats/${CREDENTIALS.apiTokenInstance}`, () => HttpResponse.error()),
    )
    const networkFailure = await greenApiRequest<unknown>(CREDENTIALS, {
      endpoint: 'getChats',
      verb: 'GET',
    }).catch((reason: unknown) => reason)
    expect((networkFailure as ApiError).kind).toBe('network')

    server.use(
      http.get(
        `${base}/getChats/${CREDENTIALS.apiTokenInstance}`,
        () => new HttpResponse('<html>', { status: 200 }),
      ),
    )
    const malformedFailure = await greenApiRequest<unknown>(CREDENTIALS, {
      endpoint: 'getChats',
      verb: 'GET',
    }).catch((reason: unknown) => reason)
    expect((malformedFailure as ApiError).kind).toBe('malformed')
  })
})
