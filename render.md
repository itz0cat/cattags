CatTags Backend — Render CLI Setup

You are continuing development of the CatTags project.

IMPORTANT: RENDER CLI IS ALREADY CONNECTED

The Render CLI has already been installed and authenticated on this machine.

Current CLI:

Render CLI v2.26.0

The CLI is already connected to the user's Render account.

DO NOT ask the user to run "render login" again.

DO NOT ask for a Render API key unless the CLI specifically requires one for an operation that cannot be performed through the authenticated CLI session.

Use the authenticated Render CLI to inspect the account and determine what resources already exist.

---

OBJECTIVE

Set up the complete CatTags backend infrastructure on Render.

The backend is for the CatTags Minecraft 1.21.11 Fabric mod.

The backend will provide:

- Team registration
- Team management
- Team members
- Player → team lookup
- Team styling
- Team logos
- Verification
- API
- Authentication
- Caching
- Version information
- Health checks
- Mod synchronization

The initial production hosting provider is Render.

Keep the application portable so it can be moved to another provider later.

---

FIRST: INSPECT THE CURRENT PROJECT

Before changing anything, inspect the existing repository.

Determine:

- Current project structure
- Backend technology
- Frontend technology
- Database technology
- Existing API
- Existing environment variables
- Existing Dockerfile
- Existing "render.yaml"
- Existing database migrations
- Existing GitHub configuration
- Existing package/build configuration

Do NOT overwrite existing working code.

If something already exists, improve it rather than creating a duplicate implementation.

---

SECOND: INSPECT RENDER THROUGH THE CLI

Use the authenticated Render CLI to inspect the account.

Check:

render --version
render services

Use the appropriate Render CLI commands/help to inspect:

- Existing services
- Existing databases
- Existing deployments
- Existing workspaces/projects if applicable
- Existing environment/configuration where available

Do not invent Render CLI commands.

If unsure about a command, use:

render --help

or the relevant subcommand's help.

The Render CLI is the source of truth for what is accessible from this machine.

---

THIRD: DETERMINE WHAT NEEDS TO BE CREATED

Based on the existing Render account and repository, determine whether CatTags already has:

1. Backend service
2. PostgreSQL database
3. Web dashboard service
4. Existing Render Blueprint
5. Existing deployment

Do not create duplicate resources.

If resources already exist, reuse them.

If they do not exist, prepare the project so they can be created cleanly.

---

RENDER ARCHITECTURE

Use this architecture unless the existing project requires a better equivalent:

GitHub
   │
   │ deployment
   ▼
Render
   │
   ├── CatTags API
   │
   └── PostgreSQL

Optional later:

Render
   │
   ├── CatTags API
   ├── PostgreSQL
   └── CatTags Web Dashboard

Logo files should NOT rely on the Render service's local filesystem.

Use an object-storage abstraction for persistent logo storage.

---

BACKEND SERVICE

Prepare the CatTags API as a Render Web Service.

Requirements:

- Production-ready
- Docker-compatible
- Health check
- Graceful shutdown
- Environment variables
- PostgreSQL support
- Database migrations
- Structured logging
- CORS
- Rate limiting
- Secure authentication
- No secrets committed to Git

The application must listen on:

0.0.0.0:$PORT

Do not hard-code a production port.

---

HEALTH CHECK

Implement:

GET /api/v1/health

Example:

{
  "status": "ok",
  "version": "1.0.0"
}

Configure Render to use the health endpoint.

The health endpoint should not require authentication.

---

DATABASE

Use PostgreSQL.

Required initial tables should include:

users
teams
team_members
player_identifiers
team_logos
audit_logs

Add additional tables if required.

Create proper migrations.

Optimize the most important lookup:

Minecraft player identifier → team

Add appropriate indexes.

---

ENVIRONMENT VARIABLES

Create/update:

.env.example

Potential configuration:

DATABASE_URL=
PORT=
NODE_ENV=
API_BASE_URL=
WEB_BASE_URL=
JWT_SECRET=
SESSION_SECRET=
CORS_ORIGINS=
LOG_LEVEL=
STORAGE_ENDPOINT=
STORAGE_BUCKET=
STORAGE_ACCESS_KEY=
STORAGE_SECRET_KEY=

Only include variables actually required by the implementation.

Production secrets must be stored in Render environment variables/secrets.

Never commit:

.env

Never commit:

- database passwords
- JWT secrets
- session secrets
- storage credentials
- Render credentials
- API keys

---

RENDER.YAML

Create or update:

render.yaml

Use Render Blueprint conventions correctly.

It should describe the required CatTags infrastructure where practical.

Example architecture:

services:
  - CatTags API

databases:
  - CatTags PostgreSQL

Do NOT blindly copy this example.

Use the actual Render Blueprint syntax supported by the current Render platform.

Do not place secret values inside "render.yaml".

Use generated/sync environment variables or Render-managed secrets where appropriate.

---

DOCKER

If the backend supports Docker, create:

backend/Dockerfile
backend/.dockerignore

The Docker image must:

- Build reproducibly
- Use a production base image
- Avoid unnecessary packages
- Run as a non-root user where practical
- Expose/use the correct application port
- Start the backend correctly

Test the Docker image locally if Docker is available.

---

DATABASE MIGRATIONS

Provide a reliable production migration process.

The deployment process must NOT accidentally destroy the database.

Never use destructive commands automatically.

Never run:

DROP DATABASE

or destructive schema resets against production.

Document the migration command.

---

API DESIGN

Implement/version the API as:

/api/v1/

