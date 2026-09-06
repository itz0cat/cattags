import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { fromNodeHeaders } from 'better-auth/node';
import { auth } from '../auth';

// Item 1: Refuse to start if JWT_SECRET is unset
export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('FATAL: JWT_SECRET environment variable is not set. Refusing to start server with insecure default.');
  }
  return secret;
}

if (!process.env.JWT_SECRET && process.env.NODE_ENV !== 'test') {
  throw new Error('FATAL: JWT_SECRET environment variable is not set. Refusing to start server with insecure default.');
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    minecraftUsername?: string;
    emailVerified?: boolean;
  };
  session?: any;
}

export async function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const cookieHeader = req.headers.cookie;

  if (!authHeader && !cookieHeader) {
    return res.status(401).json({ error: 'Missing or invalid authorization token' });
  }

  try {
    // 1. Better Auth session resolution (supports cookies and bearer tokens)
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers)
    }).catch(() => null);

    if (session?.user) {
      req.user = {
        id: session.user.id,
        email: session.user.email,
        role: (session.user as any).role || 'USER',
        minecraftUsername: (session.user as any).minecraftUsername || undefined,
        emailVerified: session.user.emailVerified
      };
      req.session = session.session;
      return next();
    }

    // 2. JWT verification fallback (preserves testing & API client parity)
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const secret = getJwtSecret();
      const decoded = jwt.verify(token, secret) as any;
      if (decoded && decoded.id) {
        req.user = {
          id: decoded.id,
          email: decoded.email,
          role: decoded.role || 'USER',
          minecraftUsername: decoded.minecraftUsername,
          emailVerified: decoded.emailVerified ?? true
        };
        return next();
      }
    }

    return res.status(401).json({ error: 'Invalid or expired token' });
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export async function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const cookieHeader = req.headers.cookie;

  if (authHeader || cookieHeader) {
    try {
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers)
      }).catch(() => null);

      if (session?.user) {
        req.user = {
          id: session.user.id,
          email: session.user.email,
          role: (session.user as any).role || 'USER',
          minecraftUsername: (session.user as any).minecraftUsername || undefined,
          emailVerified: session.user.emailVerified
        };
        req.session = session.session;
        return next();
      }

      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        const secret = getJwtSecret();
        const decoded = jwt.verify(token, secret) as any;
        if (decoded && decoded.id) {
          req.user = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role || 'USER',
            minecraftUsername: decoded.minecraftUsername,
            emailVerified: decoded.emailVerified ?? true
          };
        }
      }
    } catch {
      // ignore
    }
  }
  next();
}

export function generateToken(payload: object): string {
  const secret = getJwtSecret();
  return jwt.sign(payload, secret, { expiresIn: '7d' });
}
