import { Pool } from 'pg';
import { CompactTeamDto, PlayerResolveItem, ResolvedPlayerResult, Team, TeamMember } from '@cattags/shared';

export interface IDatabase {
  isPostgres(): boolean;
  healthCheck(): Promise<boolean>;
  findUserByEmail(email: string): Promise<any | null>;
  findUserById(id: string): Promise<any | null>;
  createUser(user: any): Promise<any>;
  findTeamById(id: string): Promise<Team | null>;
  findTeamBySlug(slug: string): Promise<Team | null>;
  listTeams(limit?: number, offset?: number, search?: string): Promise<{ teams: Team[]; total: number }>;
  createTeam(team: Team): Promise<Team>;
  updateTeam(id: string, updates: Partial<Team>): Promise<Team | null>;
  deleteTeam(id: string): Promise<boolean>;
  addTeamMember(member: TeamMember): Promise<TeamMember>;
  removeTeamMember(teamId: string, memberId: string): Promise<boolean>;
  listTeamMembers(teamId: string): Promise<TeamMember[]>;
  resolvePlayers(players: PlayerResolveItem[]): Promise<ResolvedPlayerResult[]>;
  createVerificationToken(token: any): Promise<any>;
  findVerificationToken(code: string): Promise<any | null>;
  markVerificationTokenUsed(id: string): Promise<void>;
  createAuditLog(entry: any): Promise<void>;
}

// In-Memory implementation for robust unit testing and offline development
class InMemoryDatabase implements IDatabase {
  private users: Map<string, any> = new Map();
  private teams: Map<string, Team> = new Map();
  private members: Map<string, TeamMember> = new Map();
  private tokens: Map<string, any> = new Map();
  private auditLogs: any[] = [];

  isPostgres(): boolean { return false; }

  async healthCheck(): Promise<boolean> { return true; }

  async findUserByEmail(email: string): Promise<any | null> {
    for (const u of this.users.values()) {
      if (u.email.toLowerCase() === email.toLowerCase()) return u;
    }
    return null;
  }

  async findUserById(id: string): Promise<any | null> {
    return this.users.get(id) || null;
  }

  async createUser(user: any): Promise<any> {
    this.users.set(user.id, user);
    return user;
  }

  async findTeamById(id: string): Promise<Team | null> {
    const team = this.teams.get(id);
    if (!team) return null;
    const members = await this.listTeamMembers(team.id);
    return { ...team, members };
  }

  async findTeamBySlug(slug: string): Promise<Team | null> {
    for (const t of this.teams.values()) {
      if (t.slug.toLowerCase() === slug.toLowerCase()) {
        const members = await this.listTeamMembers(t.id);
        return { ...t, members };
      }
    }
    return null;
  }

  async listTeams(limit = 50, offset = 0, search = ''): Promise<{ teams: Team[]; total: number }> {
    let all = Array.from(this.teams.values());
    if (search) {
      const q = search.toLowerCase();
      all = all.filter(t => t.name.toLowerCase().includes(q) || t.prefix.toLowerCase().includes(q));
    }
    const total = all.length;
    const slice = all.slice(offset, offset + limit);
    return { teams: slice, total };
  }

  async createTeam(team: Team): Promise<Team> {
    this.teams.set(team.id, team);
    return team;
  }

  async updateTeam(id: string, updates: Partial<Team>): Promise<Team | null> {
    const existing = this.teams.get(id);
    if (!existing) return null;
    const updated: Team = {
      ...existing,
      ...updates,
      version: existing.version + 1,
      updatedAt: new Date().toISOString()
    };
    this.teams.set(id, updated);
    return updated;
  }

  async deleteTeam(id: string): Promise<boolean> {
    const existed = this.teams.delete(id);
    for (const [mid, m] of this.members.entries()) {
      if (m.teamId === id) this.members.delete(mid);
    }
    return existed;
  }

  async addTeamMember(member: TeamMember): Promise<TeamMember> {
    this.members.set(member.id, member);
    const team = this.teams.get(member.teamId);
    if (team) {
      team.version += 1;
      team.updatedAt = new Date().toISOString();
    }
    return member;
  }

