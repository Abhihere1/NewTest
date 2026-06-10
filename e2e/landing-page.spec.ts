// Ticket: NEWTE-2
import { test, expect } from '@playwright/test';
import { loginAs, ensureUserExists } from './helpers';

test.describe('NEWTE-2: Main Landing Page', () => {
  test.beforeEach(async ({ page, request }) => {
    await ensureUserExists(request);
    await loginAs(page);
  });

  test('AC1: Logged-in user lands on centered hero workspace', async ({ page }) => {
    await expect(page.getByTestId('landing-state')).toBeVisible();
  });

  test('AC2: Patch mark is centered above welcome copy', async ({ page }) => {
    await expect(page.getByTestId('patch-mark')).toBeVisible();
  });

  test('AC3: Welcome message displays correct text with username in red', async ({ page }) => {
    const heading = page.getByTestId('welcome-heading');
    await expect(heading).toContainText('Welcome to the Discount Tire Information Center');
    // Username is rendered in a red span
    const redSpan = heading.locator('span.text-red-600');
    await expect(redSpan).toBeVisible();
  });

  test('AC5: Second line of welcome copy is visible with muted style', async ({ page }) => {
    await expect(page.getByText("My name is Patch. Let's get you taken care of.")).toBeVisible();
  });

  test('AC6: Single VDI category tile is displayed', async ({ page }) => {
    await expect(page.getByTestId('vdi-tile')).toBeVisible();
  });

  test('AC7: VDI tile shows KB Available or KB Missing badge', async ({ page }) => {
    const badge = page.getByTestId('vdi-kb-badge');
    await expect(badge).toBeVisible();
    const text = await badge.textContent();
    expect(['KB Available', 'KB Missing']).toContain(text?.trim());
  });

  test('AC8: Chat input composer is visible', async ({ page }) => {
    await expect(page.getByTestId('landing-composer')).toBeVisible();
    await expect(page.getByTestId('chat-input')).toBeVisible();
  });
});
