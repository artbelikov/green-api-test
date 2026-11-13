import { MantineProvider } from '@mantine/core'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { useChatsStore } from '@/entities/chats'
import { useSessionStore } from '@/entities/session'
import type { GreenApiCredentials } from '@/shared/api/greenapi'
import { i18n, maxTheme } from '@/shared/config'
import { handlers, mockGateway } from '@/shared/mocks'
import { ContactsModal } from './contacts-modal'

const CREDENTIALS: GreenApiCredentials = {
  apiUrl: 'https://gateway.test',
  idInstance: '110100200',
  apiTokenInstance: 'token-1',
}

const base = `${CREDENTIALS.apiUrl}/waInstance${CREDENTIALS.idInstance}`

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

const renderModal = (opened = true): void => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  render(
    <QueryClientProvider client={queryClient}>
      <MantineProvider theme={maxTheme}>
        <ContactsModal opened={opened} onClose={() => {}} />
      </MantineProvider>
    </QueryClientProvider>,
  )
}

describe('ContactsModal', () => {
  it('lists instance contacts resolved through the facade', async () => {
    useSessionStore.setState({ credentials: CREDENTIALS, status: 'connected' })
    mockGateway.ensureChat('chat-1', 'Demo Contact')

    renderModal()

    expect(await screen.findByText('Demo Contact', {}, { timeout: 3_000 })).toBeInTheDocument()
    expect(screen.getByText('chat-1')).toBeInTheDocument()
  })

  it('opens a chat on click through the pick-chat flow', async () => {
    const user = userEvent.setup()
    useSessionStore.setState({ credentials: CREDENTIALS, status: 'connected' })
    mockGateway.ensureChat('chat-1', 'Demo Contact')

    renderModal()

    await user.click(await screen.findByText('Demo Contact', {}, { timeout: 3_000 }))
    await vi.waitFor(() => {
      expect(useChatsStore.getState().summaries[0]).toMatchObject({ id: 'chat-1' })
    })
  })

  it('shows the failure alert when the contacts request errors', async () => {
    useSessionStore.setState({ credentials: CREDENTIALS, status: 'connected' })
    server.use(
      http.get(
        `${base}/getContacts/${CREDENTIALS.apiTokenInstance}`,
        () => new HttpResponse('boom', { status: 500 }),
      ),
    )

    renderModal()

    expect(
      await screen.findByText(i18n.contactsBook.loadFailed, {}, { timeout: 3_000 }),
    ).toBeInTheDocument()
  })

  it('shows the empty state when the instance has no contacts', async () => {
    useSessionStore.setState({ credentials: CREDENTIALS, status: 'connected' })

    renderModal()

    expect(
      await screen.findByText(i18n.contactsBook.empty, {}, { timeout: 3_000 }),
    ).toBeInTheDocument()
  })
})
