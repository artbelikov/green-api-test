import { MantineProvider } from '@mantine/core'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { useChatsStore } from '@/entities/chats'
import { useSessionStore } from '@/entities/session'
import type { GreenApiCredentials } from '@/shared/api/greenapi'
import { i18n } from '@/shared/config'
import { handlers, type MockChat, mockGateway } from '@/shared/mocks'
import { ChatListPane } from './chat-list-pane'
import classes from './chat-list-pane.module.css'

const ROWS_WINDOW_CLASS = classes.rowsWindow as string

vi.mock('@tanstack/react-virtual', () => ({
  useVirtualizer: (options: { count: number; getItemKey?: (index: number) => string }) => {
    const items = Array.from({ length: options.count }, (_, index) => ({
      index,
      key: options.getItemKey?.(index) ?? String(index),
      start: index * 80,
      size: 80,
    }))
    return {
      getVirtualItems: () => items,
      getTotalSize: () => options.count * 80,
      measureElement: () => {},
      scrollToOffset: () => {},
      scrollToIndex: () => {},
    }
  },
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

afterEach(() => {
  server.resetHandlers()
  mockGateway.reset()
  window.localStorage.clear()
  useSessionStore.getState().disconnect()
  useChatsStore.getState().clear()
})

afterAll(() => {
  server.close()
})

const renderPane = (): void => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  render(
    <QueryClientProvider client={queryClient}>
      <MantineProvider>
        <ChatListPane />
      </MantineProvider>
    </QueryClientProvider>,
  )
}

const DEMO_CHATS: MockChat[] = [
  { chatId: '79991234567', name: 'Demo Contact', type: 'user', username: 'demo_contact' },
  { chatId: '79160000000', name: 'Another Friend', type: 'user' },
]

const FIND_OPTIONS = { timeout: 3000 }

const endpointOf = (method: string): string =>
  `${CREDENTIALS.apiUrl}/waInstance${CREDENTIALS.idInstance}/${method}/${CREDENTIALS.apiTokenInstance}`

describe('ChatListPane', () => {
  it('hydrates rows from getChats and renders name, preview, and unread', async () => {
    useSessionStore.setState({ credentials: CREDENTIALS, status: 'connected' })
    mockGateway.chats.push(...DEMO_CHATS)

    renderPane()

    expect(await screen.findByText('Demo Contact', {}, FIND_OPTIONS)).toBeInTheDocument()
    expect(screen.getByText('Another Friend')).toBeInTheDocument()
  })

  it('backfills last-message previews in the background without unread inflation', async () => {
    useSessionStore.setState({ credentials: CREDENTIALS, status: 'connected' })
    mockGateway.chats.push(DEMO_CHATS[0] as MockChat)
    mockGateway.messages.push({
      idMessage: 'hist-1',
      chatId: '79991234567',
      direction: 'incoming',
      text: 'Old message from history',
      timestamp: Date.now() - 60_000,
    })

    renderPane()

    expect(
      await screen.findByText('Old message from history', {}, FIND_OPTIONS),
    ).toBeInTheDocument()
    const summary = useChatsStore.getState().summaries.find((entry) => entry.id === '79991234567')
    expect(summary?.lastMessage?.id).toBe('hist-1')
    expect(summary?.unread).toBe(0)
  })

  it('renders hydrated rows inside the virtualized window with measurable cells', async () => {
    useSessionStore.setState({ credentials: CREDENTIALS, status: 'connected' })
    mockGateway.chats.push(...DEMO_CHATS)

    renderPane()

    expect(await screen.findByText('Demo Contact', {}, FIND_OPTIONS)).toBeInTheDocument()
    const rowsWindow = document.querySelector(`.${ROWS_WINDOW_CLASS}`)
    if (!(rowsWindow instanceof HTMLElement)) {
      throw new Error('virtual rows window not found')
    }
    expect(rowsWindow.style.height).toBe('160px')
    const cells = rowsWindow.querySelectorAll('[data-index]')
    expect(cells).toHaveLength(2)
    expect(cells[0]?.getAttribute('data-index')).toBe('0')
    expect(cells[1]?.getAttribute('data-index')).toBe('1')
  })

  it('shows the empty state with the new-chat action when no chats exist', async () => {
    useSessionStore.setState({ credentials: CREDENTIALS, status: 'connected' })

    renderPane()

    expect(
      await screen.findByText(i18n.messenger.list.emptyTitle, {}, FIND_OPTIONS),
    ).toBeInTheDocument()
    expect(screen.getByText(i18n.messenger.list.emptyHint)).toBeInTheDocument()
  })

  it('filters rows by name through the search field', async () => {
    useSessionStore.setState({ credentials: CREDENTIALS, status: 'connected' })
    mockGateway.chats.push(...DEMO_CHATS)

    renderPane()
    expect(await screen.findByText('Demo Contact', {}, FIND_OPTIONS)).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText(i18n.messenger.list.searchPlaceholder), {
      target: { value: 'another' },
    })

    expect(screen.queryByText('Demo Contact')).not.toBeInTheDocument()
    expect(screen.getByText('Another Friend')).toBeInTheDocument()
  })

  it('reflects the session status in the connection chip', async () => {
    useSessionStore.setState({ credentials: CREDENTIALS, status: 'connected' })

    renderPane()

    expect(
      await screen.findByText(i18n.messenger.list.status.connected, {}, FIND_OPTIONS),
    ).toBeInTheDocument()
  })

  it('shows the reconnecting chip while the session is degraded', async () => {
    useSessionStore.setState({
      credentials: CREDENTIALS,
      status: 'connected',
      reconnecting: true,
    })

    renderPane()

    expect(
      await screen.findByText(i18n.messenger.list.status.reconnecting, {}, FIND_OPTIONS),
    ).toBeInTheDocument()
  })

  it('opens the new chat modal from the FAB', async () => {
    useSessionStore.setState({ credentials: CREDENTIALS, status: 'connected' })

    renderPane()
    fireEvent.click(screen.getByRole('button', { name: i18n.messenger.list.newChatAction }))

    expect(await screen.findByText(i18n.newChat.title, {}, FIND_OPTIONS)).toBeInTheDocument()
  })

  it('skips the preview sweep application when the session disconnects mid-await', async () => {
    let releaseHistory: () => void = () => undefined
    const historyGate = new Promise<void>((resolve) => {
      releaseHistory = resolve
    })
    let historyResponses = 0
    useSessionStore.setState({ credentials: CREDENTIALS, status: 'connected' })
    mockGateway.chats.push(DEMO_CHATS[0] as MockChat)
    server.use(
      http.post(endpointOf('getChatHistory'), async () => {
        await historyGate
        historyResponses += 1
        return HttpResponse.json([
          {
            type: 'incoming',
            idMessage: 'hist-ghost',
            timestamp: Math.floor(Date.now() / 1000),
            typeMessage: 'textMessage',
            chatId: '79991234567',
            textMessage: 'Late arrival after disconnect',
          },
        ])
      }),
    )

    renderPane()
    expect(await screen.findByText('Demo Contact', {}, FIND_OPTIONS)).toBeInTheDocument()
    const sweepChatId = useChatsStore.getState().summaries[0]?.id
    expect(sweepChatId).toBe('79991234567')

    useSessionStore.getState().disconnect()
    releaseHistory()

    await vi.waitFor(
      () => {
        expect(historyResponses).toBe(1)
      },
      { timeout: 5_000 },
    )
    expect(useChatsStore.getState().summaries[0]?.lastMessage).toBeNull()
  })
})
