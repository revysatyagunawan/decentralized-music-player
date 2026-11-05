import { errors } from '../utils/errors.js';

export const validate = (schema, source = 'body') => (req, _res, next) => {
  const result = schema.safeParse(req[source]);
  if (!result.success) {
    return next(errors.validation({
      fields: result.error.errors.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      })),
    }));
  }
  req[source] = result.data;
  next();
};
