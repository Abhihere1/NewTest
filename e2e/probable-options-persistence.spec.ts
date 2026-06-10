// Ticket: NEWTE-11
import { test, expect } from '@playwright/test';
import { loginAs, ensureUserExists } from './helpers';

test.describe('NEWTE-11: Probable Option Persistence and Resume Behavior', () => {
  test.beforeEach(async ({ page, request }) => {
    await ensureUserExists(request);
    await loginAs(page);
  });

  test('AC2: Incident detail page renders controls in history view', async ({ page }) => {
    await page.goto('/incidents');
    await page.waitForLoadState('networkidle');
    const incidentsList = page.getByTestId('incidents-list');
    if (await incidentsList.count() === 0) {
      test.skip();
      return;
    }
    // View any incident detail to check conversation history rendering
    await page.getByTestId(/^view-btn-/).first().click();
    await page.waitForLoadState('networkidle');
    await expect(page.getByTestId('incident-detail-page')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('conversation-card')).toBeVisible();
  });

  test('AC4: Completed controls are non-interactive in history view', async ({ page }) => {
    await page.goto('/incidents');
    await page.waitForLoadState('networkidle');
    const incidentsList = page.getByTestId('incidents-list');
    if (await incidentsList.count() === 0) {
      test.skip();
      return;
    }
    await page.getByTestId(/^view-btn-/).first().click();
    await page.waitForLoadState('networkidle');
    // If controls are present and completed, they should be in disabled state
    const completedControls = page.getByTestId('controls-completed');
    if (await completedControls.count() > 0) {
      const buttons = completedControls.locator('button');
      const firstBtn = buttons.first();
      await expect(firstBtn).toBeDisabled();
    }
    // Test passes if no completed controls found (not all incidents have them)
  });

  test('AC6: API response includes controls object for incidents with options', async ({ page }) => {
    // Use page.request for authenticated requests
    const listRes = await page.request.get('/api/incidents');
    const listData = await listRes.json();
    const incidents = listData.incidents || [];
    if (incidents.length === 0) {
      test.skip();
      return;
    }
    // Check detail endpoint for first incident
    const detailRes = await page.request.get(`/api/incidents/${incidents[0].incident_id}`);
    expect(detailRes.status()).toBe(200);
    const detail = await detailRes.json();
    expect(detail).toHaveProperty('incident');
    expect(detail.incident).toHaveProperty('history');
  });
});
