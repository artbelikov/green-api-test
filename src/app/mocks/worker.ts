import { setupWorker } from 'msw/browser'
import { handlers } from '@/shared/mocks'

export async function startMockWorker(): Promise<void> {
  if (import.meta.env.VITE_API_MODE !== 'mock') {
    return
  }
  await setupWorker(...handlers).start({ onUnhandledFrame: 'bypass' })
}
