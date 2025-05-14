import { APIRequestContext } from '@playwright/test';
import { Chance } from 'chance';
import { generateRandomPhoneNumber } from './random-helpers';

const chance = new Chance();

export interface ClientData {
  id: string;
  name: string;
  phone_number: string;
  email?: string;
  // Add other relevant properties
}

export async function createRandomClient(
  requestContext: APIRequestContext, 
): Promise<ClientData> {
  const randomSuffix = chance.string({ length: 8, pool: 'abcdefghijklmnopqrstuvwxyz0123456789' });
  const timestamp = Date.now();
  const clientData = {
    name: chance.company(),
    phone_number: '+14155550101', // Changed to a known working number for diagnostics
    email: `e2e_client_${timestamp}_${randomSuffix}@client.com`,
    address: chance.address(),
    source: 'E2E Test',
  };

  console.log('[ClientHelpers] Creating client with phone:', clientData.phone_number);

  const response = await requestContext.post(`/api/clients`, {
    data: clientData,
  });

  if (response.status() !== 201) {
    console.error('Failed to create client:', await response.text());
    throw new Error(`Failed to create client. Status: ${response.status()}`);
  }
  return response.json();
} 