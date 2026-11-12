import { useSessionStore } from '@/entities/session'
import { getNotificationEngine, stopNotificationEngine } from '@/shared/api/greenapi'

const syncEngineWithSession = (): void => {
  const { credentials, status } = useSessionStore.getState()
  if (status === 'connected' && credentials !== null) {
    getNotificationEngine().start(credentials)
    return
  }
  void stopNotificationEngine()
}

export function bindNotificationEngineToSession(): () => void {
  syncEngineWithSession()
  const unsubscribe = useSessionStore.subscribe(() => syncEngineWithSession())
  return () => {
    unsubscribe()
    void stopNotificationEngine()
  }
}
