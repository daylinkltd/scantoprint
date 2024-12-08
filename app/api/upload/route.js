import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Store from '@/models/Store';
import PrintOrder from '@/models/PrintOrder';
import { saveFile, validateFile } from '@/lib/fileHandler';

// Get file expiration time from env or use default (5 minutes)
const FILE_EXPIRATION_TIME = process.env.FILE_EXPIRATION_TIME 
  ? parseInt(process.env.FILE_EXPIRATION_TIME) 
  : 5 * 60; // 5 minutes in seconds

export async function POST(req) {
  try {
    const formData = await req.formData();
    const storeId = formData.get('storeId');
    const files = formData.getAll('files');
    const customerName = formData.get('customerName');
    const customerPhone = formData.get('customerPhone');

    // Validate store ID
    if (!storeId) {
      return NextResponse.json(
        { error: 'Store ID is required' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Check if store exists
    const store = await Store.findOne({ storeId: storeId });
    if (!store) {
      return NextResponse.json(
        { error: 'Store not found' },
        { status: 404 }
      );
    }

    // Process files
    const savedFiles = [];
    for (const file of files) {
      try {
        // Validate file
        validateFile(file);

        // Save file
        const savedFile = await saveFile(file, storeId);
        savedFiles.push(savedFile);
      } catch (error) {
        console.error('File processing error:', error);
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
    }

    // Create print order
    const printOrder = await PrintOrder.create({
      storeId: store.storeId,
      customerName,
      customerPhone,
      files: savedFiles.map(file => ({
        fileName: file.fileName,
        originalName: file.originalName,
        fileSize: file.fileSize,
        fileType: file.fileType,
      })),
    });

    // Return response with expiration time
    return NextResponse.json({
      message: 'Files uploaded successfully',
      orderId: printOrder._id,
      expirationTime: FILE_EXPIRATION_TIME,
      files: savedFiles.map(file => ({
        fileName: file.fileName,
        originalName: file.originalName,
        uploadTime: new Date(),
      })),
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload files' },
      { status: 500 }
    );
  }
} 