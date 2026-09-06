import { Request, Response, NextFunction } from 'express';

export async function verifyTurnstile(req: Request, res: Response, next: NextFunction) {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  const turnstileToken =
    req.body?.turnstileToken ||
    req.headers['cf-turnstile-response'] ||
    req.body?.['cf-turnstile-response'];

  // Only enforce when TURNSTILE_SECRET_KEY is configured
  if (secretKey) {
    if (!turnstileToken) {
      return res.status(400).json({ error: 'CAPTCHA verification failed: Turnstile token is required' });
    }

    // Support mock verification in test environments
    if (process.env.NODE_ENV === 'test' && secretKey === 'test-turnstile-secret') {
      if (turnstileToken === 'valid-turnstile-token') {
        return next();
      }
      return res.status(400).json({ error: 'CAPTCHA verification failed: Invalid Turnstile token' });
    }

    try {
      const formData = new URLSearchParams();
      formData.append('secret', secretKey);
      formData.append('response', turnstileToken);
      if (req.ip) formData.append('remoteip', req.ip);

      const cfRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData
      });

      const data = (await cfRes.json()) as { success: boolean; 'error-codes'?: string[] };
      if (!data.success) {
        return res.status(400).json({ error: 'CAPTCHA verification failed: Invalid Turnstile token' });
      }
    } catch (err) {
      console.error('[Turnstile] Verification error:', err);
      return res.status(500).json({ error: 'Failed to verify CAPTCHA token' });
    }
  }

  next();
}
