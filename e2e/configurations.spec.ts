import { test, expect, APIRequestContext } from '@playwright/test';
import { generateRandomUser, generateRandomString } from './utils/random-helpers';
import { ConfigurationValueType } from '../api/src/modules/configurations/entities/configuration-value-type.enum'; // Adjust path as needed

const BASE_URL = 'http://localhost:3000/api';

let adminRequestContext: APIRequestContext;
let managerRequestContext: APIRequestContext;
let photographerRequestContext: APIRequestContext;

let adminToken: string;
let managerToken: string;
let photographerToken: string;

let adminUserId: string;
let managerUserId: string;

let createdConfigIds: string[] = [];

function getSampleConfigPayload(keySuffix: string = '') {
  return {
    key: `E2E_TEST_KEY_${generateRandomString(5)}${keySuffix}`,
    value: `E2E Test Value ${generateRandomString(10)}`,
    description: `Description for E2E test config ${keySuffix}`,
    value_type: ConfigurationValueType.STRING,
    is_editable: true,
  };
}

test.describe.serial('/configurations E2E CRUD and RBAC', () => {
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
      baseURL: BASE_URL,
      extraHTTPHeaders: { 'Authorization': `Bearer ${adminToken}` },
    });
    console.log(`[Configurations E2E] Admin user ${adminUser.email} (ID: ${adminUserId}) created and logged in.`);

    // Manager User Setup
    const managerUserPayload = generateRandomUser(['Manager']);
    response = await adminRequestContext.post(`${BASE_URL}/users`, { data: managerUserPayload });
    expect(response.status(), 'Manager User Creation by Admin Failed').toBe(201);
    managerUserId = (await response.json()).id;
    response = await request.post(`${BASE_URL}/auth/login`, { data: { email: managerUserPayload.email, password: managerUserPayload.password } });
    expect(response.status(), 'Manager Login Failed').toBe(200);
    managerToken = (await response.json()).access_token;
    managerRequestContext = await playwright.request.newContext({
      baseURL: BASE_URL,
      extraHTTPHeaders: { 'Authorization': `Bearer ${managerToken}` },
    });
    console.log(`[Configurations E2E] Manager user ${managerUserPayload.email} (ID: ${managerUserId}) created and logged in.`);

    // Photographer User Setup (for no-access tests)
    const photographerUserPayload = generateRandomUser(['Photographer']);
    response = await adminRequestContext.post(`${BASE_URL}/users`, { data: photographerUserPayload });
    expect(response.status(), 'Photographer User Creation by Admin Failed').toBe(201);
    const photographerUserId = (await response.json()).id;
    response = await request.post(`${BASE_URL}/auth/login`, { data: { email: photographerUserPayload.email, password: photographerUserPayload.password } });
    expect(response.status(), 'Photographer Login Failed').toBe(200);
    photographerToken = (await response.json()).access_token;
    photographerRequestContext = await playwright.request.newContext({
      baseURL: BASE_URL,
      extraHTTPHeaders: { 'Authorization': `Bearer ${photographerToken}` },
    });
    console.log(`[Configurations E2E] Photographer user ${photographerUserPayload.email} (ID: ${photographerUserId}) created.`);
  });

  test.afterAll(async () => {
    console.log('[Configurations E2E] Starting cleanup...');
    for (const configId of createdConfigIds) {
      try {
        await adminRequestContext.delete(`${BASE_URL}/configurations/${configId}`);
      } catch (err) {
        console.error(`[Configurations E2E] Error deleting config ${configId}:`, err);
      }
    }
    // User cleanup can be added if necessary, similar to other spec files
    console.log('[Configurations E2E] Cleanup finished.');
  });

  let testConfigKey = '';
  let testConfigId = '';

  test('1. Admin: should create a new configuration', async () => {
    const payload = getSampleConfigPayload('_admin');
    testConfigKey = payload.key; // Store for later tests

    const response = await adminRequestContext.post(`${BASE_URL}/configurations`, { data: payload });
    expect(response.status(), `Admin Create Config Failed: ${await response.text()}`).toBe(201);
    const config = await response.json();
    expect(config.key).toBe(payload.key);
    expect(config.value).toBe(payload.value);
    expect(config.value_type).toBe(ConfigurationValueType.STRING);
    testConfigId = config.id;
    createdConfigIds.push(testConfigId);
  });

  test('2. Admin: should fail to create a configuration with a duplicate key', async () => {
    const payload = getSampleConfigPayload();
    payload.key = testConfigKey; // Use the same key as the first test
    const response = await adminRequestContext.post(`${BASE_URL}/configurations`, { data: payload });
    expect(response.status()).toBe(409); // Conflict
  });

  test('3. Admin: should get configuration by ID', async () => {
    const response = await adminRequestContext.get(`${BASE_URL}/configurations/${testConfigId}`);
    expect(response.ok(), `Admin Get Config by ID Failed: ${await response.text()}`).toBe(true);
    const config = await response.json();
    expect(config.id).toBe(testConfigId);
    expect(config.key).toBe(testConfigKey);
  });

  test('4. Admin: should get configuration by Key', async () => {
    const response = await adminRequestContext.get(`${BASE_URL}/configurations/key/${testConfigKey}`);
    expect(response.ok(), `Admin Get Config by Key Failed: ${await response.text()}`).toBe(true);
    const config = await response.json();
    expect(config.id).toBe(testConfigId);
    expect(config.key).toBe(testConfigKey);
  });

  test('5. Manager: should get configuration by ID', async () => {
    const response = await managerRequestContext.get(`${BASE_URL}/configurations/${testConfigId}`);
    expect(response.ok(), `Manager Get Config by ID Failed: ${await response.text()}`).toBe(true);
    const config = await response.json();
    expect(config.id).toBe(testConfigId);
  });

  test('6. Manager: should get configuration by Key', async () => {
    const response = await managerRequestContext.get(`${BASE_URL}/configurations/key/${testConfigKey}`);
    expect(response.ok(), `Manager Get Config by Key Failed: ${await response.text()}`).toBe(true);
    const config = await response.json();
    expect(config.key).toBe(testConfigKey);
  });

  test('7. Admin: should get all configurations (paginated)', async () => {
    // Create another config to ensure pagination has at least two items if DB is clean
    const payload2 = getSampleConfigPayload('_admin2');
    const resp2 = await adminRequestContext.post(`${BASE_URL}/configurations`, { data: payload2 });
    if(resp2.ok()) createdConfigIds.push((await resp2.json()).id);

    const response = await adminRequestContext.get(`${BASE_URL}/configurations?page=1&limit=10`);
    expect(response.ok()).toBe(true);
    const page = await response.json();
    expect(page.items.length).toBeGreaterThanOrEqual(1);
    expect(page.meta.totalItems).toBeGreaterThanOrEqual(1);
    const found = page.items.find((c: any) => c.id === testConfigId);
    expect(found).toBeDefined();
  });

  test('8. Admin: should update a configuration', async () => {
    const updatePayload = {
      value: 'Updated E2E Value by Admin',
      description: 'Admin was here - updated description',
      is_editable: false,
      value_type: ConfigurationValueType.BOOLEAN,
    };
    const response = await adminRequestContext.patch(`${BASE_URL}/configurations/${testConfigId}`, { data: updatePayload });
    expect(response.ok(), `Admin Update Config Failed: ${await response.text()}`).toBe(true);
    const config = await response.json();
    expect(config.value).toBe(updatePayload.value);
    expect(config.description).toBe(updatePayload.description);
    expect(config.is_editable).toBe(false);
    expect(config.value_type).toBe(ConfigurationValueType.BOOLEAN);
  });

  test('9. Manager: should NOT be able to create a configuration (Forbidden)', async () => {
    const payload = getSampleConfigPayload('_manager_forbidden');
    const response = await managerRequestContext.post(`${BASE_URL}/configurations`, { data: payload });
    expect(response.status()).toBe(403);
  });

  test('10. Manager: should NOT be able to update a configuration (Forbidden)', async () => {
    const updatePayload = { value: 'Manager update attempt' };
    const response = await managerRequestContext.patch(`${BASE_URL}/configurations/${testConfigId}`, { data: updatePayload });
    expect(response.status()).toBe(403);
  });

  test('11. Manager: should NOT be able to delete a configuration (Forbidden)', async () => {
    const response = await managerRequestContext.delete(`${BASE_URL}/configurations/${testConfigId}`);
    expect(response.status()).toBe(403);
  });

  test('12. Photographer: should NOT be able to GET any configuration by ID (Forbidden)', async () => {
    const response = await photographerRequestContext.get(`${BASE_URL}/configurations/${testConfigId}`);
    expect(response.status()).toBe(403);
  });
  
  test('13. Photographer: should NOT be able to GET any configuration by Key (Forbidden)', async () => {
    const response = await photographerRequestContext.get(`${BASE_URL}/configurations/key/${testConfigKey}`);
    expect(response.status()).toBe(403);
  });

  test('14. Photographer: should NOT be able to list configurations (Forbidden)', async () => {
    const response = await photographerRequestContext.get(`${BASE_URL}/configurations`);
    expect(response.status()).toBe(403);
  });

  test('15. Admin: should delete a configuration', async () => {
    const response = await adminRequestContext.delete(`${BASE_URL}/configurations/${testConfigId}`);
    expect(response.status()).toBe(204); // No Content
    createdConfigIds = createdConfigIds.filter(id => id !== testConfigId);

    // Verify it's gone
    const verifyResponse = await adminRequestContext.get(`${BASE_URL}/configurations/${testConfigId}`);
    expect(verifyResponse.status()).toBe(404);
  });
}); 