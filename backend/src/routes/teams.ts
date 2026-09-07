import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../db/database';
import { authenticate, AuthRequest, optionalAuth } from '../middleware/auth';
import { getStorageProvider } from '../storage';
import { Team, TeamMember, TeamRole, LIMITS } from '@cattags/shared';

const router = Router();

// GET /api/v1/teams - List teams
router.get('/', async (req: Request, res: Response) => {
  const limit = Math.min(parseInt(req.query.limit as string, 10) || 50, 100);
  const offset = parseInt(req.query.offset as string, 10) || 0;
  const search = (req.query.search as string) || '';

  const db = getDatabase();
  const { teams, total } = await db.listTeams(limit, offset, search);

  res.json({
    teams,
    total,
    limit,
    offset
  });
});

// GET /api/v1/teams/by-player/:identifier - Resolve team for a single player
router.get('/by-player/:identifier', async (req: Request, res: Response) => {
  const identifier = req.params.identifier.trim();
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);

  const db = getDatabase();
  const results = await db.resolvePlayers([
    isUuid ? { username: '', uuid: identifier } : { username: identifier }
  ]);

  if (results.length > 0 && results[0].team) {
    res.setHeader('Cache-Control', 'public, max-age=60');
    return res.json({ player: results[0] });
  }

  res.status(404).json({ error: 'Player is not registered with any team' });
});

// GET /api/v1/teams/:id - Get team details
router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const db = getDatabase();
  let team = await db.findTeamById(id);
  if (!team) {
    team = await db.findTeamBySlug(id);
  }

  if (!team) {
    return res.status(404).json({ error: 'Team not found' });
  }

  // ETag header based on team version
  const etag = `"team-${team.id}-v${team.version}"`;
  res.setHeader('ETag', etag);

  if (req.headers['if-none-match'] === etag) {
    return res.status(304).end();
  }

  res.json({ team });
});

// POST /api/v1/teams - Create a team
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {

  const {
    name,
    slug,
    shortName,
    prefix,
    description,
    primaryColor,
    secondaryColor,
    gradientEnabled,
    gradientDirection,
    style
  } = req.body;

  if (!name || !prefix || !slug) {
    return res.status(400).json({ error: 'name, prefix, and slug are required' });
  }

  if (prefix.length > LIMITS.maxPrefixLength) {
    return res.status(400).json({ error: `Prefix cannot exceed ${LIMITS.maxPrefixLength} characters` });
  }

  const normalizedSlug = slug.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '');
  const db = getDatabase();

  // Enforce 1 team per person
  const mcName = req.user!.minecraftUsername;
  const existingUserTeam = await db.findTeamByUserId(req.user!.id, mcName);
  if (existingUserTeam && req.user!.role !== 'ADMIN') {
    return res.status(400).json({
      error: `You already belong to team "${existingUserTeam.name}". Players can only belong to one team at a time. Leave or delete your current team first.`,
      team: existingUserTeam
    });
  }

  const existingSlug = await db.findTeamBySlug(normalizedSlug);
  if (existingSlug) {
    return res.status(409).json({ error: 'A team with this slug already exists' });
  }

  const now = new Date().toISOString();
  const teamId = 'team_' + uuidv4().replace(/-/g, '').slice(0, 12);

  const newTeam: Team = {
    id: teamId,
    slug: normalizedSlug,
    name: name.trim(),
    shortName: shortName ? shortName.trim() : undefined,
    prefix: prefix.trim(),
    description: description ? description.trim() : '',
    logoUrl: null,
    primaryColor: primaryColor || '#3B82F6',
    secondaryColor: secondaryColor || null,
    gradientEnabled: !!gradientEnabled,
    gradientDirection: gradientDirection || 'LEFT_TO_RIGHT',
    style: style || {
      type: gradientEnabled ? 'GRADIENT' : 'SOLID',
      colors: secondaryColor ? [primaryColor || '#3B82F6', secondaryColor] : [primaryColor || '#3B82F6'],
      direction: gradientDirection || 'LEFT_TO_RIGHT',
      bold: true,
      italic: false
    },
    verified: false,
    status: 'ACTIVE',
    ownerId: req.user!.id,
    version: 1,
    createdAt: now,
    updatedAt: now
  };

  // Ensure owner exists in legacy users table for foreign key constraint
  const existingUser = await db.findUserById(req.user!.id);
  if (!existingUser) {
    await db.createUser({
      id: req.user!.id,
      email: req.user!.email || `${req.user!.id}@discord.user`,
      passwordHash: null,
      minecraftUsername: req.user!.minecraftUsername || null,
      role: req.user!.role || 'USER',
      emailVerified: true,
      createdAt: now,
      updatedAt: now
    });
  }

  await db.createTeam(newTeam);

  // Automatically add the creator as OWNER member if they have a minecraft_username
  const user = await db.findUserById(req.user!.id);
  if (user && user.minecraft_username) {
    const ownerMember: TeamMember = {
      id: 'mem_' + uuidv4().slice(0, 10),
      teamId,
      minecraftUsername: user.minecraft_username,
      identifierType: 'CRACKED_USERNAME',
      role: 'OWNER',
      verified: true,
      createdAt: now,
      updatedAt: now
    };
    await db.addTeamMember(ownerMember);
    newTeam.members = [ownerMember];
  }

  await db.createAuditLog({
    id: uuidv4(),
    userId: req.user!.id,
    teamId,
    action: 'TEAM_CREATED',
    details: { name: newTeam.name, slug: newTeam.slug },
    ipAddress: req.ip
  });

  res.status(201).json({ team: newTeam });
});

