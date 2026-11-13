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

export type GreenApiInstanceState = {
  readonly stateInstance?: string
}

export type GreenApiSendMessageResult = {
  readonly idMessage?: string
}

export type GreenApiChatListItem = {
  readonly id?: string
  readonly chatId?: string
  readonly name?: string
  readonly contactName?: string
  readonly type?: string
  readonly username?: string
  readonly phoneNumber?: string | number
  readonly unreadCount?: number
  readonly archive?: boolean
}

export type GreenApiContactsItem = {
  readonly id?: string
  readonly name?: string
  readonly contactName?: string
  readonly type?: string
  readonly newChatId?: string
}

export type GreenApiContactInfo = {
  readonly chatId?: string
  readonly name?: string
  readonly contactName?: string
  readonly username?: string
  readonly avatar?: string
  readonly chatType?: string
  readonly lastSeen?: string | number
  readonly email?: string
  readonly isBusiness?: boolean
  readonly phoneNumber?: string | number
  readonly phoneNumberTimestamp?: number
  readonly isPremium?: boolean
  readonly isVerified?: boolean
  readonly isScam?: boolean
  readonly description?: string
}

export type GreenApiAvatar = {
  readonly urlAvatar?: string
  readonly available?: boolean
  readonly base64Avatar?: string
}

export type GreenApiHistoryItem = {
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

export type GreenApiInstanceData = {
  readonly idInstance?: number
  readonly wid?: string
  readonly typeInstance?: string
}

export type GreenApiSenderData = {
  readonly chatId?: string
  readonly chatName?: string
  readonly sender?: string
  readonly senderName?: string
  readonly senderContactName?: string
}

export type GreenApiNotificationEnvelope = {
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

export type GreenApiNotificationReceipt = {
  readonly receiptId?: number
  readonly body?: GreenApiNotificationEnvelope | null
  readonly code?: string
  readonly message?: string
  readonly status?: string
}

export type ReceivedNotification = {
  readonly receiptId: number
  readonly body: GreenApiNotificationEnvelope | null
}

export type GreenApiReadChatResult = {
  readonly setRead?: boolean
}

export type GreenApiDeleteNotificationResult = {
  readonly result?: boolean
  readonly reason?: string
}
