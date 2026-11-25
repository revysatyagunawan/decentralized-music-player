import { config } from '../config/index.js';

export const databaseConnectionConfig = {
  connectionString: config.DATABASE_URL,
  ...(config.isProd ? { ssl: { rejectUnauthorized: true } } : {}),
};
