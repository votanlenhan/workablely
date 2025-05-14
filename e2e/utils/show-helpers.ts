import { APIRequestContext } from '@playwright/test';
import { Chance } from 'chance';

const chance = new Chance();

export interface ShowData {
  id: string;
  client_id: string; // This interface is for the response, which might be snake_case from DB
  title?: string;
  show_type: string;
  start_datetime: string; // ISO string
  // Add other relevant properties
}

export async function createRandomShow(
  requestContext: APIRequestContext, 
  clientIdInput: string, // Renamed to avoid conflict with DTO property name
  // createdByUserId?: string, // Removed, backend infers this
): Promise<ShowData> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() + chance.integer({ min: 1, max: 30 }));

  const showDataPayload: any = {
    clientId: clientIdInput, // Use camelCase for DTO
    title: `E2E Test Show - ${chance.word({ syllables: 3 })}`,
    show_type: chance.pickone(['Wedding', 'Event', 'Portrait', 'Product']),
    start_datetime: startDate.toISOString(),
    location_address: chance.address(),
    total_price: chance.floating({ min: 500, max: 5000, fixed: 2 }),
    // deposit_amount: chance.floating({ min: 100, max: 1000, fixed: 2 }), // Optional field, add if needed for tests
    // deposit_date: startDate.toISOString().split('T')[0], // Optional field, add if needed for tests
  };

  // created_by_user_id is NOT sent; backend handles it.

  const response = await requestContext.post(`/api/shows`, {
    data: showDataPayload,
  });

  if (response.status() !== 201) {
    console.error('Failed to create show:', await response.text(), 'Payload:', showDataPayload);
    throw new Error(`Failed to create show. Status: ${response.status()}`);
  }
  return response.json();
} 