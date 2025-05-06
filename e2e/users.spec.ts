import { test, expect } from '@playwright/test';

// Helper to generate a random string for uniqueness
const generateRandomString = (length: number = 8) => Math.random().toString(36).substring(2, 2 + length);

let accessToken = '';
const adminUserEmail = 'admin@example.com'; // Ensure this admin exists
const adminPassword = 'AdminPassword123!';

let createdUserId = '';
const newUserEmail = `e2e_user_${generateRandomString()}@example.com`;
const newUserPassword = 'PasswordE2E123!';
const updatedUserFirstName = 'UpdatedFirstNameE2E';

test.describe.serial('Users API CRUD Flows (Admin)', () => {
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
        console.error(`Admin signup failed unexpectedly in users.spec: ${signupResponse.status()} ${await signupResponse.text()}`);
        throw new Error(`Admin signup failed in users.spec: ${signupResponse.status()}`);
      }
    } catch (error) {
      console.error('Error during admin user signup HTTP call for users.spec:', error);
      throw error;
    }

    // 2. Log in as admin to get the access token
    const loginResponse = await request.post('/auth/login', {
      data: { email: adminUserEmail, password: adminPassword },
    });
    expect(loginResponse.ok(), `Admin login failed in users.spec: ${await loginResponse.text()}`).toBeTruthy();
    const loginData = await loginResponse.json();
    accessToken = loginData.access_token;
    expect(accessToken).toBeTruthy();
    
    // 3. Verify the logged-in user has the Admin role via profile check
    if (accessToken) {
      const profileResponse = await request.get('/auth/profile', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      expect(profileResponse.ok(), `Fetching admin profile failed in users.spec: ${await profileResponse.text()}`).toBeTruthy();
      const profileData = await profileResponse.json();
      // console.log('[E2E Users Test] Admin Profile Data (after login):', JSON.stringify(profileData, null, 2));
      const hasAdminRole = profileData.roles?.some((role: any) => role.name === 'Admin');
      expect(hasAdminRole, 'Logged in admin user does not have the Admin role after signup/login in users.spec.').toBeTruthy();
    } else {
      throw new Error('Access token not obtained, cannot verify admin role in users.spec.');
    }
  });

  test('POST /users - should create a new user successfully', async ({ request }) => {
    const response = await request.post('/users', {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: {
        email: newUserEmail,
        password: newUserPassword,
        first_name: 'E2E',
        last_name: 'UserTest',
      },
    });
    expect(response.ok(), `Create user failed: ${await response.text()}`).toBeTruthy();
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('id');
    createdUserId = responseBody.id;
    expect(responseBody.email).toBe(newUserEmail);
    expect(responseBody.first_name).toBe('E2E');
    expect(responseBody).not.toHaveProperty('password_hash');
  });

  test('POST /users - should fail to create a user with a duplicate email', async ({ request }) => {
    const response = await request.post('/users', {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: {
        email: newUserEmail, // Duplicate email
        password: 'anotherPass',
        first_name: 'Duplicate',
        last_name: 'User',
      },
    });
    expect(response.status()).toBe(409); // Conflict
  });

  test('GET /users/:id - should retrieve the created user by ID', async ({ request }) => {
    expect(createdUserId).not.toBe('');
    const response = await request.get(`/users/${createdUserId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(response.ok()).toBeTruthy();
    const responseBody = await response.json();
    expect(responseBody.id).toBe(createdUserId);
    expect(responseBody.email).toBe(newUserEmail);
  });

  test('GET /users - should retrieve a list of users (and check for created user)', async ({ request }) => {
    const response = await request.get('/users', {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { page: 1, limit: 50 }, // Fetch more to increase chance of finding user without knowing total pages
    });
    expect(response.ok()).toBeTruthy();
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('items');
    expect(responseBody).toHaveProperty('meta');
    expect(Array.isArray(responseBody.items)).toBeTruthy();

    const foundUser = responseBody.items.find(user => user.id === createdUserId);
    expect(foundUser).toBeDefined();
    expect(foundUser.email).toBe(newUserEmail);
  });

  test('PATCH /users/:id - should update the created user', async ({ request }) => {
    expect(createdUserId).not.toBe('');
    const response = await request.patch(`/users/${createdUserId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: {
        first_name: updatedUserFirstName,
      },
    });
    expect(response.ok()).toBeTruthy();
    const responseBody = await response.json();
    expect(responseBody.id).toBe(createdUserId);
    expect(responseBody.first_name).toBe(updatedUserFirstName);
    expect(responseBody.email).toBe(newUserEmail); // Email should not have changed
  });

  test('DELETE /users/:id - should delete the created user', async ({ request }) => {
    expect(createdUserId).not.toBe('');
    const response = await request.delete(`/users/${createdUserId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(response.status()).toBe(204); // No Content
  });

  test('GET /users/:id - should fail to retrieve the deleted user', async ({ request }) => {
    expect(createdUserId).not.toBe('');
    const response = await request.get(`/users/${createdUserId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(response.status()).toBe(404); // Not Found
  });

  // TODO: Add tests for assigning/removing roles to/from users if those endpoints exist on UsersController
}); 