// PATCH /api/v1/teams/:id - Update team
router.patch('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const db = getDatabase();
  const team = await db.findTeamById(id);

  if (!team) {
    return res.status(404).json({ error: 'Team not found' });
  }

  if (team.ownerId !== req.user!.id && req.user!.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Only the team owner can edit team settings' });
  }

  const allowedUpdates: Partial<Team> = {};
  if (req.body.name) allowedUpdates.name = req.body.name.trim();
  if (req.body.prefix) allowedUpdates.prefix = req.body.prefix.trim();
  if (req.body.description !== undefined) allowedUpdates.description = req.body.description;
  if (req.body.primaryColor) allowedUpdates.primaryColor = req.body.primaryColor;
  if (req.body.secondaryColor !== undefined) allowedUpdates.secondaryColor = req.body.secondaryColor;
  if (req.body.gradientEnabled !== undefined) allowedUpdates.gradientEnabled = req.body.gradientEnabled;
  if (req.body.gradientDirection) allowedUpdates.gradientDirection = req.body.gradientDirection;
  if (req.body.style) allowedUpdates.style = req.body.style;

  const updated = await db.updateTeam(id, allowedUpdates);

  await db.createAuditLog({
    id: uuidv4(),
    userId: req.user!.id,
    teamId: id,
    action: 'TEAM_UPDATED',
    details: allowedUpdates,
    ipAddress: req.ip
  });

  res.json({ team: updated });
});

// DELETE /api/v1/teams/:id - Delete team
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const db = getDatabase();
  const team = await db.findTeamById(id);

  if (!team) {
    return res.status(404).json({ error: 'Team not found' });
  }

  if (team.ownerId !== req.user!.id && req.user!.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Only the team owner can delete this team' });
  }

  await db.deleteTeam(id);

  await db.createAuditLog({
    id: uuidv4(),
    userId: req.user!.id,
    teamId: id,
    action: 'TEAM_DELETED',
    details: { name: team.name },
    ipAddress: req.ip
  });

  res.json({ success: true, message: 'Team deleted' });
});

// POST /api/v1/teams/:id/members - Add member
router.post('/:id/members', authenticate, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { minecraftUsername, minecraftUuid, role } = req.body;

  if (!minecraftUsername || typeof minecraftUsername !== 'string') {
    return res.status(400).json({ error: 'minecraftUsername is required' });
  }

  const db = getDatabase();
  const team = await db.findTeamById(id);

  if (!team) {
    return res.status(404).json({ error: 'Team not found' });
  }

  if (team.ownerId !== req.user!.id && req.user!.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Only the team owner or admin can add members' });
  }

  const now = new Date().toISOString();
  const member: TeamMember = {
    id: 'mem_' + uuidv4().slice(0, 10),
    teamId: id,
    minecraftUsername: minecraftUsername.trim(),
    minecraftUuid: minecraftUuid ? minecraftUuid.trim() : null,
    identifierType: minecraftUuid ? 'MOJANG_UUID' : 'CRACKED_USERNAME',
    role: (role as TeamRole) || 'MEMBER',
    verified: false,
    createdAt: now,
    updatedAt: now
  };

  await db.addTeamMember(member);

  res.status(201).json({ member });
});

