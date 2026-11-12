export type GreenApiWebhookFlag =
  | 'incomingWebhook'
  | 'outgoingMessageWebhook'
  | 'outgoingAPIMessageWebhook'
  | 'outgoingWebhook'
  | 'stateWebhook'
  | 'editedMessageWebhook'
  | 'deletedMessageWebhook'

export type GreenApiWebhookFlagValue = 'yes' | 'no'

export type GreenApiSettingsPatch = Partial<Record<GreenApiWebhookFlag, GreenApiWebhookFlagValue>>

export type GreenApiSettingsState = Readonly<Record<string, string | number | boolean>>

export interface GreenApiInstanceState {
  readonly stateInstance?: string
}

export interface GreenApiSendMessageResult {
  readonly idMessage?: string
}

export interface GreenApiChatListItem {
  readonly id?: string
  readonly chatId?: string
  readonly name?: string
  readonly contactName?: string
  readonly type?: string
  readonly username?: string
  readonly phoneNumber?: string
  readonly unreadCount?: number
  readonly archive?: boolean
}

export interface GreenApiContactsItem {
  readonly id?: string
  readonly name?: string
  readonly contactName?: string
  readonly type?: string
  readonly newChatId?: string
}

export interface GreenApiContactInfo {
  readonly chatId?: string
  readonly name?: string
  readonly contactName?: string
  readonly username?: string
  readonly avatar?: string
  readonly chatType?: string
  readonly lastSeen?: string
  readonly email?: string
  readonly isBusiness?: boolean
}

export interface GreenApiAvatar {
  readonly urlAvatar?: string
  readonly available?: boolean
  readonly base64Avatar?: string
}

export interface GreenApiHistoryItem {
  readonly type?: string
  readonly idMessage?: string
  readonly timestamp?: number
  readonly typeMessage?: string
  readonly textMessage?: string
  readonly extendedTextMessage?: { readonly text?: string }
  readonly chatId?: string
  readonly senderId?: string
  readonly senderName?: string
  readonly senderContactName?: string
  readonly statusMessage?: string
  readonly description?: string
  readonly isDeleted?: boolean
  readonly isEdited?: boolean
}

export interface GreenApiInstanceData {
  readonly idInstance?: number
  readonly wid?: string
  readonly typeInstance?: string
}

export interface GreenApiSenderData {
  readonly chatId?: string
  readonly chatName?: string
  readonly sender?: string
  readonly senderName?: string
  readonly senderContactName?: string
}

export interface GreenApiNotificationEnvelope {
  readonly typeWebhook?: string
  readonly instanceData?: GreenApiInstanceData
  readonly timestamp?: number
  readonly idMessage?: string
  readonly chatId?: string
  readonly status?: string
  readonly description?: string
  readonly sendByApi?: boolean
  readonly senderData?: GreenApiSenderData
  readonly messageData?: {
    readonly typeMessage?: string
    readonly textMessageData?: { readonly textMessage?: string }
  }
}

export interface GreenApiNotificationReceipt {
  readonly receiptId?: number
  readonly body?: GreenApiNotificationEnvelope | null
  readonly code?: string
  readonly message?: string
  readonly status?: string
}

export interface GreenApiReadChatResult {
  readonly setRead?: boolean
}

export interface GreenApiDeleteNotificationResult {
  readonly result?: boolean
  readonly reason?: string
}
