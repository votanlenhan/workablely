import { test, expect } from '@playwright/test';

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
    const response = await request.post('/auth/signup', {
      data: {
        email: uniqueEmail,
        password: userPassword,
        first_name: 'Test',
        last_name: 'User',
      },
    });
    expect(response.ok()).toBeTruthy();
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('id');
    expect(responseBody.email).toBe(uniqueEmail);
    expect(responseBody).not.toHaveProperty('password_hash'); // Ensure password hash is not returned
  });

  test('POST /auth/signup - should fail to register with a duplicate email', async ({ request }) => {
    const response = await request.post('/auth/signup', {
      data: {
        email: uniqueEmail, // Use the same email as the previous test
        password: 'anotherPassword123',
        first_name: 'Duplicate',
        last_name: 'User',
      },
    });
    expect(response.status()).toBe(409); // Conflict
    const responseBody = await response.json();
    expect(responseBody.message).toBe('Email already registered'); // Changed to .toBe() and exact message
  });

  test('POST /auth/login - should login the registered user successfully and return an access token', async ({ request }) => {
    const response = await request.post('/auth/login', {
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
    const response = await request.post('/auth/login', {
      data: {
        email: uniqueEmail,
        password: 'wrongPassword123',
      },
    });
    expect(response.status()).toBe(401); // Unauthorized
  });

  test('GET /auth/profile - should get user profile with a valid access token', async ({ request }) => {
    expect(accessToken).not.toBe(''); // Ensure token was obtained
    const response = await request.get('/auth/profile', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    expect(response.ok()).toBeTruthy();
    const responseBody = await response.json();
    // The /auth/profile endpoint in NestJS by default returns the JWT payload (user object from validate() in JwtStrategy)
    // This payload usually contains 'sub' (subject, which is the user ID) and other claims like email.
    expect(responseBody).toHaveProperty('sub'); // 'sub' is standard for user ID in JWT payload
    expect(responseBody).toHaveProperty('email');
    expect(responseBody.email).toBe(uniqueEmail);
    // Optionally, if you need to verify the ID used for signup, you'd need to store it from signup response
    // and compare responseBody.sub to that stored ID.
    // For this test, just checking existence of sub and correct email is sufficient.
  });

  test('GET /auth/profile - should fail to get user profile without an access token', async ({ request }) => {
    const response = await request.get('/auth/profile');
    expect(response.status()).toBe(401); // Unauthorized
  });

  test('GET /auth/profile - should fail to get user profile with an invalid access token', async ({ request }) => {
    const response = await request.get('/auth/profile', {
      headers: {
        Authorization: 'Bearer invalidtoken123',
      },
    });
    expect(response.status()).toBe(401); // Unauthorized
  });
}); 