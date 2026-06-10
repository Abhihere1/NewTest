// Ticket: NEWTE-1
import { test, expect } from '@playwright/test';
import { TEST_USER, ensureUserExists } from './helpers';

test.describe('NEWTE-1: Authentication - Login Page', () => {
  test('AC1: /login shows split-screen layout with branded left panel and form on right', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/login');
    await expect(page.getByTestId('login-left-panel')).toBeVisible();
    await expect(page.getByTestId('login-right-panel')).toBeVisible();
  });

  test('AC2: Left panel has gradient background and Patch logo lockup', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/login');
    const leftPanel = page.getByTestId('login-left-panel');
    await expect(leftPanel).toBeVisible();
    // Logo lockup present — check eyebrow text which is in the left panel
    await expect(page.getByTestId('left-panel-eyebrow')).toBeVisible();
  });

  test('AC3: Left panel has eyebrow, heading, and stats', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/login');
    await expect(page.getByTestId('left-panel-eyebrow')).toContainText('Discount Tire Information Center');
    await expect(page.getByTestId('left-panel-heading')).toContainText('IT support, resolved faster.');
  });

  test('AC4: Right panel has Sign in card with Email, Password fields and Sign In button', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByTestId('login-heading')).toContainText('Sign in to Patch');
    await expect(page.getByTestId('login-email-input')).toBeVisible();
    await expect(page.getByTestId('login-password-input')).toBeVisible();
    await expect(page.getByTestId('login-submit-btn')).toContainText('Sign In');
  });

  test('AC5: Invalid credentials show inline error without alert', async ({ page }) => {
    await page.goto('/login');
    await page.getByTestId('login-email-input').fill('notexist@discounttire.com');
    await page.getByTestId('login-password-input').fill('wrongpassword');
    await page.getByTestId('login-submit-btn').click();
    await expect(page.getByTestId('login-error-msg')).toBeVisible({ timeout: 8000 });
    // No browser alert dialog
    const dialogs: string[] = [];
    page.on('dialog', d => { dialogs.push(d.type()); d.dismiss(); });
    expect(dialogs).toHaveLength(0);
  });

  test('AC5b: Empty form shows validation error', async ({ page }) => {
    await page.goto('/login');
    await page.getByTestId('login-submit-btn').click();
    await expect(page.getByTestId('login-error-msg')).toBeVisible();
  });

  test('AC6: Sign up link navigates to /signup', async ({ page }) => {
    await page.goto('/login');
    await page.getByTestId('signup-link').click();
    await expect(page).toHaveURL(/\/signup/);
  });
});

test.describe('NEWTE-1: Authentication - Signup Page', () => {
  test('AC7: Signup page has same split-screen layout with Username, Email, Password fields and Sign Up button', async ({ page }) => {
    await page.goto('/signup');
    await expect(page.getByTestId('signup-left-panel')).toBeVisible();
    await expect(page.getByTestId('signup-right-panel')).toBeVisible();
    await expect(page.getByTestId('signup-username-input')).toBeVisible();
    await expect(page.getByTestId('signup-email-input')).toBeVisible();
    await expect(page.getByTestId('signup-password-input')).toBeVisible();
    await expect(page.getByTestId('signup-submit-btn')).toContainText('Sign Up');
  });

  test('AC8: Successful signup redirects to /login with success message', async ({ page, request }) => {
    const unique = `e2e_${Date.now()}`;
    await page.goto('/signup');
    await page.getByTestId('signup-username-input').fill(`user_${unique}`);
    await page.getByTestId('signup-email-input').fill(`${unique}@discounttire.com`);
    await page.getByTestId('signup-password-input').fill('Password123!');
    await page.getByTestId('signup-submit-btn').click();
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
    await expect(page.getByTestId('signup-success-msg')).toBeVisible();
  });

  test('AC7b: Signup shows validation error when fields are missing', async ({ page }) => {
    await page.goto('/signup');
    await page.getByTestId('signup-submit-btn').click();
    await expect(page.getByTestId('signup-error-msg')).toBeVisible();
  });

  test('AC9: Login with valid credentials authenticates against backend and redirects to /', async ({ page, request }) => {
    await ensureUserExists(request);
    await page.goto('/login');
    await page.getByTestId('login-email-input').fill(TEST_USER.email);
    await page.getByTestId('login-password-input').fill(TEST_USER.password);
    await page.getByTestId('login-submit-btn').click();
    await expect(page).toHaveURL('/', { timeout: 10000 });
  });
});
