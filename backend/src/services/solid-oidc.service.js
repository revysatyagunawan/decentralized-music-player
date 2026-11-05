import { createRemoteJWKSet, jwtVerify } from 'jose';
import { config } from '../config/index.js';
import { errors } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

let jwks = null;
let discovery = null;

async function ensureInitialized() {
  if (jwks) return;

  const discoveryUrl = `${config.SOLID_OIDC_ISSUER.replace(/\/$/, '')}/.well-known/openid-configuration`;
  logger.info(`fetching OIDC discovery: ${discoveryUrl}`);

  const res = await fetch(discoveryUrl, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`OIDC discovery failed: HTTP ${res.status}`);
  }

  discovery = await res.json();
  if (!discovery.jwks_uri) {
    throw new Error('OIDC discovery missing jwks_uri');
  }

  jwks = createRemoteJWKSet(new URL(discovery.jwks_uri), {
    cooldownDuration: 30_000,
    cacheMaxAge: 60 * 60 * 1000,
  });

  logger.info(`solid-oidc ready (issuer=${discovery.issuer})`);
}

function defaultDisplayName(webid) {
  try {
    const url = new URL(webid);
    let host = url.host;
    const dot = host.indexOf('.');
    if (dot > 0) host = host.slice(0, dot);
    return host.charAt(0).toUpperCase() + host.slice(1);
  } catch {
    return 'Anonymous';
  }
}

export async function verifySolidIdToken(idToken) {
  await ensureInitialized();

  let payload;
  try {
    const result = await jwtVerify(idToken, jwks, {
      issuer: discovery.issuer,
      clockTolerance: 30,
    });
    payload = result.payload;
  } catch (err) {
    throw errors.unauthorized(`Solid auth failed: ${err.message}`);
  }

  const webid = payload.webid ?? payload.sub;
  if (!webid) {
    throw errors.unauthorized('No webid or sub in token');
  }

  const displayName = payload.name ?? defaultDisplayName(webid);
  return { webid, displayName };
}
