import { MantineProvider } from '@mantine/core'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { useSessionStore } from '@/entities/session'
import { i18n, maxTheme } from '@/shared/config'
import { handlers, mockGateway } from '@/shared/mocks'
import { ConnectForm } from './connect-form'

const server = setupServer(...handlers)

beforeAll(() => {
  server.listen({ onUnhandledFrame: 'error' })
})

afterEach(() => {
  server.resetHandlers()
  mockGateway.reset()
  window.localStorage.clear()
  useSessionStore.getState().disconnect()
  window.history.replaceState(null, '', '/')
})

afterAll(() => {
  server.close()
})

const labeledInput = (label: string): HTMLElement => screen.getByLabelText(new RegExp(`^${label}`))

const fillAndSubmit = (idInstance: string, apiTokenInstance: string): void => {
  fireEvent.change(labeledInput(i18n.connect.idInstanceLabel), {
    target: { value: idInstance },
  })
  fireEvent.change(labeledInput(i18n.connect.apiTokenLabel), {
    target: { value: apiTokenInstance },
  })
  const form = document.querySelector('form')
  if (!(form instanceof HTMLFormElement)) {
    throw new Error('Connect form is missing from the DOM')
  }
  fireEvent.submit(form)
}

describe('ConnectForm', () => {
  it('shows inline validation errors for missing credentials', async () => {
    render(
      <MantineProvider theme={maxTheme}>
        <ConnectForm />
      </MantineProvider>,
    )

    const form = document.querySelector('form')
    if (!(form instanceof HTMLFormElement)) {
      throw new Error('Connect form is missing from the DOM')
    }
    fireEvent.submit(form)

    await waitFor(() => {
      expect(screen.getByText(i18n.connect.errors.invalidInstanceId)).toBeInTheDocument()
    })
    expect(useSessionStore.getState().status).toBe('disconnected')
  })

  it('connects with valid credentials and persists the session', async () => {
    render(
      <MantineProvider theme={maxTheme}>
        <ConnectForm />
      </MantineProvider>,
    )

    fillAndSubmit('110100200', 'token-1')

    await waitFor(
      () => {
        expect(useSessionStore.getState().status).toBe('connected')
      },
      { timeout: 4_000 },
    )
    expect(useSessionStore.getState().bootstrapPhase).toBe('settling')
    expect(window.localStorage.getItem('green-api-messenger:session:v1')).not.toBeNull()
  })

  it('surfaces credential rejection as an inline error', async () => {
    render(
      <MantineProvider theme={maxTheme}>
        <ConnectForm />
      </MantineProvider>,
    )

    fillAndSubmit('110100200', 'invalid-token')

    await waitFor(
      () => {
        expect(screen.getByText(i18n.connect.errors.invalidCredentials)).toBeInTheDocument()
      },
      { timeout: 4_000 },
    )
    expect(useSessionStore.getState().status).toBe('disconnected')
  })

  it('flags a missing token and reveals the advanced API URL field', async () => {
    render(
      <MantineProvider theme={maxTheme}>
        <ConnectForm />
      </MantineProvider>,
    )

    fireEvent.change(labeledInput(i18n.connect.idInstanceLabel), { target: { value: '110100200' } })
    fireEvent.submit(document.querySelector('form') as HTMLFormElement)

    await waitFor(() => {
      expect(screen.getByText(i18n.connect.errors.missingToken)).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText(i18n.connect.advancedToggle))

    expect(labeledInput(i18n.connect.apiUrlLabel)).toHaveValue('https://api.green-api.com')
  })

  it('prefills demo credentials while mock mode is active', () => {
    window.history.replaceState(null, '', '/?mock=1')

    render(
      <MantineProvider theme={maxTheme}>
        <ConnectForm />
      </MantineProvider>,
    )

    expect(labeledInput(i18n.connect.idInstanceLabel)).toHaveValue('110100200')
    expect(labeledInput(i18n.connect.apiTokenLabel)).toHaveValue('mock-token')
    expect(screen.getByText(i18n.connect.mockHint)).toBeInTheDocument()
  })
})
