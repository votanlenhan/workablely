import { test, expect, APIRequestContext } from '@playwright/test';
// import { generateRandomUser, generateRandomString } from './utils/random-helpers'; // Corrected to use UserData and RoleName
import { createRandomUser, UserData } from './utils/user-helpers';
import { RoleName } from '../api/src/modules/roles/entities/role-name.enum';
import { ConfigurationValueType } from '../api/src/modules/configurations/entities/configuration-value-type.enum'; 
import { Chance } from 'chance'; // For generateRandomString if kept local

const chance = new Chance(); // For generateRandomString

// Function to generate random string, if not imported from a common helper
function generateRandomString(length: number): string {
  return chance.string({ length });
}

const BASE_URL = 'http://localhost:3000/api';

let adminRequestContext: APIRequestContext;
let managerRequestContext: APIRequestContext;
let photographerRequestContext: APIRequestContext;

// Store UserData objects to access id, email, token etc.
let adminApiUser: UserData;
let managerApiUser: UserData;
let photographerApiUser: UserData;

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
  test.beforeAll(async ({ playwright }) => {
    // Admin User Setup
    adminApiUser = await createRandomUser(playwright, BASE_URL, RoleName.ADMIN);
    adminRequestContext = await playwright.request.newContext({
      baseURL: BASE_URL,
      extraHTTPHeaders: { 'Authorization': `Bearer ${adminApiUser.token}` },
    });
    console.log(`[Configurations E2E] Admin user ${adminApiUser.email} (ID: ${adminApiUser.id}) set up.`);

    // Manager User Setup
    // Note: createRandomUser already handles signup and provides a token.
    // No need to create user via adminRequestContext.post /users unless specific scenarios require it.
    managerApiUser = await createRandomUser(playwright, BASE_URL, RoleName.MANAGER);
    managerRequestContext = await playwright.request.newContext({
      baseURL: BASE_URL,
      extraHTTPHeaders: { 'Authorization': `Bearer ${managerApiUser.token}` },
    });
    console.log(`[Configurations E2E] Manager user ${managerApiUser.email} (ID: ${managerApiUser.id}) set up.`);

    // Photographer User Setup
    photographerApiUser = await createRandomUser(playwright, BASE_URL, RoleName.PHOTOGRAPHER); // Or RoleName.USER if Photographer isn't a default role
    photographerRequestContext = await playwright.request.newContext({
      baseURL: BASE_URL,
      extraHTTPHeaders: { 'Authorization': `Bearer ${photographerApiUser.token}` },
    });
    console.log(`[Configurations E2E] Photographer user ${photographerApiUser.email} (ID: ${photographerApiUser.id}) set up.`);
  });

  test.afterAll(async () => {
    console.log('[Configurations E2E] Starting cleanup...');
    if (adminRequestContext) { // Ensure context exists before using
      for (const configId of createdConfigIds) {
        try {
          await adminRequestContext.delete(`${BASE_URL}/configurations/${configId}`);
        } catch (err) {
          console.error(`[Configurations E2E] Error deleting config ${configId}:`, err);
        }
      }
      await adminRequestContext.dispose();
    }
    if (managerRequestContext) await managerRequestContext.dispose();
    if (photographerRequestContext) await photographerRequestContext.dispose();
    // User cleanup would typically be handled by a global mechanism or not at all for test users if DB is reset/seeded.
    // Or individual user deletion calls if necessary, e.g.:
    // if (adminApiUser && adminRequestContext) await adminRequestContext.delete(`/users/${adminApiUser.id}`).catch(e => {});
    // etc. for managerApiUser, photographerApiUser if they were created via API by admin/tests
    console.log('[Configurations E2E] Cleanup finished.');
    createdConfigIds = [];
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
    // Diagnostic: First, try to get by ID to ensure it still exists for Admin
    const getByIdResponse = await adminRequestContext.get(`${BASE_URL}/configurations/${testConfigId}`);
    expect(getByIdResponse.ok(), `Admin Get Config by ID (in Test 4 PRE-CHECK) Failed: ${await getByIdResponse.text()}`).toBe(true);
    const configById = await getByIdResponse.json();
    expect(configById.key, `Config key mismatch in PRE-CHECK. Expected ${testConfigKey}, got ${configById.key}`).toBe(testConfigKey);

    const encodedKey = encodeURIComponent(testConfigKey);
    const response = await adminRequestContext.get(`${BASE_URL}/configurations/key/${encodedKey}`);
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
    const encodedKey = encodeURIComponent(testConfigKey);
    const response = await managerRequestContext.get(`${BASE_URL}/configurations/key/${encodedKey}`);
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
    const encodedKey = encodeURIComponent(testConfigKey);
    const response = await photographerRequestContext.get(`${BASE_URL}/configurations/key/${encodedKey}`);
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