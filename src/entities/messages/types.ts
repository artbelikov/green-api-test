import type { ApiError } from '@/shared/api/greenapi'

export type HistoryPhase = 'loading' | 'ready' | 'failed'

export interface SendFailure {
  readonly chatId: string
  readonly pendingId: string
  readonly error: ApiError
}
