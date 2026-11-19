import { errors } from '../utils/errors.js';
import { verifyJWT } from '../utils/jwt.js';

function extractToken(req) {
  if (req.cookies?.sm_session) return req.cookies.sm_session;
  const auth = req.headers.authorization;
  if (auth?.startsWith('Bearer ')) return auth.slice(7);
  return null;
}

export async function requireAuth(req, _res, next) {
  const token = extractToken(req);
  if (!token) return next(errors.unauthorized());

  try {
    const payload = await verifyJWT(token);
    req.user = { userId: payload.uid, webid: payload.webid };
    next();
  } catch {
    next(errors.unauthorized('Invalid or expired session'));
  }
}

export async function optionalAuth(req, _res, next) {
  const token = extractToken(req);
  if (!token) return next();

  try {
    const payload = await verifyJWT(token);
    req.user = { userId: payload.uid, webid: payload.webid };
  } catch {}
  next();
}
