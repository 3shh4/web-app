import { Page, expect } from '@playwright/test';

export async function clearAppStorage(page: Page) {
  await page.goto('/');

  await page.evaluate(() => {
    localStorage.clear();
  });

  await page.reload();
}

export async function loginAsAdmin(page: Page) {
  await page.goto('/');

  await page.getByLabel('E-mail Google').fill('elysy024s@gmail.com');
  await page.getByLabel('Imię').fill('Admin');
  await page.getByLabel('Nazwisko').fill('Testowy');

  await page.getByRole('button', { name: 'Zaloguj przez Google' }).click();

  await expect(page.getByText('LAB06: mock OAuth Google')).not.toBeVisible();
}