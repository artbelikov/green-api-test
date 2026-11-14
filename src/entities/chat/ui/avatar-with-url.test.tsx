import { MantineProvider } from '@mantine/core'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
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

const QUOTA_CREDENTIALS: GreenApiCredentials = {
  apiUrl: 'https://gateway.test',
  idInstance: '110100900',
  apiTokenInstance: 'token-quota',
}

const OTHER_CREDENTIALS: GreenApiCredentials = {
  apiUrl: 'https://gateway.test',
  idInstance: '110100901',
  apiTokenInstance: 'token-other',
}

const THIRD_CREDENTIALS: GreenApiCredentials = {
  apiUrl: 'https://gateway.test',
  idInstance: '110100902',
  apiTokenInstance: 'token-third',
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

  it('collapses a quota-exhausted instance into initials after one request', async () => {
    useSessionStore.setState({ credentials: QUOTA_CREDENTIALS, status: 'connected' })
    let avatarRequests = 0
    server.use(
      http.post(/\/getAvatar\/[^/?]+$/, () => {
        avatarRequests += 1
        return new HttpResponse(null, { status: 466 })
      }),
    )
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    const renderQuotaAvatar = (chatId: string, name: string): { unmount: () => void } =>
      render(
        <QueryClientProvider client={queryClient}>
          <MantineProvider theme={maxTheme}>
            <ChatAvatarWithUrl
              chatId={chatId}
              name={name}
              size={54}
              credentials={QUOTA_CREDENTIALS}
            />
          </MantineProvider>
        </QueryClientProvider>,
      )

    const first = renderQuotaAvatar('79990000001', 'Alpha')
    await waitFor(() => {
      expect(avatarRequests).toBe(1)
    })
    await screen.findByText('A', {}, FIND_OPTIONS)
    first.unmount()

    const second = renderQuotaAvatar('79990000002', 'Bravo')
    expect(screen.getByText('B')).toBeInTheDocument()
    await expect(
      vi.waitFor(() => {
        expect(avatarRequests).toBe(1)
      }),
    ).resolves.toBeUndefined()
    second.unmount()

    const remount = renderQuotaAvatar('79990000001', 'Alpha')
    await expect(
      vi.waitFor(() => {
        expect(avatarRequests).toBe(1)
      }),
    ).resolves.toBeUndefined()
    expect(screen.getByText('A')).toBeInTheDocument()
    remount.unmount()
  })

  it('keeps the avatar quota trip scoped to one instance', async () => {
    useSessionStore.setState({ credentials: THIRD_CREDENTIALS, status: 'connected' })
    let avatarRequests = 0
    const otherAvatarUrl = 'https://avatar.test/other.png'
    server.use(
      http.post(/\/getAvatar\/[^/?]+$/, ({ request }) => {
        if (!request.url.includes(`waInstance${OTHER_CREDENTIALS.idInstance}`)) {
          avatarRequests += 1
          return new HttpResponse(null, { status: 466 })
        }
        return HttpResponse.json({ urlAvatar: otherAvatarUrl, available: true })
      }),
    )
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    const renderWith = (
      credentials: GreenApiCredentials,
      chatId: string,
    ): { container: HTMLElement; unmount: () => void } =>
      render(
        <QueryClientProvider client={queryClient}>
          <MantineProvider theme={maxTheme}>
            <ChatAvatarWithUrl chatId={chatId} name="Delta" size={54} credentials={credentials} />
          </MantineProvider>
        </QueryClientProvider>,
      )

    const tripped = renderWith(THIRD_CREDENTIALS, '79990000003')
    await waitFor(() => {
      expect(avatarRequests).toBe(1)
    })
    expect(await screen.findByText('D', {}, FIND_OPTIONS)).toBeInTheDocument()
    tripped.unmount()

    const untouched = renderWith(OTHER_CREDENTIALS, '79990000004')
    await waitFor(() => {
      expect(untouched.container.querySelector('img')?.getAttribute('src')).toBe(otherAvatarUrl)
    })
    untouched.unmount()
  })
})
