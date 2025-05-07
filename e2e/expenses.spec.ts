import 'reflect-metadata'; // For TypeORM decorators
import { test, expect, APIRequestContext } from '@playwright/test';
// import { generateRandomUser, generateRandomString } from './utils/random-helpers'; // Replaced by standardized helper
import { createRandomUser, UserData } from './utils/user-helpers';
import { RoleName } from '../api/src/modules/roles/entities/role-name.enum';

const BASE_URL = 'http://localhost:3000/api';

let adminRequestContext: APIRequestContext;
let managerRequestContext: APIRequestContext;
let regularUserRequestContext: APIRequestContext;

// Store UserData objects to hold token, id, email etc.
let adminApiUser: UserData;
let managerApiUser: UserData;
let regularApiUser: UserData;

const createdExpenseIds: string[] = [];

test.describe.serial('/expenses E2E CRUD and RBAC', () => {
  test.beforeAll(async ({ playwright }) => {
    // Admin User Setup
    adminApiUser = await createRandomUser(playwright, BASE_URL, RoleName.ADMIN);
    adminRequestContext = await playwright.request.newContext({
      baseURL: BASE_URL,
      extraHTTPHeaders: { 'Authorization': `Bearer ${adminApiUser.token}` },
    });
    console.log(`[Expenses E2E] Admin user ${adminApiUser.email} (ID: ${adminApiUser.id}) set up.`);

    // Verify Admin's profile and roles (optional but good check)
    const adminProfileResponse = await adminRequestContext.get(`${BASE_URL}/auth/profile`);
    expect(adminProfileResponse.ok(), `Failed to fetch admin profile. Status: ${adminProfileResponse.status()}`).toBeTruthy();
    const adminProfile = await adminProfileResponse.json();
    expect(adminProfile.roles?.some((role: any) => role.name === 'Admin')).toBe(true);

    // Manager User Setup
    managerApiUser = await createRandomUser(playwright, BASE_URL, RoleName.MANAGER);
    managerRequestContext = await playwright.request.newContext({
      baseURL: BASE_URL,
      extraHTTPHeaders: { 'Authorization': `Bearer ${managerApiUser.token}` },
    });
    console.log(`[Expenses E2E] Manager user ${managerApiUser.email} (ID: ${managerApiUser.id}) set up.`);

    // Regular User (Photographer) Setup
    regularApiUser = await createRandomUser(playwright, BASE_URL, RoleName.PHOTOGRAPHER);
    regularUserRequestContext = await playwright.request.newContext({
      baseURL: BASE_URL,
      extraHTTPHeaders: { 'Authorization': `Bearer ${regularApiUser.token}` },
    });
    console.log(`[Expenses E2E] Regular user ${regularApiUser.email} (ID: ${regularApiUser.id}) set up.`);
  });

  test.afterAll(async () => {
    console.log('[Expenses E2E] Starting cleanup for expenses...');
    if (adminRequestContext) {
      for (const expenseId of createdExpenseIds) {
        try {
          await adminRequestContext.delete(`${BASE_URL}/expenses/${expenseId}`);
        } catch (error) {
          console.error(`[Expenses E2E] Error deleting expense ${expenseId}:`, error);
        }
      }
      // Dispose of contexts
      await adminRequestContext.dispose();
    }
    if (managerRequestContext) await managerRequestContext.dispose();
    if (regularUserRequestContext) await regularUserRequestContext.dispose();
    
    // User cleanup is generally not handled by individual spec files if createRandomUser doesn't do it.
    // Assuming test DB is ephemeral or seeded per run/suite.
    console.log('[Expenses E2E] Cleanup for expenses finished.');
    createdExpenseIds.length = 0; // Clear the array
  });

  // --- RBAC Tests for Expenses (Photographer role should be denied) ---
  test('POST /expenses - Regular User (Photographer) should be denied', async () => {
    const payload = {
      description: 'Unauthorized Expense Attempt',
      amount: 50,
      expense_date: new Date().toISOString().split('T')[0],
      category: 'Denied Test',
    };
    const response = await regularUserRequestContext.post(`${BASE_URL}/expenses`, { data: payload });
    expect(response.status()).toBe(403); // Forbidden
  });

  test('GET /expenses - Regular User (Photographer) should be denied', async () => {
    const response = await regularUserRequestContext.get(`${BASE_URL}/expenses`);
    expect(response.status()).toBe(403);
  });

  // --- CRUD Tests for Expenses (Admin and Manager) ---
  let expenseIdByAdmin: string;
  let expenseIdByManager: string;

  test('POST /expenses - Admin creates an expense', async () => {
    const payload = {
      description: 'Admin E2E Expense - Office Lunch',
      amount: 75.50,
      expense_date: '2024-08-10',
      category: 'Meals & Entertainment',
      is_wishlist_expense: false,
      payment_method: 'Company Card',
      vendor: 'The Big Restaurant',
      notes: 'Team lunch for project completion'
    };
    const response = await adminRequestContext.post(`${BASE_URL}/expenses`, { data: payload });
    expect(response.status()).toBe(201);
    const expense = await response.json();
    expect(expense.id).toBeDefined();
    expenseIdByAdmin = expense.id;
    createdExpenseIds.push(expenseIdByAdmin);
    expect(expense.description).toBe(payload.description);
    expect(parseFloat(expense.amount)).toBe(payload.amount);
    expect(expense.category).toBe(payload.category);
    expect(expense.recorded_by_user_id).toBe(adminApiUser.id); // Use ID from UserData
  });

  test('POST /expenses - Manager creates an expense', async () => {
    const payload = {
      description: 'Manager E2E Expense - Client Gift',
      amount: 120.00,
      expense_date: '2024-08-11',
      category: 'Gifts',
      is_wishlist_expense: true,
      notes: 'Thank you gift for Client X'
    };
    const response = await managerRequestContext.post(`${BASE_URL}/expenses`, { data: payload });
    expect(response.status()).toBe(201);
    const expense = await response.json();
    expect(expense.id).toBeDefined();
    expenseIdByManager = expense.id;
    createdExpenseIds.push(expenseIdByManager);
    expect(expense.description).toBe(payload.description);
    expect(parseFloat(expense.amount)).toBe(payload.amount);
    expect(expense.is_wishlist_expense).toBe(true);
    expect(expense.recorded_by_user_id).toBe(managerApiUser.id); // Use ID from UserData
  });

  test('GET /expenses - Admin retrieves all expenses (paginated)', async () => {
    const response = await adminRequestContext.get(`${BASE_URL}/expenses?limit=2`);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.items.length).toBeGreaterThanOrEqual(1); // Adjusted expectation, could be 1 or 2 depending on other tests
    expect(body.meta).toBeDefined();
    expect(body.meta.itemCount).toBeGreaterThanOrEqual(1);
    const foundAdminExpense = body.items.find((e: any) => e.id === expenseIdByAdmin);
    if (expenseIdByAdmin) expect(foundAdminExpense).toBeDefined(); // Only check if ID is set
    if (foundAdminExpense) expect(foundAdminExpense.description).toBe('Admin E2E Expense - Office Lunch');
  });
  
  test('GET /expenses - Manager retrieves expenses filtered by category', async () => {
    const response = await managerRequestContext.get(`${BASE_URL}/expenses?category=Gifts&limit=5`);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.items.length).toBeGreaterThanOrEqual(1);
    const foundManagerExpense = body.items.find((e: any) => e.id === expenseIdByManager);
    if (expenseIdByManager) expect(foundManagerExpense).toBeDefined();
    if (foundManagerExpense) expect(foundManagerExpense.category).toBe('Gifts');
  });

   test('GET /expenses - Admin retrieves expenses filtered by month and year', async () => {
    // Ensure at least one expense exists for this test to be meaningful if tests run selectively
    if (!expenseIdByAdmin && !expenseIdByManager) {
        console.warn('[Expenses E2E] Skipping filter by month/year test as no expenses were created by admin/manager in this run.');
        return; // Or create a specific expense for this test
    }
    const response = await adminRequestContext.get(`${BASE_URL}/expenses?year=2024&month=8&limit=5`);
    expect(response.status()).toBe(200);
    const body = await response.json();
    // This assertion is tricky if other tests create expenses in Aug 2024. 
    // We only care that *our* expenses would be there if they exist.
    expect(body.items.every((item: any) => new Date(item.expense_date).getFullYear() === 2024 && new Date(item.expense_date).getMonth() === 7)).toBeTruthy();
  });

  test('GET /expenses/:id - Admin retrieves a specific expense', async () => {
    if (!expenseIdByAdmin) {
        console.warn('[Expenses E2E] Skipping GET by ID for admin expense as it was not created.');
        return;
    }
    const response = await adminRequestContext.get(`${BASE_URL}/expenses/${expenseIdByAdmin}`);
    expect(response.status()).toBe(200);
    const expense = await response.json();
    expect(expense.id).toBe(expenseIdByAdmin);
    expect(expense.description).toBe('Admin E2E Expense - Office Lunch');
    expect(expense.recorded_by_user.id).toBe(adminApiUser.id); // Check relation
  });

  test('GET /expenses/:id - Manager retrieves a specific expense', async () => {
    if (!expenseIdByManager) {
        console.warn('[Expenses E2E] Skipping GET by ID for manager expense as it was not created.');
        return;
    }
    const response = await managerRequestContext.get(`${BASE_URL}/expenses/${expenseIdByManager}`);
    expect(response.status()).toBe(200);
    const expense = await response.json();
    expect(expense.id).toBe(expenseIdByManager);
    expect(expense.description).toBe('Manager E2E Expense - Client Gift');
  });

  test('PATCH /expenses/:id - Admin updates an expense', async () => {
    const payload = {
      notes: 'Updated by Admin: Approved and verified.',
      amount: 80.00, // Updated amount
    };
    const response = await adminRequestContext.patch(`${BASE_URL}/expenses/${expenseIdByAdmin}`, { data: payload });
    expect(response.status()).toBe(200);
    const expense = await response.json();
    expect(expense.notes).toBe(payload.notes);
    expect(parseFloat(expense.amount)).toBe(payload.amount);
  });

  test('PATCH /expenses/:id - Manager updates an expense', async () => {
    const payload = {
      description: 'Manager E2E Expense - Client Gift (Finalized)',
      category: 'Client Relations'
    };
    const response = await managerRequestContext.patch(`${BASE_URL}/expenses/${expenseIdByManager}`, { data: payload });
    expect(response.status()).toBe(200);
    const expense = await response.json();
    expect(expense.description).toBe(payload.description);
    expect(expense.category).toBe(payload.category);
  });

  test('DELETE /expenses/:id - Admin deletes an expense', async () => {
    const response = await adminRequestContext.delete(`${BASE_URL}/expenses/${expenseIdByAdmin}`);
    expect(response.status()).toBe(204);
    // Verify it's gone
    const getResponse = await adminRequestContext.get(`${BASE_URL}/expenses/${expenseIdByAdmin}`);
    expect(getResponse.status()).toBe(404);
    createdExpenseIds.splice(createdExpenseIds.indexOf(expenseIdByAdmin), 1); // Remove from cleanup array
  });

  test('DELETE /expenses/:id - Manager deletes an expense', async () => {
    const response = await managerRequestContext.delete(`${BASE_URL}/expenses/${expenseIdByManager}`);
    expect(response.status()).toBe(204);
    // Verify it's gone
    const getResponse = await managerRequestContext.get(`${BASE_URL}/expenses/${expenseIdByManager}`);
    expect(getResponse.status()).toBe(404);
    createdExpenseIds.splice(createdExpenseIds.indexOf(expenseIdByManager), 1); // Remove from cleanup array
  });

  test('GET /expenses/:id - Admin gets 404 for non-existent expense', async () => {
    const response = await adminRequestContext.get(`${BASE_URL}/expenses/b8a9c252-0151-4952-8c63-9e6dd831c670`);
    expect(response.status()).toBe(404);
  });
}); 