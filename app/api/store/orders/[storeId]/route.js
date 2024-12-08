import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Store from '@/models/Store';
import PrintOrder from '@/models/PrintOrder';
import { authenticateToken } from '@/lib/auth';

// Get file expiration time from env or use default (5 minutes)
const FILE_EXPIRATION_TIME = process.env.FILE_EXPIRATION_TIME 
  ? parseInt(process.env.FILE_EXPIRATION_TIME) 
  : 5 * 60; // 5 minutes in seconds

async function cleanupExpiredOrders() {
  const expiryTime = new Date(Date.now() - FILE_EXPIRATION_TIME * 1000);
  await PrintOrder.deleteMany({
    createdAt: { $lt: expiryTime }
  });
}

export async function GET(req, context) {
  try {
    const storeId = await context.params.storeId;
    console.log('Fetching orders for store ID:', storeId);

    // Authenticate request
    const decoded = await authenticateToken(req);
    if (!decoded) {
      console.log('Unauthorized request');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify that the token matches the requested store
    if (decoded.storeId !== storeId) {
      console.log('Token storeId does not match requested storeId:', {
        tokenStoreId: decoded.storeId,
        requestedStoreId: storeId
      });
      return NextResponse.json(
        { error: 'Unauthorized access to store orders' },
        { status: 403 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Cleanup expired orders
    await cleanupExpiredOrders();

    // Verify store exists
    const store = await Store.findOne({ storeId: storeId });
    if (!store) {
      console.log('Store not found with ID:', storeId);
      return NextResponse.json(
        { error: 'Store not found' },
        { status: 404 }
      );
    }
    console.log('Found store:', store.storeName);

    // Get orders for the store
    const orders = await PrintOrder.find({
      storeId: storeId,
      status: { $in: ['pending', 'processing'] },
      createdAt: { 
        $gte: new Date(Date.now() - FILE_EXPIRATION_TIME * 1000)
      }
    }).sort({ createdAt: -1 });

    console.log('Found orders:', orders.length);

    // Return response
    return NextResponse.json({
      orders: orders.map(order => ({
        ...order.toObject(),
        timeRemaining: Math.max(
          0,
          FILE_EXPIRATION_TIME - Math.floor((Date.now() - order.createdAt) / 1000)
        ),
      })),
    });
  } catch (error) {
    console.error('Fetch orders error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function PUT(req, context) {
  try {
    const storeId = await context.params.storeId;
    const { orderId, action } = await req.json();
    console.log('Updating order:', { storeId, orderId, action });

    // Authenticate request
    const decoded = await authenticateToken(req);
    if (!decoded) {
      console.log('Unauthorized request');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify that the token matches the requested store
    if (decoded.storeId !== storeId) {
      console.log('Token storeId does not match requested storeId');
      return NextResponse.json(
        { error: 'Unauthorized access to store orders' },
        { status: 403 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Find store
    const store = await Store.findOne({ storeId: storeId });
    if (!store) {
      console.log('Store not found with ID:', storeId);
      return NextResponse.json(
        { error: 'Store not found' },
        { status: 404 }
      );
    }

    // Update order status
    const order = await PrintOrder.findOneAndUpdate(
      {
        _id: orderId,
        storeId: storeId,
      },
      { status: action === 'print' ? 'processing' : action },
      { new: true }
    );

    if (!order) {
      console.log('Order not found:', orderId);
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    console.log('Order updated successfully:', order._id);
    return NextResponse.json({ order });
  } catch (error) {
    console.error('Update order error:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
} 