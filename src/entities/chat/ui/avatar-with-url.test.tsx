import { MantineProvider } from '@mantine/core'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { useSessionStore } from '@/entities/session'
import type { GreenApiCredentials } from '@/shared/api/greenapi'
import { maxTheme } from '@/shared/config'
import { handlers, mockGateway } from '@/shared/mocks'
import { ChatAvatarWithUrl } from './avatar-with-url'

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
})

afterAll(() => {
  server.close()
})

const renderAvatar = (credentials: GreenApiCredentials | null): void => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  render(
    <QueryClientProvider client={queryClient}>
      <MantineProvider theme={maxTheme}>
        <ChatAvatarWithUrl
          chatId="79991234567"
          name="Demo Contact"
          size={54}
          credentials={credentials}
        />
      </MantineProvider>
    </QueryClientProvider>,
  )
}

const FIND_OPTIONS = { timeout: 3000 }

describe('ChatAvatarWithUrl', () => {
  it('falls back to initials when getAvatar has no available url', async () => {
    useSessionStore.setState({ credentials: CREDENTIALS, status: 'connected' })

    renderAvatar(CREDENTIALS)

    expect(await screen.findByText('DC', {}, FIND_OPTIONS)).toBeInTheDocument()
  })

  it('skips the query and shows initials without a session', () => {
    renderAvatar(null)
    expect(screen.getByText('DC')).toBeInTheDocument()
  })

  it('recovers with initials when the avatar request fails', async () => {
    useSessionStore.setState({ credentials: CREDENTIALS, status: 'connected' })
    server.use(http.post(/\/getAvatar\/[^/?]+$/, () => new HttpResponse(null, { status: 500 })))

    renderAvatar(CREDENTIALS)

    await expect(screen.findByText('DC', {}, FIND_OPTIONS)).resolves.toBeInTheDocument()
  })
})
