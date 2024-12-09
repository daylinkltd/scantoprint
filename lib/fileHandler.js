import { MongoClient } from 'mongodb';
import config from './config';

let gridFSBucket;

async function getGridFSBucket() {
  if (!gridFSBucket) {
    const client = await MongoClient.connect(process.env.MONGODB_URI);
    const db = client.db(process.env.MONGODB_DB);
    gridFSBucket = new client.s.options.GridFSBucket(db, {
      bucketName: 'uploads'
    });
  }
  return gridFSBucket;
}

export async function saveFile(file, storeId) {
  try {
    // Generate unique filename
    const timestamp = Date.now();
    const uniqueFilename = `${storeId}/${timestamp}-${file.name}`;

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Get GridFS bucket
    const bucket = await getGridFSBucket();

    // Upload file
    const uploadStream = bucket.openUploadStream(uniqueFilename, {
      metadata: {
        storeId,
        originalName: file.name,
        fileType: file.type,
        fileSize: file.size,
        uploadDate: new Date(),
      }
    });

    await new Promise((resolve, reject) => {
      uploadStream.end(buffer, (error) => {
        if (error) reject(error);
        else resolve();
      });
    });

    return {
      fileName: uniqueFilename,
      originalName: file.name,
      fileSize: file.size,
      fileType: file.type,
      fileId: uploadStream.id.toString()
    };
  } catch (error) {
    console.error('Error saving file:', error);
    throw new Error('Failed to save file');
  }
}

export async function getFile(fileName) {
  try {
    const bucket = await getGridFSBucket();
    
    // Get the file data
    const downloadStream = bucket.openDownloadStreamByName(fileName);
    
    // Convert stream to buffer
    const chunks = [];
    await new Promise((resolve, reject) => {
      downloadStream.on('data', chunk => chunks.push(chunk));
      downloadStream.on('error', reject);
      downloadStream.on('end', resolve);
    });

    return Buffer.concat(chunks);
  } catch (error) {
    console.error('Error getting file:', error);
    throw new Error('Failed to get file');
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