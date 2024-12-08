import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import config from './config';

export async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(payload) {
  return jwt.sign(payload, config.auth.jwtSecret, {
    expiresIn: config.auth.jwtExpiresIn,
  });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, config.auth.jwtSecret);
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

export async function authenticateToken(req) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      console.error('No authorization header');
      return null;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      console.error('No token found in authorization header');
      return null;
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      console.error('Invalid token');
      return null;
    }

    // Verify token type and required fields
    if (!decoded.type || !decoded.storeId || !decoded.email) {
      console.error('Token missing required fields');
      return null;
    }

    return decoded;
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
} 