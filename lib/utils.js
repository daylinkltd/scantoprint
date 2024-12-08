import config from './config';

export async function generateUniqueStoreId(storeName, Store) {
  try {
    console.log('Generating store ID for:', storeName);
    
    const baseId = storeName
      .replace(/[^a-zA-Z0-9]/g, '') // Remove special characters
      .toUpperCase()
      .slice(0, 5); // Take first 5 characters
    
    console.log('Base ID generated:', baseId);

    let isUnique = false;
    let storeId;
    let attempts = 0;

    while (!isUnique && attempts < 100) {
      // Generate a random 3-digit number
      const randomNum = Math.floor(Math.random() * 900) + 100; // 100-999
      storeId = `${baseId}${randomNum}`;
      console.log('Trying store ID:', storeId);

      // Check if this ID already exists
      const existingStore = await Store.findOne({ storeId });
      if (!existingStore) {
        isUnique = true;
        console.log('Unique store ID found:', storeId);
      } else {
        console.log('Store ID already exists, trying again...');
      }
      attempts++;
    }

    if (!isUnique) {
      throw new Error('Unable to generate unique store ID');
    }

    return storeId;
  } catch (error) {
    console.error('Error generating store ID:', error);
    throw error;
  }
}

export function generateStoreQRData(storeId) {
  try {
    console.log('Generating QR data for store ID:', storeId);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const qrData = {
      storeId,
      url: `${baseUrl}/customer/upload/${storeId}`,
    };
    console.log('Generated QR data:', qrData);
    return qrData;
  } catch (error) {
    console.error('Error generating QR data:', error);
    throw error;
  }
} 