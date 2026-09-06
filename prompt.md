# Build a production-ready Minecraft Java Fabric mod: Team Identity System

You are an expert Minecraft Fabric mod developer, backend developer, UI/UX engineer, and DevOps engineer.

Build a complete, production-quality project for **Minecraft Java Edition 1.21.11** using **Fabric**.

Before writing code, verify the current 1.21.11 Fabric ecosystem and use compatible versions of:

* Minecraft: 1.21.11
* Fabric Loader
* Fabric API
* Fabric Loom
* Java 21
* appropriate mappings

Do NOT target 1.21.10, 1.21.8, 1.21.4, or 26.1. This project is specifically for **Minecraft 1.21.11**.

---

## 1. PROJECT CONCEPT

Create a Fabric client/server-compatible mod whose primary purpose is to provide a **persistent team identity system** for Minecraft communities.

Think of it as a more advanced, externally managed version of team-tag systems such as Modrinth/CurseForge team-tag mods, but with:

* externally registered teams
* team members
* custom team prefix
* custom team name
* custom colors
* optional gradients
* optional team logo
* backend synchronization
* automatic updates
* cached data
* offline/cracked-server compatibility
* client-side rendering
* server-independent team recognition where possible

The goal is:

> If a large Minecraft team registers itself with the service, players who have this mod installed can automatically see which registered team another player belongs to.

Example:

`[NOVA] Steve`

`[VOID] Alex`

`[ABC] Player123`

The prefix should support custom styling.

---

# 2. IMPORTANT CRACKED/OFFLINE-MODE REQUIREMENT

The mod must NOT require Microsoft/Mojang account authentication.

It must work on communities/servers that use offline/cracked authentication.

Do not build the system around Microsoft OAuth.

Instead, design a robust player identity model based on identifiers that are actually available to the Minecraft client/server environment.

The backend should support multiple identifiers for a player where appropriate, for example:

* Minecraft username
* UUID when available
* server/network identifier
* normalized username
* optional manually verified aliases

The backend must NEVER blindly trust a username alone for sensitive team administration.

Team ownership/admin operations must use a separate secure web/admin authentication system.

---

# 3. ARCHITECTURE

Use a clean monorepo architecture.

Suggested structure:

/mod
/backend
/web
/shared
/docs

The exact structure can be improved if you have a better architecture.

## Mod

Fabric Minecraft mod.

Responsibilities:

* detect players
* receive team data
* cache team data
* render team tags
* render team colors
* render optional logos
* provide configuration GUI
* communicate with backend
* automatic data refresh
* optional server integration
* update notifications

## Backend

REST API.

Responsibilities:

* team registration
* team management
* player/team associations
* logo storage
* team styling
* verification
* API authentication
* rate limiting
* caching
* version management
* audit logs
* moderation/admin tools

## Web

A web dashboard for team owners/admins.

Users should be able to:

* create a team
* claim a team
* add members
* remove members
* edit team name
* edit prefix
* choose colors
* create gradients
* upload logo
* see members
* manage admins
* generate verification codes
* view team status
* manage API keys if needed

---

# 4. TEAM DATA MODEL

Design a proper database schema.

A team should have fields similar to:

id
slug
name
short_name
prefix
description
logo_url
primary_color
secondary_color
gradient_enabled
gradient_direction
verified
created_at
updated_at
owner_id
status

Members should have:

id
team_id
minecraft_username
minecraft_uuid
identifier_type
role
verified
created_at
updated_at

Roles:

OWNER
ADMIN
MEMBER

Potential future roles should be easy to add.

---

# 5. TEAM TAG RENDERING

The Minecraft mod should render tags next to player names.

Example:

`[NOVA] Steve`

or:

`[NOVA] Steve`

where `[NOVA]` uses the team's configured color.

Support:

### Solid color

`[NOVA]`

### Two-color gradient

`[NOVA]`

### Multi-color gradient

`[NOVA]`

### Logo

Allow a small team icon/logo next to the prefix where technically appropriate.

For example:

`[★ NOVA] Steve`

or a small textured icon followed by:

`NOVA Steve`

Make the rendering configurable.

---

# 6. WHERE TEAM TAGS SHOULD APPEAR

Implement configurable rendering for:

