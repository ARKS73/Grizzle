import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'grizzle_production_secure_jwt_secret_key_2026';
const JWT_SECRET_BYTES = new TextEncoder().encode(JWT_SECRET);

export const COOKIE_NAME = 'auth_token';

export async function verifyJoseToken(token) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET_BYTES);
    return payload;
  } catch (error) {
    return null;
  }
}
