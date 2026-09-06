import { Router, Request, Response } from 'express';
import { LIMITS } from '@cattags/shared';

const router = Router();

router.get('/config', (_req: Request, res: Response) => {
  res.json({
    brand: 'CatTags',
    creator: 'ItzCat',
    apiVersion: 'v1',
    maxBatchResolveSize: LIMITS.maxBatchResolveSize,
    maxLogoSizeBytes: LIMITS.maxLogoSizeBytes,
    allowedLogoMimeTypes: ['image/png', 'image/webp'],
    clientCacheTtlSeconds: 300,
    features: {
      offlineAuthenticationSupported: true,
      gradientsSupported: true,
      logosSupported: true
    }
  });
});

export default router;