1. Player nametag above player
2. Tab list
3. Chat messages where technically possible
4. Player list
5. Optional HUD/team overlay
6. Optional scoreboard integration

Every location must be independently configurable.

Example config:

team-tag:
nametag: true
tab-list: true
chat: false
scoreboard: false
logo: true

---

# 7. LOGO SYSTEM

Teams can upload a logo through the web dashboard.

Requirements:

* PNG/WebP support
* enforce maximum dimensions
* enforce maximum file size
* validate image type
* prevent malicious uploads
* backend image optimization
* CDN/cache-friendly URLs
* Minecraft client downloads the image
* local cache
* expiration/revalidation
* fallback if logo cannot be downloaded

The mod should NOT download the logo every time a player is rendered.

Implement a persistent local cache.

Suggested:

`.minecraft/config/<modid>/cache/logos/`

Use hashes/version identifiers so changed logos can be detected.

---

# 8. BACKEND API

Create a versioned API.

Example:

GET /api/v1/teams/{team}

GET /api/v1/teams/by-player/{identifier}

POST /api/v1/teams

PATCH /api/v1/teams/{team}

DELETE /api/v1/teams/{team}

POST /api/v1/teams/{team}/members

DELETE /api/v1/teams/{team}/members/{member}

POST /api/v1/teams/{team}/verify

GET /api/v1/config

GET /api/v1/version

GET /api/v1/health

Do not blindly copy these endpoints if a better REST architecture is appropriate.

Use proper:

* HTTP status codes
* validation
* pagination
* rate limiting
* authentication
* authorization
* structured errors

---

# 9. CLIENT SYNCHRONIZATION

The client should NOT continuously hammer the backend.

Implement:

* startup synchronization
* periodic refresh
* ETag / If-None-Match support
* Cache-Control
* local persistent cache
* exponential backoff
* request timeout
* offline mode
* stale-cache fallback

Example behavior:

1. Client starts.
2. Load cached team database.
3. Immediately display cached data.
4. Contact backend asynchronously.
5. Check for changes.
6. Update cache.
7. Refresh visible player tags.

If backend is unavailable, the mod should continue working using cached data.

---

# 10. SERVER DISCOVERY

Design the system so that when a player joins a server, the mod can identify nearby/visible players and determine their registered team.

Do not repeatedly make one API request per player.

Bad:

Player A → API request
Player B → API request
Player C → API request

Instead support batch lookup.

Example:

POST /api/v1/players/resolve

with multiple identifiers.

Return:

{
"players": [
{
"identifier": "...",
"team": {
"id": "...",
"name": "Nova",
"prefix": "NOVA",
"style": {}
}
}
]
}

Cache results locally.

---

# 11. TEAM REGISTRATION

Build a complete registration workflow.

A team owner creates a team from the website.

They enter:

* Team name
* Short name
* Prefix
* Description
* Logo
* Primary color
* Secondary color
* Gradient
* Members

Then the team receives a unique ID.

Example:

NOVA → team ID `team_8f29...`

---

# 12. PLAYER VERIFICATION

Because cracked/offline servers cannot rely on Microsoft authentication, design a verification mechanism.

For example:

The website generates:

`/team verify NOVA-7K29`

The player can prove ownership/control of a Minecraft identity through an in-game command or another appropriate server-side verification method.

The exact verification mechanism should be designed carefully to avoid someone claiming another player's username.

Provide at least one secure verification strategy and document its limitations.

---

# 13. SECURITY

Treat the backend as a real public service.

Implement:

* authentication
* authorization
* password hashing if passwords are used
* secure sessions/tokens
* CSRF protection where applicable
* CORS configuration
* rate limiting
* request validation
* SQL injection prevention
* XSS prevention
* image upload validation
* abuse protection
* audit logging
* admin roles

Never store plaintext passwords.

Never put backend admin secrets inside the Minecraft mod.

Assume users can decompile the mod.

The client must therefore never contain privileged credentials.

---

# 14. PRIVACY

Do not collect unnecessary player information.

Document exactly what is stored.

The system should primarily store:

* team information
* publicly registered Minecraft identity information
* team membership
* styling information

Provide a way for team admins to remove members.

Avoid collecting IP addresses unless absolutely necessary, and if they are temporarily logged for security, document retention.

---

# 15. MOD CONFIGURATION GUI

