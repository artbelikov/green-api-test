import { describe, expect, it } from 'vitest'
import type { GreenApiHistoryItem, GreenApiNotificationEnvelope } from '../types'
import { mapHistoryMessage, mapNotification, notificationChatFallback } from './message'

const INCOMING_WEBHOOK_FIXTURE: GreenApiNotificationEnvelope = {
  typeWebhook: 'incomingMessageReceived',
  instanceData: { idInstance: 1101111111, wid: '79876543210@c.us', typeInstance: 'whatsapp' },
  timestamp: 1732268220,
  idMessage: '2D9D6721A977D369246509EBE0CE44CA',
  senderData: {
    chatId: '120363369140947676@g.us',
    chatName: 'Группа',
    sender: '79001234567@c.us',
    senderName: 'Иван',
    senderContactName: 'Иван Царевич',
  },
  messageData: { typeMessage: 'textMessage', textMessageData: { textMessage: 'I use Green-API!' } },
}

describe('mapHistoryMessage', () => {
  it('maps a text history entry into the unified message model', () => {
    const raw: GreenApiHistoryItem = {
      type: 'incoming',
      idMessage: 'BAE57784B879480F',
      timestamp: 1757583630,
      typeMessage: 'textMessage',
      chatId: '79876543210@c.us',
      textMessage: 'Привет!',
    }
    expect(mapHistoryMessage(raw)).toEqual({
      id: 'BAE57784B879480F',
      chatId: '79876543210@c.us',
      direction: 'incoming',
      text: 'Привет!',
      timestamp: 1757583630000,
      status: null,
    })
  })

  it('maps outgoing history with delivery status including legacy suspended values', () => {
    const base: GreenApiHistoryItem = {
      type: 'outgoing',
      idMessage: 'BAE5854C6CED1648',
      timestamp: 1757582429,
      typeMessage: 'textMessage',
      chatId: '79876543210@c.us',
      textMessage: 'Ping',
    }
    for (const [statusMessage, expected] of [
      ['sent', 'sent'],
      ['delivered', 'delivered'],
      ['read', 'read'],
      ['failed', 'failed'],
      ['yellowCard', 'failed'],
      ['noAccount', 'failed'],
    ] as const) {
      expect(mapHistoryMessage({ ...base, statusMessage })?.status).toBe(expected)
    }
    expect(mapHistoryMessage(base)?.status).toBeNull()
  })

  it('accepts extended text messages', () => {
    const raw: GreenApiHistoryItem = {
      type: 'incoming',
      idMessage: '1',
      timestamp: 1732268220,
      typeMessage: 'extendedTextMessage',
      chatId: '79161234567@c.us',
      extendedTextMessage: { text: 'https://green-api.com' },
    }
    expect(mapHistoryMessage(raw)?.text).toBe('https://green-api.com')
  })

  it('tolerates unknown message types, deleted entries, and missing fields', () => {
    const mediaItem: GreenApiHistoryItem = {
      type: 'incoming',
      idMessage: '2',
      timestamp: 1732268220,
      typeMessage: 'imageMessage',
      chatId: '79161234567@c.us',
    }
    expect(mapHistoryMessage(mediaItem)).toBeNull()
    expect(
      mapHistoryMessage({
        type: 'incoming',
        idMessage: '3',
        timestamp: 1732268220,
        typeMessage: 'textMessage',
        chatId: '79161234567@c.us',
        textMessage: 'gone',
        isDeleted: true,
      }),
    ).toBeNull()
    expect(
      mapHistoryMessage({ type: 'incoming', timestamp: 1, typeMessage: 'textMessage' }),
    ).toBeNull()
    expect(mapHistoryMessage({})).toBeNull()
    expect(
      mapHistoryMessage({
        type: 'reactionsJournalEntry',
        idMessage: '4',
        timestamp: 1,
        typeMessage: 'textMessage',
        chatId: '79161234567@c.us',
        textMessage: 'x',
      }),
    ).toBeNull()
  })
})

