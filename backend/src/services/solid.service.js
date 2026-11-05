import { config } from '../config/index.js';
import { errors } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

/**
 * Rewrite URL for internal fetch.
 * Metadata uses localhost:3001 (for browser), but backend in Docker
 * needs css:3001 to reach the CSS container via service name.
 */
function rewriteForFetch(url) {
  const [from, to] = config.POD_FETCH_REWRITE.split('=');
  if (from && to && url.includes(from)) {
    return url.replace(from, to);
  }
  return url;
}

export async function fetchMetadata(url) {
  const fetchUrl = rewriteForFetch(url);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const res = await fetch(fetchUrl, {
      headers: { Accept: 'application/ld+json, application/json' },
      signal: controller.signal,
    });

    if (!res.ok) {
      throw errors.validation({
        reason: 'solid_fetch_failed',
        status: res.status,
        url,
      });
    }

    return await res.json();
  } catch (err) {
    if (err.code === 'validation_error' || err.statusCode) throw err;
    logger.error(
      { err: err.message, cause: err.cause?.message, fetchUrl, originalUrl: url },
      'solid_fetch_error'
    );
    throw errors.validation({
      reason: 'solid_fetch_failed',
      message: err.cause?.message || err.message,
      url,
    });
  } finally {
    clearTimeout(timeout);
  }
}
