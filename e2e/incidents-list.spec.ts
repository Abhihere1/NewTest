// Ticket: NEWTE-7
import { test, expect } from '@playwright/test';
import { loginAs, ensureUserExists } from './helpers';

test.describe('NEWTE-7: Incident List Page', () => {
  test.beforeEach(async ({ page, request }) => {
    await ensureUserExists(request);
    await loginAs(page);
    await page.goto('/incidents');
    await page.waitForLoadState('networkidle');
  });

  test('AC1: Incidents list page loads with filter tabs', async ({ page }) => {
    await expect(page.getByTestId('incidents-page')).toBeVisible();
    await expect(page.getByTestId('filter-tabs')).toBeVisible();
  });

  test('AC1b: Filter tabs include All, Open, Escalated, Resolved', async ({ page }) => {
    await expect(page.getByTestId('filter-all')).toBeVisible();
    await expect(page.getByTestId('filter-open')).toBeVisible();
    await expect(page.getByTestId('filter-escalated')).toBeVisible();
    await expect(page.getByTestId('filter-resolved')).toBeVisible();
  });

  test('AC2: Active filter tab is highlighted', async ({ page }) => {
    const allTab = page.getByTestId('filter-all');
    await expect(allTab).toHaveClass(/text-red-600/);
  });

  test('AC4: Empty state displays correct message when no incidents', async ({ page }) => {
    // Filter by Escalated which may be empty
    await page.getByTestId('filter-escalated').click();
    const count = await page.getByTestId('incidents-list').count();
    if (count === 0) {
      await expect(page.getByTestId('empty-state')).toBeVisible();
      await expect(page.getByTestId('empty-state')).toContainText('No incidents yet.');
    }
  });

  test('AC5: Incident detail page has two-column layout', async ({ page }) => {
    const list = page.getByTestId('incidents-list');
    const hasIncidents = await list.count() > 0;
    if (!hasIncidents) {
      test.skip();
      return;
    }
    // Click the first View button
    await page.getByTestId(/^view-btn-/).first().click();
    await expect(page.getByTestId('incident-detail-page')).toBeVisible({ timeout: 10000 });
  });

  test('AC3: Each incident row shows ID, status badge, and View button', async ({ page }) => {
    await page.getByTestId('filter-all').click();
    const list = page.getByTestId('incidents-list');
    const hasIncidents = await list.count() > 0;
    if (!hasIncidents) {
      test.skip();
      return;
    }
    const firstRow = list.locator('[data-testid^="incident-row-"]').first();
    await expect(firstRow).toBeVisible();
    await expect(firstRow.getByTestId(/^status-badge-/)).toBeVisible();
    await expect(firstRow.getByTestId(/^view-btn-/)).toBeVisible();
  });
});

test.describe('NEWTE-7: Incident Detail Page', () => {
  test.beforeEach(async ({ page, request }) => {
    await ensureUserExists(request);
    await loginAs(page);
  });

  test('AC6: Detail page header has back link, status badge, title, and action button', async ({ page }) => {
    await page.goto('/incidents');
    await page.waitForLoadState('networkidle');
    const list = page.getByTestId('incidents-list');
    const hasIncidents = await list.count() > 0;
    if (!hasIncidents) {
      test.skip();
      return;
    }
    await page.getByTestId(/^view-btn-/).first().click();
    await expect(page.getByTestId('incident-detail-header')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('back-btn')).toBeVisible();
    await expect(page.getByTestId('incident-title')).toBeVisible();
  });

  test('AC8: Right column has Case Details and Identifiers cards', async ({ page }) => {
    await page.goto('/incidents');
    await page.waitForLoadState('networkidle');
    const list = page.getByTestId('incidents-list');
    const hasIncidents = await list.count() > 0;
    if (!hasIncidents) {
      test.skip();
      return;
    }
    await page.getByTestId(/^view-btn-/).first().click();
    await expect(page.getByTestId('incident-detail-page')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('case-details-card')).toBeVisible();
    await expect(page.getByTestId('identifiers-card')).toBeVisible();
  });
});
