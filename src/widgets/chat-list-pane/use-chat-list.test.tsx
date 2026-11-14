import { MantineProvider } from '@mantine/core'
import { act, render } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { useChatsStore } from '@/entities/chats'
import { useSessionStore } from '@/entities/session'
import type { Chat, GreenApiCredentials } from '@/shared/api/greenapi'
import { handlers } from '@/shared/mocks'
import { useChatPreviewHydration } from './use-chat-list'

const BASE_CREDENTIALS: GreenApiCredentials = {
  apiUrl: 'https://gateway.test',
  idInstance: '110100200',
  apiTokenInstance: 'token-1',
}

const freshCredentials = (): GreenApiCredentials => ({ ...BASE_CREDENTIALS })

const CHATS: readonly Chat[] = [
  { id: '79000000001', name: 'Visible One', type: 'private', username: null, phone: null },
  { id: '79000000002', name: 'Visible Two', type: 'private', username: null, phone: null },
]

const server = setupServer(...handlers)

beforeAll(() => {
  server.listen({ onUnhandledFrame: 'error' })
})

afterEach(() => {
  server.resetHandlers()
  window.localStorage.clear()
  useSessionStore.getState().disconnect()
  useChatsStore.getState().clear()
})

afterAll(() => {
  server.close()
})

const endpointOf = (method: string): string =>
  `${BASE_CREDENTIALS.apiUrl}/waInstance${BASE_CREDENTIALS.idInstance}/${method}/${BASE_CREDENTIALS.apiTokenInstance}`

const idsOf = (chats: readonly Chat[]): string[] => chats.map((chat) => chat.id)

const historyItem = (chatId: string, idMessage: string, text: string): unknown => ({
  type: 'incoming',
  idMessage,
  timestamp: Math.floor(Date.now() / 1000),
  typeMessage: 'textMessage',
  chatId,
  textMessage: text,
})

type HandlerPayload = (
  chatId: string,
  requestIndex: number,
) => {
  readonly status: number
  readonly body: readonly unknown[]
}

let historyRequests: Array<string>
let requestIndex: number

const trackHistoryRequests = (payload: HandlerPayload): void => {
  historyRequests = []
  requestIndex = 0
  server.use(
    http.post(endpointOf('getChatHistory'), async ({ request }) => {
      const body = (await request.json()) as { chatId?: string }
      const chatId = body.chatId ?? ''
      requestIndex += 1
      historyRequests.push(chatId)
      const response = payload(chatId, requestIndex)
      if (response.status !== 200) {
        return new HttpResponse(JSON.stringify(response.body), { status: response.status })
      }
      return HttpResponse.json(response.body)
    }),
  )
}

const ok = (chatId: string, suffix: string): { status: number; body: readonly unknown[] } => ({
  status: 200,
  body: [historyItem(chatId, `hist-${suffix}`, `Preview for ${suffix}`)],
})

const Harness = ({ visibleChatIds }: { readonly visibleChatIds: readonly string[] }): null => {
  useChatPreviewHydration(visibleChatIds)
  return null
}

const mountHarness = (visibleChatIds: readonly string[]) =>
  render(
    <MantineProvider>
      <Harness visibleChatIds={visibleChatIds} />
    </MantineProvider>,
  )

const rerenderHarness = (
  handle: ReturnType<typeof mountHarness>,
  visibleChatIds: readonly string[],
): void => {
  act(() => {
    handle.rerender(
      <MantineProvider>
        <Harness visibleChatIds={visibleChatIds} />
      </MantineProvider>,
    )
  })
}

const seedSession = (credentials: GreenApiCredentials): void => {
  act(() => {
    useSessionStore.setState({ credentials, status: 'connected' })
    useChatsStore.getState().upsertChats(CHATS)
  })
}

const waitForTest = async (assert: () => void): Promise<void> => {
  await vi.waitFor(assert, { timeout: 3_000 })
}

