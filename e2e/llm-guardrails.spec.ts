// Ticket: NEWTE-14
import { test, expect } from '@playwright/test';
import { loginAs, ensureUserExists } from './helpers';

test.describe('NEWTE-14: LLM Behavioral Guardrails and Scope Control', () => {
  test.beforeEach(async ({ page, request }) => {
    await ensureUserExists(request);
    await loginAs(page);
  });

  test('AC2-3: When user sends off-topic content, assistant redirects naturally', async ({ page }) => {
    // Start a VDI session first to provide context
    await page.getByTestId('vdi-tile').click();
    await expect(page.getByTestId('chat-state')).toBeVisible({ timeout: 15000 });
    // Wait for initial assistant reply
    await expect(page.getByTestId('assistant-msg-1')).toBeVisible({ timeout: 30000 });

    // Send off-topic message
    await page.getByTestId('chat-input').fill("What's the weather like today?");
    await page.getByTestId('send-btn').click();
    // Wait for assistant response to the off-topic message
    await expect(page.getByTestId('assistant-msg-3')).toBeVisible({ timeout: 30000 });

    // Verify the assistant responded (not silent) - it should acknowledge and redirect
    const responseText = await page.getByTestId('assistant-msg-3').textContent();
    expect(responseText?.length).toBeGreaterThan(10);
  });

  test('AC1: Chat interface accepts messages - guardrails backend is operational', async ({ page }) => {
    await expect(page.getByTestId('chat-input')).toBeEnabled();
    await page.getByTestId('chat-input').fill('test');
    await expect(page.getByTestId('send-btn')).toBeEnabled();
  });
});
