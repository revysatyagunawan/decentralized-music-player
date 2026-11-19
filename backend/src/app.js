import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from './config/index.js';
import { pool } from './db/pool.js';
import { loggerMiddleware } from './middlewares/logger.middleware.js';
import { errorMiddleware, notFoundMiddleware } from './middlewares/error.middleware.js';
import apiRoutes from './routes/index.js';

export function createApp() {
  const app = express();

  app.use(loggerMiddleware);
  app.use(cors({ origin: config.corsOrigins, credentials: true }));
  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));
  app.get('/ready', async (_req, res) => {
    try {
      await pool.query('SELECT 1');
      res.json({ status: 'ready' });
    } catch {
      res.status(503).json({ status: 'not_ready' });
    }
  });

  app.use('/api', apiRoutes);
  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
}
