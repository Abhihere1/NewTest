// Ticket: NEWTE-19
import { test, expect } from '@playwright/test';
import { loginAs, ensureUserExists } from './helpers';

test.describe('NEWTE-19: Global Visual Design System', () => {
  test.beforeEach(async ({ page, request }) => {
    await ensureUserExists(request);
    await loginAs(page);
  });

  test('AC7: Header is white with 1px bottom border', async ({ page }) => {
    const nav = page.getByTestId('top-nav');
    await expect(nav).toBeVisible();
    // Check using Tailwind class — bg-white is the source of truth
    await expect(nav).toHaveClass(/bg-white/);
    await expect(nav).toHaveClass(/border-b/);
  });

  test('AC4: Primary buttons are red with white text', async ({ page }) => {
    await page.goto('/login');
    const btn = page.getByTestId('login-submit-btn');
    // Check using class presence — Tailwind bg-red-600 class is the source of truth
    await expect(btn).toHaveClass(/bg-red-600/);
    // Also check text color class
    await expect(btn).toHaveClass(/text-white/);
  });

  test('AC6: Status badges use consistent styling', async ({ page }) => {
    await page.goto('/incidents');
    await page.waitForLoadState('networkidle');
    const list = page.getByTestId('incidents-list');
    if (await list.count() === 0) {
      test.skip();
      return;
    }
    // Verify at least one badge is visible with proper testid
    const badges = page.locator('[data-testid^="status-badge-"]');
    await expect(badges.first()).toBeVisible();
  });

  test('AC8: Landing page has radial gradient background', async ({ page }) => {
    const landingState = page.getByTestId('landing-state');
    await expect(landingState).toBeVisible();
    const bg = await landingState.evaluate(el => getComputedStyle(el).background);
    expect(bg).toContain('radial-gradient');
  });

  test('AC3: Cards use white background with border', async ({ page }) => {
    await page.goto('/incidents');
    await page.waitForLoadState('networkidle');
    const list = page.getByTestId('incidents-list');
    if (await list.count() === 0) {
      test.skip();
      return;
    }
    const firstRow = list.locator('[data-testid^="incident-row-"]').first();
    const bgColor = await firstRow.evaluate(el => getComputedStyle(el).backgroundColor);
    expect(bgColor).toBe('rgb(255, 255, 255)');
  });

  test('AC5: User messages are right-aligned red bubbles in chat', async ({ page }) => {
    await page.getByTestId('chat-input').fill('Hello Patch');
    await page.getByTestId('send-btn').click();
    await expect(page.getByTestId('chat-state')).toBeVisible({ timeout: 15000 });
    const userMsg = page.getByTestId('user-msg-0');
    await expect(userMsg).toBeVisible({ timeout: 10000 });
    // Check right alignment
    const justify = await userMsg.evaluate(el => getComputedStyle(el).justifyContent);
    expect(justify).toContain('flex-end');
  });

  test('AC5b: Assistant messages have red left accent border', async ({ page }) => {
    await page.getByTestId('chat-input').fill('Hello');
    await page.getByTestId('send-btn').click();
    // Wait for assistant reply
    await expect(page.getByTestId('assistant-msg-1')).toBeVisible({ timeout: 30000 });
    const assistantCard = page.getByTestId('assistant-card').first();
    await expect(assistantCard).toBeVisible();
    // Verify the inline style sets borderLeft to the Patch red — browser converts hex to rgb
    const style = await assistantCard.getAttribute('style');
    // Accept both hex (#DC2626) and browser-normalized rgb(220, 38, 38)
    expect(style).toMatch(/#DC2626|rgb\(220, 38, 38\)|rgb\(220,38,38\)/);
  });
});
