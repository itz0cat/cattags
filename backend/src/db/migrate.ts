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
    const migrationFile = path.join(__dirname, 'migrations', '001_initial_schema.sql');
    const sql = fs.readFileSync(migrationFile, 'utf8');
    await pool.query(sql);
    console.log('[Migration] Migration 001_initial_schema executed successfully.');
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
