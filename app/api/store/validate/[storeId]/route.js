import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Store from '@/models/Store';

export async function GET(req, context) {
  try {
    const storeId = await context.params.storeId;
    console.log('Validating store ID:', storeId);
    
    // Connect to database
    await connectToDatabase();

    // Find store
    const store = await Store.findOne({ storeId: storeId });
    if (!store) {
      console.log('Store not found:', storeId);
      return NextResponse.json(
        { error: 'Store not found' },
        { status: 404 }
      );
    }

    console.log('Store found:', store.storeName);

    // Return store info
    return NextResponse.json({
      store: {
        storeName: store.storeName,
        storeId: store.storeId,
      },
    });
  } catch (error) {
    console.error('Store validation error:', error);
    return NextResponse.json(
      { error: 'Failed to validate store' },
      { status: 500 }
    );
  }
} 