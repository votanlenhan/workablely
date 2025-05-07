import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000/api'; // Define BASE_URL

// Helper to generate a random email
const generateRandomEmail = () => {
  const randomString = Math.random().toString(36).substring(2, 10);
  return `testuser_${randomString}@example.com`;
};

const uniqueEmail = generateRandomEmail();
const userPassword = 'Password123!';
let accessToken = '';

test.describe.serial('Authentication API Flows', () => {
  test('POST /auth/signup - should register a new user successfully', async ({ request }) => {
    const signupPayload = {
      email: uniqueEmail,
      password: userPassword,
      first_name: 'Test',
      last_name: 'User',
      phone_number: '+15551234567' // Assuming a valid phone for user DTO if needed
    };

    const response = await request.post(`${BASE_URL}/auth/signup`, {
      data: signupPayload,
    });

    expect(response.ok(), `Signup failed: ${await response.text()}`).toBeTruthy();
    expect(response.status()).toBe(201);
    const responseBody = await response.json();

    expect(responseBody).toHaveProperty('access_token');
    expect(responseBody).toHaveProperty('user');
    expect(responseBody.user).toHaveProperty('id');
    expect(responseBody.user.email).toBe(uniqueEmail);
    expect(responseBody.user).not.toHaveProperty('password_hash');
  });

  test('POST /auth/signup - should fail to register with a duplicate email', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/auth/signup`, {
      data: {
        email: uniqueEmail, // Use the same email as the previous test
        password: 'anotherPassword123', // It's okay for the password to be different for a duplicate attempt
        first_name: 'Duplicate',
        last_name: 'User',
        phone_number: '+15551234567' // Add phone_number if required by CreateUserDto
      },
    });
    expect(response.status()).toBe(409); // Conflict
    const responseBody = await response.json();
    expect(responseBody.message).toBe('Email already registered'); // Changed to .toBe() and exact message
  });

  test('POST /auth/login - should login the registered user successfully and return an access token', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/auth/login`, {
      data: {
        email: uniqueEmail,
        password: userPassword,
      },
    });
    expect(response.ok()).toBeTruthy();
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('access_token');
    expect(typeof responseBody.access_token).toBe('string');
    accessToken = responseBody.access_token; // Save token for subsequent tests
  });

  test('POST /auth/login - should fail to login with invalid credentials', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/auth/login`, {
      data: {
        email: uniqueEmail,
        password: 'wrongPassword123',
      },
    });
    expect(response.status()).toBe(401); // Unauthorized
  });

  test('GET /auth/profile - should get user profile with a valid access token', async ({ request }) => {
    expect(accessToken).not.toBe(''); // Ensure token was obtained
    const response = await request.get(`${BASE_URL}/auth/profile`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    expect(response.ok()).toBeTruthy();
    const responseBody = await response.json();
    console.log('[E2E Auth Test] GET /auth/profile Response Body:', JSON.stringify(responseBody));

    // The /auth/profile endpoint in NestJS returns the object from JwtStrategy.validate()
    // which is the User object (or a similar structure like PlainUser).
    // This object has an 'id' property (from the User entity).
    expect(responseBody).toHaveProperty('id'); // User ID from the database entity
    expect(responseBody).toHaveProperty('email');
    expect(responseBody.email).toBe(uniqueEmail);
    // Optionally, if you need to verify the ID used for signup, you'd need to store it from signup response
    // and compare responseBody.id with that stored ID.
    // For now, just checking presence and correct email.
  });

  test('GET /auth/profile - should fail to get user profile without an access token', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/auth/profile`);
    expect(response.status()).toBe(401); // Unauthorized
  });

  test('GET /auth/profile - should fail to get user profile with an invalid access token', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/auth/profile`, {
      headers: {
        Authorization: 'Bearer invalidtoken123',
      },
    });
    expect(response.status()).toBe(401); // Unauthorized
  });
}); 