import { Page } from '@playwright/test';

export const TEST_USER = {
  email: 'testuser_e2e@discounttire.com',
  password: 'TestPassword123!',
  username: 'testuser_e2e',
};

export async function loginAs(page: Page, email = TEST_USER.email, password = TEST_USER.password) {
  await page.goto('/login');
  await page.getByTestId('login-email-input').fill(email);
  await page.getByTestId('login-password-input').fill(password);
  await page.getByTestId('login-submit-btn').click();
  await page.waitForURL('/', { timeout: 10000 });
}

export async function ensureUserExists(request: import('@playwright/test').APIRequestContext) {
  await request.post('/api/auth/signup', {
    data: { username: TEST_USER.username, email: TEST_USER.email, password: TEST_USER.password },
  });
}
