import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('FATAL: JWT_SECRET environment variable is not set.');
}
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
