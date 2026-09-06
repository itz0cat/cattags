import { Router, Request, Response } from 'express';
import { getDatabase } from '../db/database';
import { PlayerResolveItem, PlayerResolveResponse, LIMITS } from '@cattags/shared';

const router = Router();

router.post('/resolve', async (req: Request, res: Response) => {
  const { players } = req.body as { players?: PlayerResolveItem[] };

  if (!players || !Array.isArray(players)) {
    return res.status(400).json({ error: 'Request body must contain an array of players' });
  }

  if (players.length > LIMITS.maxBatchResolveSize) {
    return res.status(400).json({
      error: `Batch size exceeds maximum limit of ${LIMITS.maxBatchResolveSize} players`
    });
  }

  // Filter valid player queries
  const validPlayers = players
    .filter(p => p && typeof p.username === 'string' && p.username.trim().length > 0)
    .map(p => ({
      username: p.username.trim(),
      uuid: p.uuid ? p.uuid.trim() : undefined
    }));

  const db = getDatabase();
  const results = await db.resolvePlayers(validPlayers);

  const response: PlayerResolveResponse = {
    players: results,
    timestamp: Date.now()
  };

  // Cache-Control headers for intermediate proxies and clients
  res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
  res.json(response);
});

export default router;
