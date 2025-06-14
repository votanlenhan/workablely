import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000/api'; // Define BASE_URL

const generateRandomString = (length: number = 8) => Math.random().toString(36).substring(2, 2 + length);

let accessToken = '';
const adminUserEmail = 'admin@example.com';
const adminPassword = 'AdminPassword123!';

let createdShowId = '';
let testClientId = ''; // Will be created in beforeAll
const newShowTitle = `E2E Show ${generateRandomString()}`;
const newShowType = 'E2E_EVENT';
const updatedShowTitle = `Updated E2E Show ${generateRandomString()}`;

test.describe.serial('Shows API CRUD Flows', () => {
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
        console.error(`Admin signup failed unexpectedly in shows.spec: ${signupResponse.status()} ${await signupResponse.text()}`);
        throw new Error(`Admin signup failed in shows.spec: ${signupResponse.status()}`);
      }
    } catch (error) {
      console.error('Error during admin user signup HTTP call for shows.spec:', error);
      throw error;
    }

    // 2. Log in as admin to get the access token
    const loginResponse = await request.post(`${BASE_URL}/auth/login`, {
      data: { email: adminUserEmail, password: adminPassword },
    });
    expect(loginResponse.ok(), `Admin login failed in shows.spec: ${await loginResponse.text()}`).toBeTruthy();
    const loginData = await loginResponse.json();
    accessToken = loginData.access_token;
    expect(accessToken).toBeTruthy();
    
    // 3. Verify the logged-in user has the Admin role via profile check
    if (accessToken) {
      const profileResponse = await request.get(`${BASE_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      expect(profileResponse.ok(), `Fetching admin profile failed in shows.spec: ${await profileResponse.text()}`).toBeTruthy();
      const profileData = await profileResponse.json();
      const hasAdminRole = profileData.roles?.some((role: any) => role.name === 'Admin');
      expect(hasAdminRole, 'Logged in admin user does not have the Admin role after signup/login in shows.spec.').toBeTruthy();
    } else {
      throw new Error('Access token not obtained, cannot verify admin role in shows.spec.');
    }

    // Create a client to be used for creating shows (using the obtained admin accessToken)
    const clientName = `TestClientForShows_${generateRandomString()}`;
    const validPhoneNumber = '+14155552672'; // Use a valid phone number
    const clientResponse = await request.post(`${BASE_URL}/clients`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: {
        name: clientName,
        phone_number: validPhoneNumber, // Use valid phone number
        email: `clientforshow_${generateRandomString()}@e2etest.com`,
      },
    });
    expect(clientResponse.ok(), `Failed to create client for show tests in shows.spec: ${await clientResponse.text()}`).toBeTruthy();
    testClientId = (await clientResponse.json()).id;
    expect(testClientId).toBeTruthy();
  });

  test('POST /shows - should create a new show successfully', async ({ request }) => {
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000); // 2 hours later

    const response = await request.post(`${BASE_URL}/shows`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: {
        clientId: testClientId,
        title: newShowTitle,
        show_type: newShowType,
        start_datetime: startTime.toISOString(),
        end_datetime: endTime.toISOString(),
        location_address: '123 E2E Test Ave',
        total_price: 1500.75,
        // created_by_user_id will be set by the backend based on authenticated user (admin)
      },
    });
    expect(response.ok(), `Create show failed: ${await response.text()}`).toBeTruthy();
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('id');
    createdShowId = responseBody.id;
    expect(responseBody.title).toBe(newShowTitle);
    expect(responseBody.clientId).toBe(testClientId);
    expect(responseBody.show_type).toBe(newShowType);
    expect(responseBody.total_price).toBe(1500.75); // Changed to expect number
  });

  test('GET /shows/:id - should retrieve the created show by ID', async ({ request }) => {
    expect(createdShowId).not.toBe('');
    const response = await request.get(`${BASE_URL}/shows/${createdShowId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(response.ok()).toBeTruthy();
    const responseBodyGet = await response.json();
    expect(responseBodyGet.id).toBe(createdShowId);
    expect(responseBodyGet.title).toBe(newShowTitle);
    expect(responseBodyGet.clientId).toBe(testClientId);
  });

  test('GET /shows - should retrieve a list of shows (and check for created show)', async ({ request }) => {
    // First, try to get the show directly by its ID to confirm it exists at this point
    expect(createdShowId).not.toBe('');
    const directGetResponse = await request.get(`${BASE_URL}/shows/${createdShowId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(directGetResponse.ok(), 'Failed to get created show by ID within the list test.').toBeTruthy();
    const foundShowById = await directGetResponse.json();
    expect(foundShowById.id).toBe(createdShowId);
    expect(foundShowById.title).toBe(newShowTitle);
    expect(foundShowById.clientId).toBe(testClientId);

    // If the above passes, we can then proceed to check the list endpoint as before,
    // but we now have stronger evidence the show *should* be findable.
    const listResponse = await request.get(`${BASE_URL}/shows`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { page: 1, limit: 200 }, // Keep the original list call for now
    });
    expect(listResponse.ok()).toBeTruthy();
    const listResponseBody = await listResponse.json();
    expect(listResponseBody).toHaveProperty('items');
    expect(listResponseBody).toHaveProperty('meta');
    expect(Array.isArray(listResponseBody.items)).toBeTruthy();

    const foundShowInList = listResponseBody.items.find(show => show.id === createdShowId);
    if (!foundShowInList) {
    }
    expect(foundShowInList).toBeDefined(); 
    if (foundShowInList) {
        expect(foundShowInList.title).toBe(newShowTitle);
        expect(foundShowInList.clientId).toBe(testClientId);
    }
  });

  test('PATCH /shows/:id - should update the created show', async ({ request }) => {
    expect(createdShowId).not.toBe('');
    const response = await request.patch(`${BASE_URL}/shows/${createdShowId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: {
        title: updatedShowTitle,
        location_details: 'Updated location details for E2E test',
      },
    });
    expect(response.ok()).toBeTruthy();
    const patchResponseBody = await response.json();
    expect(patchResponseBody.id).toBe(createdShowId);
    expect(patchResponseBody.title).toBe(updatedShowTitle);
    expect(patchResponseBody.location_details).toBe('Updated location details for E2E test');
    expect(patchResponseBody.clientId).toBe(testClientId);
  });

  // TODO: Add test for recordPayment if the endpoint structure is finalized

  test('DELETE /shows/:id - should delete the created show', async ({ request }) => {
    expect(createdShowId).not.toBe('');
    const response = await request.delete(`${BASE_URL}/shows/${createdShowId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(response.status()).toBe(204); // No Content
  });

  test('GET /shows/:id - should fail to retrieve the deleted show', async ({ request }) => {
    expect(createdShowId).not.toBe('');
    const response = await request.get(`${BASE_URL}/shows/${createdShowId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(response.status()).toBe(404); // Not Found
  });

  // Cleanup: Delete the client created for these tests
  test.afterAll(async ({ request }) => {
    if (testClientId) {
      await request.delete(`${BASE_URL}/clients/${testClientId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
    }
  });
}); 