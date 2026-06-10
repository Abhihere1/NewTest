// Ticket: NEWTE-6
import { test, expect } from '@playwright/test';
import { loginAs, ensureUserExists } from './helpers';

test.describe('NEWTE-6: MongoDB Persistence for Incidents', () => {
  test.beforeEach(async ({ page, request }) => {
    await ensureUserExists(request);
    await loginAs(page);
  });

  test('AC1: Chat session creates a record in the Patch Transactions collection (via /api/incidents)', async ({ page }) => {
    // Get initial count using the page's authenticated context
    const beforeRes = await page.request.get('/api/incidents');
    const beforeData = await beforeRes.json();
    const beforeCount = beforeData.incidents?.length || 0;

    // Send a message to create an incident
    await page.getByTestId('chat-input').fill('I need help with my VDI connection');
    await page.getByTestId('send-btn').click();
    await expect(page.getByTestId('chat-state')).toBeVisible({ timeout: 15000 });
    // Wait for the incident header which shows incident ID
    await expect(page.getByTestId('incident-header')).toBeVisible({ timeout: 15000 });

    // Verify count increased
    const afterRes = await page.request.get('/api/incidents');
    const afterData = await afterRes.json();
    const afterCount = afterData.incidents?.length || 0;
    expect(afterCount).toBeGreaterThan(beforeCount);
  });

  test('AC2: Incident record has status field', async ({ page }) => {
    const res = await page.request.get('/api/incidents');
    const data = await res.json();
    const incidents = data.incidents || [];
    if (incidents.length === 0) {
      test.skip();
      return;
    }
    const incident = incidents[0];
    expect(['Open', 'Escalated', 'Resolved']).toContain(incident.status);
  });

  test('AC7: Incident status is one of Open, Escalated, or Resolved', async ({ page }) => {
    const res = await page.request.get('/api/incidents');
    const data = await res.json();
    for (const inc of data.incidents || []) {
      expect(['Open', 'Escalated', 'Resolved']).toContain(inc.status);
    }
  });
});
