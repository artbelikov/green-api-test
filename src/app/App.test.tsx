import { render, screen, waitFor } from '@testing-library/react'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { useSessionStore } from '@/entities/session'
import { i18n } from '@/shared/config'
import { handlers, mockGateway } from '@/shared/mocks'
import { App } from './App'

const server = setupServer(...handlers)

const SESSION_STORAGE_KEY = 'green-api-messenger:session:v1'

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

describe('App', () => {
  it('renders the connect screen when no session is stored', () => {
    render(<App />)

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(i18n.connect.heading)
    expect(screen.getByRole('button', { name: i18n.connect.connectAction })).toBeInTheDocument()
  })

  it('resumes a persisted session into the messenger shell', async () => {
    window.localStorage.setItem(
      SESSION_STORAGE_KEY,
      JSON.stringify({
        credentials: {
          apiUrl: 'https://gateway.test',
          idInstance: '110100200',
          apiTokenInstance: 'token-1',
        },
        settledAt: null,
      }),
    )

    render(<App />)

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(i18n.placeholder.title)
    })
    await waitFor(() => {
      expect(screen.getByText(i18n.session.settlingNotice)).toBeInTheDocument()
    })
    expect(screen.getByRole('button', { name: i18n.session.disconnectAction })).toBeInTheDocument()
  })
})
