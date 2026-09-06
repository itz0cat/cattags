import request from 'supertest';
import { createApp } from '../app';
import { getDatabase, setDatabase } from '../db/database';

describe('CatTags API Integration Tests', () => {
  let app: any;
  let authToken: string;
  let teamId: string;
  let memberId: string;

  beforeAll(async () => {
    jest.setTimeout(30000);
    process.env.NODE_ENV = 'test';
    process.env.JWT_SECRET = 'test-jwt-secret-key-at-least-32-chars-long';
    process.env.BETTER_AUTH_SECRET = 'test-better-auth-secret-key-32-chars-long';
    app = createApp();
  });

  it('GET /api/v1/health returns 200 and healthy status', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('cattags-api');
    expect(res.body.version).toBe('1.0.0');
  });

  it('GET /api/v1/version returns version info', async () => {
    const res = await request(app).get('/api/v1/version');
    expect(res.status).toBe(200);
    expect(res.body.targetMinecraft).toBe('1.21.11');
    expect(res.body.targetLoader).toBe('fabric');
  });

  it('GET /api/v1/config returns limits and settings', async () => {
    const res = await request(app).get('/api/v1/config');
    expect(res.status).toBe(200);
    expect(res.body.maxBatchResolveSize).toBe(100);
    expect(res.body.brand).toBe('CatTags');
  });

  it('POST /api/v1/auth/register creates a new user', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'itzcat@example.com',
        password: 'Password123!',
        minecraftUsername: 'ItzCat'
      });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('itzcat@example.com');
    authToken = res.body.token;
  });

  it('POST /api/v1/auth/login logs in the user', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'itzcat@example.com',
        password: 'Password123!'
      });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('POST /api/v1/teams creates a new team with custom styling', async () => {
    const res = await request(app)
      .post('/api/v1/teams')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Nova Team',
        slug: 'nova',
        prefix: 'NOVA',
        description: 'Top tier Minecraft team',
        primaryColor: '#3B82F6',
        secondaryColor: '#06B6D4',
        gradientEnabled: true,
        gradientDirection: 'LEFT_TO_RIGHT',
        style: {
          type: 'GRADIENT',
          colors: ['#3B82F6', '#06B6D4'],
          direction: 'LEFT_TO_RIGHT',
          bold: true,
          italic: false
        }
      });

    expect(res.status).toBe(201);
    expect(res.body.team).toBeDefined();
    expect(res.body.team.prefix).toBe('NOVA');
    expect(res.body.team.slug).toBe('nova');
    teamId = res.body.team.id;
  });

  it('GET /api/v1/teams/:id retrieves the team with ETag', async () => {
    const res = await request(app).get(`/api/v1/teams/${teamId}`);
    expect(res.status).toBe(200);
    expect(res.body.team.name).toBe('Nova Team');
    expect(res.headers.etag).toBeDefined();

    // 304 Not Modified
    const cachedRes = await request(app)
      .get(`/api/v1/teams/${teamId}`)
      .set('If-None-Match', res.headers.etag);
    expect(cachedRes.status).toBe(304);
  });

  it('POST /api/v1/teams/:id/members adds a member', async () => {
    const res = await request(app)
      .post(`/api/v1/teams/${teamId}/members`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        minecraftUsername: 'Steve',
        minecraftUuid: 'c06f8906-4c3e-4ba8-bc19-299ac4928940',
        role: 'MEMBER'
      });

    expect(res.status).toBe(201);
    expect(res.body.member.minecraftUsername).toBe('Steve');
    memberId = res.body.member.id;
  });

  it('POST /api/v1/players/resolve resolves multiple players efficiently', async () => {
    const res = await request(app)
      .post('/api/v1/players/resolve')
      .send({
        players: [
          { username: 'ItzCat' },
          { username: 'Steve', uuid: 'c06f8906-4c3e-4ba8-bc19-299ac4928940' },
          { username: 'UnknownPlayer' }
        ]
      });

    expect(res.status).toBe(200);
    expect(res.body.players).toHaveLength(3);

    const steve = res.body.players.find((p: any) => p.username === 'Steve');
    expect(steve).toBeDefined();
    expect(steve.team).toBeDefined();
    expect(steve.team.prefix).toBe('NOVA');
    expect(steve.team.style.type).toBe('GRADIENT');

    const unknown = res.body.players.find((p: any) => p.username === 'UnknownPlayer');
    expect(unknown.team).toBeNull();
  });

  it('POST /api/v1/teams/:id/verify generates a verification token', async () => {
    const res = await request(app)
      .post(`/api/v1/teams/${teamId}/verify`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        minecraftUsername: 'Alex'
      });

    expect(res.status).toBe(200);
    expect(res.body.code).toMatch(/^NOVA-/);
    expect(res.body.command).toContain('/team verify');
  });

  it('DELETE /api/v1/teams/:id/members/:memberId removes a member', async () => {
    const res = await request(app)
      .delete(`/api/v1/teams/${teamId}/members/${memberId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('IDOR: Non-owner gets 403 on /logo and /verify for a team they do not own', async () => {
    const regRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'otheruser@example.com',
        password: 'Password123!',
        minecraftUsername: 'OtherUser'
      });
    expect(regRes.status).toBe(201);
    const otherToken = regRes.body.token;

    const pngHeader = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d]);
    const logoRes = await request(app)
      .post(`/api/v1/teams/${teamId}/logo`)
      .set('Authorization', `Bearer ${otherToken}`)
      .send({
        base64Data: pngHeader.toString('base64'),
        contentType: 'image/png'
      });
    expect(logoRes.status).toBe(403);
    expect(logoRes.body.error).toContain('Unauthorized');

    const verifyRes = await request(app)
      .post(`/api/v1/teams/${teamId}/verify`)
      .set('Authorization', `Bearer ${otherToken}`)
      .send({
        minecraftUsername: 'Steve'
      });
    expect(verifyRes.status).toBe(403);
    expect(verifyRes.body.error).toContain('Unauthorized');
  });

  it('POST /api/v1/teams/:id/logo validates magic bytes for PNG and WebP', async () => {
    const fakeRes = await request(app)
      .post(`/api/v1/teams/${teamId}/logo`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        base64Data: Buffer.from('this-is-not-a-png-image-file').toString('base64'),
        contentType: 'image/png'
      });
    expect(fakeRes.status).toBe(400);
    expect(fakeRes.body.error).toContain('Invalid file signature');

    const validPng = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d]);
    const validRes = await request(app)
      .post(`/api/v1/teams/${teamId}/logo`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        base64Data: validPng.toString('base64'),
        contentType: 'image/png'
      });
    expect(validRes.status).toBe(200);
    expect(validRes.body.success).toBe(true);
    expect(validRes.body.logoUrl).toBeDefined();
  });

  it('POST /api/v1/teams/:id/verify/confirm consumes token and marks member verified', async () => {
    await request(app)
      .post(`/api/v1/teams/${teamId}/members`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        minecraftUsername: 'Alex',
        role: 'MEMBER'
      });

    const tokenRes = await request(app)
      .post(`/api/v1/teams/${teamId}/verify`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ minecraftUsername: 'Alex' });
    expect(tokenRes.status).toBe(200);
    const code = tokenRes.body.code;

    const confirmRes = await request(app)
      .post(`/api/v1/teams/${teamId}/verify/confirm`)
      .send({ code });
    expect(confirmRes.status).toBe(200);
    expect(confirmRes.body.success).toBe(true);
    expect(confirmRes.body.memberUpdated).toBe(true);

    const teamRes = await request(app).get(`/api/v1/teams/${teamId}`);
    const alex = teamRes.body.team.members.find((m: any) => m.minecraftUsername === 'Alex');
    expect(alex).toBeDefined();
    expect(alex.verified).toBe(true);

    const reuseRes = await request(app)
      .post(`/api/v1/teams/${teamId}/verify/confirm`)
      .send({ code });
    expect(reuseRes.status).toBe(400);
    expect(reuseRes.body.error).toContain('already been used');

    const invalidRes = await request(app)
      .post(`/api/v1/teams/${teamId}/verify/confirm`)
      .send({ code: 'NOVA-NONEXISTENT' });
    expect(invalidRes.status).toBe(404);
  });

  it('Cloudflare Turnstile rejects missing and invalid tokens when configured', async () => {
    process.env.TURNSTILE_SECRET_KEY = 'test-turnstile-secret';

    const regNoToken = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'turnstiletest@example.com',
        password: 'Password123!'
      });
    expect(regNoToken.status).toBe(400);
    expect(regNoToken.body.error).toContain('CAPTCHA verification failed');

    const regInvalid = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'turnstiletest@example.com',
        password: 'Password123!',
        turnstileToken: 'invalid-token'
      });
    expect(regInvalid.status).toBe(400);
    expect(regInvalid.body.error).toContain('Invalid Turnstile token');

    const loginNoToken = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'itzcat@example.com',
        password: 'Password123!'
      });
    expect(loginNoToken.status).toBe(400);

    const teamNoToken = await request(app)
      .post('/api/v1/teams')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Turnstile Team',
        slug: 'turnstile-team',
        prefix: 'TURN'
      });
    expect(teamNoToken.status).toBe(400);

    delete process.env.TURNSTILE_SECRET_KEY;
  });
});
