import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import PrintOrder from '@/models/PrintOrder';
import { authenticateToken } from '@/lib/auth';
import { getFile } from '@/lib/fileHandler';

export async function GET(request) {
  try {
    // Get orderId from URL
    const orderId = request.url.split('/').pop();

    // Authenticate request
    const decoded = await authenticateToken(request);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Find the order
    const order = await PrintOrder.findOne({
      _id: orderId,
      storeId: decoded.storeId,
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Read all files
    const fileContents = await Promise.all(
      order.files.map(async (file) => {
        try {
          const content = await getFile(file.fileName);
          return {
            name: file.originalName,
            type: file.fileType,
            content: content.toString('base64'),
            printSettings: file.printSettings,
          };
        } catch (error) {
          console.error(`Error reading file ${file.fileName}:`, error);
          return null;
        }
      })
    );

    // Filter out any files that failed to read
    const validFiles = fileContents.filter(file => file !== null);

    return NextResponse.json({
      order: {
        id: order._id,
        customerName: order.customerName,
        files: validFiles,
      },
    });
  } catch (error) {
    console.error('Print order error:', error);
    return NextResponse.json(
      { error: 'Failed to get print order' },
      { status: 500 }
    );
  }
} 