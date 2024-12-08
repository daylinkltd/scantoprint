import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Store from '@/models/Store';
import { hashPassword, generateToken } from '@/lib/auth';
import { generateUniqueStoreId, generateStoreQRData } from '@/lib/utils';
import QRCode from 'qrcode';

export async function POST(req) {
  try {
    // Connect to database first
    await connectToDatabase();
    console.log('Connected to MongoDB');

    const body = await req.json();
    const { storeName, ownerName, email, password, address, phone } = body;

    // Validate required fields
    if (!storeName || !ownerName || !email || !password || !address || !phone) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Check if store already exists
    const existingStore = await Store.findOne({ email });
    if (existingStore) {
      return NextResponse.json(
        { error: 'Store with this email already exists' },
        { status: 400 }
      );
    }

    // Generate unique store ID
    const storeId = await generateUniqueStoreId(storeName, Store);
    console.log('Generated store ID:', storeId);

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Generate QR code data
    const qrData = generateStoreQRData(storeId);
    const qrCode = await QRCode.toDataURL(JSON.stringify(qrData));

    // Create store
    const store = await Store.create({
      storeId,
      storeName,
      ownerName,
      email,
      password: hashedPassword,
      address,
      phone,
      qrCode,
    });

    console.log('Store created successfully:', store.storeId);

    // Generate JWT token with the same format as login
    const token = generateToken({
      storeId: store.storeId,
      email: store.email,
      type: 'store'
    });

    // Return response with all necessary store info
    return NextResponse.json({
      message: 'Store registered successfully',
      token,
      store: {
        id: store._id.toString(),
        storeId: store.storeId,
        storeName: store.storeName,
        email: store.email,
        qrCode: store.qrCode,
      },
    });
  } catch (error) {
    console.error('Store registration error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to register store',
        details: error.message,
      },
      { status: 500 }
    );
  }
} 