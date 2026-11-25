import { readFileSync } from 'node:fs';
import { config } from '../config/index.js';

export const databaseConnectionConfig = {
  connectionString: config.DATABASE_URL,
  ...(config.isProd
    ? {
        ssl: {
          ca: readFileSync('/usr/lib/ssl/certs/ca-certificates.crt', 'utf8'),
          rejectUnauthorized: true,
        },
      }
    : {}),
};