Core endpoints should include functionality equivalent to:

GET    /api/v1/health

GET    /api/v1/teams/{id}

GET    /api/v1/teams/by-player/{identifier}

POST   /api/v1/players/resolve

POST   /api/v1/teams

PATCH  /api/v1/teams/{id}

DELETE /api/v1/teams/{id}

POST   /api/v1/teams/{id}/members

DELETE /api/v1/teams/{id}/members/{memberId}

Adapt the exact API design to the existing backend architecture.

---

PLAYER LOOKUP

This is one of the most important CatTags features.

Minecraft clients need to efficiently determine:

Player → Team

Do not require one backend request per player.

Implement batch resolution.

Example:

POST /api/v1/players/resolve

Request:

{
  "players": [
    {
      "username": "ItzCat",
      "uuid": "..."
    },
    {
      "username": "Steve",
      "uuid": "..."
    }
  ]
}

Response should contain compact team information.

The API must be optimized for many concurrent Minecraft clients.

---

CLIENT-SAFE API

Remember that the Minecraft mod is distributed publicly.

Assume users can inspect/decompile the mod.

Therefore:

Never put privileged backend credentials inside the Minecraft mod.

The client may have:

- public API endpoint
- public API version
- public client identifier if necessary

But it must never contain:

- database credentials
- admin tokens
- signing secrets
- private storage credentials
- Render credentials

---

CACHING

Implement caching at multiple levels where appropriate:

Minecraft client
      ↓
local cache
      ↓
CatTags API
      ↓
application cache
      ↓
PostgreSQL

The Minecraft client should be able to continue displaying previously known team information if the API temporarily goes offline.

Use:

- ETags
- Cache-Control
- version numbers
- timestamps
- batch lookup
- local persistent cache

where appropriate.

---

LOGO STORAGE

Do not permanently store uploaded logos on the Render Web Service filesystem.

Create an abstraction:

ObjectStorageProvider

Support an S3-compatible provider.

Store metadata in PostgreSQL.

The Minecraft client should receive a stable public/cacheable URL.

Validate:

- file type
- file size
- dimensions
- image contents

Do not allow arbitrary executable uploads.

---

SECURITY

The production backend must include:

- Password hashing if passwords are used
- Secure sessions/tokens
- Authorization
- Input validation
- SQL injection protection
- CORS
- Rate limiting
- Request size limits
- Upload validation
- Audit logging
- Secure HTTP headers
- Error handling that doesn't leak secrets

Do not expose stack traces or database details in production API responses.

---

RENDER DEPLOYMENT WORKFLOW

After preparing the project, validate the Render configuration.

Use the installed Render CLI.

For example, where supported:

render blueprints validate

Then inspect available services:

render services

If a deployment is appropriate and the repository/resource configuration is ready, use the correct Render CLI deployment workflow.

Do not deploy blindly.

Before production deployment:

1. Verify the build.
2. Verify migrations.
3. Verify environment variables.
4. Verify database configuration.
5. Verify health check.
6. Verify API routes.
7. Verify CORS.
8. Verify secrets.
9. Verify GitHub repository connection.
10. Then deploy.

---

GITHUB INTEGRATION

The project should be deployable from the GitHub repository.

Do not store GitHub credentials in the repository.

Use Render's supported GitHub integration/Blueprint workflow.

Document the expected deployment flow:

GitHub push
      ↓
Render build
      ↓
database migration
      ↓
deployment
      ↓
health check
      ↓
CatTags API online

---

CUSTOM DOMAIN

Prepare configuration for a future custom domain.

Example:

api.cattags.xyz

Do not purchase or modify DNS automatically unless explicitly requested.

Document where the custom domain would be configured.

---

OBSERVABILITY

Make the backend easy to debug.

Provide:

/api/v1/health

and useful structured logs.

Log:

- request method
- route
- status
- duration
- request ID

Do NOT log:

- passwords
- authentication tokens
- private secrets
- unnecessary personal data

---

FINAL VALIDATION

Before saying the backend is complete, actually test it.

Run:

git status

Build the backend.

Run backend tests.

Validate Render configuration.

If possible, run the API locally and test:

GET /api/v1/health

Test PostgreSQL connection.

Test migrations.

Test team creation.

Test team member creation.

Test player lookup.

Test batch player resolution.

Test authentication/authorization.

Then, if the Render infrastructure is ready and deployment is safe, deploy using the authenticated Render CLI.

---

IMPORTANT BEHAVIOR

Do not just tell me what commands I should run.

You are operating inside the project environment.

Use the tools/terminal available to you to inspect the project and perform the setup.

If a command requires an interactive browser authorization that is already completed, do not repeat it.

If Render CLI reports that the current account lacks permission for an operation, stop and explain exactly what permission is missing.

If a resource already exists, do not create a duplicate.

If a configuration is ambiguous, inspect the repository and Render state first before asking me.

Do not invent Render CLI syntax. Check:

render --help

when necessary.

---

SUCCESS CONDITION

At the end, provide a concise report containing:

Render account

- CLI authenticated: YES/NO
- Workspace/account detected
- Existing services
- Existing databases

CatTags backend

- Backend framework
- Database
- API URL if available
- Health endpoint
- Migration system

Deployment

- "render.yaml" status
- Docker status
- GitHub integration status
- Deployment status

Security

- Secrets protected
- ".env" ignored
- No credentials committed

Testing

- Build result
- Test result
- API health result
- Database result

Next steps

List only the remaining actions that genuinely require user input.

Do not claim deployment succeeded unless you actually verified it.
