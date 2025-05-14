import { test, expect, Page } from '@playwright/test';
import { loginAs } from './utils/auth';
// import { RoleName } from '../api/src/modules/roles/entities/role.entity'; // Temporarily commented out due to Playwright global setup TypeError
import { createShow, createPayment, createWishlistExpense, createExternalIncome } from './utils/financial';

// Skip the entire describe block if all tests within are to be skipped
test.describe.skip('Dashboard Statistics', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, RoleName.MANAGER);
  });

  test('should display correct monthly statistics', async ({ page }) => {
    // Create test data for current month
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

    // Create Wishlist expenses
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

    // Navigate to dashboard
    await page.goto('/dashboard');
    
    // Select period (current month)
    await page.selectOption('select[name="period"]', 'current-month');
    
    // Verify dashboard statistics
    await expect(page.locator('[data-testid="opening-balance"]')).toContainText('0');
    await expect(page.locator('[data-testid="total-revenue"]')).toContainText('25,000,000');
    await expect(page.locator('[data-testid="total-collected"]')).toContainText('15,500,000');
    await expect(page.locator('[data-testid="total-due"]')).toContainText('9,500,000');
    await expect(page.locator('[data-testid="salary-allocations"]')).toContainText('8,750,000');
    await expect(page.locator('[data-testid="wishlist-contributions"]')).toContainText('5,000,000');
    await expect(page.locator('[data-testid="net-profit"]')).toContainText('11,250,000');
    await expect(page.locator('[data-testid="wishlist-expenses"]')).toContainText('2,000,000');
    await expect(page.locator('[data-testid="external-income"]')).toContainText('1,000,000');
  });

  test('should display correct quarterly statistics', async ({ page }) => {
    // Create test data for current quarter
    const show1 = await createShow(page, {
      totalPrice: 20000000,
      depositAmount: 10000000,
      depositDate: new Date().toISOString(),
    });

    const show2 = await createShow(page, {
      totalPrice: 30000000,
      depositAmount: 15000000,
      depositDate: new Date().toISOString(),
    });

    // Create additional payments
    await createPayment(page, show1.id, {
      amount: 5000000,
      date: new Date().toISOString(),
    });

    // Create Wishlist expenses
    await createWishlistExpense(page, {
      amount: 5000000,
      description: 'Major equipment purchase',
      date: new Date().toISOString(),
    });

    // Create external income
    await createExternalIncome(page, {
      amount: 3000000,
      description: 'Multiple equipment rentals',
      date: new Date().toISOString(),
    });

    // Navigate to dashboard
    await page.goto('/dashboard');
    
    // Select period (current quarter)
    await page.selectOption('select[name="period"]', 'current-quarter');
    
    // Verify dashboard statistics
    await expect(page.locator('[data-testid="opening-balance"]')).toContainText('0');
    await expect(page.locator('[data-testid="total-revenue"]')).toContainText('50,000,000');
    await expect(page.locator('[data-testid="total-collected"]')).toContainText('30,000,000');
    await expect(page.locator('[data-testid="total-due"]')).toContainText('20,000,000');
    await expect(page.locator('[data-testid="salary-allocations"]')).toContainText('17,500,000');
    await expect(page.locator('[data-testid="wishlist-contributions"]')).toContainText('10,000,000');
    await expect(page.locator('[data-testid="net-profit"]')).toContainText('22,500,000');
    await expect(page.locator('[data-testid="wishlist-expenses"]')).toContainText('5,000,000');
    await expect(page.locator('[data-testid="external-income"]')).toContainText('3,000,000');
  });

  test('should display correct yearly statistics', async ({ page }) => {
    // Create test data for current year
    const show1 = await createShow(page, {
      totalPrice: 50000000,
      depositAmount: 25000000,
      depositDate: new Date().toISOString(),
    });

    const show2 = await createShow(page, {
      totalPrice: 75000000,
      depositAmount: 37500000,
      depositDate: new Date().toISOString(),
    });

    // Create additional payments
    await createPayment(page, show1.id, {
      amount: 15000000,
      date: new Date().toISOString(),
    });

    // Create Wishlist expenses
    await createWishlistExpense(page, {
      amount: 15000000,
      description: 'Annual equipment upgrade',
      date: new Date().toISOString(),
    });

    // Create external income
    await createExternalIncome(page, {
      amount: 10000000,
      description: 'Yearly equipment rentals',
      date: new Date().toISOString(),
    });

    // Navigate to dashboard
    await page.goto('/dashboard');
    
    // Select period (current year)
    await page.selectOption('select[name="period"]', 'current-year');
    
    // Verify dashboard statistics
    await expect(page.locator('[data-testid="opening-balance"]')).toContainText('0');
    await expect(page.locator('[data-testid="total-revenue"]')).toContainText('125,000,000');
    await expect(page.locator('[data-testid="total-collected"]')).toContainText('77,500,000');
    await expect(page.locator('[data-testid="total-due"]')).toContainText('47,500,000');
    await expect(page.locator('[data-testid="salary-allocations"]')).toContainText('43,750,000');
    await expect(page.locator('[data-testid="wishlist-contributions"]')).toContainText('25,000,000');
    await expect(page.locator('[data-testid="net-profit"]')).toContainText('56,250,000');
    await expect(page.locator('[data-testid="wishlist-expenses"]')).toContainText('15,000,000');
    await expect(page.locator('[data-testid="external-income"]')).toContainText('10,000,000');
  });
}); 