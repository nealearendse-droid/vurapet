import crypto from 'crypto';

export function generatePayFastSignature(data: any, passphrase: string): string {
  // Step 1: Sort the data alphabetically by key
  const sortedData: any = {};
  Object.keys(data)
    .sort()
    .forEach(key => {
      if (data[key] !== '' && data[key] !== null && data[key] !== undefined) {
        sortedData[key] = data[key];
      }
    });

  // Step 2: Create query string
  const queryString = new URLSearchParams(sortedData).toString();

  // Step 3: Add passphrase if it exists
  const stringToSign = passphrase 
    ? `${queryString}&passphrase=${passphrase}`
    : queryString;

  // Step 4: Generate MD5 hash
  return crypto.createHash('md5').update(stringToSign).toString('hex');
}