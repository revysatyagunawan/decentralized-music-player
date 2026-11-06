import { config } from './config/index.js';
import { logger } from './utils/logger.js';
import { migrate } from './db/migrate.js';
import { createApp } from './app.js';

if (config.NODE_ENV === 'development') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  logger.warn('TLS validation disabled (dev only)');
}

async function main() {
  logger.info('starting backend');

  await migrate();

  const app = createApp();
  const server = app.listen(config.PORT, () => {
    logger.info(`listening on :${config.PORT}`);
  });

  const shutdown = (signal) => {
    logger.info(`received ${signal}, shutting down`);
    server.close(() => process.exit(0));
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

main().catch((err) => {
  logger.error({ err }, 'fatal');
  process.exit(1);
});
