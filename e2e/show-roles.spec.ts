import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000/api'; // Define BASE_URL

// Helper to generate a random string for uniqueness
const generateRandomString = (length: number = 8) => Math.random().toString(36).substring(2, 2 + length);

let accessToken = '';
const adminUserEmail = 'admin@example.com'; // Ensure this admin exists
const adminPassword = 'AdminPassword123!';

let createdShowRoleId = '';
const newShowRoleName = `E2E ShowRole ${generateRandomString()}`;
const updatedShowRoleDescription = `Updated E2E ShowRole Desc ${generateRandomString()}`;

test.describe.serial('ShowRoles API CRUD Flows', () => {
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
        console.error(`Admin signup failed unexpectedly in show-roles.spec: ${signupResponse.status()} ${await signupResponse.text()}`);
        throw new Error(`Admin signup failed in show-roles.spec: ${signupResponse.status()}`);
      }
    } catch (error) {
      console.error('Error during admin user signup HTTP call for show-roles.spec:', error);
      throw error;
    }

    // 2. Log in as admin to get the access token
    const loginResponse = await request.post(`${BASE_URL}/auth/login`, {
      data: { email: adminUserEmail, password: adminPassword },
    });
    expect(loginResponse.ok(), `Admin login failed in show-roles.spec: ${await loginResponse.text()}`).toBeTruthy();
    const loginData = await loginResponse.json();
    accessToken = loginData.access_token;
    expect(accessToken).toBeTruthy();
    
    // 3. Verify the logged-in user has the Admin role via profile check
    if (accessToken) {
      const profileResponse = await request.get(`${BASE_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      expect(profileResponse.ok(), `Fetching admin profile failed in show-roles.spec: ${await profileResponse.text()}`).toBeTruthy();
      const profileData = await profileResponse.json();
      // console.log('[E2E ShowRoles Test] Admin Profile Data (after login):', JSON.stringify(profileData, null, 2));
      const hasAdminRole = profileData.roles?.some((role: any) => role.name === 'Admin');
      expect(hasAdminRole, 'Logged in admin user does not have the Admin role after signup/login in show-roles.spec.').toBeTruthy();
    } else {
      throw new Error('Access token not obtained, cannot verify admin role in show-roles.spec.');
    }
  });

  test('POST /show-roles - should create a new show role successfully', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/show-roles`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: {
        name: newShowRoleName,
        description: 'E2E Test Show Role',
        default_allocation_percentage: 10.50,
      },
    });
    expect(response.ok(), `Create show role failed: ${await response.text()}`).toBeTruthy();
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('id');
    createdShowRoleId = responseBody.id;
    expect(responseBody.name).toBe(newShowRoleName);
    expect(responseBody.default_allocation_percentage).toBe(10.5); // Changed to expect number
  });

  test('POST /show-roles - should fail to create a show role with a duplicate name', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/show-roles`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: {
        name: newShowRoleName, // Duplicate name
        description: 'Another E2E Show Role',
      },
    });
    expect(response.status()).toBe(409); // Conflict
  });

  test('GET /show-roles/:id - should retrieve the created show role by ID', async ({ request }) => {
    expect(createdShowRoleId).not.toBe('');
    const response = await request.get(`${BASE_URL}/show-roles/${createdShowRoleId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(response.ok()).toBeTruthy();
    const responseBody = await response.json();
    expect(responseBody.id).toBe(createdShowRoleId);
    expect(responseBody.name).toBe(newShowRoleName);
  });

  test('GET /show-roles - should retrieve a list of show roles (and check for created role)', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/show-roles`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { page: 1, limit: 50 }, 
    });
    expect(response.ok()).toBeTruthy();
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('items');
    expect(responseBody).toHaveProperty('meta');
    expect(Array.isArray(responseBody.items)).toBeTruthy();

    const foundShowRole = responseBody.items.find(sr => sr.id === createdShowRoleId);
    expect(foundShowRole).toBeDefined();
    expect(foundShowRole.name).toBe(newShowRoleName);
  });

  test('PATCH /show-roles/:id - should update the created show role', async ({ request }) => {
    expect(createdShowRoleId).not.toBe('');
    const response = await request.patch(`${BASE_URL}/show-roles/${createdShowRoleId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: {
        description: updatedShowRoleDescription,
        default_allocation_percentage: 15.75,
      },
    });
    expect(response.ok()).toBeTruthy();
    const responseBody = await response.json();
    expect(responseBody.id).toBe(createdShowRoleId);
    expect(responseBody.description).toBe(updatedShowRoleDescription);
    expect(responseBody.default_allocation_percentage).toBe(15.75);
  });

  test('DELETE /show-roles/:id - should delete the created show role', async ({ request }) => {
    expect(createdShowRoleId).not.toBe('');
    const response = await request.delete(`${BASE_URL}/show-roles/${createdShowRoleId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(response.status()).toBe(204); // No Content
  });

  test('GET /show-roles/:id - should fail to retrieve the deleted show role', async ({ request }) => {
    expect(createdShowRoleId).not.toBe('');
    const response = await request.get(`${BASE_URL}/show-roles/${createdShowRoleId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(response.status()).toBe(404); // Not Found
  });
}); 