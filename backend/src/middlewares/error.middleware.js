import { ZodError } from 'zod';
import { ApiError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export function errorMiddleware(err, req, res, _next) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'validation_error',
      message: 'Invalid request',
      details: {
        fields: err.errors.map((e) => ({
          path: e.path.join('.'),
          message: e.message,
        })),
      },
    });
  }

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      error: err.code,
      message: err.message,
      ...(err.details && { details: err.details }),
    });
  }

  logger.error({ err }, 'unhandled_error');
  res.status(500).json({ error: 'internal_error', message: 'Internal server error' });
}

export function notFoundMiddleware(req, res) {
  res.status(404).json({
    error: 'not_found',
    message: `Route ${req.method} ${req.path} not found`,
  });
}
