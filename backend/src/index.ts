import dotenv from 'dotenv';
dotenv.config();

// Item 1: Refuse to start if JWT_SECRET is not set
if (!process.env.JWT_SECRET) {
  console.error('[Bootstrap] FATAL: JWT_SECRET environment variable is not set. Refusing to start server with insecure default.');
  throw new Error('FATAL: JWT_SECRET environment variable is not set. Refusing to start server with insecure default.');
}

import { createApp } from './app';
import { runMigrations } from './db/migrate';

const PORT = parseInt(process.env.PORT || '8080', 10);
const HOST = '0.0.0.0';

async function bootstrap() {
  // Run database migrations on startup if connected to PostgreSQL
  try {
    await runMigrations();
  } catch (err) {
    console.error('[Bootstrap] Migration failed:', err);
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }

  const app = createApp();

  const server = app.listen(PORT, HOST, () => {
    console.log(`[CatTags API] Server running on http://${HOST}:${PORT}`);
    console.log(`[CatTags API] Health check at http://${HOST}:${PORT}/api/v1/health`);
  });

  // Graceful shutdown
  const shutdown = (signal: string) => {
    console.log(`[CatTags API] Received ${signal}, closing server gracefully...`);
    server.close(() => {
      console.log('[CatTags API] Server closed.');
      process.exit(0);
    });
    setTimeout(() => {
      console.error('[CatTags API] Forcefully shutting down after timeout.');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap().catch(err => {
  console.error('[CatTags API] Fatal bootstrap error:', err);
  process.exit(1);
});
