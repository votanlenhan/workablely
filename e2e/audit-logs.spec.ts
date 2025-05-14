import { test, expect, APIRequestContext } from '@playwright/test';
import { BASE_URL } from './utils/constants';
import { createRandomUser } from './utils/user-helpers';
import { createRandomClient } from './utils/client-helpers';
import { createRandomShow } from './utils/show-helpers';
import { RoleName } from '../api/src/modules/roles/entities/role-name.enum';

// Define API root URL (adjust if necessary)
const API_ROOT_URL = process.env.API_URL || 'http://localhost:3000';

test.describe('Audit Logs API', () => {
  let adminRequestContext: APIRequestContext;
  let regularUserRequestContext: APIRequestContext;
  let adminToken: string;
  let regularUserToken: string;
  let adminId: string;
  let regularUserId: string;
  let clientId: string;
  let showId: string;

  test.beforeAll(async ({ playwright }) => {
    // Create admin user
    const adminUser = await createRandomUser(playwright, API_ROOT_URL, [RoleName.ADMIN]);
    adminToken = adminUser.token;
    adminId = adminUser.id;
    adminRequestContext = await playwright.request.newContext({
      baseURL: API_ROOT_URL,
      extraHTTPHeaders: { Authorization: `Bearer ${adminToken}` },
    });

    // Create regular user
    const regularUser = await createRandomUser(playwright, API_ROOT_URL, [RoleName.USER]);
    regularUserToken = regularUser.token;
    regularUserId = regularUser.id;
    regularUserRequestContext = await playwright.request.newContext({
      baseURL: API_ROOT_URL,
      extraHTTPHeaders: { Authorization: `Bearer ${regularUserToken}` },
    });

    // Create a client and show to generate some audit logs
    const clientData = await createRandomClient(adminRequestContext);
    clientId = clientData.id;

    const showData = await createRandomShow(adminRequestContext, clientId);
    showId = showData.id;

    // Optional: Perform an update action to ensure varied logs
    await adminRequestContext.patch(`/clients/${clientId}`, { data: { name: 'Updated Client Name For Audit Log Test' } });
  });

  test.afterAll(async () => {
    await adminRequestContext?.dispose();
    await regularUserRequestContext?.dispose();
    // Consider cleanup of created users/clients/shows if necessary
  });

  test('should not allow regular users to access audit logs', async () => {
    const response = await regularUserRequestContext.get('/api/audit-logs');
    expect(response.status()).toBe(403);
  });

  test('should allow admin to access audit logs', async () => {
    const response = await adminRequestContext.get('/api/audit-logs');
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.items).toBeDefined();
    expect(Array.isArray(data.items)).toBe(true);
  });

  test('should filter audit logs by entity', async () => {
    const response = await adminRequestContext.get('/api/audit-logs?entity_name=Show');
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.items).toBeDefined();
    expect(Array.isArray(data.items)).toBe(true);
    if (data.items.length > 0) {
      expect(data.items[0].entity_name).toBe('Show');
    }
  });

  test('should filter audit logs by entity ID', async () => {
    const response = await adminRequestContext.get(`/api/audit-logs?entity_id=${showId}`);
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.items).toBeDefined();
    expect(Array.isArray(data.items)).toBe(true);
    if (data.items.length > 0) {
      expect(data.items[0].entity_id).toBe(showId);
    }
  });

  test('should filter audit logs by action', async () => {
    const response = await adminRequestContext.get('/api/audit-logs?action=CREATE');
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.items).toBeDefined();
    expect(Array.isArray(data.items)).toBe(true);
    if (data.items.length > 0) {
      expect(data.items[0].action).toBe('CREATE');
    }
  });

  test('should filter audit logs by changed by user', async () => {
    const response = await adminRequestContext.get(`/api/audit-logs?changed_by_user_id=${adminId}`);
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.items).toBeDefined();
    expect(Array.isArray(data.items)).toBe(true);
    if (data.items.length > 0) {
      expect(data.items[0].changed_by_user_id).toBe(adminId);
    }
  });

  test('should filter audit logs by date range', async () => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 1); // Yesterday
    const endDate = new Date();

    const response = await adminRequestContext.get(
      `/api/audit-logs?start_date=${startDate.toISOString()}&end_date=${endDate.toISOString()}`,
    );

    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.items).toBeDefined();
    expect(Array.isArray(data.items)).toBe(true);
  });

  test('should support pagination', async () => {
    const response = await adminRequestContext.get('/api/audit-logs?page=1&limit=5');
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.items).toBeDefined();
    expect(Array.isArray(data.items)).toBe(true);
    expect(data.items.length).toBeLessThanOrEqual(5);
    expect(data.meta).toBeDefined();
    expect(data.meta.currentPage).toBe(1);
  });
}); 