import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from '@/app'
import { i18n } from '@/shared/config'
import { isMockRuntime } from '@/shared/lib'
import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'

async function bootstrap(): Promise<void> {
  const container = document.getElementById('root')
  if (!(container instanceof HTMLElement)) {
    throw new Error(i18n.errors.missingRootElement)
  }
  if (isMockRuntime()) {
    const { startMockWorker } = await import('@/app/mocks')
    await startMockWorker()
  }
  createRoot(container).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

void bootstrap()
