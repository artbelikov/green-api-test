import type { GreenApiChatListItem, GreenApiContactInfo } from '../types'

export type ChatType = 'private' | 'group' | 'channel' | 'unknown'

export type Chat = {
  readonly id: string
  readonly name: string
  readonly type: ChatType
  readonly username: string | null
  readonly phone: string | null
}

const normalizeChatType = (raw: string | undefined): ChatType => {
  switch (raw) {
    case 'user':
    case 'bot':
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

const normalizeUsername = (raw: string | undefined): string | null =>
  raw === undefined ? null : raw.replace(/^@+/, '')

const normalizePhoneNumber = (raw: string | number | undefined): string | null => {
  if (typeof raw === 'number') {
    return raw === 0 ? null : String(raw)
  }
  if (raw === undefined || raw.length === 0) {
    return null
  }
  return raw
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
    username: normalizeUsername(raw.username),
    phone: normalizePhoneNumber(raw.phoneNumber),
  }
}

export type ContactInfoFallback = {
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
    username: normalizeUsername(raw.username),
    phone: null,
  }
}
