import * as userRepo from '../repositories/user.repo.js';
import { signJWT, ttlToMs } from '../utils/jwt.js';
import { ok } from '../utils/response.js';
import { errors } from '../utils/errors.js';
import { config } from '../config/index.js';

function cookieOptions() {
  return {
    httpOnly: true,
    secure: config.isProd,
    sameSite: 'lax',
    maxAge: ttlToMs(config.JWT_TTL),
    path: '/',
  };
}

function deriveDisplayName(webid) {
  try {
    const url = new URL(webid);
    const parts = url.pathname.split('/').filter(Boolean);
    const name = parts[0] || url.hostname;
    return name.charAt(0).toUpperCase() + name.slice(1);
  } catch {
    return 'User';
  }
}

export async function exchange(req, res, next) {
  try {
    const { webid } = req.solid;
    const displayName = deriveDisplayName(webid);

    const user = await userRepo.upsertByWebId(webid, displayName);
    const token = await signJWT({ uid: user.id, webid: user.webid });

    res.cookie('sm_session', token, cookieOptions());
    ok(res, { user });
  } catch (err) {
    next(err);
  }
}

export async function me(req, res, next) {
  try {
    const user = await userRepo.findById(req.user.userId);
    if (!user) throw errors.unauthorized('User not found');
    ok(res, user);
  } catch (err) {
    next(err);
  }
}

export async function logout(_req, res) {
  res.clearCookie('sm_session', { path: '/' });
  ok(res, { status: 'logged_out' });
}
