# Cracked & Offline Server Verification Workflow

## The Challenge

Standard Minecraft authentication relies on Mojang session servers to verify that a client actually owns a given UUID and username. On offline ("cracked") servers:
* `online-mode=false` generates deterministic offline UUIDs via `UUID.nameUUIDFromBytes("OfflinePlayer:" + username)`.
* Anyone can log in using any username unless a server-side authentication plugin (such as AuthMe or LimboAuth) protects the session.

## CatTags Verification Model

To prevent unauthorized users from claiming team membership on offline servers, CatTags implements a **Zero-Trust In-Game Token Verification**:

1. **Dashboard Request**: The team owner or prospective member enters their Minecraft username on the CatTags Web Dashboard.
2. **Ephemeral Token Generation**: The backend generates a cryptographically random, short-lived code (e.g., `NOVA-7K29`) valid for 15 minutes.
3. **In-Game Proof**: The player logs into a server running the CatTags verification plugin/mod and executes:
   ```mcfunction
   /team verify NOVA-7K29
   ```
4. **Validation**: The server verifies that the executing session's username matches the token's target username, then notifies the CatTags API.
5. **Verified Roster Status**: The player is marked `verified: true` in the team roster.
