import 'reflect-metadata'; // For TypeORM decorators, though likely not needed here directly if no API entities imported
import { test, expect, APIRequestContext } from '@playwright/test';
import { createRandomUser, UserData, generateRandomString } from './utils/user-helpers'; // Import UserData, generateRandomString
import { RoleName } from '../api/src/modules/roles/entities/role-name.enum';

const BASE_URL = 'http://localhost:3000/api';

let adminRequestContext: APIRequestContext;
let managerRequestContext: APIRequestContext;
let regularUserRequestContext: APIRequestContext; // For testing forbidden access

// Store UserData objects
let adminApiUser: UserData;
let managerApiUser: UserData;
let regularApiUser: UserData;

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
  test.beforeAll(async ({ playwright }) => {
    // Admin User Setup
    adminApiUser = await createRandomUser(playwright, BASE_URL, RoleName.ADMIN);
    adminRequestContext = await playwright.request.newContext({
      baseURL: BASE_URL,
      extraHTTPHeaders: { 'Authorization': `Bearer ${adminApiUser.token}` },
    });
    console.log(`[External Incomes E2E] Admin user ${adminApiUser.email} (ID: ${adminApiUser.id}) set up.`);

    // Manager User Setup
    managerApiUser = await createRandomUser(playwright, BASE_URL, RoleName.MANAGER);
    managerRequestContext = await playwright.request.newContext({
      baseURL: BASE_URL,
      extraHTTPHeaders: { 'Authorization': `Bearer ${managerApiUser.token}` },
    });
    console.log(`[External Incomes E2E] Manager user ${managerApiUser.email} (ID: ${managerApiUser.id}) set up.`);

    // Regular User (Photographer) Setup
    regularApiUser = await createRandomUser(playwright, BASE_URL, RoleName.PHOTOGRAPHER);
    regularUserRequestContext = await playwright.request.newContext({
      baseURL: BASE_URL,
      extraHTTPHeaders: { 'Authorization': `Bearer ${regularApiUser.token}` },
    });
    console.log(`[External Incomes E2E] Regular user ${regularApiUser.email} (ID: ${regularApiUser.id}) set up.`);
  });

  test.afterAll(async () => {
    console.log('[External Incomes E2E] Starting cleanup...');
    if (adminRequestContext) {
      for (const incomeId of createdExternalIncomeIds) {
        try {
          await adminRequestContext.delete(`${BASE_URL}/external-incomes/${incomeId}`);
        } catch (err) {
          console.error(`[External Incomes E2E] Error deleting income ${incomeId}:`, err);
        }
      }
      await adminRequestContext.dispose();
    }
    if (managerRequestContext) await managerRequestContext.dispose();
    if (regularUserRequestContext) await regularUserRequestContext.dispose();
    console.log('[External Incomes E2E] Cleanup finished.');
    createdExternalIncomeIds = [];
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
    expect(income.recorded_by_user_id).toBe(adminApiUser.id); // Use updated ID reference
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
    expect(income.recorded_by_user_id).toBe(managerApiUser.id); // Use updated ID reference
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
    expect(response.ok(), `Admin Get Other\'s Failed: ${await response.text()}`).toBe(true);
    const income = await response.json();
    expect(income.id).toBe(managerCreatedIncomeId);
  });

  test('5. Manager: should get own external income by ID', async () => {
    expect(managerCreatedIncomeId, 'Manager created income ID is missing for test 5').toBeDefined();
    const response = await managerRequestContext.get(`${BASE_URL}/external-incomes/${managerCreatedIncomeId}`);
    expect(response.ok(), `Manager Get Own Failed: ${await response.text()}`).toBe(true);
    const income = await response.json();
    expect(income.id).toBe(managerCreatedIncomeId);
    expect(income.recorded_by_user_id).toBe(managerApiUser.id);
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
    expect(response.ok(), `Admin Update Other\'s Failed: ${await response.text()}`).toBe(true);
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
    // Ensure managerCreatedIncomeId is set, or create one if not (e.g. if tests run selectively)
    if (!managerCreatedIncomeId) {
      const tempPayload = getSampleIncomePayload('_manager_temp_for_page');
      const tempResp = await managerRequestContext.post(`${BASE_URL}/external-incomes`, { data: tempPayload });
      expect(tempResp.status()).toBe(201);
      managerCreatedIncomeId = (await tempResp.json()).id;
      createdExternalIncomeIds.push(managerCreatedIncomeId); 
    }

    const newManagerIncomePayload = getSampleIncomePayload('_manager_page');
    const newManagerIncomeResp = await managerRequestContext.post(`${BASE_URL}/external-incomes`, { data: newManagerIncomePayload });
    expect(newManagerIncomeResp.status()).toBe(201);
    const newManagerIncome = await newManagerIncomeResp.json();
    createdExternalIncomeIds.push(newManagerIncome.id);
    
    const response = await managerRequestContext.get(`${BASE_URL}/external-incomes?page=1&limit=1`);
    expect(response.ok(), `Manager Paginate Own Failed: ${await response.text()}`).toBe(true);
    const page = await response.json();
    expect(page.items.length).toBe(1);
    expect(page.items[0].recorded_by_user_id).toBe(managerApiUser.id);
    expect(page.meta.totalItems).toBeGreaterThanOrEqual(2); 
    expect(page.meta.currentPage).toBe(1);

    const responseAdminQuery = await managerRequestContext.get(`${BASE_URL}/external-incomes?page=1&limit=10&recorded_by_user_id=${adminApiUser.id}`);
    expect(responseAdminQuery.ok()).toBe(true);
    const pageAdminQuery = await responseAdminQuery.json();
    pageAdminQuery.items.forEach((item: any) => {
        expect(item.recorded_by_user_id).toBe(managerApiUser.id);
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