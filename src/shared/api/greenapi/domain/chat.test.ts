import { describe, expect, it } from 'vitest'
import type { GreenApiChatListItem, GreenApiContactInfo, GreenApiContactsItem } from '../types'
import { mapChatListItem, mapContactInfo, mapContactItem } from './chat'

describe('mapChatListItem', () => {
  it('maps the live Telegram getChats shape', () => {
    const raw: GreenApiChatListItem = {
      chatId: '79161234567',
      name: 'Иван',
      type: 'user',
      username: 'ivan',
      phoneNumber: '79161234567',
    }
    expect(mapChatListItem(raw)).toEqual({
      id: '79161234567',
      name: 'Иван',
      type: 'private',
      username: 'ivan',
      phone: '79161234567',
    })
  })

  it('maps the documented WhatsApp getChats shape onto the same model', () => {
    const raw: GreenApiChatListItem = {
      id: '79876543210@c.us',
      name: 'Иван Царевич',
      type: 'user',
      unreadCount: 5,
    }
    expect(mapChatListItem(raw)).toEqual({
      id: '79876543210@c.us',
      name: 'Иван Царевич',
      type: 'private',
      username: null,
      phone: null,
    })
  })

  it('normalizes group and channel kinds', () => {
    expect(mapChatListItem({ chatId: '1203@g.us', type: 'supergroup' })?.type).toBe('group')
    expect(mapChatListItem({ chatId: '1203@g.us', type: 'group' })?.type).toBe('group')
    expect(mapChatListItem({ chatId: '1203', type: 'channel' })?.type).toBe('channel')
    expect(mapChatListItem({ chatId: '1203', type: 'something-new' })?.type).toBe('unknown')
  })

  it('falls back the name to the chat id and rejects entries without an id', () => {
    expect(mapChatListItem({ chatId: '7916', type: 'user' })).toEqual({
      id: '7916',
      name: '7916',
      type: 'private',
      username: null,
      phone: null,
    })
    expect(mapChatListItem({ name: 'No id here' })).toBeNull()
  })
})

describe('mapContactItem', () => {
  it('prefers the phone-book name over the raw name and honors newChatId', () => {
    const raw: GreenApiContactsItem = {
      id: '79876543210@c.us',
      name: '',
      contactName: 'Иван Царевич Работа',
      type: 'user',
      newChatId: '999999@lid',
    }
    expect(mapContactItem(raw)).toEqual({
      id: '999999@lid',
      name: 'Иван Царевич Работа',
      type: 'private',
      username: null,
      phone: null,
    })
  })

  it('rejects entries without an id', () => {
    expect(mapContactItem({ name: 'Ghost' })).toBeNull()
  })
})

describe('mapContactInfo', () => {
  it('maps a live Telegram profile', () => {
    const raw: GreenApiContactInfo = {
      chatId: '79161234567',
      name: 'Иван',
      username: 'ivan',
      chatType: 'user',
      lastSeen: '2026-11-12T12:00:00Z',
    }
    expect(mapContactInfo(raw)).toEqual({
      id: '79161234567',
      name: 'Иван',
      type: 'private',
      username: 'ivan',
      phone: null,
    })
  })

  it('keeps the entered phone as the name for an empty profile (unknown recipient)', () => {
    const raw: GreenApiContactInfo = {}
    expect(mapContactInfo(raw, { chatId: '79161234567', name: '79161234567' })).toEqual({
      id: '79161234567',
      name: '79161234567',
      type: 'unknown',
      username: null,
      phone: null,
    })
  })
})
