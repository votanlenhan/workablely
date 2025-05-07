import { test, expect, APIRequestContext } from '@playwright/test';
import { createRandomUser, UserData, generateRandomString } from './utils/user-helpers';
import { RoleName } from '../api/src/modules/roles/entities/role-name.enum';

const BASE_URL = 'http://localhost:3000/api';

let adminRequestContext: APIRequestContext;
let adminApiUser: UserData;
let createdClientId: string;
let createdShowId: string;
let createdPaymentId: string;

test.describe.configure({ mode: 'serial' });

test.beforeAll(async ({ playwright }) => {
  adminApiUser = await createRandomUser(playwright, BASE_URL, RoleName.ADMIN);
  expect(adminApiUser.token).toBeDefined();
  console.log('[Payments E2E Setup] Admin Token:', adminApiUser.token);
  console.log('[Payments E2E Setup] Admin User Roles:', adminApiUser.roles);

  adminRequestContext = await playwright.request.newContext({
    extraHTTPHeaders: {
      'Authorization': `Bearer ${adminApiUser.token}`,
    },
  });

  const profileResponse = await adminRequestContext.get(`${BASE_URL}/auth/profile`);
  expect(profileResponse.ok(), `Failed to get admin profile: ${await profileResponse.text()}`).toBeTruthy();
  const profile = await profileResponse.json();
  expect(profile.roles.some((role: any) => role.name === 'Admin')).toBeTruthy();
  console.log(`[Payments E2E Setup] Admin user ${adminApiUser.email} logged in successfully after /auth/profile.`);

  // Diagnostic GET for a simple, existing, public resource (if available) or newly created one.
  // For example, try to get the list of roles, which should be public or accessible to admin.
  const rolesListResponse = await adminRequestContext.get(`${BASE_URL}/roles?limit=1`);
  console.log(`[Payments E2E Setup] Diagnostic GET /roles status: ${rolesListResponse.status()}`);
  expect(rolesListResponse.ok(), `Diagnostic GET /roles failed: ${await rolesListResponse.text()}`).toBeTruthy();
  console.log('[Payments E2E Setup] Diagnostic GET /roles successful.');

  const clientName = `Test Client for Payments ${generateRandomString(5)}`;
  const clientResponse = await adminRequestContext.post(`${BASE_URL}/clients`, {
    data: {
      name: clientName,
      phone_number: '+14155552671',
      email: `client_payments_${generateRandomString(5)}@example.com`,
    },
  });
  expect(clientResponse.ok(), `Failed to create client: ${await clientResponse.text()}`).toBeTruthy();
  const client = await clientResponse.json();
  createdClientId = client.id;
  expect(createdClientId).toBeDefined();

  const initialDepositAmount = 100;
  const showData = {
    clientId: createdClientId,
    title: `Test Show for Payments ${generateRandomString(5)}`,
    show_type: 'Test Event',
    start_datetime: new Date().toISOString(),
    total_price: 1000,
  };
  const showResponse = await adminRequestContext.post(`${BASE_URL}/shows`, {
    data: showData,
  });
  expect(showResponse.ok(), `Failed to create show: ${await showResponse.text()}`).toBeTruthy();
  const show = await showResponse.json();
  createdShowId = show.id;
  expect(createdShowId).toBeDefined();

  const depositPaymentResponse = await adminRequestContext.post(`${BASE_URL}/payments`, {
    data: {
      show_id: createdShowId,
      amount: initialDepositAmount,
      payment_date: new Date().toISOString(),
      payment_method: 'Initial Deposit',
      notes: 'Initial deposit payment for show setup',
      is_deposit: true, 
    },
  });
  expect(depositPaymentResponse.ok(), `Failed to create initial deposit payment: ${await depositPaymentResponse.text()}`).toBeTruthy();

  const showAfterDepositResponse = await adminRequestContext.get(`${BASE_URL}/shows/${createdShowId}`);
  expect(showAfterDepositResponse.ok()).toBeTruthy();
  const showAfterDeposit = await showAfterDepositResponse.json();
  expect(Number(showAfterDeposit.total_collected)).toBe(initialDepositAmount);
  expect(Number(showAfterDeposit.deposit_amount)).toBe(initialDepositAmount);
});

test.afterAll(async () => {
  if (adminRequestContext) {
    if (createdShowId) {
      console.log(`[Payments E2E Teardown] Deleting Show ID: ${createdShowId}`);
      const deleteShowResponse = await adminRequestContext.delete(`${BASE_URL}/shows/${createdShowId}`);
      if (!deleteShowResponse.ok()) {
          console.error(`[Payments E2E Teardown] Failed to delete show ${createdShowId}: ${await deleteShowResponse.text()}`);
      }
    }
    if (createdClientId) {
      console.log(`[Payments E2E Teardown] Deleting Client ID: ${createdClientId}`);
      const deleteClientResponse = await adminRequestContext.delete(`${BASE_URL}/clients/${createdClientId}`);
       if (!deleteClientResponse.ok()) {
          console.error(`[Payments E2E Teardown] Failed to delete client ${createdClientId}: ${await deleteClientResponse.text()}`);
      }
    }
    await adminRequestContext.dispose();
  }
  console.log('[Payments E2E Teardown] Cleanup complete.');
});

