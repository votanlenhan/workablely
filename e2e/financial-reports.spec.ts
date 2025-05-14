import { test, expect } from '@playwright/test';
import { loginAsManager, loginAsAdmin } from './utils/auth';
import { createShow, createPayment, createWishlistExpense, createExternalIncome } from './utils/financial';

test.describe.skip('Financial Reports', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsManager(page);
  });

  test('should display correct financial summary for a period', async ({ page }) => {
    // Create test data
    const show1 = await createShow(page, {
      totalPrice: 10000000,
      depositAmount: 5000000,
      depositDate: new Date().toISOString(),
    });

    const show2 = await createShow(page, {
      totalPrice: 15000000,
      depositAmount: 7500000,
      depositDate: new Date().toISOString(),
    });

    // Create additional payments
    await createPayment(page, show1.id, {
      amount: 3000000,
      date: new Date().toISOString(),
    });

    // Create Wishlist expense
    await createWishlistExpense(page, {
      amount: 2000000,
      description: 'Equipment purchase',
      date: new Date().toISOString(),
    });

    // Create external income
    await createExternalIncome(page, {
      amount: 1000000,
      description: 'Equipment rental',
      date: new Date().toISOString(),
    });

    // Navigate to financial reports
    await page.goto('/financial/reports');
    
    // Select period (current month)
    await page.selectOption('select[name="period"]', 'current-month');
    
    // Verify financial summary
    await expect(page.locator('[data-testid="total-revenue"]')).toContainText('25,000,000');
    await expect(page.locator('[data-testid="total-collected"]')).toContainText('15,500,000');
    await expect(page.locator('[data-testid="total-due"]')).toContainText('9,500,000');
    await expect(page.locator('[data-testid="wishlist-expenses"]')).toContainText('2,000,000');
    await expect(page.locator('[data-testid="external-income"]')).toContainText('1,000,000');
  });

  test('should display correct member income report', async ({ page }) => {
    // Create test data with member assignments
    const show = await createShow(page, {
      totalPrice: 10000000,
      depositAmount: 5000000,
      depositDate: new Date().toISOString(),
    });

    // Assign members to show
    await page.goto(`/shows/${show.id}/assignments`);
    await page.click('[data-testid="assign-key"]');
    await page.selectOption('select[name="member"]', 'photographer1');
    await page.click('[data-testid="save-assignment"]');

    await page.click('[data-testid="assign-support"]');
    await page.selectOption('select[name="member"]', 'photographer2');
    await page.click('[data-testid="save-assignment"]');

    // Navigate to member income report
    await page.goto('/financial/member-income');
    
    // Select period
    await page.selectOption('select[name="period"]', 'current-month');
    
    // Verify member income
    await expect(page.locator('[data-testid="member-income-photographer1"]')).toContainText('3,500,000');
    await expect(page.locator('[data-testid="member-income-photographer2"]')).toContainText('3,500,000');
  });

  test('should display correct wishlist fund report', async ({ page }) => {
    // Create test data
    const show = await createShow(page, {
      totalPrice: 10000000,
      depositAmount: 5000000,
      depositDate: new Date().toISOString(),
    });

    // Create Wishlist expenses
    await createWishlistExpense(page, {
      amount: 1000000,
      description: 'Equipment purchase 1',
      date: new Date().toISOString(),
    });

    await createWishlistExpense(page, {
      amount: 1500000,
      description: 'Equipment purchase 2',
      date: new Date().toISOString(),
    });

    // Navigate to wishlist fund report
    await page.goto('/financial/wishlist');
    
    // Select period
    await page.selectOption('select[name="period"]', 'current-month');
    
    // Verify wishlist fund report
    await expect(page.locator('[data-testid="wishlist-contributions"]')).toContainText('2,000,000');
    await expect(page.locator('[data-testid="wishlist-expenses"]')).toContainText('2,500,000');
    await expect(page.locator('[data-testid="wishlist-balance"]')).toContainText('-500,000');
  });

  test('should display correct external income report', async ({ page }) => {
    // Create test data
    await createExternalIncome(page, {
      amount: 1000000,
      description: 'Equipment rental 1',
      date: new Date().toISOString(),
    });

    await createExternalIncome(page, {
      amount: 2000000,
      description: 'Equipment rental 2',
      date: new Date().toISOString(),
    });

    // Navigate to external income report
    await page.goto('/financial/external-income');
    
    // Select period
    await page.selectOption('select[name="period"]', 'current-month');
    
    // Verify external income report
    await expect(page.locator('[data-testid="total-external-income"]')).toContainText('3,000,000');
    await expect(page.locator('[data-testid="income-count"]')).toContainText('2');
  });
}); 