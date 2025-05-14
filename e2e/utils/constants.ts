export const BASE_URL = process.env.API_URL || 'http://localhost:3000';

export const DEFAULT_TIMEOUT = 30000; // 30 seconds

export const TEST_ROLES = {
  ADMIN: 'Admin',
  MANAGER: 'Manager',
  USER: 'User',
  PHOTOGRAPHER: 'Photographer',
};

export const TEST_PERMISSIONS = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
};

export const TEST_SUBJECTS = {
  USER: 'User',
  ROLE: 'Role',
  PERMISSION: 'Permission',
  EQUIPMENT: 'Equipment',
  SHOW: 'Show',
  EXTERNAL_INCOME: 'ExternalIncome',
  MEMBER_EVALUATION: 'MemberEvaluation',
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
}; 