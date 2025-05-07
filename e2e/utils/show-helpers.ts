import { APIRequestContext } from '@playwright/test';
import { Chance } from 'chance';

const chance = new Chance();

export interface ShowData {
  id: string;
  client_id: string;
  title?: string;
  show_type: string;
  start_datetime: string; // ISO string
  // Add other relevant properties
}

export async function createRandomShow(
  requestContext: APIRequestContext, 
  baseUrl: string,
  clientId: string,
  createdByUserId: string,
): Promise<ShowData> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() + chance.integer({ min: 1, max: 30 }));

  const showData = {
    clientId: clientId,
    title: `E2E Test Show - ${chance.word({ syllables: 3 })}`,
    show_type: chance.pickone(['Wedding', 'Event', 'Portrait', 'Product']),
    start_datetime: startDate.toISOString(),
    location_address: chance.address(),
    total_price: chance.floating({ min: 500, max: 5000, fixed: 2 }),
  };

  const response = await requestContext.post(`${baseUrl}/shows`, {
    data: showData,
  });

  if (response.status() !== 201) {
    console.error('Failed to create show:', await response.text());
    throw new Error(`Failed to create show. Status: ${response.status()}`);
  }
  return response.json();
} 