import { setupWorker } from 'msw/browser'
import { isMockRuntime } from '@/shared/lib'
import { handlers } from '@/shared/mocks'

export async function startMockWorker(): Promise<void> {
  if (!isMockRuntime()) {
    return
  }
  await setupWorker(...handlers).start({ onUnhandledFrame: 'bypass' })
}