Create a polished configuration screen.

Options:

### General

* Enable mod
* Enable backend
* Debug mode
* Cache duration

### Nametags

* Enable
* Show prefix
* Show logo
* Show team name
* Distance
* Scale

### Tab list

* Enable
* Show prefix
* Show logo

### Chat

* Enable
* Show team prefix

### Performance

* Maximum cached teams
* Refresh interval
* Logo cache size

Make the UI feel like a real modern Minecraft mod.

---

# 16. TEAM STYLE ENGINE

Create a reusable style system.

Example JSON:

{
"prefix": "NOVA",
"style": {
"type": "gradient",
"colors": [
"#7C3AED",
"#06B6D4"
],
"direction": "LEFT_TO_RIGHT",
"bold": true,
"italic": false
}
}

Support:

SOLID
GRADIENT
RAINBOW

Do not make rainbow rendering expensive.

Rendering must be efficient.

---

# 17. PERFORMANCE

This is extremely important.

Do not perform HTTP requests from Minecraft's render thread.

Do not block rendering.

Use asynchronous networking.

Use efficient caches.

Avoid repeatedly parsing JSON.

Avoid downloading the same logo multiple times.

Avoid unnecessary mixins.

Use Fabric APIs whenever possible.

Profile the mod and keep client overhead extremely low.

---

# 18. AUTO UPDATE

Separate:

### Mod update

Detect when a newer mod version exists.

### Team data update

Detect when team information changes.

### Logo update

Detect when a team's logo changes.

Do not automatically download and execute arbitrary code.

The mod updater should only notify the user or use a trusted, documented update mechanism.

Never execute a downloaded JAR without explicit user-controlled installation/update flow.

---

# 19. GITHUB REPOSITORY

Create the project so it can be published as a public GitHub repository.

Include:

README.md

LICENSE

CONTRIBUTING.md

SECURITY.md

PRIVACY.md

CHANGELOG.md

docs/

.github/

.github/workflows/

Provide GitHub Actions for:

* build
* test
* formatting/checks
* release
* creating artifacts

Do not commit:

* API secrets
* passwords
* private keys
* production database credentials
* JWT secrets
* cloud credentials

Use environment variables/secrets.

---

# 20. AUTOMATED RELEASES

Set up GitHub Actions so that pushing a version tag such as:

v1.0.0

can:

1. build the Fabric mod
2. run tests
3. verify the JAR
4. generate release artifacts
5. create a GitHub Release

Optionally prepare metadata for Modrinth/CurseForge publishing, but do not publish automatically unless credentials are configured.

---

# 21. MOD METADATA

Create a correct `fabric.mod.json`.

Use an appropriate mod ID, for example:

teamidentity

but choose a better unique ID if necessary.

Display name:

Team Identity

Make the version configurable from Gradle.

Correctly declare:

* Fabric Loader dependency
* Fabric API dependency
* Minecraft dependency
* entrypoints
* mixins if required
* environment

---

# 22. COMMANDS

Provide useful commands where appropriate.

Potential commands:

/teamidentity reload

/teamidentity status

/teamidentity cache

/teamidentity debug

Commands should only be enabled where the architecture makes sense.

Do NOT require users to manually run commands for normal team detection.

---

# 23. BACKEND TECHNOLOGY

Choose a sensible modern backend stack.

You may use:

* Java/Kotlin
* Node.js/TypeScript
* Go
* Rust

Prefer a simple, maintainable architecture.

For the database, PostgreSQL is preferred.

Use migrations.

Do not use an in-memory database as the production architecture.

Redis may optionally be used for caching/rate limiting, but keep it optional if possible.

---

# 24. WEB DASHBOARD

Create a modern responsive dashboard.

Pages:

/login

/dashboard

/teams

/teams/new

/teams/{id}

/teams/{id}/members

/teams/{id}/appearance

/teams/{id}/settings

/admin

The team appearance page should provide a live preview.

For example:

[ NOVA ] Steve

Allow users to visually configure:

* prefix
* text color
* gradient
* logo
* bold
* italic
* scale

---

# 25. LIVE PREVIEW

The website should have a Minecraft-style preview.

Example:

`[NOVA] Steve`

with the actual selected colors and logo.

When the user changes a color, update the preview instantly.

---