describe('mapNotification', () => {
  it('maps an incoming text webhook into a message event with the sender chat', () => {
    const event = mapNotification(INCOMING_WEBHOOK_FIXTURE)
    expect(event).toEqual({
      kind: 'message',
      message: {
        id: '2D9D6721A977D369246509EBE0CE44CA',
        chatId: '120363369140947676@g.us',
        direction: 'incoming',
        text: 'I use Green-API!',
        timestamp: 1732268220000,
        status: null,
      },
    })
  })

  it('maps outgoing API message webhooks as sent outgoing messages', () => {
    const event = mapNotification({
      typeWebhook: 'outgoingAPIMessageReceived',
      timestamp: 1732268220,
      idMessage: 'MSG1',
      senderData: { chatId: '79161234567@c.us', senderName: 'Иван' },
      messageData: { typeMessage: 'textMessage', textMessageData: { textMessage: 'Отправлено' } },
    })
    expect(event).toEqual({
      kind: 'message',
      message: {
        id: 'MSG1',
        chatId: '79161234567@c.us',
        direction: 'outgoing',
        text: 'Отправлено',
        timestamp: 1732268220000,
        status: 'sent',
      },
    })
  })

  it('maps outgoing message status webhooks onto delivery states', () => {
    const statusFixture = (status: string): GreenApiNotificationEnvelope => ({
      typeWebhook: 'outgoingMessageStatus',
      chatId: '79876543210@c.us',
      timestamp: 1727691478,
      idMessage: '3EB0608D6A2901063D63',
      status,
      sendByApi: true,
    })
    expect(mapNotification(statusFixture('sent'))).toEqual({
      kind: 'status',
      idMessage: '3EB0608D6A2901063D63',
      chatId: '79876543210@c.us',
      status: 'sent',
      timestamp: 1727691478000,
    })
    expect(mapNotification(statusFixture('read'))).toEqual({
      kind: 'status',
      idMessage: '3EB0608D6A2901063D63',
      chatId: '79876543210@c.us',
      status: 'read',
      timestamp: 1727691478000,
    })
    expect(mapNotification(statusFixture('noAccount'))).toEqual({
      kind: 'status',
      idMessage: '3EB0608D6A2901063D63',
      chatId: '79876543210@c.us',
      status: 'failed',
      timestamp: 1727691478000,
    })
    expect(mapNotification(statusFixture('brandNewStatus'))).toEqual({
      kind: 'status',
      idMessage: '3EB0608D6A2901063D63',
      chatId: '79876543210@c.us',
      status: 'failed',
      timestamp: 1727691478000,
    })
  })

  it('ignores service webhooks, media payloads, and malformed envelopes', () => {
    expect(mapNotification({ typeWebhook: 'stateInstanceChanged', timestamp: 1 })).toEqual({
      kind: 'ignored',
    })
    expect(
      mapNotification({
        typeWebhook: 'incomingMessageReceived',
        timestamp: 1,
        idMessage: 'X',
        senderData: { chatId: '79161234567@c.us' },
        messageData: { typeMessage: 'imageMessage' },
      }),
    ).toEqual({ kind: 'ignored' })
    expect(
      mapNotification({
        typeWebhook: 'incomingMessageReceived',
        timestamp: 1,
        idMessage: 'X',
        messageData: { typeMessage: 'textMessage', textMessageData: { textMessage: 'no chat id' } },
      }),
    ).toEqual({ kind: 'ignored' })
    expect(mapNotification(null)).toEqual({ kind: 'ignored' })
    expect(mapNotification(undefined)).toEqual({ kind: 'ignored' })
    expect(mapNotification({})).toEqual({ kind: 'ignored' })
  })
})

describe('notificationChatFallback', () => {
  it('derives the unknown-chat display name from senderData', () => {
    expect(notificationChatFallback(INCOMING_WEBHOOK_FIXTURE)).toEqual({
      chatId: '120363369140947676@g.us',
      name: 'Группа',
    })
    expect(
      notificationChatFallback({
        typeWebhook: 'incomingMessageReceived',
        senderData: { chatId: '79161234567@c.us', senderName: 'Иван' },
      }),
    ).toEqual({ chatId: '79161234567@c.us', name: 'Иван' })
    expect(notificationChatFallback({ typeWebhook: 'incomingMessageReceived' })).toBeNull()
  })
})
