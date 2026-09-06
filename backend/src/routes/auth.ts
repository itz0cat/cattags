import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../db/database';
import { authenticate, AuthRequest, generateToken } from '../middleware/auth';

const router = Router();

router.post('/register', async (req: Request, res: Response) => {
  const { email, password, minecraftUsername } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long' });
  }

  const db = getDatabase();
  const existing = await db.findUserByEmail(email);
  if (existing) {
    return res.status(409).json({ error: 'User with this email already exists' });
  }

  const saltRounds = process.env.NODE_ENV === 'test' ? 1 : 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);
  const user = {
    id: uuidv4(),
    email: email.toLowerCase().trim(),
    passwordHash,
    minecraftUsername: minecraftUsername ? minecraftUsername.trim() : null,
    role: 'USER',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  await db.createUser(user);

  const token = generateToken({ id: user.id, email: user.email, role: user.role });

  res.status(201).json({
    user: {
      id: user.id,
      email: user.email,
      minecraftUsername: user.minecraftUsername,
      role: user.role
    },
    token
  });
});

router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const db = getDatabase();
  const user = await db.findUserByEmail(email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const passwordValid = await bcrypt.compare(password, user.password_hash || user.passwordHash);
  if (!passwordValid) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = generateToken({ id: user.id, email: user.email, role: user.role });

  res.json({
    user: {
      id: user.id,
      email: user.email,
      minecraftUsername: user.minecraft_username || user.minecraftUsername,
      role: user.role
    },
    token
  });
});

router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  const db = getDatabase();
  const user = await db.findUserById(req.user!.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({
    user: {
      id: user.id,
      email: user.email,
      minecraftUsername: user.minecraft_username || user.minecraftUsername,
      role: user.role
    }
  });
});

export default router;