// DELETE /api/v1/teams/:id/members/:memberId - Remove member
router.delete('/:id/members/:memberId', authenticate, async (req: AuthRequest, res: Response) => {
  const { id, memberId } = req.params;
  const db = getDatabase();
  const team = await db.findTeamById(id);

  if (!team) {
    return res.status(404).json({ error: 'Team not found' });
  }

  if (team.ownerId !== req.user!.id && req.user!.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Only team admins can remove members' });
  }

  const removed = await db.removeTeamMember(id, memberId);
  if (!removed) {
    return res.status(404).json({ error: 'Member not found' });
  }

  res.json({ success: true, message: 'Member removed from team' });
});

// POST /api/v1/teams/:id/leave - Member leaves team
router.post('/:id/leave', authenticate, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const db = getDatabase();
  const team = await db.findTeamById(id);
  if (!team) return res.status(404).json({ error: 'Team not found' });

  if (team.ownerId === req.user!.id) {
    return res.status(400).json({
      error: 'Team owners cannot leave their own team. You can delete the team or transfer ownership.'
    });
  }

  const members = await db.listTeamMembers(id);
  const mcName = req.user!.minecraftUsername?.toLowerCase().trim();
  const member = members.find(m =>
    (m as any).userId === req.user!.id ||
    (mcName && m.minecraftUsername.toLowerCase().trim() === mcName)
  );

  if (!member) {
    return res.status(404).json({ error: 'You are not a member of this team' });
  }

  await db.removeTeamMember(id, member.id);
  await db.createAuditLog({
    id: uuidv4(),
    teamId: id,
    userId: req.user!.id,
    action: 'MEMBER_LEFT',
    details: { minecraftUsername: member.minecraftUsername },
    ipAddress: req.ip
  });

  res.json({ success: true, message: `You have successfully left team ${team.name}` });
});

// POST /api/v1/teams/:id/verify - Generate verification token for in-game cracked/offline verification
router.post('/:id/verify', authenticate, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { minecraftUsername } = req.body;

  if (!minecraftUsername) {
    return res.status(400).json({ error: 'minecraftUsername is required' });
  }

  const db = getDatabase();
  const team = await db.findTeamById(id);
  if (!team) return res.status(404).json({ error: 'Team not found' });

  // IDOR check: Only owner or admin can generate verification tokens
  if (team.ownerId !== req.user!.id && req.user!.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Unauthorized to generate verification codes for this team' });
  }

  // Cryptographically secure token generation with 12 hex characters (~2.81 x 10^14 combinations)
  const secureRandomHex = crypto.randomBytes(6).toString('hex').toUpperCase();
  const code = `${team.prefix.toUpperCase()}-${secureRandomHex}`;

  const token = {
    id: uuidv4(),
    teamId: id,
    minecraftUsername: minecraftUsername.trim(),
    code,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 mins
    used: false
  };

  await db.createVerificationToken(token);

  res.json({
    code,
    command: `/team verify ${code}`,
    expiresInSeconds: 900,
    instructions: 'Run this command on a verified CatTags server to confirm identity.'
  });
});

// POST /api/v1/teams/verify/confirm - Global verification endpoint by code (for in-game command)
router.post('/verify/confirm', async (req: Request, res: Response) => {
  const { code, minecraftUsername } = req.body;

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Verification code is required' });
  }

  const db = getDatabase();
  const token = await db.findVerificationToken(code.trim().toUpperCase());
  if (!token) {
    return res.status(404).json({ error: 'Invalid verification code' });
  }

  if (token.used) {
    return res.status(400).json({ error: 'Verification code has already been used' });
  }

  const expiresAt = new Date(token.expires_at || token.expiresAt);
  if (expiresAt.getTime() < Date.now()) {
    return res.status(400).json({ error: 'Verification code has expired' });
  }

  const teamId = token.team_id || token.teamId;
  const team = await db.findTeamById(teamId);
  if (!team) return res.status(404).json({ error: 'Team not found' });

  // Mark token used
  await db.markVerificationTokenUsed(token.id);

  // Mark matching member verified in database
  const username = token.minecraft_username || token.minecraftUsername || minecraftUsername;
  const memberUpdated = await db.verifyTeamMember(teamId, username);

  // Increment team sync version and audit log
  await db.updateTeam(teamId, { version: team.version + 1 });
  await db.createAuditLog({
    id: uuidv4(),
    teamId,
    action: 'MEMBER_VERIFIED',
    details: { minecraftUsername: username, code: token.code }
  });

  res.json({
    success: true,
    message: `Player ${username} successfully verified for team ${team.name}`,
    minecraftUsername: username,
    teamId: team.id,
    teamName: team.name,
    team: {
      id: team.id,
      name: team.name,
      prefix: team.prefix
    },
    memberUpdated
  });
});

