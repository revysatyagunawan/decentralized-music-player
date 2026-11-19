import { jwtVerify, createRemoteJWKSet } from 'jose';
import { config } from '../config/index.js';
import { errors } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

// Cache JWKS per issuer (berlaku 1 jam)
const jwksCache = new Map();

async function getJwksForIssuer(issuerUrl) {
  const normalized = issuerUrl.replace(/\/$/, '');
  if (jwksCache.has(normalized)) return jwksCache.get(normalized);

  const discoveryUrl = `${normalized}/.well-known/openid-configuration`;
  const res = await fetch(discoveryUrl, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) {
    throw new Error(`Discovery failed for ${normalized}: HTTP ${res.status}`);
  }

  const discovery = await res.json();
  if (!discovery.issuer || !discovery.jwks_uri) {
    throw new Error('Invalid OIDC discovery document');
  }

  const jwks = createRemoteJWKSet(new URL(discovery.jwks_uri), {
    cooldownDuration: 30000,
    cacheMaxAge: 60 * 60 * 1000,
  });

  const entry = { jwks, canonicalIssuer: discovery.issuer };
  jwksCache.set(normalized, entry);
  return entry;
}

export async function verifyDpopToken(req, _res, next) {
  const authHeader = req.headers.authorization;
  const dpopHeader = req.headers.dpop;

  if (!authHeader?.startsWith('DPoP ') || !dpopHeader) {
    return next(errors.unauthorized('Missing DPoP headers'));
  }

  const accessToken = authHeader.slice(5);

  try {
    // 1. Extract iss tanpa verifikasi (decode payload saja)
    const parts = accessToken.split('.');
    if (parts.length !== 3) throw new Error('Invalid JWT format');

    const payloadJson = Buffer.from(parts[1], 'base64url').toString('utf8');
    const unverified = JSON.parse(payloadJson);
    if (!unverified.iss) throw new Error('Missing iss claim in token');

    // 2. Fetch JWKS untuk issuer tersebut
    const { jwks, canonicalIssuer } = await getJwksForIssuer(unverified.iss);

    // 3. Verify signature access token
    const { payload: verified } = await jwtVerify(accessToken, jwks, {
      issuer: canonicalIssuer,
      clockTolerance: 60,
    });

    // 4. Extract WebID dari token yang SUDAH terverifikasi
    const webid = verified.webid || verified.sub;
    if (!webid || typeof webid !== 'string') {
      throw new Error('No webid or sub claim in token');
    }

    // 5. Opsional: enforce whitelist kalau diisi
    if (config.ALLOWED_ISSUERS.length > 0) {
      const allowed = config.ALLOWED_ISSUERS.map((i) => i.replace(/\/$/, ''));
      const canonical = canonicalIssuer.replace(/\/$/, '');
      if (!allowed.includes(canonical)) {
        throw new Error(`Issuer not in allowlist: ${canonicalIssuer}`);
      }
    }

    req.solid = { webid: webid.replace(/\/$/, '') };
    next();
  } catch (err) {
    logger.error({ err: err.message }, 'DPoP verification failed');
    next(errors.unauthorized(`Invalid token: ${err.message}`));
  }
}
