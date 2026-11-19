import { errors } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export async function fetchMetadata(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    logger.debug({ url }, 'fetching metadata from pod');

    const res = await fetch(url, {
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
    if (err.code) throw err; // already ApiError
    throw errors.validation({
      reason: 'solid_fetch_failed',
      message: err.cause?.message || err.message,
      url,
    });
  } finally {
    clearTimeout(timeout);
  }
}
