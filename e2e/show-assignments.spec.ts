import { test, expect, APIRequestContext } from '@playwright/test';
import { createRandomUser, UserData, generateRandomString } from './utils/user-helpers';
import { RoleName } from '../api/src/modules/roles/entities/role-name.enum';

const BASE_URL = 'http://localhost:3000/api';

let adminContext: APIRequestContext; // Changed from adminRequest
let adminApiUser: UserData;
let accessToken: string; // Keep for direct use if needed, but prefer context

let testShowId: string;
let testUserId: string;
let testShowRoleId: string;
let createdShowAssignmentId: string | undefined;

let createdClientForShowAssignments: string;

test.describe.serial('ShowAssignments API CRUD Flows', () => {
  test.beforeAll(async ({ playwright }) => { // Changed from 'request: apiRequest' to 'playwright'
    // Create admin user to get a token
    adminApiUser = await createRandomUser(playwright, BASE_URL, RoleName.ADMIN);
    accessToken = adminApiUser.token;
    expect(accessToken, 'Access token not received for admin user').toBeDefined();

    adminContext = await playwright.request.newContext({
      baseURL: BASE_URL,
      extraHTTPHeaders: { Authorization: `Bearer ${accessToken}` },
    });

    console.log(`[SA E2E] Admin user ${adminApiUser.email} for show assignment tests set up.`);

    // Ensure 'Photographer' show role exists and we have its ID
    const targetShowRoleName = 'Photographer';
    let postRoleResponse = await adminContext.post(`${BASE_URL}/show-roles`, {
      data: { name: targetShowRoleName, description: `E2E Test ${targetShowRoleName} Show Role` },
    });

    if (postRoleResponse.ok()) { // 201 Created
      testShowRoleId = (await postRoleResponse.json()).id;
      console.log(`Show role '${targetShowRoleName}' created successfully with ID: ${testShowRoleId}`);
    } else if (postRoleResponse.status() === 409) { // Conflict
      console.warn(`Conflict creating show role '${targetShowRoleName}', fetching existing.`);
      const listRolesResponse = await adminContext.get(`${BASE_URL}/show-roles`, { params: { limit: 200 } }); // Fetch all
      if (!listRolesResponse.ok()) {
        throw new Error(`Failed to list show roles after conflict: ${await listRolesResponse.text()}`);
      }
      const rolesList = await listRolesResponse.json();
      const foundRole = rolesList.items.find((r: any) => r.name === targetShowRoleName);
      if (!foundRole) {
        throw new Error(`Show role '${targetShowRoleName}' not found in list after conflict.`);
      }
      testShowRoleId = foundRole.id;
      console.log(`Found existing show role '${targetShowRoleName}' with ID: ${testShowRoleId}`);
    } else {
      throw new Error(`Failed to create or ensure show role '${targetShowRoleName}': ${await postRoleResponse.text()}`);
    }
    expect(testShowRoleId, `Failed to get ID for '${targetShowRoleName}' show role`).toBeDefined();

    // Create a client first
    const clientName = `E2E Client SA ${generateRandomString(5)}`;
    const clientPayload = {
      name: clientName,
      phone_number: '+14155550101', // Using a known valid E.164 number
      email: `client_sa_${generateRandomString(5)}@example.com`,
    };
    const clientResponse = await adminContext.post(`${BASE_URL}/clients`, { data: clientPayload });
    expect(clientResponse.ok(), `Failed to create client for show assignments: ${await clientResponse.text()}`).toBeTruthy();
    const client = await clientResponse.json();
    createdClientForShowAssignments = client.id;

    // Create a test show
    const showTitle = `E2E Show For Assignment ${generateRandomString(5)}`;
    const showPayload = {
      clientId: createdClientForShowAssignments,
      title: showTitle,
      show_type: 'E2E Test Event',
      start_datetime: new Date().toISOString(),
      total_price: 1200,
    };
    const showResponse = await adminContext.post(`${BASE_URL}/shows`, { data: showPayload });
    expect(showResponse.ok(), `Show creation failed in beforeAll: ${await showResponse.text()}`).toBeTruthy();
    const show = await showResponse.json();
    testShowId = show.id;
    expect(testShowId).toBeDefined();

    // Create a test user (e.g., a photographer to be assigned)
    // Using createRandomUser which handles signup and gives back user data including ID
    const photographerUser = await createRandomUser(playwright, BASE_URL, RoleName.PHOTOGRAPHER);
    testUserId = photographerUser.id;
    expect(testUserId).toBeDefined();
  });

  test.afterAll(async () => {
    if (adminContext) {
      // Delete show assignment first if created
      if (createdShowAssignmentId) {
        await adminContext.delete(`${BASE_URL}/show-assignments/${createdShowAssignmentId}`).catch(() => {});
      }
      // Delete the show
      if (testShowId) {
        await adminContext.delete(`${BASE_URL}/shows/${testShowId}`).catch(() => {});
      }
      // Delete the client
      if (createdClientForShowAssignments) {
        await adminContext.delete(`${BASE_URL}/clients/${createdClientForShowAssignments}`).catch(() => {});
      }
      // Delete the photographer user (if createRandomUser doesn't handle cleanup)
      if (testUserId) {
         // User deletion might require specific privileges or cascade, careful here
         // await adminContext.delete(`${BASE_URL}/users/${testUserId}`).catch(() => {});
      }
       // Show Role cleanup usually not needed if they are system/seeded roles

      await adminContext.dispose();
    }
    // Admin user (adminApiUser) cleanup if necessary and if createRandomUser doesn't handle it.
  });

  test('POST /show-assignments - should create a new show assignment successfully', async () => { // Removed 'request' fixture
    const payload = {
      showId: testShowId,
      userId: testUserId,
      showRoleId: testShowRoleId,
      // assigned_by_user_id will be set by the backend based on the token
    };

    const responseCreate = await adminContext.post(`${BASE_URL}/show-assignments`, {
      data: payload,
      // headers already set in adminContext
    });

    console.log('[E2E ShowAssignments Test] Create ShowAssignment Response Body:', await responseCreate.text());
    expect(responseCreate.ok(), `Create ShowAssignment Failed: ${await responseCreate.text()}`).toBeTruthy();
    const responseBodyCreate = await responseCreate.json();

    expect(responseBodyCreate.id).toBeDefined();
    createdShowAssignmentId = responseBodyCreate.id;
    expect(responseBodyCreate.show_id).toBe(testShowId);
    expect(responseBodyCreate.user_id).toBe(testUserId);
    expect(responseBodyCreate.show_role_id).toBe(testShowRoleId);
    expect(responseBodyCreate.confirmation_status).toBe('Pending'); // Default status
    expect(responseBodyCreate.assigned_by_user_id).toBe(adminApiUser.id); // Check if admin user ID matches
  });

  test('GET /show-assignments/:id - should retrieve the created show assignment by ID', async () => { // Removed 'request' fixture
    expect(createdShowAssignmentId, 'createdShowAssignmentId is not defined for GET by ID test').toBeDefined();

    const response = await adminContext.get(`${BASE_URL}/show-assignments/${createdShowAssignmentId}`);
    expect(response.ok(), `GET ShowAssignment by ID failed: ${await response.text()}`).toBeTruthy();
    const responseBodyGet = await response.json();

    expect(responseBodyGet.id).toBe(createdShowAssignmentId);
    expect(responseBodyGet.show_id).toBe(testShowId);
    expect(responseBodyGet.user_id).toBe(testUserId);
  });

  test('GET /show-assignments/show/:showId - should retrieve assignments for a specific show', async () => {
        expect(testShowId, 'testShowId is not defined for GET by show test').toBeDefined();
        const response = await adminContext.get(`${BASE_URL}/show-assignments/show/${testShowId}`);
        expect(response.ok(), `GET ShowAssignments by Show ID failed: ${await response.text()}`).toBeTruthy();
        const paginatedResponse = await response.json();
        expect(paginatedResponse).toHaveProperty('items');
        expect(paginatedResponse).toHaveProperty('meta');
        expect(paginatedResponse.items).toBeInstanceOf(Array);
        expect(paginatedResponse.items.length).toBeGreaterThanOrEqual(1);
        const found = paginatedResponse.items.find((a: any) => a.id === createdShowAssignmentId);
        expect(found).toBeDefined();
  });

  test('GET /show-assignments/user/:userId - should retrieve assignments for a specific user', async () => {
    expect(testUserId, 'testUserId is not defined for GET by user test').toBeDefined();
    const response = await adminContext.get(`${BASE_URL}/show-assignments/user/${testUserId}`);
    expect(response.ok(), `GET ShowAssignments by User ID failed: ${await response.text()}`).toBeTruthy();
    const paginatedResponse = await response.json(); 
    expect(paginatedResponse).toHaveProperty('items');
    expect(paginatedResponse).toHaveProperty('meta');
    expect(paginatedResponse.items).toBeInstanceOf(Array); 
    expect(paginatedResponse.items.length).toBeGreaterThanOrEqual(1);
    const found = paginatedResponse.items.find((a: any) => a.id === createdShowAssignmentId);
    expect(found).toBeDefined();
  });

  test('PATCH /show-assignments/:id/decline - should decline a show assignment', async () => {
    expect(createdShowAssignmentId, 'createdShowAssignmentId is not defined for decline test').toBeDefined();
    const declineReason = 'Unavailable for this date (E2E test)';
    const response = await adminContext.patch(`${BASE_URL}/show-assignments/${createdShowAssignmentId}/decline`, {
      data: { decline_reason: declineReason },
    });
    expect(response.ok(), `Decline ShowAssignment failed: ${await response.text()}`).toBeTruthy();
    const updatedAssignment = await response.json();
    expect(updatedAssignment.confirmation_status).toBe('Declined');
    expect(updatedAssignment.decline_reason).toBe(declineReason);
  });

  test('PATCH /show-assignments/:id/confirm - should confirm a show assignment', async () => {
    expect(createdShowAssignmentId, 'createdShowAssignmentId is not defined for confirm test').toBeDefined();
    const response = await adminContext.patch(`${BASE_URL}/show-assignments/${createdShowAssignmentId}/confirm`, {});
    expect(response.ok(), `Confirm ShowAssignment failed: ${await response.text()}`).toBeTruthy();
    const updatedAssignment = await response.json();
    expect(updatedAssignment.confirmation_status).toBe('Confirmed');
    expect(updatedAssignment.confirmed_at).toBeDefined();
    expect(updatedAssignment.decline_reason).toBeNull();
  });

  test('DELETE /show-assignments/:id - should delete a show assignment', async () => { // Removed 'request' fixture
    expect(createdShowAssignmentId, 'createdShowAssignmentId is not defined for DELETE test').toBeDefined();
    const response = await adminContext.delete(`${BASE_URL}/show-assignments/${createdShowAssignmentId}`);
    expect(response.status()).toBe(204); // No Content

    // Verify it's gone
    const getResponse = await adminContext.get(`${BASE_URL}/show-assignments/${createdShowAssignmentId}`);
    expect(getResponse.status()).toBe(404);
    createdShowAssignmentId = undefined; // Sửa thành undefined
  });
}); 