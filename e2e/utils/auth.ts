import { Page } from '@playwright/test';

export async function loginAsManager(page: Page) {
  await page.goto('/login');
  await page.fill('[data-testid="email"]', 'manager@example.com');
  await page.fill('[data-testid="password"]', 'password123');
  await page.click('[data-testid="login-button"]');
  await page.waitForURL('/dashboard');
}

export async function loginAsAdmin(page: Page) {
  await page.goto('/login');
  await page.fill('[data-testid="email"]', 'admin@example.com');
  await page.fill('[data-testid="password"]', 'password123');
  await page.click('[data-testid="login-button"]');
  await page.waitForURL('/dashboard');
} 