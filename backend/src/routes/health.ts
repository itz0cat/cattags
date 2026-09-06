import { Router, Request, Response } from 'express';
import { getDatabase } from '../db/database';

const router = Router();

router.get('/health', async (_req: Request, res: Response) => {
  const db = getDatabase();
  const dbHealthy = await db.healthCheck();

  const response = {
    status: dbHealthy ? 'ok' : 'degraded',
    version: '1.0.0',
    service: 'cattags-api',
    database: dbHealthy ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  };

  res.status(dbHealthy ? 200 : 503).json(response);
});

router.get('/version', (_req: Request, res: Response) => {
  res.json({
    version: '1.0.0',
    apiVersion: 'v1',
    targetMinecraft: '1.21.11',
    targetLoader: 'fabric',
    brand: 'CatTags'
  });
});

export default router;
