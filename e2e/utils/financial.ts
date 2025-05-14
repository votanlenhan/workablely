import { Page } from '@playwright/test';

interface ShowData {
  totalPrice: number;
  depositAmount: number;
  depositDate: string;
}

interface PaymentData {
  amount: number;
  date: string;
}

interface WishlistExpenseData {
  amount: number;
  description: string;
  date: string;
}

interface ExternalIncomeData {
  amount: number;
  description: string;
  date: string;
}

export async function createShow(page: Page, data: ShowData) {
  await page.goto('/shows/new');
  
  // Fill in show details
  await page.fill('[data-testid="total-price"]', data.totalPrice.toString());
  await page.fill('[data-testid="deposit-amount"]', data.depositAmount.toString());
  await page.fill('[data-testid="deposit-date"]', data.depositDate);
  
  // Save show
  await page.click('[data-testid="save-show"]');
  
  // Wait for redirect and get show ID
  await page.waitForURL('/shows/*');
  const showId = page.url().split('/').pop();
  
  return { id: showId };
}

export async function createPayment(page: Page, showId: string, data: PaymentData) {
  await page.goto(`/shows/${showId}/payments/new`);
  
  // Fill in payment details
  await page.fill('[data-testid="payment-amount"]', data.amount.toString());
  await page.fill('[data-testid="payment-date"]', data.date);
  
  // Save payment
  await page.click('[data-testid="save-payment"]');
  
  // Wait for redirect
  await page.waitForURL(`/shows/${showId}/payments`);
}

export async function createWishlistExpense(page: Page, data: WishlistExpenseData) {
  await page.goto('/financial/wishlist/expenses/new');
  
  // Fill in expense details
  await page.fill('[data-testid="expense-amount"]', data.amount.toString());
  await page.fill('[data-testid="expense-description"]', data.description);
  await page.fill('[data-testid="expense-date"]', data.date);
  
  // Save expense
  await page.click('[data-testid="save-expense"]');
  
  // Wait for redirect
  await page.waitForURL('/financial/wishlist/expenses');
}

export async function createExternalIncome(page: Page, data: ExternalIncomeData) {
  await page.goto('/financial/external-income/new');
  
  // Fill in income details
  await page.fill('[data-testid="income-amount"]', data.amount.toString());
  await page.fill('[data-testid="income-description"]', data.description);
  await page.fill('[data-testid="income-date"]', data.date);
  
  // Save income
  await page.click('[data-testid="save-income"]');
  
  // Wait for redirect
  await page.waitForURL('/financial/external-income');
} 