describe('useChatPreviewHydration', () => {
  it('fetches count-1 history for each visible chat and mirrors it as an unread-free preview', async () => {
    trackHistoryRequests((chatId, index) => ok(chatId, String(index)))
    const credentials = freshCredentials()
    seedSession(credentials)

    const handle = mountHarness(idsOf(CHATS))
    await waitForTest(() => {
      expect(historyRequests).toEqual(idsOf(CHATS))
    })

    const summaries = useChatsStore.getState().summaries
    expect(summaries.find((entry) => entry.id === '79000000001')?.lastMessage).toMatchObject({
      id: 'hist-1',
      text: 'Preview for 1',
    })
    expect(summaries.find((entry) => entry.id === '79000000002')?.lastMessage).toMatchObject({
      id: 'hist-2',
      text: 'Preview for 2',
    })
    expect(summaries.every((entry) => entry.unread === 0)).toBe(true)
    handle.unmount()
  })

  it('attempts each chat once per credentials session even across window changes', async () => {
    trackHistoryRequests((chatId, index) => ok(chatId, String(index)))
    const credentials = freshCredentials()
    seedSession(credentials)

    const handle = mountHarness(idsOf(CHATS.slice(0, 1)))
    await waitForTest(() => {
      expect(historyRequests).toEqual(['79000000001'])
    })

    rerenderHarness(handle, idsOf(CHATS))
    await waitForTest(() => {
      expect(historyRequests).toEqual(['79000000001', '79000000002'])
    })

    rerenderHarness(handle, idsOf(CHATS))
    rerenderHarness(handle, idsOf(CHATS.slice(1)))
    await waitForTest(() => {
      expect(historyRequests).toEqual(['79000000001', '79000000002'])
    })
    handle.unmount()
  })

  it('does not request history for chats that already carry a preview', async () => {
    trackHistoryRequests((chatId, index) => ok(chatId, String(index)))
    const credentials = freshCredentials()
    seedSession(credentials)
    act(() => {
      useChatsStore.getState().applyNewMessage({
        message: {
          id: 'local-1',
          chatId: '79000000002',
          direction: 'incoming',
          text: 'Already streamed',
          timestamp: Date.now(),
          status: null,
        },
        fallbackName: null,
        markUnread: false,
      })
    })

    const handle = mountHarness(idsOf(CHATS))
    await waitForTest(() => {
      expect(historyRequests).toEqual(['79000000001'])
    })
    handle.unmount()
  })

  it('retries a failed chat on the next visibility pass and succeeds', async () => {
    trackHistoryRequests((chatId, index) =>
      index === 1 ? { status: 500, body: [] } : ok(chatId, 'retry'),
    )
    const credentials = freshCredentials()
    seedSession(credentials)

    const handle = mountHarness(idsOf(CHATS.slice(0, 1)))
    await waitForTest(() => {
      expect(historyRequests).toEqual(['79000000001'])
    })
    expect(useChatsStore.getState().summaries[0]?.lastMessage).toBeNull()

    rerenderHarness(handle, idsOf(CHATS.slice(0, 1)))
    await waitForTest(() => {
      expect(historyRequests).toEqual(['79000000001', '79000000001'])
      expect(useChatsStore.getState().summaries[0]?.lastMessage).toMatchObject({
        id: 'hist-retry',
        text: 'Preview for retry',
      })
    })
    handle.unmount()
  })

  it('does not repeat requests for genuinely empty histories on later passes', async () => {
    trackHistoryRequests(() => ({ status: 200, body: [] }))
    const credentials = freshCredentials()
    seedSession(credentials)

    const handle = mountHarness(idsOf(CHATS.slice(0, 1)))
    await waitForTest(() => {
      expect(historyRequests).toEqual(['79000000001'])
    })
    rerenderHarness(handle, idsOf(CHATS.slice(0, 1)))
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(historyRequests).toEqual(['79000000001'])
    expect(useChatsStore.getState().summaries[0]?.lastMessage).toBeNull()
    handle.unmount()
  })

  it('stays idle without credentials', () => {
    trackHistoryRequests((chatId, index) => ok(chatId, String(index)))
    act(() => {
      useChatsStore.getState().upsertChats(CHATS)
      useSessionStore.setState({ credentials: null, status: 'disconnected' })
    })

    const handle = mountHarness(idsOf(CHATS))
    handle.rerender(
      <MantineProvider>
        <Harness visibleChatIds={idsOf(CHATS)} />
      </MantineProvider>,
    )

    expect(historyRequests).toEqual([])
    handle.unmount()
  })

  it('labels non-text last messages instead of leaving the preview empty forever', async () => {
    trackHistoryRequests((chatId, index) => ({
      status: 200,
      body: [
        {
          type: 'incoming',
          idMessage: `media-${index}`,
          timestamp: Math.floor(Date.now() / 1000),
          chatId,
          typeMessage: index === 1 ? 'imageMessage' : 'unsupportedKind',
        },
      ],
    }))
    const credentials = freshCredentials()
    seedSession(credentials)

    const handle = mountHarness(idsOf(CHATS))
    await waitForTest(() => {
      expect(historyRequests).toEqual(idsOf(CHATS))
    })

    const summaries = useChatsStore.getState().summaries
    expect(summaries.find((entry) => entry.id === '79000000001')?.lastMessage).toMatchObject({
      id: 'media-1',
      text: 'Photo',
    })
    expect(summaries.find((entry) => entry.id === '79000000002')?.lastMessage).toMatchObject({
      id: 'media-2',
      text: 'Message',
    })
    handle.unmount()
  })

  it('skips deleted journal entries and still mirrors the newest usable copy', async () => {
    trackHistoryRequests((chatId, index) => ({
      status: 200,
      body: [
        {
          type: 'incoming',
          idMessage: `deleted-${index}`,
          timestamp: Math.floor(Date.now() / 1000),
          chatId,
          typeMessage: 'textMessage',
          textMessage: 'Removed copy',
          isDeleted: true,
        },
        {
          type: 'incoming',
          idMessage: `kept-${index}`,
          timestamp: Math.floor(Date.now() / 1000) - 60,
          chatId,
          typeMessage: 'textMessage',
          textMessage: 'Kept copy',
        },
      ],
    }))
    const credentials = freshCredentials()
    seedSession(credentials)

    const handle = mountHarness(idsOf(CHATS.slice(0, 1)))
    await waitForTest(() => {
      expect(historyRequests).toEqual(['79000000001'])
      expect(
        useChatsStore.getState().summaries.find((entry) => entry.id === '79000000001')?.lastMessage,
      ).toMatchObject({ id: 'kept-1', text: 'Kept copy' })
    })
    handle.unmount()
  })
})
