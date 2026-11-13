import { MantineProvider } from '@mantine/core'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
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

  it('does not reuse an avatar cached under another instance credentials', async () => {
    useSessionStore.setState({ credentials: CREDENTIALS, status: 'connected' })
    let avatarUrl = 'https://avatar.test/one.png'
    const fetchPaths: string[] = []
    server.use(
      http.post(/\/getAvatar\/[^/?]+$/, async ({ request }) => {
        fetchPaths.push(request.url)
        return HttpResponse.json({ urlAvatar: avatarUrl, available: true })
      }),
    )
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    const renderWith = (credentials: GreenApiCredentials): { unmount: () => void } =>
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

    const first = renderWith(CREDENTIALS)
    await waitFor(() => {
      expect(document.querySelector('img')?.getAttribute('src')).toBe('https://avatar.test/one.png')
    })
    first.unmount()

    avatarUrl = 'https://avatar.test/two.png'
    const secondCredentials: GreenApiCredentials = {
      ...CREDENTIALS,
      idInstance: '110100201',
      apiTokenInstance: 'token-2',
    }
    renderWith(secondCredentials)
    await waitFor(() => {
      expect(document.querySelector('img')?.getAttribute('src')).toBe('https://avatar.test/two.png')
    })

    expect(fetchPaths).toHaveLength(2)
    expect(fetchPaths[0]).toContain(`waInstance${CREDENTIALS.idInstance}`)
    expect(fetchPaths[1]).toContain(`waInstance${secondCredentials.idInstance}`)
  })
})