  async removeTeamMember(teamId: string, memberId: string): Promise<boolean> {
    const member = this.members.get(memberId);
    if (member && member.teamId === teamId) {
      this.members.delete(memberId);
      const team = this.teams.get(teamId);
      if (team) {
        team.version += 1;
        team.updatedAt = new Date().toISOString();
      }
      return true;
    }
    return false;
  }

  async listTeamMembers(teamId: string): Promise<TeamMember[]> {
    const res: TeamMember[] = [];
    for (const m of this.members.values()) {
      if (m.teamId === teamId) res.push(m);
    }
    return res;
  }

  async resolvePlayers(players: PlayerResolveItem[]): Promise<ResolvedPlayerResult[]> {
    const results: ResolvedPlayerResult[] = [];
    for (const p of players) {
      const normUsername = p.username.toLowerCase().trim();
      let matchedMember: TeamMember | null = null;

      for (const m of this.members.values()) {
        if (m.minecraftUsername.toLowerCase() === normUsername) {
          matchedMember = m;
          break;
        }
        if (p.uuid && m.minecraftUuid && m.minecraftUuid === p.uuid) {
          matchedMember = m;
          break;
        }
      }

      let compactTeam: CompactTeamDto | null = null;
      if (matchedMember) {
        const team = this.teams.get(matchedMember.teamId);
        if (team && team.status === 'ACTIVE') {
          compactTeam = {
            id: team.id,
            slug: team.slug,
            name: team.name,
            prefix: team.prefix,
            style: team.style,
            logo: team.logoUrl || null,
            version: team.version
          };
        }
      }

      results.push({
        identifier: normUsername,
        username: p.username,
        uuid: p.uuid,
        team: compactTeam
      });
    }
    return results;
  }

  async createVerificationToken(token: any): Promise<any> {
    this.tokens.set(token.code, token);
    return token;
  }

  async findVerificationToken(code: string): Promise<any | null> {
    return this.tokens.get(code) || null;
  }

  async markVerificationTokenUsed(id: string): Promise<void> {
    for (const t of this.tokens.values()) {
      if (t.id === id) t.used = true;
    }
  }

  async createAuditLog(entry: any): Promise<void> {
    this.auditLogs.push({ ...entry, createdAt: new Date().toISOString() });
  }
}

// PostgreSQL implementation for Production on Render
class PostgresDatabase implements IDatabase {
  private pool: Pool;

  constructor(connectionString: string) {
    this.pool = new Pool({
      connectionString,
      ssl: connectionString.includes('render.com') ? { rejectUnauthorized: false } : undefined,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000
    });
  }

  isPostgres(): boolean { return true; }

  async healthCheck(): Promise<boolean> {
    try {
      const res = await this.pool.query('SELECT 1');
      return !!res.rowCount;
    } catch {
      return false;
    }
  }

