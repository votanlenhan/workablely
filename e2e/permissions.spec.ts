import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000/api'; // Define BASE_URL

// Helper to generate a random name
const generateRandomName = (prefix: string) => {
  const randomString = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${randomString}`;
};

let accessToken = '';
const adminUserEmail = 'admin@example.com'; // Should match the one in roles.spec.ts or be a general test admin
const adminPassword = 'AdminPassword123!'; // Ensure this user exists and has admin privileges

let createdPermissionId = '';
const newPermissionAction = generateRandomName('testAction');
const newPermissionSubject = generateRandomName('TestSubject');
const updatedPermissionDescription = 'Updated E2E Test Permission Description';

test.describe.serial('Permissions API CRUD Flows', () => {
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
        console.error(`Admin signup failed unexpectedly in permissions.spec: ${signupResponse.status()} ${await signupResponse.text()}`);
        throw new Error(`Admin signup failed in permissions.spec: ${signupResponse.status()}`);
      }
    } catch (error) {
      console.error('Error during admin user signup HTTP call for permissions.spec:', error);
      throw error;
    }

    // 2. Log in as admin to get the access token
    const loginResponse = await request.post(`${BASE_URL}/auth/login`, {
      data: { email: adminUserEmail, password: adminPassword },
    });
    expect(loginResponse.ok(), `Admin login failed in permissions.spec: ${await loginResponse.text()}`).toBeTruthy();
    const loginData = await loginResponse.json();
    accessToken = loginData.access_token;
    expect(accessToken).toBeTruthy();
    
    // 3. Verify the logged-in user has the Admin role via profile check
    if (accessToken) {
      const profileResponse = await request.get(`${BASE_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      expect(profileResponse.ok(), `Fetching admin profile failed in permissions.spec: ${await profileResponse.text()}`).toBeTruthy();
      const profileData = await profileResponse.json();
      // console.log('[E2E Permissions Test] Admin Profile Data (after login):', JSON.stringify(profileData, null, 2));
      const hasAdminRole = profileData.roles?.some((role: any) => role.name === 'Admin');
      expect(hasAdminRole, 'Logged in admin user does not have the Admin role after signup/login in permissions.spec.').toBeTruthy();
    } else {
      throw new Error('Access token not obtained, cannot verify admin role in permissions.spec.');
    }
  });

  test('POST /permissions - should create a new permission successfully', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/permissions`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: {
        action: newPermissionAction,
        subject: newPermissionSubject,
        description: 'E2E Test Permission',
      },
    });
    expect(response.ok(), `Create permission failed: ${await response.text()}`).toBeTruthy();
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('id');
    createdPermissionId = responseBody.id;
    expect(responseBody.action).toBe(newPermissionAction);
    expect(responseBody.subject).toBe(newPermissionSubject);
  });

  test('POST /permissions - should fail to create a permission with a duplicate action and subject', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/permissions`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: {
        action: newPermissionAction, // Duplicate action
        subject: newPermissionSubject, // Duplicate subject
        description: 'Another E2E Test Permission',
      },
    });
    expect(response.status()).toBe(409); // Conflict
  });

  test('GET /permissions/:id - should retrieve the created permission by ID', async ({ request }) => {
    expect(createdPermissionId).not.toBe('');
    const response = await request.get(`${BASE_URL}/permissions/${createdPermissionId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(response.ok()).toBeTruthy();
    const responseBody = await response.json();
    expect(responseBody.id).toBe(createdPermissionId);
    expect(responseBody.action).toBe(newPermissionAction);
    expect(responseBody.subject).toBe(newPermissionSubject);
  });

  test('GET /permissions - should retrieve a list of permissions (basic check)', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/permissions`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(response.ok()).toBeTruthy();
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('items');
    expect(responseBody).toHaveProperty('meta');
    expect(Array.isArray(responseBody.items)).toBeTruthy();
    // Check if the created permission is in the list
    const foundPermission = responseBody.items.find(perm => perm.id === createdPermissionId);
    expect(foundPermission).toBeDefined();
    expect(foundPermission.action).toBe(newPermissionAction);
    expect(foundPermission.subject).toBe(newPermissionSubject);
  });

  test('PATCH /permissions/:id - should update the created permission', async ({ request }) => {
    expect(createdPermissionId).not.toBe('');
    const response = await request.patch(`${BASE_URL}/permissions/${createdPermissionId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: {
        description: updatedPermissionDescription,
      },
    });
    expect(response.ok()).toBeTruthy();
    const responseBody = await response.json();
    expect(responseBody.id).toBe(createdPermissionId);
    expect(responseBody.description).toBe(updatedPermissionDescription);
    expect(responseBody.action).toBe(newPermissionAction); // Action should not change
    expect(responseBody.subject).toBe(newPermissionSubject); // Subject should not change
  });

  test('DELETE /permissions/:id - should delete the created permission', async ({ request }) => {
    expect(createdPermissionId).not.toBe('');
    const response = await request.delete(`${BASE_URL}/permissions/${createdPermissionId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(response.status()).toBe(204); // No Content
  });

  test('GET /permissions/:id - should fail to retrieve the deleted permission', async ({ request }) => {
    expect(createdPermissionId).not.toBe('');
    const response = await request.get(`${BASE_URL}/permissions/${createdPermissionId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(response.status()).toBe(404); // Not Found
  });
}); 