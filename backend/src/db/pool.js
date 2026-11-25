import pg from 'pg';
import { databaseConnectionConfig } from './connection.js';

export const pool = new pg.Pool({
  ...databaseConnectionConfig,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('Unexpected pg error:', err);
});
