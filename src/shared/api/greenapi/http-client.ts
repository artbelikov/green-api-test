export interface GreenApiCredentials {
  readonly apiUrl: string
  readonly idInstance: string
  readonly apiTokenInstance: string
}

export type ApiErrorKind = 'status' | 'timeout' | 'aborted' | 'network' | 'malformed'

export interface ApiErrorInit {
  readonly kind: ApiErrorKind
  readonly status?: number | null
  readonly retryAfterSeconds?: number | null
}

export class ApiError extends Error {
  readonly kind: ApiErrorKind
  readonly status: number | null
  readonly retryAfterSeconds: number | null

  constructor(message: string, init: ApiErrorInit) {
    super(message)
    this.name = 'ApiError'
    this.kind = init.kind
    this.status = init.status ?? null
    this.retryAfterSeconds = init.retryAfterSeconds ?? null
  }

  static fromStatus(
    status: number,
    message: string,
    retryAfterSeconds: number | null = null,
  ): ApiError {
    return new ApiError(message, {
      kind: 'status',
      status,
      retryAfterSeconds,
    })
  }

  static timeout(delayMs: number): ApiError {
    return new ApiError(`Request timed out after ${delayMs} ms`, { kind: 'timeout' })
  }

  static aborted(): ApiError {
    return new ApiError('Request aborted', { kind: 'aborted' })
  }

  static network(reason: unknown): ApiError {
    const detail = reason instanceof Error ? reason.message : String(reason)
    return new ApiError(`Network request failed: ${detail}`, { kind: 'network' })
  }
}

const DEFAULT_TIMEOUT_MS = 20_000

export interface GreenApiRequest {
  readonly endpoint: string
  readonly pathSuffix?: string
  readonly verb?: 'GET' | 'POST' | 'DELETE'
  readonly payload?: unknown
  readonly query?: Readonly<Record<string, string | number>>
  readonly signal?: AbortSignal | undefined
  readonly timeoutMs?: number | undefined
}

const errorMessageFromBody = (bodyText: string): string => {
  try {
    const parsed: unknown = JSON.parse(bodyText)
    if (parsed !== null && typeof parsed === 'object' && 'message' in parsed) {
      const candidate = (parsed as { message?: unknown }).message
      if (typeof candidate === 'string' && candidate.length > 0) {
        return candidate
      }
    }
  } catch {
    return bodyText
  }
  return bodyText
}

const retryAfterSecondsFrom = (headers: Headers): number | null => {
  const raw = headers.get('retry-after')
  if (raw === null) {
    return null
  }
  const seconds = Number(raw)
  return Number.isFinite(seconds) ? seconds : null
}

const parseResponseBody = (bodyText: string): unknown => {
  if (bodyText.length === 0) {
    return undefined
  }
  try {
    return JSON.parse(bodyText)
  } catch {
    throw new ApiError(`Malformed response body: ${bodyText}`, { kind: 'malformed' })
  }
}

export async function greenApiRequest<T>(
  credentials: GreenApiCredentials,
  request: GreenApiRequest,
): Promise<T> {
  const pathSuffix = request.pathSuffix === undefined ? '' : `/${request.pathSuffix}`
  const url = new URL(
    `/waInstance${credentials.idInstance}/${request.endpoint}/${credentials.apiTokenInstance}${pathSuffix}`,
    credentials.apiUrl,
  )
  for (const [name, value] of Object.entries(request.query ?? {})) {
    url.searchParams.set(name, String(value))
  }
  const timeoutMs = request.timeoutMs ?? DEFAULT_TIMEOUT_MS
  const timeoutSignal = AbortSignal.timeout(timeoutMs)
  const signal = request.signal ? AbortSignal.any([request.signal, timeoutSignal]) : timeoutSignal
  const init: RequestInit = { method: request.verb ?? 'POST', signal }
  if (request.verb !== 'GET' && request.payload !== undefined) {
    init.headers = { 'Content-Type': 'application/json' }
    init.body = JSON.stringify(request.payload)
  }

  let response: Response
  try {
    response = await fetch(url, init)
  } catch (reason: unknown) {
    if (reason instanceof Error && reason.name === 'TimeoutError') {
      throw ApiError.timeout(timeoutMs)
    }
    if (reason instanceof Error && reason.name === 'AbortError') {
      throw ApiError.aborted()
    }
    throw ApiError.network(reason)
  }

  const bodyText = await response.text()
  if (!response.ok) {
    throw ApiError.fromStatus(
      response.status,
      bodyText.length > 0 ? errorMessageFromBody(bodyText) : response.statusText,
      retryAfterSecondsFrom(response.headers),
    )
  }
  return parseResponseBody(bodyText) as T
}
