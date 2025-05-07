import 'reflect-metadata'; // For TypeORM decorators, though likely not needed here directly if no API entities imported
import { test, expect, APIRequestContext } from '@playwright/test';
import { generateRandomUser, generateRandomString } from './utils/random-helpers';

const BASE_URL = 'http://localhost:3000/api';

let adminRequestContext: APIRequestContext;
let managerRequestContext: APIRequestContext;
let regularUserRequestContext: APIRequestContext; // For testing forbidden access

let adminToken: string;
let managerToken: string;
let regularUserToken: string;

let adminUserId: string;
let managerUserId: string;
let regularUserId: string;

let createdExternalIncomeIds: string[] = [];

function getSampleIncomePayload(descriptionSuffix: string = '') {
  const randomAmount = parseFloat((Math.random() * 1000 + 50).toFixed(2));
  const year = 2024;
  const month = Math.floor(Math.random() * 12) + 1;
  const day = Math.floor(Math.random() * 28) + 1;
  return {
    description: `E2E Test Income ${generateRandomString(5)}${descriptionSuffix}`,
    amount: randomAmount,
    income_date: `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`,
    source: `E2E Source ${generateRandomString(3)}`,
    notes: `Notes for E2E income ${descriptionSuffix}`,
  };
}

test.describe.serial('/external-incomes E2E CRUD and RBAC', () => {
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
    adminRequestContext = await playwright.request.newContext({
      baseURL: BASE_URL, // Will be prefixed to requests
      extraHTTPHeaders: { 'Authorization': `Bearer ${adminToken}` },
    });
    console.log(`[External Incomes E2E] Admin user ${adminUser.email} (ID: ${adminUserId}) created and logged in.`);

    // Manager User Setup (created by Admin)
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
    console.log(`[External Incomes E2E] Manager user ${managerUser.email} (ID: ${managerUserId}) created and logged in.`);

    // Regular User (Photographer) Setup - for forbidden tests
    const regularUserPayload = generateRandomUser(['Photographer']); // Assuming Photographer role exists and has no EI rights
    response = await adminRequestContext.post(`${BASE_URL}/users`, { data: regularUserPayload });
    expect(response.status(), 'Regular User Creation by Admin Failed').toBe(201);
    regularUserId = (await response.json()).id;
    response = await request.post(`${BASE_URL}/auth/login`, { data: { email: regularUserPayload.email, password: regularUserPayload.password } });
    expect(response.status(), 'Regular User Login Failed').toBe(200);
    regularUserToken = (await response.json()).access_token;
    regularUserRequestContext = await playwright.request.newContext({
      baseURL: BASE_URL,
      extraHTTPHeaders: { 'Authorization': `Bearer ${regularUserToken}` },
    });
    console.log(`[External Incomes E2E] Regular user ${regularUserPayload.email} (ID: ${regularUserId}) created and logged in.`);
  });

  test.afterAll(async () => {
    console.log('[External Incomes E2E] Starting cleanup...');
    // Delete created external incomes
    for (const incomeId of createdExternalIncomeIds) {
      try {
        const resp = await adminRequestContext.delete(`${BASE_URL}/external-incomes/${incomeId}`);
        console.log(`[External Incomes E2E] Deleted income ${incomeId}, status: ${resp.status()}`);
      } catch (err) {
        console.error(`[External Incomes E2E] Error deleting income ${incomeId}:`, err);
      }
    }
    // Delete users (optional, depends on test isolation needs)
    // For simplicity, we might skip user deletion if IDs are unique enough for test runs
    // Or, implement deletion if it's critical
    if (regularUserId) await adminRequestContext.delete(`${BASE_URL}/users/${regularUserId}`).catch(e => console.error('Cleanup error', e));
    if (managerUserId) await adminRequestContext.delete(`${BASE_URL}/users/${managerUserId}`).catch(e => console.error('Cleanup error', e));
    if (adminUserId) await adminRequestContext.delete(`${BASE_URL}/users/${adminUserId}`).catch(e => console.error('Cleanup error', e));
    console.log('[External Incomes E2E] Cleanup finished.');
  });

  // --- CRUD Tests --- 
  let adminCreatedIncomeId: string;
  let managerCreatedIncomeId: string;

  test('1. Admin: should create an external income', async () => {
    const payload = getSampleIncomePayload('_admin');
    const response = await adminRequestContext.post(`${BASE_URL}/external-incomes`, { data: payload });
    expect(response.status(), `Admin Create Failed: ${await response.text()}`).toBe(201);
    const income = await response.json();
    expect(income.description).toBe(payload.description);
    expect(income.amount).toBe(payload.amount);
    expect(income.recorded_by_user_id).toBe(adminUserId);
    adminCreatedIncomeId = income.id;
    createdExternalIncomeIds.push(adminCreatedIncomeId);
  });

  test('2. Manager: should create an external income', async () => {
    const payload = getSampleIncomePayload('_manager');
    const response = await managerRequestContext.post(`${BASE_URL}/external-incomes`, { data: payload });
    expect(response.status(), `Manager Create Failed: ${await response.text()}`).toBe(201);
    const income = await response.json();
    expect(income.description).toBe(payload.description);
    expect(income.amount).toBe(payload.amount);
    expect(income.recorded_by_user_id).toBe(managerUserId);
    managerCreatedIncomeId = income.id;
    createdExternalIncomeIds.push(managerCreatedIncomeId);
  });

  test('3. Admin: should get an external income by ID (admin created)', async () => {
    expect(adminCreatedIncomeId, 'Admin created income ID is missing for test 3').toBeDefined();
    const response = await adminRequestContext.get(`${BASE_URL}/external-incomes/${adminCreatedIncomeId}`);
    expect(response.ok(), `Admin Get Own Failed: ${await response.text()}`).toBe(true);
    const income = await response.json();
    expect(income.id).toBe(adminCreatedIncomeId);
  });

  test('4. Admin: should get an external income by ID (manager created)', async () => {
    expect(managerCreatedIncomeId, 'Manager created income ID is missing for test 4').toBeDefined();
    const response = await adminRequestContext.get(`${BASE_URL}/external-incomes/${managerCreatedIncomeId}`);
    expect(response.ok(), `Admin Get Other's Failed: ${await response.text()}`).toBe(true);
    const income = await response.json();
    expect(income.id).toBe(managerCreatedIncomeId);
  });

  test('5. Manager: should get own external income by ID', async () => {
    expect(managerCreatedIncomeId, 'Manager created income ID is missing for test 5').toBeDefined();
    const response = await managerRequestContext.get(`${BASE_URL}/external-incomes/${managerCreatedIncomeId}`);
    expect(response.ok(), `Manager Get Own Failed: ${await response.text()}`).toBe(true);
    const income = await response.json();
    expect(income.id).toBe(managerCreatedIncomeId);
    expect(income.recorded_by_user_id).toBe(managerUserId);
  });

  test('6. Manager: should NOT get an external income recorded by Admin (Forbidden)', async () => {
    expect(adminCreatedIncomeId, 'Admin created income ID is missing for test 6').toBeDefined();
    const response = await managerRequestContext.get(`${BASE_URL}/external-incomes/${adminCreatedIncomeId}`);
    expect(response.status()).toBe(403); // Forbidden
  });

  test('7. Admin: should update an external income (admin created)', async () => {
    expect(adminCreatedIncomeId, 'Admin created income ID is missing for test 7').toBeDefined();
    const updatePayload = { description: 'Updated by Admin', notes: 'Admin update note' };
    const response = await adminRequestContext.patch(`${BASE_URL}/external-incomes/${adminCreatedIncomeId}`, { data: updatePayload });
    expect(response.ok(), `Admin Update Own Failed: ${await response.text()}`).toBe(true);
    const income = await response.json();
    expect(income.description).toBe(updatePayload.description);
    expect(income.notes).toBe(updatePayload.notes);
  });

  test('8. Admin: should update an external income (manager created)', async () => {
    expect(managerCreatedIncomeId, 'Manager created income ID is missing for test 8').toBeDefined();
    const updatePayload = { amount: 99.99 };
    const response = await adminRequestContext.patch(`${BASE_URL}/external-incomes/${managerCreatedIncomeId}`, { data: updatePayload });
    expect(response.ok(), `Admin Update Other's Failed: ${await response.text()}`).toBe(true);
    const income = await response.json();
    expect(income.amount).toBe(updatePayload.amount);
  });

  test('9. Manager: should update own external income', async () => {
    expect(managerCreatedIncomeId, 'Manager created income ID is missing for test 9').toBeDefined();
    const updatePayload = { source: 'Updated Source by Manager' };
    const response = await managerRequestContext.patch(`${BASE_URL}/external-incomes/${managerCreatedIncomeId}`, { data: updatePayload });
    expect(response.ok(), `Manager Update Own Failed: ${await response.text()}`).toBe(true);
    const income = await response.json();
    expect(income.source).toBe(updatePayload.source);
  });

  test('10. Manager: should NOT update an external income recorded by Admin (Forbidden)', async () => {
    expect(adminCreatedIncomeId, 'Admin created income ID is missing for test 10').toBeDefined();
    const updatePayload = { description: 'Manager attempt to update admin income' };
    const response = await managerRequestContext.patch(`${BASE_URL}/external-incomes/${adminCreatedIncomeId}`, { data: updatePayload });
    expect(response.status()).toBe(403);
  });

  test('11. Regular User: should NOT create an external income (Forbidden)', async () => {
    const payload = getSampleIncomePayload('_regular_forbidden');
    const response = await regularUserRequestContext.post(`${BASE_URL}/external-incomes`, { data: payload });
    expect(response.status()).toBe(403);
  });

  test('12. Regular User: should NOT get any external income (Forbidden)', async () => {
    expect(adminCreatedIncomeId, 'Admin created income ID is missing for test 12').toBeDefined();
    const response = await regularUserRequestContext.get(`${BASE_URL}/external-incomes/${adminCreatedIncomeId}`);
    expect(response.status()).toBe(403);
  });

  test('13. Pagination: Admin should get paginated list of all incomes', async () => {
    // Create a few more incomes to test pagination if needed
    await adminRequestContext.post(`${BASE_URL}/external-incomes`, { data: getSampleIncomePayload('_page1') });
    createdExternalIncomeIds.push((await (await adminRequestContext.post(`${BASE_URL}/external-incomes`, { data: getSampleIncomePayload('_page2') })).json()).id);

    const response = await adminRequestContext.get(`${BASE_URL}/external-incomes?page=1&limit=2`);
    expect(response.ok(), `Admin Paginate Failed: ${await response.text()}`).toBe(true);
    const page = await response.json();
    expect(page.items.length).toBeLessThanOrEqual(2);
    expect(page.meta.itemCount).toBeGreaterThanOrEqual(2); // we created at least adminCreatedIncomeId, managerCreatedIncomeId, and 2 more here
    expect(page.meta.currentPage).toBe(1);
  });

  test('14. Pagination: Manager should get paginated list of OWN incomes', async () => {
    // Manager already created one (managerCreatedIncomeId). Create one more by manager for pagination test.
    const newManagerIncome = await (await managerRequestContext.post(`${BASE_URL}/external-incomes`, { data: getSampleIncomePayload('_manager_page') })).json();
    createdExternalIncomeIds.push(newManagerIncome.id);
    
    const response = await managerRequestContext.get(`${BASE_URL}/external-incomes?page=1&limit=1`);
    expect(response.ok(), `Manager Paginate Own Failed: ${await response.text()}`).toBe(true);
    const page = await response.json();
    expect(page.items.length).toBe(1);
    expect(page.items[0].recorded_by_user_id).toBe(managerUserId);
    expect(page.meta.totalItems).toBeGreaterThanOrEqual(2); // Manager created at least two
    expect(page.meta.currentPage).toBe(1);

    // Check that if manager tries to query for admin's incomes specifically, it still defaults to their own
    const responseAdminQuery = await managerRequestContext.get(`${BASE_URL}/external-incomes?page=1&limit=10&recorded_by_user_id=${adminUserId}`);
    expect(responseAdminQuery.ok()).toBe(true);
    const pageAdminQuery = await responseAdminQuery.json();
    pageAdminQuery.items.forEach((item: any) => {
        expect(item.recorded_by_user_id).toBe(managerUserId);
    });
  });

  test('15. Manager: should delete own external income', async () => {
    expect(managerCreatedIncomeId, 'Manager created income ID is missing for test 15').toBeDefined();
    const response = await managerRequestContext.delete(`${BASE_URL}/external-incomes/${managerCreatedIncomeId}`);
    expect(response.status()).toBe(204); // No Content
    // Verify it's gone for manager
    const verifyResponse = await managerRequestContext.get(`${BASE_URL}/external-incomes/${managerCreatedIncomeId}`);
    expect(verifyResponse.status()).toBe(404); // Changed to expect 404 Not Found
    const verifyAdmin = await adminRequestContext.get(`${BASE_URL}/external-incomes/${managerCreatedIncomeId}`);
    expect(verifyAdmin.status()).toBe(404); // Admin confirms it is gone
    createdExternalIncomeIds = createdExternalIncomeIds.filter(id => id !== managerCreatedIncomeId);
  });

  test('16. Manager: should NOT delete an external income recorded by Admin (Forbidden)', async () => {
    expect(adminCreatedIncomeId, 'Admin created income ID is missing for test 16').toBeDefined();
    const response = await managerRequestContext.delete(`${BASE_URL}/external-incomes/${adminCreatedIncomeId}`);
    expect(response.status()).toBe(403);
  });

  test('17. Admin: should delete an external income (admin created)', async () => {
    expect(adminCreatedIncomeId, 'Admin created income ID is missing for test 17').toBeDefined();
    const response = await adminRequestContext.delete(`${BASE_URL}/external-incomes/${adminCreatedIncomeId}`);
    expect(response.status()).toBe(204);
    // Verify it's gone
    const verifyResponse = await adminRequestContext.get(`${BASE_URL}/external-incomes/${adminCreatedIncomeId}`);
    expect(verifyResponse.status()).toBe(404);
    createdExternalIncomeIds = createdExternalIncomeIds.filter(id => id !== adminCreatedIncomeId);
  });
}); 