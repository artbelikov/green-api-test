import {
  ApiError,
  credentialsFingerprint,
  type GreenApiCredentials,
  greenApiRequest,
} from './http-client'
import { GREEN_API_RATE_LIMITS, RateQueue, type RateQueuePriority } from './rate-queue'
import type {
  GreenApiAvatar,
  GreenApiChatListItem,
  GreenApiContactInfo,
  GreenApiContactsItem,
  GreenApiDeleteNotificationResult,
  GreenApiHistoryItem,
  GreenApiInstanceState,
  GreenApiNotificationReceipt,
  GreenApiReadChatResult,
  GreenApiSendMessageResult,
  GreenApiSettingsPatch,
  GreenApiSettingsState,
  ReceivedNotification,
} from './types'

export type GreenApiFacadeOptions = {
  readonly signal?: AbortSignal | undefined
  readonly timeoutMs?: number | undefined
  readonly priority?: RateQueuePriority | undefined
  readonly coalesce?: boolean | undefined
}

export type SendMessageArgs = {
  readonly chatId: string
  readonly text: string
}

export type ChatHistoryArgs = {
  readonly chatId: string
  readonly count: number
}

const rateQueue = new RateQueue(GREEN_API_RATE_LIMITS)

const DEFAULT_RECEIVE_TIMEOUT_MARGIN_SECONDS = 5

const coalesceKey = (credentials: GreenApiCredentials, ...parts: readonly string[]): string =>
  [credentialsFingerprint(credentials), ...parts].join('::')

const dispatchFacade = <T>(
  method: string,
  task: () => Promise<T>,
  options: GreenApiFacadeOptions,
  coalesceId?: string,
): Promise<T> =>
  rateQueue.enqueue(method, task, coalesceId, options.priority ?? 'background', options.signal)

export async function sendMessage(
  credentials: GreenApiCredentials,
  args: SendMessageArgs,
  options: GreenApiFacadeOptions = {},
): Promise<GreenApiSendMessageResult> {
  return dispatchFacade(
    'sendMessage',
    () =>
      greenApiRequest<GreenApiSendMessageResult>(credentials, {
        endpoint: 'sendMessage',
        payload: {
          chatId: args.chatId,
          message: args.text,
        },
        signal: options.signal,
        timeoutMs: options.timeoutMs,
      }),
    options,
  )
}

export async function getChatHistory(
  credentials: GreenApiCredentials,
  args: ChatHistoryArgs,
  options: GreenApiFacadeOptions = {},
): Promise<GreenApiHistoryItem[]> {
  const coalesceId =
    options.coalesce === false
      ? undefined
      : coalesceKey(credentials, `${args.chatId}:${args.count}`)
  return dispatchFacade(
    'getChatHistory',
    () =>
      greenApiRequest<GreenApiHistoryItem[]>(credentials, {
        endpoint: 'getChatHistory',
        payload: {
          chatId: args.chatId,
          count: args.count,
        },
        signal: options.signal,
        timeoutMs: options.timeoutMs,
      }),
    options,
    coalesceId,
  )
}

export async function getChats(
  credentials: GreenApiCredentials,
  options: GreenApiFacadeOptions = {},
): Promise<GreenApiChatListItem[]> {
  const coalesceId = options.coalesce === false ? undefined : coalesceKey(credentials, 'all')
  return dispatchFacade(
    'getChats',
    () =>
      greenApiRequest<GreenApiChatListItem[]>(credentials, {
        endpoint: 'getChats',
        verb: 'GET',
        signal: options.signal,
        timeoutMs: options.timeoutMs,
      }),
    options,
    coalesceId,
  )
}

export async function getContacts(
  credentials: GreenApiCredentials,
  options: GreenApiFacadeOptions = {},
): Promise<GreenApiContactsItem[]> {
  return dispatchFacade(
    'getContacts',
    () =>
      greenApiRequest<GreenApiContactsItem[]>(credentials, {
        endpoint: 'getContacts',
        verb: 'GET',
        signal: options.signal,
        timeoutMs: options.timeoutMs,
      }),
    options,
    coalesceKey(credentials, 'all'),
  )
}

export async function getContactInfo(
  credentials: GreenApiCredentials,
  chatId: string,
  options: GreenApiFacadeOptions = {},
): Promise<GreenApiContactInfo> {
  return dispatchFacade(
    'getContactInfo',
    () =>
      greenApiRequest<GreenApiContactInfo>(credentials, {
        endpoint: 'getContactInfo',
        payload: { chatId },
        signal: options.signal,
        timeoutMs: options.timeoutMs,
      }),
    options,
    coalesceKey(credentials, chatId),
  )
}

