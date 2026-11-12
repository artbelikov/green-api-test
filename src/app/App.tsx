import { useEffect } from 'react'
import { useSessionStore } from '@/entities/session'
import { ConnectPage } from '@/pages/connect'
import { PlaceholderPage } from '@/pages/placeholder'
import { AppProvider } from './providers/app-provider'
import { bindNotificationEngineToSession } from './providers/notification-engine'

function App() {
  const status = useSessionStore((state) => state.status)

  useEffect(() => {
    void useSessionStore.getState().resume()
    return bindNotificationEngineToSession()
  }, [])

  return (
    <AppProvider>{status === 'disconnected' ? <ConnectPage /> : <PlaceholderPage />}</AppProvider>
  )
}

export { App }
