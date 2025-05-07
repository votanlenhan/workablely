import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000/api'; // Define BASE_URL

const generateRandomString = (length: number = 8) => Math.random().toString(36).substring(2, 2 + length);

let accessToken = '';
const adminUserEmail = 'admin@example.com';
const adminPassword = 'AdminPassword123!';
let adminUserId = '';

// IDs for dependent entities, created in beforeAll
let testShowId = '';
let testClientIdForShowAssignments = '';
let testUserIdForAssignment = ''; // A user to be assigned to the show
let testShowRoleId = '';

let createdShowAssignmentId = '';

test.describe.serial('ShowAssignments API CRUD Flows', () => {
  test.beforeAll(async ({ request }) => {
    // 1. Attempt to sign up the admin user with 'Admin' role by name
    try {
      const signupResponse = await request.post(`${BASE_URL}/auth/signup`, {
        data: {
          email: adminUserEmail,
          password: adminPassword,
          first_name: 'Admin',
          last_name: 'E2E',
          roleNames: ['Admin'], 
        },
      });
      if (!signupResponse.ok() && signupResponse.status() !== 409 /* Conflict, user already exists */) {
        console.error(`Admin signup failed unexpectedly in show-assignments.spec: ${signupResponse.status()} ${await signupResponse.text()}`);
        throw new Error(`Admin signup failed in show-assignments.spec: ${signupResponse.status()}`);
      }
    } catch (error) {
      console.error('Error during admin user signup HTTP call for show-assignments.spec:', error);
      throw error;
    }

    // 2. Log in as admin to get the access token
    const loginResponse = await request.post(`${BASE_URL}/auth/login`, {
      data: { email: adminUserEmail, password: adminPassword },
    });
    expect(loginResponse.ok(), `Admin login failed in show-assignments.spec: ${await loginResponse.text()}`).toBeTruthy();
    const loginData = await loginResponse.json();
    accessToken = loginData.access_token;
    expect(accessToken).toBeTruthy();
    
    // 3. Verify the logged-in user has the Admin role via profile check
    if (accessToken) {
      const profileResponse = await request.get(`${BASE_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      expect(profileResponse.ok(), `Fetching admin profile failed in show-assignments.spec: ${await profileResponse.text()}`).toBeTruthy();
      const profileData = await profileResponse.json();
      // console.log('[E2E ShowAssignments Test] Admin Profile Data (after login):', JSON.stringify(profileData, null, 2));
      const hasAdminRole = profileData.roles?.some((role: any) => role.name === 'Admin');
      expect(hasAdminRole, 'Logged in admin user does not have the Admin role after signup/login in show-assignments.spec.').toBeTruthy();
    } else {
      throw new Error('Access token not obtained, cannot verify admin role in show-assignments.spec.');
    }

    // 4. Create a Client
    const clientName = `TestClientForSA_${generateRandomString()}`;
    const validClientPhoneNumber = '+14155552673'; // Unique valid phone number
    const clientResponse = await request.post(`${BASE_URL}/clients`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: { name: clientName, phone_number: validClientPhoneNumber },
    });
    expect(clientResponse.ok(), `Client creation for SA failed: ${await clientResponse.text()}`).toBeTruthy();
    testClientIdForShowAssignments = (await clientResponse.json()).id;

    // 5. Create a Show
    const showTitle = `TestShowForSA_${generateRandomString()}`;
    const startTime = new Date();
    const showResponse = await request.post(`${BASE_URL}/shows`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: {
        clientId: testClientIdForShowAssignments, // Use camelCase
        title: showTitle,
        show_type: 'E2E_ASSIGNMENT_TEST',
        start_datetime: startTime.toISOString(),
        total_price: 100,
      },
    });
    expect(showResponse.ok(), `Show creation for SA failed: ${await showResponse.text()}`).toBeTruthy();
    testShowId = (await showResponse.json()).id;

    // 6. Create a User (the one to be assigned)
    const userEmail = `assigneduser_${generateRandomString()}@example.com`;
    const userResponse = await request.post(`${BASE_URL}/users`, { 
      headers: { Authorization: `Bearer ${accessToken}` },
      data: {
        email: userEmail,
        password: 'AssignUserPass123!',
        first_name: 'Assigned',
        last_name: 'UserE2E',
      },
    });
    expect(userResponse.ok(), `User creation for SA failed: ${await userResponse.text()}`).toBeTruthy();
    testUserIdForAssignment = (await userResponse.json()).id;

    // 7. Create a ShowRole
    const showRoleName = `TestShowRoleForSA_${generateRandomString()}`;
    const showRoleResponse = await request.post(`${BASE_URL}/show-roles`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: { name: showRoleName, description: 'Role for SA E2E' },
    });
    expect(showRoleResponse.ok(), `ShowRole creation for SA failed: ${await showRoleResponse.text()}`).toBeTruthy();
    testShowRoleId = (await showRoleResponse.json()).id;

    expect(testShowId).toBeTruthy();
    expect(testUserIdForAssignment).toBeTruthy();
    expect(testShowRoleId).toBeTruthy();
  });

  test('POST /show-assignments - should create a new show assignment successfully', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/show-assignments`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: {
        showId: testShowId,
        userId: testUserIdForAssignment,
        showRoleId: testShowRoleId,
        // assigned_by_user_id is usually set by the backend from the authenticated user
      },
    });
    expect(response.ok(), `Create show assignment failed: ${await response.text()}`).toBeTruthy();
    const responseBody = await response.json();
    console.log('[E2E ShowAssignments Test] Create ShowAssignment Response Body:', JSON.stringify(responseBody, null, 2));
    expect(responseBody).toHaveProperty('id');
    createdShowAssignmentId = responseBody.id;
    expect(responseBody.show_id).toBe(testShowId);
    expect(responseBody.user_id).toBe(testUserIdForAssignment);
    expect(responseBody.show_role_id).toBe(testShowRoleId);
    expect(responseBody.confirmation_status).toBe('Pending'); // Default status
  });

  test('POST /show-assignments - should fail with duplicate assignment (user to show)', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/show-assignments`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        data: {
            showId: testShowId,
            userId: testUserIdForAssignment,
            showRoleId: testShowRoleId,
        },
    });
    expect(response.status()).toBe(409); // Conflict
  });

  test('GET /show-assignments/:id - should retrieve the created show assignment by ID', async ({ request }) => {
    expect(createdShowAssignmentId).not.toBe('');
    const response = await request.get(`${BASE_URL}/show-assignments/${createdShowAssignmentId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(response.ok()).toBeTruthy();
    const responseBodyGet = await response.json();
    expect(responseBodyGet.id).toBe(createdShowAssignmentId);
    expect(responseBodyGet.show_id).toBe(testShowId);
  });

  test('GET /show-assignments - should retrieve a list of show assignments (basic check)', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/show-assignments`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(response.ok()).toBeTruthy();
    const responseBody = await response.json();

    // Expect a paginated response object
    expect(responseBody).toBeInstanceOf(Object);
    expect(responseBody).toHaveProperty('items');
    expect(responseBody).toHaveProperty('meta');
    expect(Array.isArray(responseBody.items)).toBeTruthy();

    // Find the created assignment in the items array
    const foundAssignment = responseBody.items.find(sa => sa.id === createdShowAssignmentId);
    expect(foundAssignment).toBeDefined();
    if (foundAssignment) {
      expect(foundAssignment.show_id).toBe(testShowId);
      expect(foundAssignment.user_id).toBe(testUserIdForAssignment);
      expect(foundAssignment.show_role_id).toBe(testShowRoleId);
    }
  });

  test('PATCH /show-assignments/:id - should update the created show assignment', async ({ request }) => {
    expect(createdShowAssignmentId).not.toBe('');
    const response = await request.patch(`${BASE_URL}/show-assignments/${createdShowAssignmentId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: {
        confirmationStatus: 'Confirmed',
      },
    });
    console.log(`[E2E ShowAssignments PATCH] Status: ${response.status()}, Text: ${await response.text()}`); // Log status and text
    expect(response.ok()).toBeTruthy();
    const responseBody = await response.json();
    expect(responseBody.id).toBe(createdShowAssignmentId);
    expect(responseBody.confirmation_status).toBe('Confirmed');
  });

  test('DELETE /show-assignments/:id - should delete the created show assignment', async ({ request }) => {
    expect(createdShowAssignmentId).not.toBe('');
    const response = await request.delete(`${BASE_URL}/show-assignments/${createdShowAssignmentId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(response.status()).toBe(204); // No Content
  });

  test('GET /show-assignments/:id - should fail to retrieve the deleted show assignment', async ({ request }) => {
    expect(createdShowAssignmentId).not.toBe('');
    const response = await request.get(`${BASE_URL}/show-assignments/${createdShowAssignmentId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(response.status()).toBe(404); // Not Found
  });

  // Cleanup dependent entities
  test.afterAll(async ({ request }) => {
    // Order of deletion might matter if there are FK constraints not handled by cascade
    // Ensure accessToken is available in this scope if defined globally in the describe block
    if (createdShowAssignmentId) { // First delete the assignment itself if it was created
        try {
            await request.delete(`${BASE_URL}/show-assignments/${createdShowAssignmentId}`, { headers: { Authorization: `Bearer ${accessToken}` } });
        } catch (e) { console.error(`Failed to delete showAssignment ${createdShowAssignmentId}:`, e); }
    }
    if (testShowId) {
      try {
        await request.delete(`${BASE_URL}/shows/${testShowId}`, { headers: { Authorization: `Bearer ${accessToken}` } });
      } catch (e) { console.error(`Failed to delete show ${testShowId}:`, e); }
    }
    if (testClientIdForShowAssignments) {
      try {
        await request.delete(`${BASE_URL}/clients/${testClientIdForShowAssignments}`, { headers: { Authorization: `Bearer ${accessToken}` } });
      } catch (e) { console.error(`Failed to delete client ${testClientIdForShowAssignments}:`, e); }
    }
    if (testUserIdForAssignment) {
      try {
        await request.delete(`${BASE_URL}/users/${testUserIdForAssignment}`, { headers: { Authorization: `Bearer ${accessToken}` } });
      } catch (e) { console.error(`Failed to delete user ${testUserIdForAssignment}:`, e); }
    }
    if (testShowRoleId) {
      try {
        await request.delete(`${BASE_URL}/show-roles/${testShowRoleId}`, { headers: { Authorization: `Bearer ${accessToken}` } });
      } catch (e) { console.error(`Failed to delete showRole ${testShowRoleId}:`, e); }
    }
    // console.log('Cleaned up entities for ShowAssignments tests.');
  });
}); 