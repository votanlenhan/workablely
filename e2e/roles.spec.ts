import { test, expect } from '@playwright/test';

// Helper to generate a random name
const generateRandomName = (prefix: string) => {
  const randomString = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${randomString}`;
};

let accessToken = '';
const adminUserEmail = 'admin@example.com';
const adminPassword = 'AdminPassword123!';

let createdRoleId = '';
const newRoleName = generateRandomName('TestRoleE2E');
const updatedRoleDescription = 'Updated E2E Test Role Description';

// Test suite will run serially to manage dependencies between tests (login -> create -> read -> update -> delete)
test.describe.serial('Roles API CRUD Flows', () => {
  test.beforeAll(async ({ request }) => {
    // 1. Attempt to sign up the admin user with 'Admin' role by name
    try {
      const signupResponse = await request.post('/auth/signup', {
        data: {
          email: adminUserEmail,
          password: adminPassword,
          first_name: 'Admin',
          last_name: 'E2E',
          roleNames: ['Admin'], 
        },
      });
      if (!signupResponse.ok() && signupResponse.status() !== 409 /* Conflict, user already exists */) {
        console.error(`Admin signup failed unexpectedly: ${signupResponse.status()} ${await signupResponse.text()}`);
        throw new Error(`Admin signup failed: ${signupResponse.status()}`);
      }
    } catch (error) {
      console.error('Error during admin user signup HTTP call for roles.spec:', error);
      throw error;
    }

    // 2. Log in as admin to get the access token
    const loginResponse = await request.post('/auth/login', {
      data: { email: adminUserEmail, password: adminPassword },
    });
    expect(loginResponse.ok(), `Admin login failed in roles.spec: ${await loginResponse.text()}`).toBeTruthy();
    const loginData = await loginResponse.json();
    accessToken = loginData.access_token;
    expect(accessToken).toBeTruthy();
    
    // 3. Verify the logged-in user has the Admin role via profile check
    if (accessToken) {
      const profileResponse = await request.get('/auth/profile', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      expect(profileResponse.ok(), `Fetching admin profile failed in roles.spec: ${await profileResponse.text()}`).toBeTruthy();
      const profileData = await profileResponse.json();
      // console.log('[E2E Roles Test] Admin Profile Data (after login):', JSON.stringify(profileData, null, 2));
      const hasAdminRole = profileData.roles?.some((role: any) => role.name === 'Admin');
      expect(hasAdminRole, 'Logged in admin user does not have the Admin role after signup/login in roles.spec.').toBeTruthy();
    } else {
      throw new Error('Access token not obtained, cannot verify admin role in roles.spec.');
    }
  });

  test('POST /roles - should create a new role successfully', async ({ request }) => {
    const response = await request.post('/roles', {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: {
        name: newRoleName,
        description: 'E2E Test Role',
        permissionIds: [], // Assuming no permissions for simplicity, add if needed
      },
    });
    expect(response.ok(), `Create role failed: ${await response.text()}`).toBeTruthy();
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('id');
    createdRoleId = responseBody.id;
    expect(responseBody.name).toBe(newRoleName);
    expect(responseBody.description).toBe('E2E Test Role');
  });

  test('POST /roles - should fail to create a role with a duplicate name', async ({ request }) => {
    const response = await request.post('/roles', {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: {
        name: newRoleName, // Duplicate name
        description: 'Another E2E Test Role',
      },
    });
    expect(response.status()).toBe(409); // Conflict
  });

  test('GET /roles/:id - should retrieve the created role by ID', async ({ request }) => {
    expect(createdRoleId).not.toBe('');
    const response = await request.get(`/roles/${createdRoleId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(response.ok()).toBeTruthy();
    const responseBody = await response.json();
    expect(responseBody.id).toBe(createdRoleId);
    expect(responseBody.name).toBe(newRoleName);
  });

  test('GET /roles - should retrieve a list of roles (basic check)', async ({ request }) => {
    const response = await request.get('/roles', {
      headers: { Authorization: `Bearer ${accessToken}` },
      // params: { page: 1, limit: 10 } // Optional: add pagination params if testing pagination
    });
    expect(response.ok()).toBeTruthy();
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('items');
    expect(responseBody).toHaveProperty('meta');
    expect(Array.isArray(responseBody.items)).toBeTruthy();
    // Check if the created role is in the list
    const foundRole = responseBody.items.find(role => role.id === createdRoleId);
    expect(foundRole).toBeDefined();
    expect(foundRole.name).toBe(newRoleName);
  });

  test('PATCH /roles/:id - should update the created role', async ({ request }) => {
    expect(createdRoleId).not.toBe('');
    const response = await request.patch(`/roles/${createdRoleId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: {
        description: updatedRoleDescription,
      },
    });
    expect(response.ok()).toBeTruthy();
    const responseBody = await response.json();
    expect(responseBody.id).toBe(createdRoleId);
    expect(responseBody.description).toBe(updatedRoleDescription);
    expect(responseBody.name).toBe(newRoleName); // Name should not have changed
  });

  test('DELETE /roles/:id - should delete the created role', async ({ request }) => {
    expect(createdRoleId).not.toBe('');
    const response = await request.delete(`/roles/${createdRoleId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(response.status()).toBe(204); // No Content
  });

  test('GET /roles/:id - should fail to retrieve the deleted role', async ({ request }) => {
    expect(createdRoleId).not.toBe('');
    const response = await request.get(`/roles/${createdRoleId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(response.status()).toBe(404); // Not Found
  });
}); 