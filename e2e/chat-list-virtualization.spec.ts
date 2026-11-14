import { expect, type Page, test } from '@playwright/test'
import { connectMockInstance, deliverBackgroundMessages } from './helpers'

const FILLER_CHATS = 36
const NAME_PREFIX = 'Filler Chat'

const fillerDeliveries = Array.from({ length: FILLER_CHATS }, (_, index) => ({
  idMessage: `list-filler-${index + 1}`,
  chatId: `7900555${String(index + 1).padStart(4, '0')}`,
  chatName: `${NAME_PREFIX} ${index + 1}`,
  text: `List filler message ${index + 1}`,
}))

const scrollRowsContainer = async (page: Page, deltaY: number): Promise<boolean> => {
  const atBottom = await page.evaluate((step) => {
    const cell = document.querySelector('aside [data-index]')
    const scrollEl = cell?.parentElement?.parentElement
    if (!(scrollEl instanceof HTMLElement)) {
      return false
    }
    scrollEl.scrollTop += step
    return scrollEl.scrollTop + scrollEl.clientHeight >= scrollEl.scrollHeight - 12
  }, deltaY)
  return atBottom
}

const waitForDeliveriesToSettle = async (page: Page): Promise<void> => {
  await page.waitForFunction(
    () => {
      const windowEl = document.querySelector('aside [data-index]')?.parentElement
      if (!(windowEl instanceof HTMLElement)) {
        return false
      }
      const height = windowEl.style.height
      const stable =
        windowEl.dataset.lastHeight !== undefined && windowEl.dataset.lastHeight === height
      windowEl.dataset.lastHeight = height
      return stable
    },
    undefined,
    { polling: 250, timeout: 30_000 },
  )
}

test('the chat list virtualizes many chats and mounts rows on demand', async ({ page }) => {
  await connectMockInstance(page)
  await deliverBackgroundMessages(page, fillerDeliveries)
  await waitForDeliveriesToSettle(page)

  const cells = page.locator('aside [data-index]')
  await expect(page.getByText(/List filler message/).first()).toBeVisible()
  expect(await cells.count()).toBeLessThan(FILLER_CHATS)

  for (let atBottom = false; !atBottom; ) {
    atBottom = await scrollRowsContainer(page, 600)
  }

  await expect(page.locator('aside [data-index="0"]')).toHaveCount(0)
  await expect(page.getByText(/List filler message/).first()).toBeVisible()
  expect(await cells.count()).toBeLessThan(FILLER_CHATS)
})
