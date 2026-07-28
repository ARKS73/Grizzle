import jwt from 'jsonwebtoken';
import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'grizzle_production_secure_jwt_secret_key_2026';
const JWT_SECRET_BYTES = new TextEncoder().encode(JWT_SECRET);

export const COOKIE_NAME = 'auth_token';

// Sign JWT for user session (Node.js runtime / API Routes)
export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

// Sign JWT using Jose (Edge Runtime compatible for Middleware)
export async function signJoseToken(payload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET_BYTES);
}

// Verify JWT token in API routes
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Verify JWT using Jose in Next.js Middleware
export async function verifyJoseToken(token) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET_BYTES);
    return payload;
  } catch (error) {
    return null;
  }
}

// Helper to extract user from NextRequest cookies or Authorization header
export function getAuthUser(request) {
  let token = null;

  // 1. Try HTTP-Only cookie
  if (request.cookies && typeof request.cookies.get === 'function') {
    const cookie = request.cookies.get(COOKIE_NAME);
    token = cookie ? cookie.value : null;
  }

  // 2. Fallback to Authorization Header
  if (!token && request.headers && typeof request.headers.get === 'function') {
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  if (!token) return null;
  const decoded = verifyToken(token);
  if (!decoded) return null;

  const id = decoded.userId || decoded.id || decoded._id || decoded.sub;

  return {
    ...decoded,
    userId: id,
    _id: id,
  };
}

