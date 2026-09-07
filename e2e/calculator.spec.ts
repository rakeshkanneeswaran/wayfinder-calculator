import { expect, test } from '@playwright/test';

test('the calculator page loads with its core regions', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Calculator', level: 1 })).toBeAttached();
  await expect(page.getByRole('group', { name: 'Display' })).toBeVisible();
  await expect(page.getByRole('group', { name: 'Keypad' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'History', level: 2 })).toBeVisible();
});

test('computes 7 × 3 = 21 through the keypad', async ({ page }) => {
  await page.goto('/');
  const display = page.getByRole('group', { name: 'Display' });

  await page.getByRole('button', { name: '7', exact: true }).click();
  await page.getByRole('button', { name: 'Multiply' }).click();
  await expect(display).toContainText('7 ×');

  await page.getByRole('button', { name: '3', exact: true }).click();
  await page.getByRole('button', { name: 'Equals' }).click();
  await expect(display).toContainText('21');
});
