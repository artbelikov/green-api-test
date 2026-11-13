export type SessionStatus = 'disconnected' | 'connecting' | 'connected'

export type BootstrapPhase = 'idle' | 'running' | 'settling' | 'done' | 'failed'

export type ConnectInput = {
  readonly idInstance: string
  readonly apiTokenInstance: string
  readonly apiUrl: string
}

export type ConnectFailureCode =
  | 'invalidInstanceId'
  | 'missingToken'
  | 'invalidApiUrl'
  | 'invalidCredentials'
  | 'notAuthorized'
  | 'instanceStarting'
  | 'instanceUnavailable'
  | 'networkError'
  | 'timeoutError'
  | 'rateLimited'
  | 'unexpected'

export type ConnectResult =
  | { readonly ok: true }
  | { readonly ok: false; readonly code: ConnectFailureCode }
