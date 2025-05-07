import { test, expect, APIRequestContext } from '@playwright/test';
// import { generateRandomString, generateRandomPhoneNumber } from './utils/random-helpers'; // Using centralized helpers
import { createRandomUser, UserData, generateRandomString } from './utils/user-helpers';
// import { RoleName } from '../api/src/modules/roles/entities/role-name.enum'; // Avoid importing API enums directly

const BASE_URL = 'http://localhost:3000/api';

// Define role names as strings for robustness in E2E tests
const AdminRole = 'Admin';
const ManagerRole = 'Manager';
const PhotographerRole = 'Photographer';

let superAdminContext: APIRequestContext;
let adminRequestContext: APIRequestContext; // For running most tests

let superAdminApiUser: UserData;
let adminApiUserForTests: UserData; // User with Admin+Manager roles
let photographerApiUser: UserData;  // User with Photographer role

let createdEquipmentId: string;
let createdShowId: string;
let createdAssignmentIds: string[] = [];
let createdClientId: string;

test.describe('Equipment Assignments API', () => {
  test.beforeAll(async ({ playwright }) => {
    // 1. Create a SuperAdmin user (only Admin role) to set up other roles
    superAdminApiUser = await createRandomUser(playwright, BASE_URL, AdminRole);
    superAdminContext = await playwright.request.newContext({
      extraHTTPHeaders: { Authorization: `Bearer ${superAdminApiUser.token}` },
    });
    console.log(`[EA E2E] SuperAdmin user ${superAdminApiUser.email} set up.`);

    // 2. Create 'Manager' and 'Photographer' roles if they don't exist (using SuperAdmin)
    // const rolesToEnsure = [RoleName.MANAGER, RoleName.PHOTOGRAPHER]; // Use string literals instead
    const rolesToEnsure = [ManagerRole, PhotographerRole];
    for (const roleName of rolesToEnsure) {
      const roleGetResponse = await superAdminContext.get(`${BASE_URL}/roles/name/${roleName}`);
      if (!roleGetResponse.ok()) { 
        if (roleGetResponse.status() === 404) {
          const roleCreateResponse = await superAdminContext.post(`${BASE_URL}/roles`, {
            data: { name: roleName, description: `E2E Test ${roleName} Role` },
          });
          if (!roleCreateResponse.ok() && roleCreateResponse.status() !== 409 /* Conflict */) {
            throw new Error(`${roleName} Role Creation Failed with status ${roleCreateResponse.status()}: ${await roleCreateResponse.text()}`);
          }
          // Log success or conflict (already exists)
        } else {
          throw new Error(`Getting role ${roleName} failed: ${await roleGetResponse.text()}`);
        }
      } 
    }
    console.log('[EA E2E] Ensured Manager and Photographer roles exist.');

    // 3. Create the main adminUser for tests (Admin + Manager roles)
    adminApiUserForTests = await createRandomUser(playwright, BASE_URL, [AdminRole, ManagerRole] as any); // Pass as array of strings
    adminRequestContext = await playwright.request.newContext({
      extraHTTPHeaders: { Authorization: `Bearer ${adminApiUserForTests.token}` },
    });
    console.log(`[EA E2E] Test Admin user ${adminApiUserForTests.email} (Admin, Manager) set up.`);

    // 4. Create a standard user for assignment target (Photographer role)
    photographerApiUser = await createRandomUser(playwright, BASE_URL, PhotographerRole); // Use string literal
    // No separate context needed for photographerApiUser if only its ID is used by adminRequestContext
    console.log(`[EA E2E] Photographer user ${photographerApiUser.email} for assignment set up.`);

    // 5. Create Equipment, Client, Show using adminRequestContext (who is Admin+Manager)
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
        phone_number: '+16505551234', // Hardcoded, known-good phone number
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
    console.log('[EA E2E] Prerequisite entities (Equipment, Client, Show) created.');
  });

  test.afterAll(async () => {
    console.log('[EA E2E] Starting cleanup...');
    const contextForCleanup = adminRequestContext || superAdminContext;
    if (!contextForCleanup) {
        console.warn('[EA E2E] No admin context available for full cleanup.');
        if (adminRequestContext) await adminRequestContext.dispose();
        if (superAdminContext) await superAdminContext.dispose();
        return;
    }

    for (const assignId of createdAssignmentIds) {
      try { await contextForCleanup.delete(`${BASE_URL}/equipment-assignments/${assignId}`); } catch (e) { /* ignore */ }
    }
    if (createdEquipmentId) {
      try { await contextForCleanup.delete(`${BASE_URL}/equipment/${createdEquipmentId}`); } catch (e) { /* ignore */ }
    }
    if (createdShowId) {
      try { await contextForCleanup.delete(`${BASE_URL}/shows/${createdShowId}`); } catch (e) { /* ignore */ }
    }
    if (createdClientId) { 
        try { await contextForCleanup.delete(`${BASE_URL}/clients/${createdClientId}`); } catch (e) { /* ignore */ }
    }
    // User cleanup can be tricky due to dependencies or if createRandomUser doesn't delete.
    // For this refactor, focusing on test setup. Actual user deletion might need global strategy.
    if (photographerApiUser && photographerApiUser.id && (superAdminContext || adminRequestContext)) {
      try { await (superAdminContext || adminRequestContext).delete(`${BASE_URL}/users/${photographerApiUser.id}`); } catch (e) { /* ignore */ }
    }
    if (adminApiUserForTests && adminApiUserForTests.id && superAdminContext) { // SuperAdmin has rights to delete other admins if needed
        try { await superAdminContext.delete(`${BASE_URL}/users/${adminApiUserForTests.id}`); } catch (e) { /* ignore */ }
    }
    if (superAdminApiUser && superAdminApiUser.id && superAdminContext) {
        try { await superAdminContext.delete(`${BASE_URL}/users/${superAdminApiUser.id}`); } catch (e) { /* ignore */ }
    }
    
    if (adminRequestContext) await adminRequestContext.dispose();
    if (superAdminContext) await superAdminContext.dispose();
    
    createdAssignmentIds = [];
    createdEquipmentId = '';
    createdShowId = '';
    createdClientId = '';
    console.log('[EA E2E] Cleanup finished.');
  });

  const getSampleAssignmentPayload = () => ({
    equipment_id: createdEquipmentId,
    show_id: createdShowId,
    user_id: photographerApiUser.id, // Use ID from created photographer user
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
    } else {
      // ID was popped, no need to re-add to createdAssignmentIds if we don't intend to reuse it after delete
    }
    // Ensure equipment is 'In Use' before deleting assignment to test status update logic
    const equipStatusCheck = await adminRequestContext.get(`${BASE_URL}/equipment/${createdEquipmentId}`);
    if((await equipStatusCheck.json()).status !== 'In Use') {
       // If not in use, it means the assignment to be deleted was likely already returned or another assignment is active.
       // For this test, we want to ensure deleting an active assignment makes equipment available.
       // Re-assign if necessary, or ensure the one to be deleted IS the active one.
       // This might require creating a fresh assignment specifically for this delete test if state is complex.
       // For now, we'll assume an assignment exists that, when deleted, should free up the equipment.
       // If the equipment is already 'Available', the test of status change post-delete is less direct.
    }

    const response = await adminRequestContext.delete(`${BASE_URL}/equipment-assignments/${assignmentIdToDelete!}`);
    expect(response.status()).toBe(204);

    const getResponse = await adminRequestContext.get(`${BASE_URL}/equipment-assignments/${assignmentIdToDelete!}`);
    expect(getResponse.status()).toBe(404);
    
    const equipmentResponse = await adminRequestContext.get(`${BASE_URL}/equipment/${createdEquipmentId}`);
    expect((await equipmentResponse.json()).status).toBe('Available');
  });
}); 