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

test('meets the accessibility bar: names, roles, focus ring, live region', async ({ page }) => {
  await page.goto('/');

  // one landmark + a real (visually hidden) H1
  await expect(page.getByRole('main')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Calculator', level: 1 })).toBeAttached();

  // glyph keys carry words, not symbols
  await expect(page.getByRole('button', { name: 'All clear' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Divide' })).toBeVisible();

  // a focused key shows the custom ring (Tailwind renders it as a box-shadow)
  const seven = page.getByRole('button', { name: '7', exact: true });
  await seven.focus();
  const shadow = await seven.evaluate((el) => getComputedStyle(el).boxShadow);
  expect(shadow).not.toBe('none');

  // history rows are "Recall <result>" buttons in a list
  await page.getByRole('button', { name: '6', exact: true }).click();
  await page.getByRole('button', { name: 'Add' }).click();
  await page.getByRole('button', { name: '2', exact: true }).click();
  await page.getByRole('button', { name: 'Equals' }).click();
  const row = page
    .getByRole('listitem')
    .first()
    .getByRole('button', { name: /^Recall / });
  await expect(row).toHaveText(/6 \+ 2/);

  // the live region announced the result but not the digits that preceded it
  const live = page.locator('[aria-live="polite"]');
  await expect(live).toHaveText('8');
  await page.getByRole('button', { name: 'All clear' }).click();
  await page.getByRole('button', { name: '4', exact: true }).click();
  await expect(live).toHaveText('8');
});
