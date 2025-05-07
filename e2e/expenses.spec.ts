import 'reflect-metadata'; // For TypeORM decorators
import { test, expect, APIRequestContext } from '@playwright/test';
import { generateRandomUser, generateRandomString } from './utils/random-helpers';

const BASE_URL = 'http://localhost:3000/api';

let adminRequestContext: APIRequestContext;
let managerRequestContext: APIRequestContext;
let regularUserRequestContext: APIRequestContext;

let adminToken: string;
let managerToken: string;
let regularUserToken: string;

let adminUserId: string;
let managerUserId: string;
let regularUserId: string;

const createdExpenseIds: string[] = [];

test.describe.serial('/expenses E2E CRUD and RBAC', () => {
  test.beforeAll(async ({ playwright, request }) => {
    // Admin User Setup
    const adminUserPayload = generateRandomUser(['Admin']);
    let response = await request.post(`${BASE_URL}/auth/signup`, { data: adminUserPayload });
    expect(response.status(), 'Admin Signup Failed').toBe(201);
    let adminUser = await response.json();
    adminUserId = adminUser.id;

    response = await request.post(`${BASE_URL}/auth/login`, { data: { email: adminUserPayload.email, password: adminUserPayload.password } });
    expect(response.status(), 'Admin Login Failed').toBe(200);
    adminToken = (await response.json()).access_token;
    console.log('[Expenses E2E Test] Admin Token:', adminToken);

    adminRequestContext = await playwright.request.newContext({
      baseURL: BASE_URL,
      extraHTTPHeaders: { 'Authorization': `Bearer ${adminToken}` },
    });
    console.log(`Admin user ${adminUser.email} (ID: ${adminUserId}) created and logged in.`);

    // Verify Admin's profile and roles
    const adminProfileResponse = await adminRequestContext.get(`${BASE_URL}/auth/profile`);
    const adminProfileResponseBody = await adminProfileResponse.text();
    console.log('[Expenses E2E Test] Admin Profile Response Status:', adminProfileResponse.status());
    console.log('[Expenses E2E Test] Admin Profile Response Body:', adminProfileResponseBody);

    expect(adminProfileResponse.ok(), `Failed to fetch admin profile. Status: ${adminProfileResponse.status()}, Body: ${adminProfileResponseBody}`).toBeTruthy();
    const adminProfile = JSON.parse(adminProfileResponseBody);
    console.log('[Expenses E2E Test] Admin Profile after setup:', JSON.stringify(adminProfile, null, 2));
    const isAdmin = adminProfile.roles?.some((role: any) => role.name === 'Admin');
    expect(isAdmin, 'Admin user created in expenses.spec.ts does not have Admin role').toBe(true);

    // Manager User Setup
    const managerUserPayload = generateRandomUser(['Manager']);
    response = await adminRequestContext.post(`${BASE_URL}/users`, { data: managerUserPayload });
    expect(response.status(), 'Manager User Creation by Admin Failed').toBe(201);
    let managerUser = await response.json();
    managerUserId = managerUser.id;

    response = await request.post(`${BASE_URL}/auth/login`, { data: { email: managerUserPayload.email, password: managerUserPayload.password } });
    expect(response.status(), 'Manager Login Failed').toBe(200);
    managerToken = (await response.json()).access_token;
    managerRequestContext = await playwright.request.newContext({
      baseURL: BASE_URL,
      extraHTTPHeaders: { 'Authorization': `Bearer ${managerToken}` },
    });
    console.log(`Manager user ${managerUser.email} (ID: ${managerUserId}) created and logged in.`);

    // Regular User (Photographer) Setup for RBAC tests
    const regularUserPayload = generateRandomUser(['Photographer']);
    response = await adminRequestContext.post(`${BASE_URL}/users`, { data: regularUserPayload });
    expect(response.status(), 'Regular User (Photographer) Creation by Admin Failed').toBe(201);
    let regularUser = await response.json();
    regularUserId = regularUser.id;

    response = await request.post(`${BASE_URL}/auth/login`, { data: { email: regularUserPayload.email, password: regularUserPayload.password } });
    expect(response.status(), 'Regular User Login Failed').toBe(200);
    regularUserToken = (await response.json()).access_token;
    regularUserRequestContext = await playwright.request.newContext({
      baseURL: BASE_URL,
      extraHTTPHeaders: { 'Authorization': `Bearer ${regularUserToken}` },
    });
    console.log(`Regular user ${regularUser.email} (ID: ${regularUserId}) created and logged in.`);
  });

  test.afterAll(async () => {
    console.log('Starting E2E cleanup for expenses...');
    // Delete created expenses
    for (const expenseId of createdExpenseIds) {
      try {
        const res = await adminRequestContext.delete(`${BASE_URL}/expenses/${expenseId}`);
        console.log(`Deleted expense ${expenseId}, status: ${res.status()}`);
      } catch (error) {
        console.error(`Error deleting expense ${expenseId}:`, error);
      }
    }

    // Delete users (in reverse order of dependency or just all)
    if (adminRequestContext && regularUserId) {
        try {
            await adminRequestContext.delete(`${BASE_URL}/users/${regularUserId}`);
            console.log(`Deleted regular user ${regularUserId}`);
        } catch (e) { console.error(`Failed to delete regular user ${regularUserId}:`, e.message); }
    }
    if (adminRequestContext && managerUserId) {
        try {
            await adminRequestContext.delete(`${BASE_URL}/users/${managerUserId}`);
            console.log(`Deleted manager user ${managerUserId}`);
        } catch (e) { console.error(`Failed to delete manager user ${managerUserId}:`, e.message); }
    }
    // Admin user cannot delete itself through the API usually, depends on setup.
    // If a super admin or direct DB cleanup is needed for the initial admin, that's outside this scope.
    console.log('E2E cleanup for expenses finished.');
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
    expect(expense.recorded_by_user_id).toBe(adminUserId);
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
    expect(expense.recorded_by_user_id).toBe(managerUserId);
  });

  test('GET /expenses - Admin retrieves all expenses (paginated)', async () => {
    const response = await adminRequestContext.get(`${BASE_URL}/expenses?limit=2`);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.items.length).toBeGreaterThanOrEqual(2); // Expecting at least the 2 created
    expect(body.meta).toBeDefined();
    expect(body.meta.itemCount).toBeGreaterThanOrEqual(2);
    // Verify one of the created expenses is present
    const foundAdminExpense = body.items.find(e => e.id === expenseIdByAdmin);
    expect(foundAdminExpense).toBeDefined();
    expect(foundAdminExpense.description).toBe('Admin E2E Expense - Office Lunch');
  });
  
  test('GET /expenses - Manager retrieves expenses filtered by category', async () => {
    const response = await managerRequestContext.get(`${BASE_URL}/expenses?category=Gifts&limit=5`);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.items.length).toBeGreaterThanOrEqual(1);
    const foundManagerExpense = body.items.find(e => e.id === expenseIdByManager);
    expect(foundManagerExpense).toBeDefined();
    expect(foundManagerExpense.category).toBe('Gifts');
  });

   test('GET /expenses - Admin retrieves expenses filtered by month and year', async () => {
    const response = await adminRequestContext.get(`${BASE_URL}/expenses?year=2024&month=8&limit=5`);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.items.length).toBeGreaterThanOrEqual(2); // Both expenses created are in Aug 2024
    expect(body.items.every(item => new Date(item.expense_date).getFullYear() === 2024 && new Date(item.expense_date).getMonth() === 7)).toBeTruthy();
  });

  test('GET /expenses/:id - Admin retrieves a specific expense', async () => {
    const response = await adminRequestContext.get(`${BASE_URL}/expenses/${expenseIdByAdmin}`);
    expect(response.status()).toBe(200);
    const expense = await response.json();
    expect(expense.id).toBe(expenseIdByAdmin);
    expect(expense.description).toBe('Admin E2E Expense - Office Lunch');
    expect(expense.recorded_by_user.id).toBe(adminUserId);
  });

  test('GET /expenses/:id - Manager retrieves a specific expense', async () => {
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