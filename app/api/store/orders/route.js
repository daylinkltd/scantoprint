import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import PrintOrder from '@/models/PrintOrder';
import { authenticateToken } from '@/lib/auth';

export async function GET(req) {
  try {
    // Authenticate request
    const decoded = await authenticateToken(req);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Get orders for the store
    const orders = await PrintOrder.find({
      storeId: decoded.storeId,
      status: { $in: ['pending', 'processing'] },
      createdAt: { 
        $gte: new Date(Date.now() - 5 * 60 * 1000) // Orders from last 5 minutes
      }
    }).sort({ createdAt: -1 });

    // Return response
    return NextResponse.json({
      orders: orders.map(order => ({
        ...order.toObject(),
        timeRemaining: Math.max(
          0,
          5 - Math.floor((Date.now() - order.createdAt) / (1000 * 60))
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

export async function PUT(req) {
  try {
    // Authenticate request
    const decoded = await authenticateToken(req);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { orderId, status } = body;

    // Connect to database
    await connectToDatabase();

    // Update order status
    const order = await PrintOrder.findOneAndUpdate(
      {
        _id: orderId,
        storeId: decoded.storeId,
      },
      { status },
      { new: true }
    );

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Update order error:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
} 