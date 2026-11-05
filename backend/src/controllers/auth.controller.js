import * as authService from '../services/solid-oidc.service.js';
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

export async function exchange(req, res, next) {
  try {
    const { id_token } = req.body;
    const { webid, displayName } = await authService.verifySolidIdToken(id_token);

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
