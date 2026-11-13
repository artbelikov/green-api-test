import { expect, type Page } from '@playwright/test'
import { i18n } from '../src/shared/config'

export interface BackgroundDelivery {
  readonly idMessage: string
  readonly chatId: string
  readonly chatName: string | null
  readonly text: string
}

export interface StatusDelivery {
  readonly idMessage: string
  readonly chatId: string
  readonly status: 'sent' | 'delivered' | 'read'
}

export type MockGatewayFlag = 'pollOutage' | 'invalidate' | 'autoReplyEnabled'

export async function connectMockInstance(page: Page): Promise<void> {
  await page.goto('/?mock=1')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(i18n.connect.heading)
  await page.getByRole('button', { name: i18n.connect.connectAction }).click()
  await expect(page.getByRole('heading', { name: i18n.messenger.list.heading })).toBeVisible()
}

export async function createChatByPhone(
  page: Page,
  phone: string,
  expectedName: string,
): Promise<void> {
  await page.getByRole('button', { name: i18n.messenger.list.newChatAction }).click()
  const dialog = page.getByRole('dialog')
  await dialog.getByLabel(i18n.newChat.targetLabel).fill(phone)
  await dialog.getByRole('button', { name: i18n.newChat.createAction }).click()
  await expect(page.getByRole('heading', { level: 3, name: expectedName })).toBeVisible()
}

export async function sendChatMessage(page: Page, text: string): Promise<void> {
  const composer = page.getByPlaceholder(i18n.messenger.composer.placeholder)
  await composer.fill(text)
  await composer.press('Enter')
  await expect(messagesRegion(page).getByText(text)).toBeVisible()
}

export const messagesRegion = (page: Page) =>
  page.getByRole('region', { name: i18n.messenger.conversation.messagesRegion })

export const chatRow = (page: Page, name: string) => page.getByRole('button', { name }).first()

export function deliverBackgroundMessage(page: Page, delivery: BackgroundDelivery): Promise<void> {
  return page.evaluate(
    ({ idMessage, chatId, chatName, text }) => {
      window.mockGateway.deliverNotification({
        typeWebhook: 'incomingMessageReceived',
        idMessage,
        timestamp: Math.floor(Date.now() / 1000),
        senderData: chatName === null ? { chatId } : { chatId, chatName },
        messageData: { typeMessage: 'textMessage', textMessageData: { textMessage: text } },
      })
    },
    { ...delivery },
  )
}

export function deliverBackgroundMessages(
  page: Page,
  deliveries: BackgroundDelivery[],
): Promise<void> {
  return page.evaluate(
    (items) => {
      const timestamp = Math.floor(Date.now() / 1000)
      for (const item of items) {
        window.mockGateway.deliverNotification({
          typeWebhook: 'incomingMessageReceived',
          idMessage: item.idMessage,
          timestamp,
          senderData:
            item.chatName === null
              ? { chatId: item.chatId }
              : { chatId: item.chatId, chatName: item.chatName },
          messageData: {
            typeMessage: 'textMessage',
            textMessageData: { textMessage: item.text },
          },
        })
      }
    },
    deliveries.map((delivery) => ({ ...delivery })),
  )
}

export function deliverStatusUpdate(page: Page, delivery: StatusDelivery): Promise<void> {
  return page.evaluate(
    ({ idMessage, chatId, status }) => {
      window.mockGateway.deliverNotification({
        typeWebhook: 'outgoingMessageStatus',
        idMessage,
        chatId,
        status,
        timestamp: Math.floor(Date.now() / 1000),
      })
    },
    { ...delivery },
  )
}

export function setMockGatewayFlag(
  page: Page,
  flag: MockGatewayFlag,
  value: boolean,
): Promise<void> {
  return page.evaluate(
    ([flagName, flagValue]) => {
      window.mockGateway[flagName] = flagValue
    },
    [flag, value] as const,
  )
}