test.describe('Payments API Endpoints', () => {
  test('POST /payments - should create a new payment for a show', async () => {
    const paymentAmount = 200;
    const createPaymentResponse = await adminRequestContext.post(`${BASE_URL}/payments`, {
      data: {
        show_id: createdShowId,
        amount: paymentAmount,
        payment_date: new Date().toISOString(),
        payment_method: 'Cash',
        notes: 'First partial payment after deposit',
        is_deposit: false, 
      },
    });
    expect(createPaymentResponse.ok(), `Create Payment Failed: ${await createPaymentResponse.text()}`).toBeTruthy();
    const payment = await createPaymentResponse.json();
    createdPaymentId = payment.id;
    expect(payment.id).toBeDefined();
    expect(payment.show_id).toBe(createdShowId);
    expect(Number(payment.amount)).toBe(paymentAmount);
    expect(payment.payment_method).toBe('Cash');
    console.log(`[Payments E2E Test] Created payment ${payment.id} for show ${createdShowId}`);

    // Verify show finances were updated
    const showResponse = await adminRequestContext.get(`${BASE_URL}/shows/${createdShowId}`);
    expect(showResponse.ok(), `Failed to get show ${createdShowId} after payment: ${await showResponse.text()}`).toBeTruthy();
    const show = await showResponse.json();
    expect(Number(show.total_collected)).toBe(100 + paymentAmount); // Initial deposit 100 + this payment
    expect(Number(show.amount_due)).toBe(show.total_price - (100 + paymentAmount));
  });

  test('GET /payments - should retrieve a list of payments (paginated)', async () => {
    const response = await adminRequestContext.get(`${BASE_URL}/payments`, {
      params: { show_id: createdShowId, limit: 5 }, // Filter by show_id if API supports it, or check list generally
    });
    expect(response.ok(), `GET /payments Failed: ${await response.text()}`).toBeTruthy();
    const body = await response.json();
    expect(body.items).toBeInstanceOf(Array);
    expect(body.items.length).toBeGreaterThanOrEqual(1);
    const foundPayment = body.items.find((p: any) => p.id === createdPaymentId);
    expect(foundPayment, `Payment ${createdPaymentId} not found in list`).toBeDefined();
    expect(body.meta).toBeDefined();
  });

  test('GET /payments/:id - should retrieve a specific payment', async () => {
    expect(createdPaymentId, 'createdPaymentId is not set, skipping GET by ID test').toBeDefined();
    const response = await adminRequestContext.get(`${BASE_URL}/payments/${createdPaymentId}`);
    expect(response.ok(), `GET /payments/${createdPaymentId} Failed: ${await response.text()}`).toBeTruthy();
    const payment = await response.json();
    expect(payment.id).toBe(createdPaymentId);
    expect(payment.show_id).toBe(createdShowId);
  });

  test('PATCH /payments/:id - should update an existing payment', async () => {
    expect(createdPaymentId, 'createdPaymentId is not set, skipping PATCH test').toBeDefined();
    const updatedAmount = 250;
    const updatedNotes = 'Updated payment notes via PATCH';
    const response = await adminRequestContext.patch(`${BASE_URL}/payments/${createdPaymentId}`, {
      data: {
        amount: updatedAmount,
        notes: updatedNotes,
      },
    });
    expect(response.ok(), `PATCH /payments/${createdPaymentId} Failed: ${await response.text()}`).toBeTruthy();
    const updatedPayment = await response.json();
    expect(updatedPayment.id).toBe(createdPaymentId);
    expect(Number(updatedPayment.amount)).toBe(updatedAmount);
    expect(updatedPayment.notes).toBe(updatedNotes);
    console.log(`[Payments E2E Test] Updated payment ${updatedPayment.id} to amount ${updatedAmount}`);

    const showResponse = await adminRequestContext.get(`${BASE_URL}/shows/${createdShowId}`);
    expect(showResponse.ok(), `Failed to get show ${createdShowId} after payment update: ${await showResponse.text()}`).toBeTruthy();
    const show = await showResponse.json();
    expect(Number(show.total_collected)).toBe(100 + updatedAmount); // Deposit 100 + new updated amount
    expect(Number(show.amount_due)).toBe(show.total_price - (100 + updatedAmount));
  });

  test('DELETE /payments/:id - should delete a payment', async () => {
    expect(createdPaymentId, 'createdPaymentId is not set, skipping DELETE test').toBeDefined();
    const response = await adminRequestContext.delete(`${BASE_URL}/payments/${createdPaymentId}`);
    expect(response.status()).toBe(204);
    console.log(`[Payments E2E Test] Deleted payment ${createdPaymentId}`);

    const getResponse = await adminRequestContext.get(`${BASE_URL}/payments/${createdPaymentId}`);
    expect(getResponse.status()).toBe(404);

    const showResponse = await adminRequestContext.get(`${BASE_URL}/shows/${createdShowId}`);
    expect(showResponse.ok(), `Failed to get show ${createdShowId} after payment delete: ${await showResponse.text()}`).toBeTruthy();
    const show = await showResponse.json();
    expect(Number(show.total_collected)).toBe(100); // Only initial deposit should remain
    expect(Number(show.amount_due)).toBe(show.total_price - 100);
  });
}); 