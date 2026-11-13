import { MantineProvider } from '@mantine/core'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen } from '@testing-library/react'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { useChatsStore } from '@/entities/chats'
import { useSessionStore } from '@/entities/session'
import type { GreenApiCredentials } from '@/shared/api/greenapi'
import { i18n } from '@/shared/config'
import { handlers, type MockChat, mockGateway } from '@/shared/mocks'
import { ChatListPane } from './chat-list-pane'

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

describe('ChatListPane', () => {
  it('hydrates rows from getChats and renders name, preview, and unread', async () => {
    useSessionStore.setState({ credentials: CREDENTIALS, status: 'connected' })
    mockGateway.chats.push(...DEMO_CHATS)

    renderPane()

    expect(await screen.findByText('Demo Contact', {}, FIND_OPTIONS)).toBeInTheDocument()
    expect(screen.getByText('Another Friend')).toBeInTheDocument()
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
})
