import type { GreenApiChatListItem, GreenApiContactInfo } from '../types'

export type ChatType = 'private' | 'group' | 'channel' | 'unknown'

export interface Chat {
  readonly id: string
  readonly name: string
  readonly type: ChatType
  readonly username: string | null
  readonly phone: string | null
}

const normalizeChatType = (raw: string | undefined): ChatType => {
  switch (raw) {
    case 'user':
      return 'private'
    case 'supergroup':
    case 'group':
      return 'group'
    case 'channel':
      return 'channel'
    default:
      return 'unknown'
  }
}

const resolveName = (...candidates: ReadonlyArray<string | undefined>): string =>
  candidates.find((candidate) => candidate !== undefined && candidate.length > 0) ?? ''

export function mapChatListItem(raw: GreenApiChatListItem): Chat | null {
  const id = raw.chatId ?? raw.id
  if (id === undefined || id.length === 0) {
    return null
  }
  return {
    id,
    name: resolveName(raw.name, raw.contactName, id),
    type: normalizeChatType(raw.type),
    username: raw.username ?? null,
    phone: raw.phoneNumber ?? null,
  }
}

export interface ContactInfoFallback {
  readonly chatId?: string
  readonly name?: string
}

export function mapContactInfo(raw: GreenApiContactInfo, fallback: ContactInfoFallback = {}): Chat {
  const resolved = raw.chatId
  const id = resolved !== undefined && resolved.length > 0 ? resolved : (fallback.chatId ?? '')
  return {
    id,
    name: resolveName(raw.name, raw.contactName, fallback.name, id),
    type: normalizeChatType(raw.chatType),
    username: raw.username ?? null,
    phone: null,
  }
}
