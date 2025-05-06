import { test, expect } from '@playwright/test';

// Helper to generate a random string for uniqueness
const generateRandomString = (length: number = 8) => Math.random().toString(36).substring(2, 2 + length);

let accessToken = '';
const adminUserEmail = 'admin@example.com';
const adminPassword = 'AdminPassword123!';

let createdClientId = '';
const newClientName = `E2E Client ${generateRandomString()}`;
const newClientPhoneNumber = '+14155552671';
const updatedClientName = `Updated E2E Client ${generateRandomString()}`;

test.describe.serial('Clients API CRUD Flows', () => {
  test.beforeAll(async ({ request }) => {
    // 1. Attempt to sign up the admin user with 'Admin' role by name
    // If the user already exists (409), it's fine, assuming they were created correctly before.
    // UsersService.createUser should assign the 'Admin' role if the role exists.
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
      console.error('Error during admin user signup HTTP call for clients.spec:', error);
      throw error;
    }

    // 2. Log in as admin to get the access token
    const loginResponse = await request.post('/auth/login', {
      data: { email: adminUserEmail, password: adminPassword },
    });
    expect(loginResponse.ok(), `Admin login failed in clients.spec: ${await loginResponse.text()}`).toBeTruthy();
    const loginData = await loginResponse.json();
    accessToken = loginData.access_token;
    expect(accessToken).toBeTruthy();
    
    // 3. Verify the logged-in user has the Admin role via profile check
    // This is the crucial check. If this fails, either signup didn't assign the role,
    // or the profile endpoint doesn't return it correctly.
    if (accessToken) {
      const profileResponse = await request.get('/auth/profile', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      expect(profileResponse.ok(), `Fetching admin profile failed: ${await profileResponse.text()}`).toBeTruthy();
      const profileData = await profileResponse.json();
      console.log('[E2E Clients Test] Admin Profile Data (after login):', JSON.stringify(profileData, null, 2));
      const hasAdminRole = profileData.roles?.some((role: any) => role.name === 'Admin');
      expect(hasAdminRole, 'Logged in admin user does not have the Admin role after signup/login.').toBeTruthy();
    } else {
      throw new Error('Access token not obtained, cannot verify admin role.');
    }
  });

  test('POST /clients - should create a new client successfully', async ({ request }) => {
    const response = await request.post('/clients', {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: {
        name: newClientName,
        phone_number: newClientPhoneNumber,
        email: `client_${generateRandomString()}@e2etest.com`,
        address: '123 E2E Street',
      },
    });
    expect(response.ok(), `Create client failed: ${await response.text()}`).toBeTruthy();
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('id');
    createdClientId = responseBody.id;
    expect(responseBody.name).toBe(newClientName);
    expect(responseBody.phone_number).toBe(newClientPhoneNumber);
  });

  test('GET /clients/:id - should retrieve the created client by ID', async ({ request }) => {
    expect(createdClientId).not.toBe('');
    const response = await request.get(`/clients/${createdClientId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(response.ok()).toBeTruthy();
    const responseBody = await response.json();
    expect(responseBody.id).toBe(createdClientId);
    expect(responseBody.name).toBe(newClientName);
  });

  test('GET /clients - should retrieve a list of clients (and check for created client)', async ({ request }) => {
    const response = await request.get('/clients', {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { page: 1, limit: 50 }, 
    });
    expect(response.ok()).toBeTruthy();
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('items');
    expect(responseBody).toHaveProperty('meta');
    expect(Array.isArray(responseBody.items)).toBeTruthy();

    const foundClient = responseBody.items.find(client => client.id === createdClientId);
    expect(foundClient).toBeDefined();
    expect(foundClient.name).toBe(newClientName);
  });

  test('PATCH /clients/:id - should update the created client', async ({ request }) => {
    expect(createdClientId).not.toBe('');
    const response = await request.patch(`/clients/${createdClientId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: {
        name: updatedClientName,
      },
    });
    expect(response.ok()).toBeTruthy();
    const responseBody = await response.json();
    expect(responseBody.id).toBe(createdClientId);
    expect(responseBody.name).toBe(updatedClientName);
  });

  test('DELETE /clients/:id - should delete the created client', async ({ request }) => {
    expect(createdClientId).not.toBe('');
    const response = await request.delete(`/clients/${createdClientId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(response.status()).toBe(204); // No Content
  });

  test('GET /clients/:id - should fail to retrieve the deleted client', async ({ request }) => {
    expect(createdClientId).not.toBe('');
    const response = await request.get(`/clients/${createdClientId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(response.status()).toBe(404); // Not Found
  });
}); 