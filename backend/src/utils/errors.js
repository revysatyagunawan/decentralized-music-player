export class ApiError extends Error {
  constructor(statusCode, code, message, details) {
    super(message || code);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export const errors = {
  validation: (details) => new ApiError(400, 'validation_error', 'Invalid request', details),
  unauthorized: (msg = 'Authentication required') => new ApiError(401, 'unauthorized', msg),
  forbidden: (msg = 'Access denied') => new ApiError(403, 'forbidden', msg),
  notFound: (code = 'not_found', msg = 'Resource not found') => new ApiError(404, code, msg),
  conflict: (code, msg) => new ApiError(409, code, msg),
  internal: (msg = 'Internal server error') => new ApiError(500, 'internal_error', msg),
};
