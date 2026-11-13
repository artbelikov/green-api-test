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
  it('shows the restore screen while the resume decision is pending', () => {
    useSessionStore.setState({
      status: 'connecting',
      credentials: {
        apiUrl: 'https://gateway.test',
        idInstance: '110100200',
        apiTokenInstance: 'token-1',
      },
      sessionResolved: false,
    })

    render(<App />)

    expect(screen.getByText(i18n.app.restoring)).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: i18n.connect.connectAction }),
    ).not.toBeInTheDocument()
  })

  it('shows the connect screen once the resume decision resolved without a stored session', async () => {
    render(<App />)

    await screen.findByRole('heading', { level: 1 })
    expect(screen.getByRole('button', { name: i18n.connect.connectAction })).toBeInTheDocument()
    expect(screen.queryByText(i18n.app.restoring)).not.toBeInTheDocument()
  })

  it('resumes a persisted session into the messenger shell without flashing the connect screen', async () => {
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
      expect(screen.getByRole('heading', { name: i18n.messenger.list.heading })).toBeInTheDocument()
    })
    expect(
      screen.queryByRole('button', { name: i18n.connect.connectAction }),
    ).not.toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByText(i18n.session.settlingNotice)).toBeInTheDocument()
    })
    expect(
      screen.getByRole('button', { name: i18n.messenger.list.newChatAction }),
    ).toBeInTheDocument()
  })
})
