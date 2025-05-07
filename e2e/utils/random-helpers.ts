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
  // Generates a random 10-digit number and prefixes with +1 (North America)
  // Adjust country code or format as needed for your specific testing requirements
  const num = Math.floor(Math.random() * 10000000000).toString().padStart(10, '0');
  return `+1${num}`;
} 