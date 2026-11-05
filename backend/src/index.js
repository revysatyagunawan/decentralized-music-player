import { config } from './config/index.js';
import { logger } from './utils/logger.js';
import { migrate } from './db/migrate.js';
import { createApp } from './app.js';

async function main() {
  logger.info('starting backend', { env: config.NODE_ENV });

  await migrate();

  const app = createApp();
  const server = app.listen(config.PORT, () => {
    logger.info(`listening on :${config.PORT}`);
  });

  const shutdown = (signal) => {
    logger.info(`received ${signal}, shutting down`);
    server.close(() => {
      logger.info('server closed');
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

main().catch((err) => {
  logger.error({ err }, 'fatal startup error');
  process.exit(1);
});
