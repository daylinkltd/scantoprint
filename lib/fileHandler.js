import { MongoClient } from 'mongodb';
import config from './config';

let cachedClient = null;

async function connectToMongo() {
  if (cachedClient) {
    return cachedClient;
  }

  const client = await MongoClient.connect(process.env.MONGODB_URI);
  cachedClient = client;
  return client;
}

export async function saveFile(file, storeId) {
  try {
    // Generate unique filename
    const timestamp = Date.now();
    const uniqueFilename = `${storeId}/${timestamp}-${file.name}`;

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Connect to MongoDB
    const client = await connectToMongo();
    const db = client.db(process.env.MONGODB_DB);

    // Create GridFS bucket
    const bucket = new MongoClient.GridFSBucket(db, {
      bucketName: 'uploads'
    });

    // Create upload stream
    const uploadStream = bucket.openUploadStream(uniqueFilename, {
      metadata: {
        storeId,
        originalName: file.name,
        fileType: file.type,
        fileSize: file.size,
        uploadDate: new Date(),
      }
    });

    // Upload file
    return new Promise((resolve, reject) => {
      uploadStream.on('error', (error) => {
        console.error('Upload stream error:', error);
        reject(new Error('Failed to save file'));
      });

      uploadStream.on('finish', () => {
        resolve({
          fileName: uniqueFilename,
          originalName: file.name,
          fileSize: file.size,
          fileType: file.type,
          fileId: uploadStream.id.toString()
        });
      });

      uploadStream.write(buffer);
      uploadStream.end();
    });
  } catch (error) {
    console.error('Error saving file:', error);
    throw new Error('Failed to save file');
  }
}

export async function getFile(fileName) {
  try {
    // Connect to MongoDB
    const client = await connectToMongo();
    const db = client.db(process.env.MONGODB_DB);

    // Create GridFS bucket
    const bucket = new MongoClient.GridFSBucket(db, {
      bucketName: 'uploads'
    });

    // Get the file data
    const downloadStream = bucket.openDownloadStreamByName(fileName);

    // Convert stream to buffer
    return new Promise((resolve, reject) => {
      const chunks = [];
      downloadStream.on('data', chunk => chunks.push(chunk));
      downloadStream.on('error', error => {
        console.error('Download stream error:', error);
        reject(new Error('Failed to get file'));
      });
      downloadStream.on('end', () => resolve(Buffer.concat(chunks)));
    });
  } catch (error) {
    console.error('Error getting file:', error);
    throw new Error('Failed to get file');
  }
}

export async function deleteFile(fileName) {
  try {
    // Connect to MongoDB
    const client = await connectToMongo();
    const db = client.db(process.env.MONGODB_DB);

    // Create GridFS bucket
    const bucket = new MongoClient.GridFSBucket(db, {
      bucketName: 'uploads'
    });

    // Find and delete the file
    const file = await db.collection('uploads.files').findOne({ filename: fileName });
    if (file) {
      await bucket.delete(file._id);
    }
  } catch (error) {
    console.error('Error deleting file:', error);
    throw new Error('Failed to delete file');
  }
}

export function validateFile(file) {
  // Check file size
  if (file.size > config.upload.maxFileSize) {
    throw new Error('File size exceeds the limit');
  }

  // Check file type
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
  ];

  if (!allowedTypes.includes(file.type)) {
    throw new Error('File type not supported');
  }

  return true;
} 