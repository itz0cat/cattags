import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';

import healthRoutes from './routes/health';
import configRoutes from './routes/config';
import playerRoutes from './routes/players';
import teamRoutes from './routes/teams';
import authRoutes from './routes/auth';
import { errorHandler } from './middleware/errorHandler';

export function createApp() {
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
    allowedHeaders: ['Content-Type', 'Authorization', 'If-None-Match'],
    exposedHeaders: ['ETag', 'Cache-Control']
  }));

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

  // 404 handler
  app.use((_req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
  });

  // Error handling middleware
  app.use(errorHandler);

  return app;
}
