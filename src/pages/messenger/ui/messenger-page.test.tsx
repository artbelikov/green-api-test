import { MantineProvider } from '@mantine/core'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { useChatsStore } from '@/entities/chats'
import { useSessionStore } from '@/entities/session'
import type { GreenApiCredentials } from '@/shared/api/greenapi'
import { i18n, maxTheme } from '@/shared/config'
import { handlers, mockGateway } from '@/shared/mocks'
import { MessengerPage } from './messenger-page'

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

const renderPage = (): void => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  render(
    <QueryClientProvider client={queryClient}>
      <MantineProvider theme={maxTheme}>
        <MessengerPage />
      </MantineProvider>
    </QueryClientProvider>,
  )
}

describe('MessengerPage', () => {
  it('renders the rail, the chat list pane, and the conversation placeholder', async () => {
    useSessionStore.setState({ credentials: CREDENTIALS, status: 'connected' })

    renderPage()

    expect(
      screen.getByRole('navigation', { name: i18n.messenger.navRail.label }),
    ).toBeInTheDocument()
    expect(await screen.findByText(i18n.messenger.list.emptyTitle)).toBeInTheDocument()
    expect(screen.getByText(i18n.messenger.conversation.placeholder)).toBeInTheDocument()
  })

  it('shows the active chat header when a chat is open', () => {
    useSessionStore.setState({ credentials: CREDENTIALS, status: 'connected' })
    useChatsStore
      .getState()
      .upsertChats([
        { id: 'chat-1', name: 'Demo Contact', type: 'unknown', username: null, phone: null },
      ])
    useChatsStore.getState().openChat('chat-1')

    renderPage()

    expect(screen.getByRole('heading', { level: 3, name: 'Demo Contact' })).toBeInTheDocument()
    expect(screen.getAllByText('Demo Contact').length).toBeGreaterThan(0)
  })
})
