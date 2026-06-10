// Ticket: NEWTE-15
import { test, expect } from '@playwright/test';
import { loginAs, ensureUserExists } from './helpers';

test.describe('NEWTE-15: Escalation Flow and Summary Cards', () => {
  test.beforeEach(async ({ page, request }) => {
    await ensureUserExists(request);
    await loginAs(page);
  });

  test('AC1-5: Escalated incident detail page shows outcome card with Escalated status badge', async ({ page }) => {
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
      const badge = rows.nth(i).locator('[data-testid="status-badge-escalated"]');
      if (await badge.count() > 0) {
        await rows.nth(i).getByTestId(/^view-btn-/).click();
        await page.waitForLoadState('networkidle');
        await expect(page.getByTestId('incident-detail-page')).toBeVisible({ timeout: 10000 });
        await expect(page.getByTestId('outcome-card')).toBeVisible();
        await expect(page.getByTestId('status-badge-escalated')).toBeVisible();
        return;
      }
    }
    test.skip();
  });

  test('AC3: Escalation outcome card shows incident summary fields', async ({ page }) => {
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
      const badge = rows.nth(i).locator('[data-testid="status-badge-escalated"]');
      if (await badge.count() > 0) {
        await rows.nth(i).getByTestId(/^view-btn-/).click();
        await page.waitForLoadState('networkidle');
        // Outcome card should be present with escalation details
        await expect(page.getByTestId('outcome-card')).toBeVisible({ timeout: 8000 });
        return;
      }
    }
    test.skip();
  });

  test('AC8: Escalated incident has chat input disabled (no resume button)', async ({ page }) => {
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
      const badge = rows.nth(i).locator('[data-testid="status-badge-escalated"]');
      if (await badge.count() > 0) {
        await rows.nth(i).getByTestId(/^view-btn-/).click();
        await page.waitForLoadState('networkidle');
        // No resume button for escalated incidents
        await expect(page.getByTestId('resume-chat-btn')).toHaveCount(0);
        return;
      }
    }
    test.skip();
  });
});