export async function getAvatar(
  credentials: GreenApiCredentials,
  chatId: string,
  options: GreenApiFacadeOptions = {},
): Promise<GreenApiAvatar> {
  return dispatchFacade(
    'getAvatar',
    () =>
      greenApiRequest<GreenApiAvatar>(credentials, {
        endpoint: 'getAvatar',
        payload: { chatId },
        signal: options.signal,
        timeoutMs: options.timeoutMs,
      }),
    options,
    coalesceKey(credentials, chatId),
  )
}

export async function getStateInstance(
  credentials: GreenApiCredentials,
  options: GreenApiFacadeOptions = {},
): Promise<GreenApiInstanceState> {
  return dispatchFacade(
    'getStateInstance',
    () =>
      greenApiRequest<GreenApiInstanceState>(credentials, {
        endpoint: 'getStateInstance',
        verb: 'GET',
        signal: options.signal,
        timeoutMs: options.timeoutMs,
      }),
    options,
    coalesceKey(credentials, 'state'),
  )
}

export async function getSettings(
  credentials: GreenApiCredentials,
  options: GreenApiFacadeOptions = {},
): Promise<GreenApiSettingsState> {
  return dispatchFacade(
    'getSettings',
    () =>
      greenApiRequest<GreenApiSettingsState>(credentials, {
        endpoint: 'getSettings',
        verb: 'GET',
        signal: options.signal,
        timeoutMs: options.timeoutMs,
      }),
    options,
    coalesceKey(credentials, 'settings'),
  )
}

export async function setSettings(
  credentials: GreenApiCredentials,
  patch: GreenApiSettingsPatch,
  options: GreenApiFacadeOptions = {},
): Promise<void> {
  await dispatchFacade(
    'setSettings',
    () =>
      greenApiRequest<unknown>(credentials, {
        endpoint: 'setSettings',
        payload: patch,
        signal: options.signal,
        timeoutMs: options.timeoutMs,
      }),
    options,
  )
}

export async function receiveNotification(
  credentials: GreenApiCredentials,
  receiveTimeoutSeconds: number,
  options: GreenApiFacadeOptions = {},
): Promise<ReceivedNotification | null> {
  const receipt = await dispatchFacade(
    'receiveNotification',
    () =>
      greenApiRequest<GreenApiNotificationReceipt | null | undefined>(credentials, {
        endpoint: 'receiveNotification',
        verb: 'GET',
        query: { receiveTimeout: receiveTimeoutSeconds },
        signal: options.signal,
        timeoutMs:
          options.timeoutMs ??
          (receiveTimeoutSeconds + DEFAULT_RECEIVE_TIMEOUT_MARGIN_SECONDS) * 1000,
      }),
    options,
  )
  if (receipt === null || receipt === undefined) {
    return null
  }
  if (receipt.status === 'error') {
    throw new ApiError(receipt.message ?? 'Gateway returned an error notification', {
      kind: 'status',
      status: null,
    })
  }
  if (typeof receipt.receiptId !== 'number') {
    return null
  }
  return { receiptId: receipt.receiptId, body: receipt.body ?? null }
}

export async function deleteNotification(
  credentials: GreenApiCredentials,
  receiptId: number,
  options: GreenApiFacadeOptions = {},
): Promise<GreenApiDeleteNotificationResult> {
  return dispatchFacade(
    'deleteNotification',
    () =>
      greenApiRequest<GreenApiDeleteNotificationResult>(credentials, {
        endpoint: 'deleteNotification',
        pathSuffix: String(receiptId),
        verb: 'DELETE',
        signal: options.signal,
        timeoutMs: options.timeoutMs,
      }),
    options,
  )
}

export async function readChat(
  credentials: GreenApiCredentials,
  chatId: string,
  options: GreenApiFacadeOptions = {},
): Promise<GreenApiReadChatResult> {
  return dispatchFacade(
    'readChat',
    () =>
      greenApiRequest<GreenApiReadChatResult>(credentials, {
        endpoint: 'readChat',
        payload: { chatId },
        signal: options.signal,
        timeoutMs: options.timeoutMs,
      }),
    options,
    coalesceKey(credentials, chatId),
  )
}
