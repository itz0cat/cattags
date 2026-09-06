import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
import { toNodeHandler } from 'better-auth/node';

import healthRoutes from './routes/health';
import configRoutes from './routes/config';
import playerRoutes from './routes/players';
import teamRoutes from './routes/teams';
import authRoutes from './routes/auth';
import { errorHandler } from './middleware/errorHandler';
import { auth } from './auth';

export function createApp() {
  // Item 1: Refuse to start if JWT_SECRET is unset
  if (!process.env.JWT_SECRET) {
    throw new Error('FATAL: JWT_SECRET environment variable is not set. Refusing to start server with insecure default.');
  }

  const app = express();

  // Security headers
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  }));

  // CORS
  const corsOrigins = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : '*';
  app.use(cors({
    origin: corsOrigins,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'If-None-Match', 'cf-turnstile-response'],
    exposedHeaders: ['ETag', 'Cache-Control']
  }));

  // Better Auth native route handler
  app.all('/api/auth/*', toNodeHandler(auth));

  // Body parser with 2MB limit for logo upload
  app.use(express.json({ limit: '2mb' }));

  // General rate limiter
  const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: process.env.NODE_ENV === 'test' ? 10000 : 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' }
  });
  app.use('/api/', limiter);

  // Serve static uploads for local file storage
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  app.use('/uploads', express.static(uploadDir));

  // Request logger
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      if (process.env.NODE_ENV !== 'test') {
        console.log(`[HTTP] ${req.method} ${req.originalUrl} ${res.statusCode} (${duration}ms)`);
      }
    });
    next();
  });

  // API Routes
  app.use('/api/v1', healthRoutes);
  app.use('/api/v1', configRoutes);
  app.use('/api/v1/players', playerRoutes);
  app.use('/api/v1/teams', teamRoutes);
  app.use('/api/v1/auth', authRoutes);

  // Serve web dashboard frontend if built
  const possibleWebDist = [
    path.join(__dirname, '..', '..', 'web', 'dist'),
    path.join(process.cwd(), 'web', 'dist')
  ];
  let webDistDir = '';
  for (const p of possibleWebDist) {
    if (fs.existsSync(p)) {
      webDistDir = p;
      break;
    }
  }

  if (webDistDir) {
    app.use(express.static(webDistDir));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
        return next();
      }
      res.sendFile(path.join(webDistDir, 'index.html'));
    });
  }

  // 404 handler
  app.use((_req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
  });

  // Error handling middleware
  app.use(errorHandler);

  return app;
}
