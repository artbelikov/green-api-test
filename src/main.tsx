import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from '@/app'
import { startMockWorker } from '@/app/mocks'
import { i18n } from '@/shared/config'

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
