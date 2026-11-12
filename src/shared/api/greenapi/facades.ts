import { ApiError, type GreenApiCredentials, greenApiRequest } from './http-client'
import { GREEN_API_RATE_LIMITS, RateQueue } from './rate-queue'
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

export interface GreenApiFacadeOptions {
  readonly signal?: AbortSignal | undefined
  readonly timeoutMs?: number | undefined
}

export interface SendMessageArgs {
  readonly chatId: string
  readonly text: string
}

export interface ChatHistoryArgs {
  readonly chatId: string
  readonly count: number
}

const rateQueue = new RateQueue(GREEN_API_RATE_LIMITS)

const DEFAULT_RECEIVE_TIMEOUT_MARGIN_SECONDS = 5

export async function sendMessage(
  credentials: GreenApiCredentials,
  args: SendMessageArgs,
  options: GreenApiFacadeOptions = {},
): Promise<GreenApiSendMessageResult> {
  return rateQueue.enqueue('sendMessage', () =>
    greenApiRequest<GreenApiSendMessageResult>(credentials, {
      endpoint: 'sendMessage',
      payload: {
        chatId: args.chatId,
        message: args.text,
      },
      signal: options.signal,
      timeoutMs: options.timeoutMs,
    }),
  )
}

export async function getChatHistory(
  credentials: GreenApiCredentials,
  args: ChatHistoryArgs,
  options: GreenApiFacadeOptions = {},
): Promise<GreenApiHistoryItem[]> {
  return rateQueue.enqueue(
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
    `${args.chatId}:${args.count}`,
  )
}

export async function getChats(
  credentials: GreenApiCredentials,
  options: GreenApiFacadeOptions = {},
): Promise<GreenApiChatListItem[]> {
  return rateQueue.enqueue(
    'getChats',
    () =>
      greenApiRequest<GreenApiChatListItem[]>(credentials, {
        endpoint: 'getChats',
        verb: 'GET',
        signal: options.signal,
        timeoutMs: options.timeoutMs,
      }),
    'all',
  )
}

export async function getContacts(
  credentials: GreenApiCredentials,
  options: GreenApiFacadeOptions = {},
): Promise<GreenApiContactsItem[]> {
  return rateQueue.enqueue(
    'getContacts',
    () =>
      greenApiRequest<GreenApiContactsItem[]>(credentials, {
        endpoint: 'getContacts',
        verb: 'GET',
        signal: options.signal,
        timeoutMs: options.timeoutMs,
      }),
    'all',
  )
}

export async function getContactInfo(
  credentials: GreenApiCredentials,
  chatId: string,
  options: GreenApiFacadeOptions = {},
): Promise<GreenApiContactInfo> {
  return rateQueue.enqueue(
    'getContactInfo',
    () =>
      greenApiRequest<GreenApiContactInfo>(credentials, {
        endpoint: 'getContactInfo',
        payload: { chatId },
        signal: options.signal,
        timeoutMs: options.timeoutMs,
      }),
    chatId,
  )
}

export async function getAvatar(
  credentials: GreenApiCredentials,
  chatId: string,
  options: GreenApiFacadeOptions = {},
): Promise<GreenApiAvatar> {
  return rateQueue.enqueue(
    'getAvatar',
    () =>
      greenApiRequest<GreenApiAvatar>(credentials, {
        endpoint: 'getAvatar',
        payload: { chatId },
        signal: options.signal,
        timeoutMs: options.timeoutMs,
      }),
    chatId,
  )
}

export async function getStateInstance(
  credentials: GreenApiCredentials,
  options: GreenApiFacadeOptions = {},
): Promise<GreenApiInstanceState> {
  return rateQueue.enqueue(
    'getStateInstance',
    () =>
      greenApiRequest<GreenApiInstanceState>(credentials, {
        endpoint: 'getStateInstance',
        verb: 'GET',
        signal: options.signal,
        timeoutMs: options.timeoutMs,
      }),
    'state',
  )
}

export async function getSettings(
  credentials: GreenApiCredentials,
  options: GreenApiFacadeOptions = {},
): Promise<GreenApiSettingsState> {
  return rateQueue.enqueue(
    'getSettings',
    () =>
      greenApiRequest<GreenApiSettingsState>(credentials, {
        endpoint: 'getSettings',
        verb: 'GET',
        signal: options.signal,
        timeoutMs: options.timeoutMs,
      }),
    'settings',
  )
}

export async function setSettings(
  credentials: GreenApiCredentials,
  patch: GreenApiSettingsPatch,
  options: GreenApiFacadeOptions = {},
): Promise<void> {
  await rateQueue.enqueue('setSettings', () =>
    greenApiRequest<unknown>(credentials, {
      endpoint: 'setSettings',
      payload: patch,
      signal: options.signal,
      timeoutMs: options.timeoutMs,
    }),
  )
}

export async function receiveNotification(
  credentials: GreenApiCredentials,
  receiveTimeoutSeconds: number,
  options: GreenApiFacadeOptions = {},
): Promise<ReceivedNotification | null> {
  const receipt = await rateQueue.enqueue('receiveNotification', () =>
    greenApiRequest<GreenApiNotificationReceipt | null | undefined>(credentials, {
      endpoint: 'receiveNotification',
      verb: 'GET',
      query: { receiveTimeout: receiveTimeoutSeconds },
      signal: options.signal,
      timeoutMs:
        options.timeoutMs ??
        (receiveTimeoutSeconds + DEFAULT_RECEIVE_TIMEOUT_MARGIN_SECONDS) * 1000,
    }),
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
  return rateQueue.enqueue('deleteNotification', () =>
    greenApiRequest<GreenApiDeleteNotificationResult>(credentials, {
      endpoint: 'deleteNotification',
      pathSuffix: String(receiptId),
      verb: 'DELETE',
      signal: options.signal,
      timeoutMs: options.timeoutMs,
    }),
  )
}

export async function readChat(
  credentials: GreenApiCredentials,
  chatId: string,
  options: GreenApiFacadeOptions = {},
): Promise<GreenApiReadChatResult> {
  return rateQueue.enqueue(
    'readChat',
    () =>
      greenApiRequest<GreenApiReadChatResult>(credentials, {
        endpoint: 'readChat',
        payload: { chatId },
        signal: options.signal,
        timeoutMs: options.timeoutMs,
      }),
    chatId,
  )
}
