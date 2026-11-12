import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from '@/app'
import { startMockWorker } from '@/app/mocks'
import { i18n } from '@/shared/config'
import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'

async function bootstrap(): Promise<void> {
  const container = document.getElementById('root')
  if (!(container instanceof HTMLElement)) {
    throw new Error(i18n.errors.missingRootElement)
  }
  await startMockWorker()
  createRoot(container).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

void bootstrap()
