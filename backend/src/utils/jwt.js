import { SignJWT, jwtVerify } from 'jose';
import { config } from '../config/index.js';

const secret = new TextEncoder().encode(config.JWT_SECRET);

export async function signJWT(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(config.JWT_TTL)
    .setIssuer('solid-music')
    .sign(secret);
}

export async function verifyJWT(token) {
  const { payload } = await jwtVerify(token, secret, { issuer: 'solid-music' });
  return payload;
}

export function ttlToMs(ttl) {
  const m = /^(\d+)([smhd])$/.exec(ttl);
  if (!m) return 24 * 3600 * 1000;
  const [, n, unit] = m;
  return parseInt(n, 10) * { s: 1000, m: 60000, h: 3600000, d: 86400000 }[unit];
}
