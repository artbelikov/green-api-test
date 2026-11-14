import { expect, test } from '@playwright/test'
import { i18n } from '../src/shared/config'

const CHAT_COUNT = 16
const NAME_PREFIX = 'Media Only'

const fillerChats = Array.from({ length: CHAT_COUNT }, (_, index) => ({
  chatId: `7900777${String(index + 1).padStart(4, '0')}`,
  name: `${NAME_PREFIX} ${index + 1}`,
  type: 'user',
  username: `media_only_${index + 1}`,
}))

const journalMessages = fillerChats.map((chat, index) => ({
  idMessage: `journal-${index + 1}`,
  chatId: chat.chatId,
  direction: 'incoming' as const,
  timestamp: Date.now() - (index + 1) * 60_000,
  typeMessage: 'imageMessage',
  text: '',
}))

const scrollToStep = async (
  page: import('@playwright/test').Page,
  delta: number,
): Promise<void> => {
  await page.evaluate((step) => {
    const viewport = document
      .querySelector('aside [data-index]')
      ?.closest('[data-scrollarea-viewport]')
    if (viewport instanceof HTMLElement) {
      viewport.scrollTop += step
    }
  }, delta)
}

test('previews hydrate for the rendered window and keep filling as rows scroll in', async ({
  page,
}) => {
  test.setTimeout(120_000)
  await page.goto('/?mock=1')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(i18n.connect.heading)

  const seeded = await page.evaluate(
    ({ chats, messages }) => {
      const gateway = window.mockGateway
      if (!gateway) {
        return 'no gateway'
      }
      for (const chat of chats) {
        gateway.chats.push(chat)
      }
      for (const message of messages) {
        gateway.messages.push(message)
      }
      return `chats:${gateway.chats.length}`
    },
    { chats: fillerChats, messages: journalMessages },
  )
  expect(seeded).toBe(`chats:${CHAT_COUNT}`)

  await page.getByRole('button', { name: i18n.connect.connectAction }).click()
  await expect(page.getByRole('heading', { name: i18n.messenger.list.heading })).toBeVisible()

  await expect(
    page.getByText(`${i18n.messenger.list.media.other}`, { exact: true }).first(),
  ).toBeVisible({ timeout: 30_000 })

  for (let step = 0; step < 3; step += 1) {
    await scrollToStep(page, 800)
    await page.waitForTimeout(1200)
  }
  await page.waitForTimeout(6000)

  const bottomText = await page.evaluate(() => {
    const cells = Array.from(document.querySelectorAll('aside [data-index]'))
    return cells
      .slice(-10)
      .map((cell) => cell.textContent ?? '')
      .join('|')
  })
  expect(bottomText).toContain(i18n.messenger.list.media.other)
})
