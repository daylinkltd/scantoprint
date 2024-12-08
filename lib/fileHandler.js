import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import config from './config';

export async function saveFile(file, storeId) {
  try {
    // Create store-specific upload directory if it doesn't exist
    const uploadDir = join(process.cwd(), config.upload.directory, storeId);
    await mkdir(uploadDir, { recursive: true });

    // Generate unique filename
    const timestamp = Date.now();
    const uniqueFilename = `${timestamp}-${file.name}`;
    const filePath = join(uploadDir, uniqueFilename);

    // Save file
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    return {
      fileName: uniqueFilename,
      originalName: file.name,
      fileSize: file.size,
      fileType: file.type,
      filePath,
    };
  } catch (error) {
    console.error('Error saving file:', error);
    throw new Error('Failed to save file');
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