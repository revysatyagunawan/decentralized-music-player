import { createSolidTokenVerifier } from '@solid/access-token-verifier';
import { config } from '../config/index.js';
import { errors } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export async function verifyDpopToken(req, _res, next) {
  const authHeader = req.headers.authorization;
  const dpopHeader = req.headers.dpop;

  if (!authHeader?.startsWith('DPoP ') || !dpopHeader) {
    return next(errors.unauthorized('Missing DPoP headers'));
  }

  try {
    const verifier = createSolidTokenVerifier({
      allow: { issuers: config.ALLOWED_ISSUERS },
    });

    const url = `${req.protocol}://${req.get('host')}${req.originalUrl}`;

    const { webid } = await verifier(authHeader, {
      header: dpopHeader,
      method: req.method,
      url,
    });

    req.solid = { webid: webid.replace(/\/$/, '') };
    next();
  } catch (err) {
    logger.error({ err: err.message, url: req.originalUrl }, 'DPoP verification failed');
    next(errors.unauthorized(`Invalid DPoP token: ${err.message}`));
  }
}
