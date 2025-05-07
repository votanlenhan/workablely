import { test, expect, APIRequestContext } from '@playwright/test';
import { generateRandomString, generateRandomPhoneNumber } from './utils/random-helpers';

const BASE_URL = 'http://localhost:3000/api';

let adminRequestContext: APIRequestContext;
let adminUser: any;
let createdEquipmentIds: string[] = [];

test.describe('Equipment API', () => {
  test.beforeAll(async ({ playwright, request }) => {
    const adminEmail = `admin_${generateRandomString(8)}@example.com`;
    const adminPassword = 'password123';
    const adminFirstName = 'Admin';
    const adminLastName = 'UserE2E';

    const signupResponse = await request.post(`${BASE_URL}/auth/signup`, {
      data: {
        email: adminEmail,
        password: adminPassword,
        first_name: adminFirstName,
        last_name: adminLastName,
        roleNames: ['Admin'], 
      },
    });
    expect(signupResponse.ok(), `Admin Signup Failed: ${await signupResponse.text()}`).toBeTruthy();
    adminUser = await signupResponse.json();
    expect(adminUser).toHaveProperty('id');

    const loginResponse = await request.post(`${BASE_URL}/auth/login`, {
      data: {
        email: adminEmail,
        password: adminPassword,
      },
    });
    expect(loginResponse.ok(), `Admin Login Failed: ${await loginResponse.text()}`).toBeTruthy();
    const { access_token } = await loginResponse.json();
    expect(access_token).toBeTruthy();

    adminRequestContext = await playwright.request.newContext({
      extraHTTPHeaders: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const profileResponse = await adminRequestContext.get(`${BASE_URL}/auth/profile`);
    expect(profileResponse.ok(), `Failed to get admin profile: ${await profileResponse.text()}`).toBeTruthy();
    const profile = await profileResponse.json();
    expect(profile.id).toEqual(adminUser.id);
    expect(profile.roles.some((r: any) => r.name === 'Admin')).toBeTruthy();
  });

  test.afterAll(async () => {
    if (adminRequestContext) {
        for (const equipId of createdEquipmentIds) {
            try {
                await adminRequestContext.delete(`${BASE_URL}/equipment/${equipId}`);
            } catch (error) {
                console.error(`Failed to delete equipment ${equipId}:`, error);
            }
        }
        if (adminUser && adminUser.id) {
            try {
                await adminRequestContext.delete(`${BASE_URL}/users/${adminUser.id}`);
            } catch (error) {
                console.error(`Error deleting admin user ${adminUser.id}:`, error);
            }
        }
        await adminRequestContext.dispose();
    }
    createdEquipmentIds = []; 
    adminUser = null;
  });

  const getSampleEquipmentPayload = () => ({
    name: 'Test Camera E2E',
    serial_number: `SN-${generateRandomString(10)}`,
    category: 'Photography',
    purchase_date: new Date().toISOString().split('T')[0],
    purchase_price: 1200.50,
    status: 'Available', 
    notes: 'Initial E2E test equipment',
  });

  test('POST /equipment - should create new equipment', async () => {
    const payload = getSampleEquipmentPayload();
    payload.serial_number = `SN-POST-${generateRandomString(8)}`; 

    const response = await adminRequestContext.post(`${BASE_URL}/equipment`, {
      data: payload,
    });
    expect(response.status()).toBe(201);
    const equipment = await response.json();
    expect(equipment).toHaveProperty('id');
    expect(equipment.name).toBe(payload.name);
    expect(equipment.serial_number).toBe(payload.serial_number);
    createdEquipmentIds.push(equipment.id);
  });

  test('GET /equipment - should retrieve a paginated list of equipment', async () => {
    if (createdEquipmentIds.length === 0) {
      const payload = getSampleEquipmentPayload();
      payload.serial_number = `SN-PAGIN-${generateRandomString(8)}`;
      const postResponse = await adminRequestContext.post(`${BASE_URL}/equipment`, { data: payload });
      expect(postResponse.status()).toBe(201);
      createdEquipmentIds.push((await postResponse.json()).id);
    }
    const response = await adminRequestContext.get(`${BASE_URL}/equipment`, {
      params: { page: 1, limit: 5 },
    });
    expect(response.status()).toBe(200);
    const paginatedResult = await response.json();
    expect(paginatedResult).toHaveProperty('items');
    expect(paginatedResult).toHaveProperty('meta');
    expect(paginatedResult.items.length).toBeGreaterThanOrEqual(1);
    expect(paginatedResult.meta.itemCount).toBeGreaterThanOrEqual(1);
  });

  test('GET /equipment/:id - should retrieve a specific piece of equipment', async () => {
    let equipmentId = createdEquipmentIds[0];
    if (!equipmentId) {
      const payload = getSampleEquipmentPayload();
      payload.serial_number = `SN-GETID-${generateRandomString(8)}`;
      const postResponse = await adminRequestContext.post(`${BASE_URL}/equipment`, { data: payload });
      expect(postResponse.status()).toBe(201);
      const newEquipment = await postResponse.json();
      equipmentId = newEquipment.id;
      createdEquipmentIds.push(equipmentId);
    }
    const response = await adminRequestContext.get(`${BASE_URL}/equipment/${equipmentId}`);
    expect(response.status()).toBe(200);
    const equipment = await response.json();
    expect(equipment).toHaveProperty('id', equipmentId);
  });

  test('PATCH /equipment/:id - should update a piece of equipment', async () => {
    let equipmentId = createdEquipmentIds[0];
    if (!equipmentId) {
      const payload = getSampleEquipmentPayload();
      payload.serial_number = `SN-PATCH-${generateRandomString(8)}`;
      const postResponse = await adminRequestContext.post(`${BASE_URL}/equipment`, { data: payload });
      expect(postResponse.status()).toBe(201);
      const newEquipment = await postResponse.json();
      equipmentId = newEquipment.id;
      createdEquipmentIds.push(equipmentId);
    }
    const updatePayload = {
      name: 'Updated Test Camera E2E',
      status: 'Under Maintenance',
      notes: 'Updated during PATCH E2E test',
    };

    const response = await adminRequestContext.patch(`${BASE_URL}/equipment/${equipmentId}`, {
      data: updatePayload,
    });
    expect(response.status()).toBe(200);
    const updatedEquipment = await response.json();
    expect(updatedEquipment.id).toBe(equipmentId);
    expect(updatedEquipment.name).toBe(updatePayload.name);
    expect(updatedEquipment.status).toBe(updatePayload.status);
  });

  test('DELETE /equipment/:id - should delete a piece of equipment', async () => {
    let equipmentIdToDelete = createdEquipmentIds.pop(); 
    if (!equipmentIdToDelete) {
      const payload = getSampleEquipmentPayload();
      payload.serial_number = `SN-DEL-${generateRandomString(8)}`;
      const postResponse = await adminRequestContext.post(`${BASE_URL}/equipment`, { data: payload });
      expect(postResponse.status()).toBe(201);
      equipmentIdToDelete = (await postResponse.json()).id;
    } else {
      // ID was popped, no need to re-add to createdEquipmentIds
    }
    const response = await adminRequestContext.delete(`${BASE_URL}/equipment/${equipmentIdToDelete!}`);
    expect(response.status()).toBe(204); 

    const getResponse = await adminRequestContext.get(`${BASE_URL}/equipment/${equipmentIdToDelete!}`);
    expect(getResponse.status()).toBe(404);
  });

  test('POST /equipment - should prevent creating equipment with duplicate serial number', async () => {
    const serial = `SN-DUP-${generateRandomString(8)}`;
    const initialPayload = getSampleEquipmentPayload();
    initialPayload.serial_number = serial;
    
    const response1 = await adminRequestContext.post(`${BASE_URL}/equipment`, { data: initialPayload });
    expect(response1.status()).toBe(201);
    const equipment1 = await response1.json();
    createdEquipmentIds.push(equipment1.id);

    const secondPayload = getSampleEquipmentPayload();
    secondPayload.name = "Another Camera";
    secondPayload.serial_number = serial; 

    const response2 = await adminRequestContext.post(`${BASE_URL}/equipment`, {
      data: secondPayload,
    });
    expect(response2.status()).toBe(409); 
    const error = await response2.json();
    expect(error.message).toContain('already exists');
  });
}); 