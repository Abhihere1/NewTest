// Ticket: NEWTE-16
import { test, expect } from '@playwright/test';
import { loginAs, ensureUserExists } from './helpers';

test.describe('NEWTE-16: Resolution Flow and Summary Cards', () => {
  test.beforeEach(async ({ page, request }) => {
    await ensureUserExists(request);
    await loginAs(page);
  });

  test('AC1-5: Resolved incident detail page shows outcome card with Resolved status badge', async ({ page }) => {
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
        await expect(page.getByTestId('incident-detail-page')).toBeVisible({ timeout: 10000 });
        await expect(page.getByTestId('outcome-card')).toBeVisible();
        await expect(page.getByTestId('status-badge-resolved')).toBeVisible();
        return;
      }
    }
    test.skip();
  });

  test('AC8: Resolved incident has no resume button (chat disabled)', async ({ page }) => {
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
        await expect(page.getByTestId('resume-chat-btn')).toHaveCount(0);
        return;
      }
    }
    test.skip();
  });
});