// POST /api/v1/teams/:id/verify/confirm - Consume in-game verification token and mark member verified
router.post('/:id/verify/confirm', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { code } = req.body;

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Verification code is required' });
  }

  const db = getDatabase();
  const team = await db.findTeamById(id);
  if (!team) return res.status(404).json({ error: 'Team not found' });

  const token = await db.findVerificationToken(code.trim().toUpperCase());
  if (!token) {
    return res.status(404).json({ error: 'Invalid verification code' });
  }

  if (token.team_id && token.team_id !== id && token.teamId !== id) {
    return res.status(400).json({ error: 'Verification code does not belong to this team' });
  }

  if (token.used) {
    return res.status(400).json({ error: 'Verification code has already been used' });
  }

  const expiresAt = new Date(token.expires_at || token.expiresAt);
  if (expiresAt.getTime() < Date.now()) {
    return res.status(400).json({ error: 'Verification code has expired' });
  }

  // Mark token used
  await db.markVerificationTokenUsed(token.id);

  // Mark matching member verified in database
  const username = token.minecraft_username || token.minecraftUsername;
  const memberUpdated = await db.verifyTeamMember(id, username);

  // Increment team sync version and audit log
  await db.updateTeam(id, { version: team.version + 1 });
  await db.createAuditLog({
    id: uuidv4(),
    teamId: id,
    action: 'MEMBER_VERIFIED',
    details: { minecraftUsername: username, code: token.code }
  });

  res.json({
    success: true,
    message: `Player ${username} successfully verified for team ${team.name}`,
    minecraftUsername: username,
    memberUpdated
  });
});

// POST /api/v1/teams/:id/logo - Upload logo image
router.post('/:id/logo', authenticate, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { base64Data, contentType } = req.body;

  if (!base64Data || !contentType) {
    return res.status(400).json({ error: 'base64Data and contentType are required' });
  }

  const db = getDatabase();
  const team = await db.findTeamById(id);
  if (!team) return res.status(404).json({ error: 'Team not found' });

  // IDOR check: Only owner or admin can update team logo
  if (team.ownerId !== req.user!.id && req.user!.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Unauthorized to update this team' });
  }

  const allowedTypes = ['image/png', 'image/webp'];
  if (!allowedTypes.includes(contentType)) {
    return res.status(400).json({ error: 'Only PNG and WebP images are allowed' });
  }

  const buffer = Buffer.from(base64Data, 'base64');
  if (buffer.length > LIMITS.maxLogoSizeBytes) {
    return res.status(400).json({ error: `Image size exceeds ${LIMITS.maxLogoSizeBytes / 1024}KB limit` });
  }

  // Validate real file signature (magic bytes)
  const isPng =
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a;

  const isWebp =
    buffer.length >= 12 &&
    buffer.toString('ascii', 0, 4) === 'RIFF' &&
    buffer.toString('ascii', 8, 12) === 'WEBP';

  if (!isPng && !isWebp) {
    return res.status(400).json({ error: 'Invalid file signature: File bytes do not match a valid PNG or WebP image' });
  }

  const storage = getStorageProvider();
  const uploadName = `logo_${id}_${Date.now()}.${contentType === 'image/webp' ? 'webp' : 'png'}`;
  const uploadResult = await storage.upload(uploadName, buffer, contentType);

  const updatedTeam = await db.updateTeam(id, { logoUrl: uploadResult.url });

  res.json({
    success: true,
    logoUrl: uploadResult.url,
    team: updatedTeam
  });
});

export default router;