# 26. DATABASE MIGRATIONS

Create proper migrations.

Tables should at minimum cover:

users
teams
team_members
team_admins
player_identifiers
team_logos
audit_logs
api_tokens if needed

Add indexes for frequently queried player identifiers.

Think carefully about lookup performance.

The primary query will often be:

"Which team does this Minecraft player belong to?"

That lookup must be fast.

---

# 27. API RESPONSE DESIGN

Keep responses small.

Do not send unnecessary team metadata to Minecraft clients.

Create a compact DTO specifically for Minecraft clients.

Example:

{
"id": "team_123",
"name": "Nova",
"prefix": "NOVA",
"style": {
"type": "gradient",
"colors": ["#8B5CF6", "#06B6D4"]
},
"logo": "https://cdn.example.com/logos/team_123.webp",
"version": 4
}

---

# 28. FAILURE HANDLING

The mod must gracefully handle:

* no internet
* backend downtime
* invalid response
* server timeout
* rate limit
* corrupted cache
* deleted team
* deleted player
* changed username
* invalid logo
* outdated API
* unsupported backend version

Minecraft should NEVER crash because the backend is unavailable.

---

# 29. TESTING

Create tests for:

### Backend

* team creation
* team editing
* membership
* permissions
* player lookup
* authentication
* rate limiting
* invalid requests

### Mod

* configuration
* JSON parsing
* cache
* API client
* style parser
* gradient renderer
* logo cache

Add integration tests where practical.

---

# 30. DOCUMENTATION

Write detailed documentation explaining:

* architecture
* local development
* building the mod
* running the backend
* database setup
* environment variables
* deployment
* API
* team registration
* verification
* security model
* offline/cracked server limitations
* caching
* troubleshooting

---

# 31. DEVELOPMENT WORKFLOW

Do NOT simply generate a giant amount of code and assume it works.

Work incrementally.

First:

1. Inspect the repository.
2. Verify the available environment.
3. Verify Minecraft 1.21.11/Fabric compatibility.
4. Create the project architecture.
5. Build a minimal Fabric mod.
6. Run Gradle build.
7. Fix all compilation errors.
8. Implement backend.
9. Run backend tests.
10. Implement API integration.
11. Implement team cache.
12. Implement rendering.
13. Implement logo system.
14. Implement dashboard.
15. Add CI.
16. Run complete tests.
17. Build final artifacts.

After every major stage, actually run the relevant build/tests.

Do not leave TODO placeholders for core functionality.

---

# 32. IMPORTANT IMPLEMENTATION RULE

Before coding Minecraft mixins, inspect the actual 1.21.11 mappings/API and verify the target classes/methods.

Do not blindly copy code from older Minecraft versions.

Minecraft 1.21.11 is specifically required.

Use the current Fabric documentation and compatible APIs.

---

# 33. FINAL ACCEPTANCE CRITERIA

The project is considered complete only if:

* Minecraft 1.21.11 builds successfully.
* Fabric Loader compatibility is correct.
* Fabric API compatibility is correct.
* Java 21 is used.
* Client can launch with the mod.
* Backend can start.
* Database migrations work.
* A team can be created.
* Members can be added.
* A player can be resolved to a team.
* Minecraft can retrieve team data.
* Team tags render correctly.
* Colors work.
* Gradients work.
* Logos work.
* Logos are cached.
* Offline backend operation uses cached data.
* Backend failures do not crash Minecraft.
* Web dashboard works.
* Authentication works.
* Team permissions work.
* API is rate limited.
* GitHub Actions builds the project.
* No secrets are committed.
* Documentation exists.
* Production deployment instructions exist.

---

# 34. DELIVERABLE

At the end, provide:

1. Complete repository structure.
2. All source code.
3. Gradle configuration.
4. Fabric metadata.
5. Backend.
6. Database migrations.
7. Web dashboard.
8. API documentation.
9. Configuration examples.
10. Docker configuration if appropriate.
11. GitHub Actions.
12. README.
13. Security documentation.
14. Privacy documentation.
15. Build instructions.
16. Test results.

Most importantly:

**Actually build and test the project instead of only generating theoretical code.**

If something is impossible or unsafe to implement exactly as described, explain the limitation and implement the closest technically correct alternative rather than silently omitting the feature.

