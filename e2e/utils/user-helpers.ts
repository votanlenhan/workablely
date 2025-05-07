import { APIRequestContext, PlaywrightTestArgs } from '@playwright/test';
import { Chance } from 'chance';

const chance = new Chance();

export function generateRandomString(length: number): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export function generateRandomPhoneNumber(): string {
  const num = Math.floor(Math.random() * 10000000000).toString().padStart(10, '0');
  return `+1${num}`;
}

export interface UserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  token: string;
  roles: string[];
}

export async function createRandomUser(
  playwright: PlaywrightTestArgs['playwright'],
  baseUrl: string,
  roleNamesOrRoleName?: string | string[] | undefined,
): Promise<UserData> {
  const requestContext = await playwright.request.newContext();
  
  const randomSuffix = generateRandomString(8);
  const timestamp = Date.now();
  const email = `testuser_${randomSuffix}_${timestamp}@example.com`;
  const password = `Password${randomSuffix}!`;
  const firstName = `TestF_${randomSuffix}`;
  const lastName = `TestL_${randomSuffix}`;

  const signupPayload: any = {
    email,
    password,
    first_name: firstName,
    last_name: lastName,
    phone_number: generateRandomPhoneNumber(),
  };

  if (roleNamesOrRoleName) {
    if (Array.isArray(roleNamesOrRoleName)) {
      signupPayload.roleNames = roleNamesOrRoleName;
    } else {
      signupPayload.roleNames = [roleNamesOrRoleName];
    }
  }

  const signupResponse = await requestContext.post(`${baseUrl}/auth/signup`, {
    data: signupPayload,
  });

  if (signupResponse.status() !== 201) {
    console.error('Failed to signup user:', await signupResponse.text(), 'Payload:', signupPayload);
    throw new Error(`Failed to signup user ${signupPayload.email}. Status: ${signupResponse.status()}`);
  }
  
  const signupResult = await signupResponse.json();

  if (!signupResult.user || !signupResult.user.id || !signupResult.access_token) {
    console.error('Unexpected signup response structure:', signupResult);
    throw new Error('Unexpected signup response structure from /auth/signup');
  }

  return {
    id: signupResult.user.id,
    email: signupResult.user.email,
    firstName: signupResult.user.first_name,
    lastName: signupResult.user.last_name,
    token: signupResult.access_token,
    roles: signupResult.user.roles?.map((r: any) => r.name) || [],
  };
}

export function generateRandomUser(roleNames: string[] = []): any {
  const randomSuffix = generateRandomString(8);
  const timestamp = Date.now(); // Add timestamp for more uniqueness
  return {
    email: `testuser_${randomSuffix}_${timestamp}@example.com`, // Incorporate timestamp
    password: `Password${randomSuffix}!`,
    first_name: `Test`,
    last_name: `User_${randomSuffix}`,
    roleNames: roleNames, // This was correctly being passed for signup
    phone_number: generateRandomPhoneNumber(), // Ensure this uses the correct helper
  };
} 