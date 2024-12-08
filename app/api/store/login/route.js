import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Store from '@/models/Store';
import { comparePassword, generateToken } from '@/lib/auth';
import { generateUniqueStoreId, generateStoreQRData } from '@/lib/utils';
import QRCode from 'qrcode';

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, password } = body;
    console.log('Login attempt for email:', email);

    // Connect to database
    await connectToDatabase();
    console.log('Connected to MongoDB');

    // Find store
    const store = await Store.findOne({ email });
    if (!store) {
      console.log('Store not found for email:', email);
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    console.log('Found store:', {
      id: store._id,
      storeId: store.storeId,
      email: store.email,
      storeName: store.storeName
    });

    // Verify password
    const isValidPassword = await comparePassword(password, store.password);
    if (!isValidPassword) {
      console.log('Invalid password for store:', store.email);
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    console.log('Password verified successfully');

    // If storeId is missing, generate it
    if (!store.storeId) {
      console.log('Store ID missing, generating new one...');
      const storeId = await generateUniqueStoreId(store.storeName, Store);
      const qrData = generateStoreQRData(storeId);
      const qrCode = await QRCode.toDataURL(JSON.stringify(qrData));
      
      // Update store with new storeId and QR code
      await Store.updateOne(
        { _id: store._id },
        { 
          $set: { 
            storeId: storeId,
            qrCode: qrCode
          }
        }
      );
      
      // Update local store object
      store.storeId = storeId;
      store.qrCode = qrCode;
      console.log('Generated new store ID:', storeId);
    }

    // Generate token with store ID
    const token = generateToken({
      storeId: store.storeId,
      email: store.email,
      type: 'store'
    });
    console.log('Generated token for store:', store.storeId);

    // Prepare store data
    const storeData = {
      id: store._id.toString(),
      storeId: store.storeId,
      storeName: store.storeName,
      email: store.email,
      qrCode: store.qrCode,
    };
    console.log('Prepared store data:', storeData);

    // Return response with all necessary store info
    const response = {
      message: 'Login successful',
      token,
      store: storeData,
    };
    console.log('Sending response:', response);

    return NextResponse.json(response);
  } catch (error) {
    console.error('Store login error:', error);
    return NextResponse.json(
      { error: 'Failed to login' },
      { status: 500 }
    );
  }
} 