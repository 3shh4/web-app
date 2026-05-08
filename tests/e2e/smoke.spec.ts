import { expect, test } from '@playwright/test';
import { clearAppStorage, loginAsAdmin } from './helpers/auth';

test.describe('ManageMe smoke test', () => {
  test.beforeEach(async ({ page }) => {
    await clearAppStorage(page);
  });

  test('app should start and render login view', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText('ManageMe')).toBeVisible();
    await expect(page.getByText('Zaloguj się przez Google')).toBeVisible();
    await expect(page.getByLabel('E-mail Google')).toBeVisible();
    await expect(page.getByLabel('Imię')).toBeVisible();
    await expect(page.getByLabel('Nazwisko')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Zaloguj przez Google' })).toBeDisabled();
  });

  test('user can fill mock Google login form', async ({ page }) => {
    await loginAsAdmin(page);
  });
});