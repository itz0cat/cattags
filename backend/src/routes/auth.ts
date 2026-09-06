import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../db/database';
import { authenticate, AuthRequest, generateToken } from '../middleware/auth';
import { verifyTurnstile } from '../middleware/turnstile';
import { auth } from '../auth';

const router = Router();

// Item 5: Dedicated strict rate limiter on login and register (10 attempts per 15 minutes per IP)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'test' ? 1000 : 10,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  message: { error: 'Too many authentication attempts. Please try again in 15 minutes.' }
});

router.post('/register', authLimiter, verifyTurnstile, async (req: Request, res: Response) => {
  const { email, password, minecraftUsername } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long' });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const db = getDatabase();
  const existing = await db.findUserByEmail(normalizedEmail);
  if (existing) {
    return res.status(409).json({ error: 'User with this email already exists' });
  }

  // Register user with Better Auth
  let betterAuthUser: any = null;
  let betterAuthToken: string | null = null;

  try {
    const signupRes = await auth.api.signUpEmail({
      body: {
        email: normalizedEmail,
        password,
        name: minecraftUsername ? minecraftUsername.trim() : normalizedEmail.split('@')[0],
        minecraftUsername: minecraftUsername ? minecraftUsername.trim() : undefined,
        role: 'USER'
      }
    });

    if (signupRes?.user) {
      betterAuthUser = signupRes.user;
      betterAuthToken = (signupRes as any).token || (signupRes as any).session?.token || null;
    }
  } catch (err: any) {
    // If Better Auth failed due to existing user, return 409
    if (err.message?.toLowerCase().includes('already exists')) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }
  }

  const userId = betterAuthUser?.id || uuidv4();
  const saltRounds = process.env.NODE_ENV === 'test' ? 1 : 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const isEmailVerified = process.env.NODE_ENV === 'test' ? true : (betterAuthUser?.emailVerified ?? false);

  const user = {
    id: userId,
    email: normalizedEmail,
    passwordHash,
    minecraftUsername: minecraftUsername ? minecraftUsername.trim() : null,
    role: 'USER',
    emailVerified: isEmailVerified,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  await db.createUser(user);

  const token =
    betterAuthToken ||
    generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      minecraftUsername: user.minecraftUsername,
      emailVerified: user.emailVerified
    });

  res.status(201).json({
    user: {
      id: user.id,
      email: user.email,
      minecraftUsername: user.minecraftUsername,
      role: user.role,
      emailVerified: user.emailVerified
    },
    token
  });
});

router.post('/login', authLimiter, verifyTurnstile, async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const db = getDatabase();
  const user = await db.findUserByEmail(normalizedEmail);

  // Authenticate with Better Auth
  let betterAuthSession: any = null;
  try {
    betterAuthSession = await auth.api.signInEmail({
      body: {
        email: normalizedEmail,
        password
      }
    });
  } catch {
    // Fall back to stored password hash check
  }

  if (betterAuthSession?.user) {
    const u = betterAuthSession.user;
    const token =
      betterAuthSession.token ||
      betterAuthSession.session?.token ||
      generateToken({
        id: u.id,
        email: u.email,
        role: (u as any).role || 'USER',
        minecraftUsername: (u as any).minecraftUsername,
        emailVerified: u.emailVerified
      });

    return res.json({
      user: {
        id: u.id,
        email: u.email,
        minecraftUsername: (u as any).minecraftUsername || user?.minecraft_username || user?.minecraftUsername,
        role: (u as any).role || user?.role || 'USER',
        emailVerified: u.emailVerified
      },
      token
    });
  }

  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const passwordValid = await bcrypt.compare(password, user.password_hash || user.passwordHash);
  if (!passwordValid) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
    minecraftUsername: user.minecraft_username || user.minecraftUsername,
    emailVerified: user.emailVerified ?? true
  });

  res.json({
    user: {
      id: user.id,
      email: user.email,
      minecraftUsername: user.minecraft_username || user.minecraftUsername,
      role: user.role,
      emailVerified: user.emailVerified ?? true
    },
    token
  });
});

router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  const db = getDatabase();
  const user = await db.findUserById(req.user!.id);

  if (!user && !req.user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({
    user: {
      id: req.user!.id,
      email: req.user!.email,
      minecraftUsername: req.user!.minecraftUsername || user?.minecraft_username || user?.minecraftUsername,
      role: req.user!.role,
      emailVerified: req.user!.emailVerified ?? user?.emailVerified ?? true
    }
  });
});

export default router;