  async findUserByEmail(email: string): Promise<any | null> {
    const res = await this.pool.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email]);
    return res.rows[0] || null;
  }

  async findUserById(id: string): Promise<any | null> {
    const res = await this.pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return res.rows[0] || null;
  }

  async createUser(user: any): Promise<any> {
    const res = await this.pool.query(
      `INSERT INTO users (id, email, password_hash, minecraft_username, role)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [user.id, user.email, user.passwordHash, user.minecraftUsername, user.role || 'USER']
    );
    return res.rows[0];
  }

  async findTeamById(id: string): Promise<Team | null> {
    const res = await this.pool.query('SELECT * FROM teams WHERE id = $1', [id]);
    if (!res.rows[0]) return null;
    const team = this.mapTeamRow(res.rows[0]);
    team.members = await this.listTeamMembers(team.id);
    return team;
  }

  async findTeamBySlug(slug: string): Promise<Team | null> {
    const res = await this.pool.query('SELECT * FROM teams WHERE LOWER(slug) = LOWER($1)', [slug]);
    if (!res.rows[0]) return null;
    const team = this.mapTeamRow(res.rows[0]);
    team.members = await this.listTeamMembers(team.id);
    return team;
  }

  async listTeams(limit = 50, offset = 0, search = ''): Promise<{ teams: Team[]; total: number }> {
    let query = 'SELECT * FROM teams';
    const params: any[] = [];
    if (search) {
      query += ' WHERE LOWER(name) LIKE $1 OR LOWER(prefix) LIKE $1';
      params.push(`%${search.toLowerCase()}%`);
    }
    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const res = await this.pool.query(query, params);
    const countRes = await this.pool.query('SELECT COUNT(*) FROM teams');
    return {
      teams: res.rows.map(this.mapTeamRow),
      total: parseInt(countRes.rows[0].count, 10)
    };
  }

  async createTeam(team: Team): Promise<Team> {
    await this.pool.query(
      `INSERT INTO teams (id, slug, name, short_name, prefix, description, logo_url,
        primary_color, secondary_color, gradient_enabled, gradient_direction, style_json,
        verified, status, owner_id, version)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
      [
        team.id, team.slug, team.name, team.shortName, team.prefix, team.description,
        team.logoUrl, team.primaryColor, team.secondaryColor, team.gradientEnabled,
        team.gradientDirection, JSON.stringify(team.style), team.verified, team.status,
        team.ownerId, team.version
      ]
    );
    return team;
  }

  async updateTeam(id: string, updates: Partial<Team>): Promise<Team | null> {
    const existing = await this.findTeamById(id);
    if (!existing) return null;

    const newVersion = existing.version + 1;
    await this.pool.query(
      `UPDATE teams SET
        name = COALESCE($1, name),
        prefix = COALESCE($2, prefix),
        description = COALESCE($3, description),
        logo_url = COALESCE($4, logo_url),
        primary_color = COALESCE($5, primary_color),
        secondary_color = COALESCE($6, secondary_color),
        gradient_enabled = COALESCE($7, gradient_enabled),
        gradient_direction = COALESCE($8, gradient_direction),
        style_json = COALESCE($9, style_json),
        version = $10,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $11`,
      [
        updates.name, updates.prefix, updates.description, updates.logoUrl,
        updates.primaryColor, updates.secondaryColor, updates.gradientEnabled,
        updates.gradientDirection, updates.style ? JSON.stringify(updates.style) : null,
        newVersion, id
      ]
    );
    return this.findTeamById(id);
  }

  async deleteTeam(id: string): Promise<boolean> {
    const res = await this.pool.query('DELETE FROM teams WHERE id = $1', [id]);
    return (res.rowCount ?? 0) > 0;
  }

  async addTeamMember(member: TeamMember): Promise<TeamMember> {
    await this.pool.query(
      `INSERT INTO team_members (id, team_id, minecraft_username, minecraft_uuid, identifier_type, role, verified)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [member.id, member.teamId, member.minecraftUsername, member.minecraftUuid, member.identifierType, member.role, member.verified]
    );
    // Add player identifier for instant index lookup
    await this.pool.query(
      `INSERT INTO player_identifiers (id, team_member_id, team_id, normalized_username, minecraft_uuid, is_primary)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [member.id + '_ident', member.id, member.teamId, member.minecraftUsername.toLowerCase().trim(), member.minecraftUuid, true]
    );
    await this.pool.query('UPDATE teams SET version = version + 1, updated_at = CURRENT_TIMESTAMP WHERE id = $1', [member.teamId]);
    return member;
  }

  async removeTeamMember(teamId: string, memberId: string): Promise<boolean> {
    const res = await this.pool.query('DELETE FROM team_members WHERE id = $1 AND team_id = $2', [memberId, teamId]);
    if ((res.rowCount ?? 0) > 0) {
      await this.pool.query('UPDATE teams SET version = version + 1, updated_at = CURRENT_TIMESTAMP WHERE id = $1', [teamId]);
      return true;
    }
    return false;
  }

  async listTeamMembers(teamId: string): Promise<TeamMember[]> {
    const res = await this.pool.query('SELECT * FROM team_members WHERE team_id = $1 ORDER BY created_at ASC', [teamId]);
    return res.rows.map(r => ({
      id: r.id,
      teamId: r.team_id,
      minecraftUsername: r.minecraft_username,
      minecraftUuid: r.minecraft_uuid,
      identifierType: r.identifier_type,
      role: r.role,
      verified: r.verified,
      createdAt: r.created_at.toISOString(),
      updatedAt: r.updated_at.toISOString()
    }));
  }

  async resolvePlayers(players: PlayerResolveItem[]): Promise<ResolvedPlayerResult[]> {
    const usernames = players.map(p => p.username.toLowerCase().trim());
    const uuids = players.map(p => p.uuid).filter(Boolean) as string[];

    const query = `
      SELECT pi.normalized_username, pi.minecraft_uuid, t.*
      FROM player_identifiers pi
      JOIN teams t ON pi.team_id = t.id
      WHERE (pi.normalized_username = ANY($1) OR (pi.minecraft_uuid IS NOT NULL AND pi.minecraft_uuid = ANY($2)))
        AND t.status = 'ACTIVE'
    `;

    const res = await this.pool.query(query, [usernames, uuids.length ? uuids : ['__NONE__']]);
    const teamByUsername = new Map<string, CompactTeamDto>();
    const teamByUuid = new Map<string, CompactTeamDto>();

    for (const row of res.rows) {
      const style = typeof row.style_json === 'string' ? JSON.parse(row.style_json) : row.style_json;
      const compact: CompactTeamDto = {
        id: row.id,
        slug: row.slug,
        name: row.name,
        prefix: row.prefix,
        style,
        logo: row.logo_url || null,
        version: row.version
      };
      if (row.normalized_username) teamByUsername.set(row.normalized_username, compact);
      if (row.minecraft_uuid) teamByUuid.set(row.minecraft_uuid, compact);
    }

    return players.map(p => {
      const norm = p.username.toLowerCase().trim();
      const team = teamByUsername.get(norm) || (p.uuid ? teamByUuid.get(p.uuid) : null) || null;
      return {
        identifier: norm,
        username: p.username,
        uuid: p.uuid,
        team
      };
    });
  }

  async createVerificationToken(token: any): Promise<any> {
    await this.pool.query(
      `INSERT INTO verification_tokens (id, team_id, minecraft_username, code, expires_at, used)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [token.id, token.teamId, token.minecraftUsername, token.code, token.expiresAt, token.used]
    );
    return token;
  }

  async findVerificationToken(code: string): Promise<any | null> {
    const res = await this.pool.query('SELECT * FROM verification_tokens WHERE code = $1', [code]);
    return res.rows[0] || null;
  }

  async markVerificationTokenUsed(id: string): Promise<void> {
    await this.pool.query('UPDATE verification_tokens SET used = true WHERE id = $1', [id]);
  }

  async createAuditLog(entry: any): Promise<void> {
    await this.pool.query(
      `INSERT INTO audit_logs (id, user_id, team_id, action, details, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [entry.id, entry.userId, entry.teamId, entry.action, JSON.stringify(entry.details), entry.ipAddress]
    );
  }

  private mapTeamRow(r: any): Team {
    return {
      id: r.id,
      slug: r.slug,
      name: r.name,
      shortName: r.short_name,
      prefix: r.prefix,
      description: r.description,
      logoUrl: r.logo_url,
      primaryColor: r.primary_color,
      secondaryColor: r.secondary_color,
      gradientEnabled: r.gradient_enabled,
      gradientDirection: r.gradient_direction,
      style: typeof r.style_json === 'string' ? JSON.parse(r.style_json) : r.style_json,
      verified: r.verified,
      status: r.status,
      ownerId: r.owner_id,
      version: r.version,
      createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
      updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString()
    };
  }
}

let dbInstance: IDatabase | null = null;

export function getDatabase(): IDatabase {
  if (!dbInstance) {
    const url = process.env.DATABASE_URL;
    if (url && url.startsWith('postgres')) {
      dbInstance = new PostgresDatabase(url);
    } else {
      dbInstance = new InMemoryDatabase();
    }
  }
  return dbInstance;
}

export function setDatabase(db: IDatabase) {
  dbInstance = db;
}
