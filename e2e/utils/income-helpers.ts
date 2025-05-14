import { Chance } from 'chance';

const chance = new Chance();

// Function to generate random string, if not imported from a common helper
function generateRandomString(length: number): string {
  return chance.string({ length });
}

export function getSampleIncomePayload(descriptionSuffix: string = '') {
  const randomAmount = parseFloat((Math.random() * 1000 + 50).toFixed(2));
  const year = 2024;
  const month = Math.floor(Math.random() * 12) + 1;
  const day = Math.floor(Math.random() * 28) + 1;
  return {
    description: `E2E Test Income ${generateRandomString(5)}${descriptionSuffix}`,
    amount: randomAmount,
    income_date: `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`,
    source: `E2E Source ${generateRandomString(3)}`,
    notes: `Notes for E2E income ${descriptionSuffix}`,
  };
} 