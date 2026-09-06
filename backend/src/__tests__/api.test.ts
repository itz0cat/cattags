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
});
