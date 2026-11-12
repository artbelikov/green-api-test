import { ApiError } from '@/shared/api/greenapi'
import type { ConnectFailureCode } from './types'

export function mapConnectError(error: unknown): ConnectFailureCode {
  if (error instanceof ApiError) {
    if (error.kind === 'timeout') {
      return 'timeoutError'
    }
    if (error.kind === 'network') {
      return 'networkError'
    }
    if (error.kind === 'status') {
      if (error.status === 429) {
        return 'rateLimited'
      }
      if (error.status === 401 || error.status === 403) {
        return 'invalidCredentials'
      }
    }
  }
  return 'unexpected'
}

export function mapInstanceState(state: string | undefined): ConnectFailureCode | null {
  switch (state) {
    case 'authorized':
      return null
    case 'notAuthorized':
      return 'notAuthorized'
    case 'starting':
      return 'instanceStarting'
    case 'blocked':
    case 'yellowCard':
      return 'instanceUnavailable'
    default:
      return 'unexpected'
  }
}
