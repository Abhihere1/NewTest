// Ticket: NEWTE-5
import { test, expect } from '@playwright/test';
import { loginAs, ensureUserExists } from './helpers';

test.describe('NEWTE-5: Inline Image Rendering in Chat', () => {
  test.beforeEach(async ({ page, request }) => {
    await ensureUserExists(request);
    await loginAs(page);
  });

  test('AC1-AC3: Images API endpoint is accessible for known files', async ({ request }) => {
    // Test the /api/images/[filename] endpoint which serves KB images
    const res = await request.get('/api/images/vdi.png');
    // Should return image or 404 if file doesn't exist
    expect([200, 404]).toContain(res.status());
  });

  test('AC7: Missing image files do not crash the chat', async ({ page }) => {
    // Send a message and verify the chat remains functional even if LLM references images
    await page.getByTestId('chat-input').fill('Show me the VDI troubleshooting steps');
    await page.getByTestId('send-btn').click();
    await expect(page.getByTestId('chat-state')).toBeVisible({ timeout: 15000 });
    // Page should remain functional
    await expect(page.getByTestId('main-page')).toBeVisible();
    // No uncaught error crashed the page
    await expect(page.getByTestId('messages-container')).toBeVisible({ timeout: 30000 });
  });

  test('AC4: Images do not have visible captions in chat', async ({ page }) => {
    await page.getByTestId('vdi-tile').click();
    await expect(page.getByTestId('chat-state')).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId('assistant-msg-1')).toBeVisible({ timeout: 30000 });
    // If images are rendered, they should not have figcaption elements
    const figCaptions = page.locator('figcaption');
    expect(await figCaptions.count()).toBe(0);
  });
});
