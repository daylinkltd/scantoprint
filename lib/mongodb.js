import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

let cachedConnection = null;

export async function connectToDatabase() {
  if (cachedConnection) {
    console.log('Using cached MongoDB connection');
    return cachedConnection;
  }

  try {
    console.log('Creating new MongoDB connection');
    
    // Configure mongoose
    mongoose.set('strictQuery', true);
    
    // Connect with retry logic
    const connection = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      maxPoolSize: 10, // Maintain up to 10 socket connections
    });

    console.log('MongoDB connected successfully');
    cachedConnection = connection;
    return connection;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    
    // Clear cached connection on error
    cachedConnection = null;
    
    // Throw a more user-friendly error
    throw new Error('Failed to connect to database. Please check your connection and try again.');
  }
} 