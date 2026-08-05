import crypto from 'crypto';

// Base32 Alphabet RFC 4648
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

// Base32 encode buffer
export function base32Encode(buffer) {
  let bits = 0;
  let value = 0;
  let output = '';

  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i];
    bits += 8;

    while (bits >= 5) {
      output += ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += ALPHABET[(value << (5 - bits)) & 31];
  }

  return output;
}

// Base32 decode string to buffer
export function base32Decode(input) {
  const cleanInput = input.toUpperCase().replace(/=+$/, '').replace(/\s+/g, '');
  const buffer = [];
  let bits = 0;
  let value = 0;

  for (let i = 0; i < cleanInput.length; i++) {
    const val = ALPHABET.indexOf(cleanInput[i]);
    if (val === -1) continue;

    value = (value << 5) | val;
    bits += 5;

    if (bits >= 8) {
      buffer.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return Buffer.from(buffer);
}

// Generate TOTP Secret (160-bit / 20 bytes random key)
export function generateTotpSecret(email = 'admin@grizzle.in') {
  const randomBytes = crypto.randomBytes(20);
  const secret = base32Encode(randomBytes);
  const issuer = 'GrizzleApparel';
  const otpauthUrl = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(email)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;

  return { secret, otpauthUrl };
}

// Calculate HOTP value for a specific counter (RFC 4226)
export function generateHOTP(secret, counter) {
  const key = base32Decode(secret);

  // Counter as 8-byte big-endian buffer
  const buf = Buffer.alloc(8);
  let tmp = counter;
  for (let i = 7; i >= 0; i--) {
    buf[i] = tmp & 0xff;
    tmp = tmp >> 8;
  }

  // HMAC-SHA1
  const hmac = crypto.createHmac('sha1', key).update(buf).digest();

  // Dynamic truncation
  const offset = hmac[hmac.length - 1] & 0xf;
  const codeInt =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  // 6-digit code
  const code = (codeInt % 1000000).toString().padStart(6, '0');
  return code;
}

// Calculate current TOTP value for current timestamp (RFC 6238)
export function generateTOTP(secret, timeStep = 30) {
  const counter = Math.floor(Date.now() / 1000 / timeStep);
  return generateHOTP(secret, counter);
}

// Verify TOTP token with ±1 window tolerance (90 seconds leeway for clock drift)
export function verifyTOTP(secret, userCode, window = 1, timeStep = 30) {
  if (!secret || !userCode) return false;
  const cleanCode = userCode.toString().trim();
  if (cleanCode.length !== 6) return false;

  const currentCounter = Math.floor(Date.now() / 1000 / timeStep);

  for (let errorWindow = -window; errorWindow <= window; errorWindow++) {
    const calculatedCode = generateHOTP(secret, currentCounter + errorWindow);
    if (calculatedCode === cleanCode) {
      return true;
    }
  }

  return false;
}
