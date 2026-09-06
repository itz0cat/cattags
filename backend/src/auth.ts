import { betterAuth } from 'better-auth';
import { bearer } from 'better-auth/plugins';
import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import { memoryAdapter } from 'better-auth/adapters/memory';
import { sendVerificationEmail } from './email';

// Item 1: Refuse to start if JWT_SECRET / BETTER_AUTH_SECRET is not set
const authSecret = process.env.BETTER_AUTH_SECRET || process.env.JWT_SECRET;
if (!authSecret && process.env.NODE_ENV !== 'test') {
  throw new Error('FATAL: JWT_SECRET environment variable is not set. Refusing to start server with insecure default.');
}

function getDatabaseOption() {
  const connectionString = process.env.DATABASE_URL;
  if (connectionString) {
    const pool = new Pool({
      connectionString,
      ssl: connectionString.includes('render.com') ? { rejectUnauthorized: false } : undefined
    });
    const db = new Kysely({
      dialect: new PostgresDialect({ pool })
    });
    return { db, type: 'postgres' as const };
  }
  // In-memory adapter for unit testing and offline development
  return memoryAdapter({
    user: [],
    session: [],
    account: [],
    verification: []
  });
}

export const auth = betterAuth({
  database: getDatabaseOption(),
  secret: authSecret || 'test-secret-key-32-chars-long-testing!',
  baseURL: process.env.BETTER_AUTH_URL || process.env.API_BASE_URL || process.env.RENDER_EXTERNAL_URL || 'http://localhost:8080',
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url, token }) => {
      await sendVerificationEmail({
        email: user.email,
        url,
        token
      });
    }
  },
  user: {
    additionalFields: {
      minecraftUsername: {
        type: 'string',
        required: false
      },
      role: {
        type: 'string',
        required: false,
        defaultValue: 'USER'
      }
    }
  },
  plugins: [
    bearer()
  ]
});
