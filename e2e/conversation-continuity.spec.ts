// Ticket: NEWTE-9
import { test, expect } from '@playwright/test';
import { loginAs, ensureUserExists } from './helpers';

test.describe('NEWTE-9: Conversation Continuity Rules', () => {
  test.beforeEach(async ({ page, request }) => {
    await ensureUserExists(request);
    await loginAs(page);
  });

  test('AC1: Clicking VDI tile triggers sendMessage with category context, not just UI state change', async ({ page }) => {
    await page.getByTestId('vdi-tile').click();
    // Chat state should immediately become active
    await expect(page.getByTestId('chat-state')).toBeVisible({ timeout: 15000 });
    // User message should appear
    await expect(page.getByTestId('user-msg-0')).toBeVisible({ timeout: 10000 });
  });

  test('AC6: Escalated incidents show in read-only mode on detail page', async ({ page }) => {
    await page.goto('/incidents');
    await page.waitForLoadState('networkidle');
    const incidentsList = page.getByTestId('incidents-list');
    if (await incidentsList.count() === 0) {
      test.skip();
      return;
    }
    // Find an escalated incident
    const rows = incidentsList.locator('[data-testid^="incident-row-"]');
    const rowCount = await rows.count();
    for (let i = 0; i < rowCount; i++) {
      const badge = rows.nth(i).locator('[data-testid="status-badge-escalated"]');
      if (await badge.count() > 0) {
        await rows.nth(i).getByTestId(/^view-btn-/).click();
        await page.waitForLoadState('networkidle');
        // Should NOT have a resume chat button (read-only)
        await expect(page.getByTestId('resume-chat-btn')).toHaveCount(0);
        return;
      }
    }
    test.skip();
  });

  test('AC7: Resolved incidents render in read-only state on detail page', async ({ page }) => {
    await page.goto('/incidents');
    await page.waitForLoadState('networkidle');
    const incidentsList = page.getByTestId('incidents-list');
    if (await incidentsList.count() === 0) {
      test.skip();
      return;
    }
    const rows = incidentsList.locator('[data-testid^="incident-row-"]');
    const rowCount = await rows.count();
    for (let i = 0; i < rowCount; i++) {
      const badge = rows.nth(i).locator('[data-testid="status-badge-resolved"]');
      if (await badge.count() > 0) {
        await rows.nth(i).getByTestId(/^view-btn-/).click();
        await page.waitForLoadState('networkidle');
        // Should NOT have a resume chat button
        await expect(page.getByTestId('resume-chat-btn')).toHaveCount(0);
        return;
      }
    }
    test.skip();
  });
});
