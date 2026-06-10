// Ticket: NEWTE-4
import { test, expect } from '@playwright/test';
import { loginAs, ensureUserExists } from './helpers';

test.describe('NEWTE-4: Knowledge Base Management and Retrieval', () => {
  test.beforeEach(async ({ page, request }) => {
    await ensureUserExists(request);
    await loginAs(page);
  });

  test('AC3: VDI tile KB status badge reflects vdi.md presence via /api/kb', async ({ page }) => {
    const res = await page.request.get('/api/kb');
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(['available', 'missing']).toContain(data.vdi);
  });

  test('AC3b: VDI tile displays correct KB status badge text', async ({ page }) => {
    const badge = page.getByTestId('vdi-kb-badge');
    await expect(badge).toBeVisible();
    const text = await badge.textContent();
    expect(['KB Available', 'KB Missing']).toContain(text?.trim());
  });

  test('AC1: KB endpoint is accessible and returns data', async ({ page }) => {
    const res = await page.request.get('/api/kb');
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty('vdi');
  });
});
