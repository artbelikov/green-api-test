import { setupWorker } from 'msw/browser'
import { isMockRuntime } from '@/shared/lib'
import { handlers, mockGateway } from '@/shared/mocks'

declare global {
  interface Window {
    mockGateway: typeof mockGateway
  }
}

export async function startMockWorker(): Promise<void> {
  if (!isMockRuntime()) {
    return
  }
  window.mockGateway = mockGateway
  await setupWorker(...handlers).start({ onUnhandledFrame: 'bypass' })
}
