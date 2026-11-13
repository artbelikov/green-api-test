import { lazy, Suspense, useEffect } from 'react'
import { useSessionStore } from '@/entities/session'
import { ConnectPage } from '@/pages/connect'
import { i18n } from '@/shared/config'
import { AppProvider } from './providers/app-provider'
import { bindChatStores } from './providers/chat-stores'
import { bindNotificationEngineToSession } from './providers/notification-engine'

const MessengerPage = lazy(() =>
  import('@/pages/messenger').then((module) => ({ default: module.MessengerPage })),
)

function App() {
  const status = useSessionStore((state) => state.status)

  useEffect(() => {
    void useSessionStore.getState().resume()
    return bindNotificationEngineToSession()
  }, [])

  useEffect(() => bindChatStores(), [])

  return (
    <AppProvider>
      {status === 'connected' ? (
        <Suspense fallback={i18n.app.loading}>
          <MessengerPage />
        </Suspense>
      ) : (
        <ConnectPage />
      )}
    </AppProvider>
  )
}

export { App }
