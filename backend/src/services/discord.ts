import { getDatabase } from '../db/database';

export const OFFICIAL_DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID || '1263147204940533781';

/**
 * Auto-joins a user to the official Discord guild (1263147204940533781)
 * using their OAuth2 access token obtained during Discord login.
 * Requires the `guilds.join` OAuth scope (already configured).
 */
export async function autoJoinDiscordGuild(userId: string, guildId: string = OFFICIAL_DISCORD_GUILD_ID): Promise<boolean> {
  try {
    const db = getDatabase();
    if (!db.isPostgres()) {
      return false;
    }

    const pool = (db as any).pool;
    if (!pool) return false;

    // Fetch the user's latest Discord OAuth credentials from Better Auth's account table
    const accountRes = await pool.query(
      `SELECT "accountId", "accessToken" FROM "account" 
       WHERE "userId" = $1 AND "providerId" = 'discord' 
       ORDER BY "createdAt" DESC LIMIT 1`,
      [userId]
    );

    if (accountRes.rows.length === 0) {
      return false;
    }

    const { accountId, accessToken } = accountRes.rows[0];
    if (!accountId || !accessToken) {
      return false;
    }

    const botToken = process.env.DISCORD_BOT_TOKEN;
    if (!botToken) {
      // If bot token is not yet provided, we log that user is ready to be joined
      console.log(`[Discord Auto-Join] User ${accountId} ready to join guild ${guildId} (DISCORD_BOT_TOKEN unset)`);
      return false;
    }

    // Call Discord REST API to add member to guild
    const response = await fetch(`https://discord.com/api/v10/guilds/${guildId}/members/${accountId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bot ${botToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        access_token: accessToken
      })
    });

    if (response.status === 201 || response.status === 204) {
      console.log(`[Discord Auto-Join] Successfully joined user ${accountId} to guild ${guildId}`);
      return true;
    } else {
      const errorText = await response.text();
      console.warn(`[Discord Auto-Join] Guild join API returned status ${response.status}: ${errorText}`);
      return false;
    }
  } catch (err) {
    console.error('[Discord Auto-Join] Error joining guild:', err);
    return false;
  }
}
