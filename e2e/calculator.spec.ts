import { expect, test } from '@playwright/test';

test('the calculator page loads with its core regions', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Calculator', level: 1 })).toBeAttached();
  await expect(page.getByRole('group', { name: 'Display' })).toBeVisible();
  await expect(page.getByRole('group', { name: 'Keypad' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'History', level: 2 })).toBeVisible();
});
