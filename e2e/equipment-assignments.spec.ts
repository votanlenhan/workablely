import { test, expect, APIRequestContext } from '@playwright/test';
import { generateRandomString, generateRandomPhoneNumber } from './utils/random-helpers';

const BASE_URL = 'http://localhost:3000/api';

let superAdminContext: APIRequestContext; // For creating roles
let superAdminId: string; // Store ID for cleanup
let adminRequestContext: APIRequestContext; // For running most tests
let adminUser: any; // The user with Admin+Manager roles for tests
let createdEquipmentId: string;
let createdShowId: string;
let testUserId: string; // User with Photographer role
let createdAssignmentIds: string[] = [];
let createdClientId: string;

test.describe('Equipment Assignments API', () => {
  test.beforeAll(async ({ playwright, request }) => {
    // 1. Create a SuperAdmin user (only Admin role) to set up other roles
    const superAdminEmail = `superadmin_${generateRandomString(8)}@example.com`;
    const superAdminPassword = 'password123';
    let superAdminSignupResponse = await request.post(`${BASE_URL}/auth/signup`, {
      data: { email: superAdminEmail, password: superAdminPassword, first_name: 'Super', last_name: 'AdminE2E', roleNames: ['Admin'] },
    });
    expect(superAdminSignupResponse.ok(), `SuperAdmin Signup Failed: ${await superAdminSignupResponse.text()}`).toBeTruthy();
    const superAdmin = await superAdminSignupResponse.json();
    superAdminId = superAdmin.id;

    const superAdminLoginResponse = await request.post(`${BASE_URL}/auth/login`, {
      data: { email: superAdminEmail, password: superAdminPassword },
    });
    expect(superAdminLoginResponse.ok()).toBeTruthy();
    const { access_token: superAdminToken } = await superAdminLoginResponse.json();
    superAdminContext = await playwright.request.newContext({
      extraHTTPHeaders: { Authorization: `Bearer ${superAdminToken}` },
    });

    // 2. Create 'Manager' and 'Photographer' roles if they don't exist
    const rolesToEnsure = ['Manager', 'Photographer'];
    for (const roleName of rolesToEnsure) {
      const roleGetResponse = await superAdminContext.get(`${BASE_URL}/roles/name/${roleName}`);
      if (!roleGetResponse.ok()) { 
        const roleCreateResponse = await superAdminContext.post(`${BASE_URL}/roles`, {
          data: { name: roleName, description: `E2E Test ${roleName} Role` },
        });
        if (!roleCreateResponse.ok() && roleCreateResponse.status() !== 409) {
          throw new Error(`${roleName} Role Creation Failed with status ${roleCreateResponse.status()}: ${await roleCreateResponse.text()}`);
        }
        if (roleCreateResponse.ok()) {
            console.log(`${roleName} role created by this worker.`);
        } else if (roleCreateResponse.status() === 409) {
            console.log(`${roleName} role was created by another worker (409 on POST).`);
        }
      } else {
        console.log(`${roleName} role already exists (found by GET).`);
      }
    }

    // 3. Create the main adminUser for tests (Admin + Manager roles)
    const adminEmail = `admin_assign_${generateRandomString(8)}@example.com`;
    const adminPassword = 'password123';
    const signupResponse = await superAdminContext.post(`${BASE_URL}/auth/signup`, { 
      data: {
        email: adminEmail,
        password: adminPassword,
        first_name: 'AdminAssign',
        last_name: 'UserE2E',
        roleNames: ['Admin', 'Manager'],
      },
    });
    expect(signupResponse.ok(), `Test Admin User Signup Failed: ${await signupResponse.text()}`).toBeTruthy();
    adminUser = await signupResponse.json();

    const loginResponse = await request.post(`${BASE_URL}/auth/login`, {
      data: { email: adminEmail, password: adminPassword },
    });
    expect(loginResponse.ok(), `Test Admin Login Failed: ${await loginResponse.text()}`).toBeTruthy();
    const { access_token } = await loginResponse.json();
    adminRequestContext = await playwright.request.newContext({
      extraHTTPHeaders: { Authorization: `Bearer ${access_token}` },
    });

    // 4. Create a standard user for assignment target (Photographer role)
    const testUserEmail = `testuser_${generateRandomString(8)}@example.com`;
    const testUserPassword = 'password123';
    // Use adminRequestContext (who is Admin+Manager) or superAdminContext to create this user
    const userSignupResponse = await adminRequestContext.post(`${BASE_URL}/users`, {
        data: {
          email: testUserEmail,
          password: testUserPassword,
          first_name: 'Test',
          last_name: 'Assignee',
          roleNames: ['Photographer'] 
        }
    });
    expect(userSignupResponse.ok(), `Test Assignee User Signup Failed: ${await userSignupResponse.text()}`).toBeTruthy();
    const testUser = await userSignupResponse.json();
    testUserId = testUser.id;

    // 5. Create Equipment, Client, Show using adminRequestContext
    const equipmentResponse = await adminRequestContext.post(`${BASE_URL}/equipment`, {
      data: {
        name: 'Camera for Assignment E2E',
        serial_number: `SN-ASSIGN-${generateRandomString(8)}`,
        category: 'Camera',
        status: 'Available',
      },
    });
    expect(equipmentResponse.ok(), `Equipment Creation Failed: ${await equipmentResponse.text()}`).toBeTruthy();
    createdEquipmentId = (await equipmentResponse.json()).id;

    const clientResponse = await adminRequestContext.post(`${BASE_URL}/clients`, {
      data: {
        name: `ClientForShowAssignE2E ${generateRandomString(4)}`,
        phone_number: '+16505551234',
        email: `client_show_assign_${generateRandomString(4)}@example.com`,
      },
    });
    expect(clientResponse.ok(), `Client creation failed: ${await clientResponse.text()}`).toBeTruthy();
    createdClientId = (await clientResponse.json()).id;

    const showResponse = await adminRequestContext.post(`${BASE_URL}/shows`, {
      data: {
        clientId: createdClientId,
        title: 'Show for Equipment Assignment E2E',
        show_type: 'Event',
        start_datetime: new Date().toISOString(),
        total_price: 500,
      },
    });
    expect(showResponse.ok(), `Show Creation Failed: ${await showResponse.text()}`).toBeTruthy();
    createdShowId = (await showResponse.json()).id;
  });

  test.afterAll(async () => {
    // Use adminRequestContext for most cleanup, fall back to superAdminContext if needed for users
    const contextForCleanup = adminRequestContext || superAdminContext;
    if (!contextForCleanup) return;

    for (const assignId of createdAssignmentIds) {
      try { await contextForCleanup.delete(`${BASE_URL}/equipment-assignments/${assignId}`); } catch (e) { console.error(`Cleanup failed for assignment ${assignId}:`, e);}
    }
    if (createdEquipmentId) {
      try { await contextForCleanup.delete(`${BASE_URL}/equipment/${createdEquipmentId}`); } catch (e) { console.error(`Cleanup failed for equipment ${createdEquipmentId}:`, e);}
    }
    if (createdShowId) {
      try { await contextForCleanup.delete(`${BASE_URL}/shows/${createdShowId}`); } catch (e) { console.error(`Cleanup failed for show ${createdShowId}:`, e);}
    }
    if (createdClientId) { 
        try { await contextForCleanup.delete(`${BASE_URL}/clients/${createdClientId}`); } catch (e) { console.error(`Cleanup failed for client ${createdClientId}:`, e);}
    }
    if (testUserId){
      try { await contextForCleanup.delete(`${BASE_URL}/users/${testUserId}`); } catch (e) { console.error(`Cleanup failed for testUser ${testUserId}:`, e);}
    }
    if (adminUser && adminUser.id) { // This is the adminUser for tests, not superAdmin
      try { await (superAdminContext || contextForCleanup).delete(`${BASE_URL}/users/${adminUser.id}`); } catch (e) { console.error(`Cleanup failed for adminUser ${adminUser.id}:`, e);}
    }
    // Cleanup superAdmin user
    if (superAdminId && superAdminContext) { // Use stored superAdminId
        try { await superAdminContext.delete(`${BASE_URL}/users/${superAdminId}`); } catch (e) { console.error(`Cleanup failed for superAdminUser ${superAdminId}:`, e);}
    }
    
    if (adminRequestContext) await adminRequestContext.dispose();
    if (superAdminContext) await superAdminContext.dispose();
    
    createdAssignmentIds = [];
    createdEquipmentId = '';
    createdShowId = '';
    testUserId = '';
    adminUser = null;
    createdClientId = '';
  });

  const getSampleAssignmentPayload = () => ({
    equipment_id: createdEquipmentId,
    show_id: createdShowId,
    user_id: testUserId,
    assignment_date: new Date().toISOString(),
    expected_return_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'E2E test assignment',
  });

  test('POST /equipment-assignments - should create a new equipment assignment', async () => {
    const payload = getSampleAssignmentPayload();
    const response = await adminRequestContext.post(`${BASE_URL}/equipment-assignments`, {
      data: payload,
    });
    expect(response.status(), `Assignment creation failed: ${await response.text()}`).toBe(201);
    const assignment = await response.json();
    expect(assignment).toHaveProperty('id');
    expect(assignment.equipment_id).toBe(payload.equipment_id);
    expect(assignment.show_id).toBe(payload.show_id);
    expect(assignment.user_id).toBe(payload.user_id);
    expect(assignment.status).toBe('Assigned');
    createdAssignmentIds.push(assignment.id);

    const equipmentResponse = await adminRequestContext.get(`${BASE_URL}/equipment/${createdEquipmentId}`);
    expect((await equipmentResponse.json()).status).toBe('In Use');
  });

  test('GET /equipment-assignments - should retrieve a paginated list of assignments', async () => {
    if (createdAssignmentIds.length === 0) {
      const postResponse = await adminRequestContext.post(`${BASE_URL}/equipment-assignments`, {
        data: getSampleAssignmentPayload(),
      });
      expect(postResponse.ok(), `Failed to create assignment for pagination test: ${await postResponse.text()}`).toBeTruthy();
      createdAssignmentIds.push((await postResponse.json()).id);
    }

    const response = await adminRequestContext.get(`${BASE_URL}/equipment-assignments`, {
      params: { page: 1, limit: 5 },
    });
    expect(response.status()).toBe(200);
    const paginatedResult = await response.json();
    expect(paginatedResult).toHaveProperty('items');
    expect(paginatedResult.items.length).toBeGreaterThanOrEqual(1);
  });

  test('GET /equipment-assignments/:id - should retrieve a specific assignment', async () => {
    if (createdAssignmentIds.length === 0) {
      const postResponse = await adminRequestContext.post(`${BASE_URL}/equipment-assignments`, {
        data: getSampleAssignmentPayload(),
      });
      expect(postResponse.ok()).toBeTruthy();
      createdAssignmentIds.push((await postResponse.json()).id);
    }
    const assignmentId = createdAssignmentIds[0];
    const response = await adminRequestContext.get(`${BASE_URL}/equipment-assignments/${assignmentId}`);
    expect(response.status()).toBe(200);
    const assignment = await response.json();
    expect(assignment).toHaveProperty('id', assignmentId);
  });

  test('PATCH /equipment-assignments/:id - should update an assignment (e.g., return equipment)', async () => {
    let assignmentIdToUpdate = createdAssignmentIds[0];
    if (!assignmentIdToUpdate) {
        const postResponse = await adminRequestContext.post(`${BASE_URL}/equipment-assignments`, {
            data: getSampleAssignmentPayload(),
        });
        expect(postResponse.ok()).toBeTruthy();
        assignmentIdToUpdate = (await postResponse.json()).id;
        createdAssignmentIds.push(assignmentIdToUpdate);
    }

    const updatePayload = {
      status: 'Returned',
      actual_return_date: new Date().toISOString(),
      notes: 'Equipment returned, E2E test',
    };

    const response = await adminRequestContext.patch(`${BASE_URL}/equipment-assignments/${assignmentIdToUpdate}`, {
      data: updatePayload,
    });
    expect(response.status(), `Failed to update assignment: ${await response.text()}`).toBe(200);
    const updatedAssignment = await response.json();
    expect(updatedAssignment.id).toBe(assignmentIdToUpdate);
    expect(updatedAssignment.status).toBe(updatePayload.status);

    const equipmentResponse = await adminRequestContext.get(`${BASE_URL}/equipment/${createdEquipmentId}`);
    expect((await equipmentResponse.json()).status).toBe('Available');
  });

  test('DELETE /equipment-assignments/:id - should delete an assignment', async () => {
    let assignmentIdToDelete = createdAssignmentIds.pop();
    if (!assignmentIdToDelete) {
      const postResponse = await adminRequestContext.post(`${BASE_URL}/equipment-assignments`, {
        data: getSampleAssignmentPayload(),
      });
      expect(postResponse.ok()).toBeTruthy();
      assignmentIdToDelete = (await postResponse.json()).id;
    }
    const equipBeforeDel = await adminRequestContext.get(`${BASE_URL}/equipment/${createdEquipmentId}`);
    if ((await equipBeforeDel.json()).status !== 'In Use') {
        await adminRequestContext.patch(`${BASE_URL}/equipment-assignments/${assignmentIdToDelete}`, {data: {status: 'Assigned'}});
    }

    const response = await adminRequestContext.delete(`${BASE_URL}/equipment-assignments/${assignmentIdToDelete!}`);
    expect(response.status()).toBe(204);

    const getResponse = await adminRequestContext.get(`${BASE_URL}/equipment-assignments/${assignmentIdToDelete!}`);
    expect(getResponse.status()).toBe(404);
    
    const equipmentResponse = await adminRequestContext.get(`${BASE_URL}/equipment/${createdEquipmentId}`);
    expect((await equipmentResponse.json()).status).toBe('Available');
  });
}); 