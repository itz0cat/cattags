import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';

export async function runMigrations() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl || !databaseUrl.startsWith('postgres')) {
    console.log('[Migration] No PostgreSQL DATABASE_URL detected, skipping SQL schema migration.');
    return;
  }

  console.log('[Migration] Running PostgreSQL migrations against database...');
  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: databaseUrl.includes('render.com') ? { rejectUnauthorized: false } : undefined
  });

  try {
    const possiblePaths = [
      path.join(__dirname, 'migrations', '001_initial_schema.sql'),
      path.join(__dirname, '..', '..', 'src', 'db', 'migrations', '001_initial_schema.sql'),
      path.join(process.cwd(), 'backend', 'src', 'db', 'migrations', '001_initial_schema.sql'),
      path.join(process.cwd(), 'src', 'db', 'migrations', '001_initial_schema.sql')
    ];
    let sql = '';
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        sql = fs.readFileSync(p, 'utf8');
        break;
      }
    }
    if (!sql) {
      sql = `
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    minecraft_username VARCHAR(32),
    role VARCHAR(16) NOT NULL DEFAULT 'USER',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS teams (
    id VARCHAR(36) PRIMARY KEY,
    slug VARCHAR(32) UNIQUE NOT NULL,
    name VARCHAR(32) NOT NULL,
    short_name VARCHAR(16),
    prefix VARCHAR(10) NOT NULL,
    description TEXT,
    logo_url TEXT,
    primary_color VARCHAR(16) NOT NULL DEFAULT '#3B82F6',
    secondary_color VARCHAR(16),
    gradient_enabled BOOLEAN DEFAULT FALSE,
    gradient_direction VARCHAR(16) DEFAULT 'LEFT_TO_RIGHT',
    style_json JSONB NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    status VARCHAR(16) NOT NULL DEFAULT 'ACTIVE',
    owner_id VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    version INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS team_members (
    id VARCHAR(36) PRIMARY KEY,
    team_id VARCHAR(36) NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    minecraft_username VARCHAR(32) NOT NULL,
    minecraft_uuid VARCHAR(36),
    identifier_type VARCHAR(24) NOT NULL DEFAULT 'CRACKED_USERNAME',
    role VARCHAR(16) NOT NULL DEFAULT 'MEMBER',
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS player_identifiers (
    id VARCHAR(36) PRIMARY KEY,
    team_member_id VARCHAR(36) NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
    team_id VARCHAR(36) NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    normalized_username VARCHAR(32) NOT NULL,
    minecraft_uuid VARCHAR(36),
    is_primary BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS verification_tokens (
    id VARCHAR(36) PRIMARY KEY,
    team_id VARCHAR(36) NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    minecraft_username VARCHAR(32) NOT NULL,
    code VARCHAR(16) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_player_lookup_norm_user ON player_identifiers(normalized_username);
CREATE INDEX IF NOT EXISTS idx_player_lookup_uuid ON player_identifiers(minecraft_uuid);
CREATE INDEX IF NOT EXISTS idx_teams_slug ON teams(slug);
`;
    }
    await pool.query(sql);
    console.log('[Migration] Migration executed successfully.');
  } catch (err) {
    console.error('[Migration] Error running migrations:', err);
    throw err;
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  runMigrations()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
