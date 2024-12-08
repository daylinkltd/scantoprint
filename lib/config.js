const config = {
  mongodb: {
    uri: process.env.MONGODB_URI,
    dbName: process.env.MONGODB_DB,
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN,
  },
  api: {
    url: process.env.NEXT_PUBLIC_API_URL,
  },
  upload: {
    directory: process.env.UPLOAD_DIR,
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE),
  },
  store: {
    qrCodeExpiry: parseInt(process.env.QR_CODE_EXPIRY),
  },
};

// Validate required environment variables
const requiredEnvVars = [
  'MONGODB_URI',
  'MONGODB_DB',
  'JWT_SECRET',
  'JWT_EXPIRES_IN',
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

export default config; 