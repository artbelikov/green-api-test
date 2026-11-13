import { expect, test } from '@playwright/test'
import { i18n } from '../src/shared/config'
import { connectMockInstance } from './helpers'

test('connect validates credentials against the gateway', async ({ page }) => {
  await page.goto('/?mock=1')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(i18n.connect.heading)

  await connectMockInstance(page)
  await expect(page.getByRole('heading', { name: i18n.messenger.list.heading })).toBeVisible()
})

test('connect rejects an instance id with non-digit characters inline', async ({ page }) => {
  await page.goto('/?mock=1')
  const idField = page.getByLabel(i18n.connect.idInstanceLabel)
  await idField.fill('abc')
  await page.getByRole('button', { name: i18n.connect.connectAction }).click()

  await expect(page.getByText(i18n.connect.errors.invalidInstanceId)).toBeVisible()
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
})

test('connect surfaces a rejection when the gateway refuses the token', async ({ page }) => {
  await page.goto('/?mock=1')
  await page.getByLabel(i18n.connect.apiTokenLabel).fill('invalid-token')
  await page.getByRole('button', { name: i18n.connect.connectAction }).click()

  await expect(page.getByText(i18n.connect.errors.invalidCredentials)).toBeVisible()
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
})
