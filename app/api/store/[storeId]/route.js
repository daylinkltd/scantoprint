import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Store from '@/models/Store';

export async function GET(req, { params }) {
  try {
    const { storeId } = params;

    // Connect to database
    await connectToDatabase();

    // Find store
    const store = await Store.findOne({ storeId });
    if (!store) {
      return NextResponse.json(
        { error: 'Store not found' },
        { status: 404 }
      );
    }

    // Return response
    return NextResponse.json({
      store: {
        id: store._id,
        storeId: store.storeId,
        storeName: store.storeName,
      },
    });
  } catch (error) {
    console.error('Fetch store error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch store details' },
      { status: 500 }
    );
  }
} 