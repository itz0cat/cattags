# Changelog

All notable changes to the CatTags project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-09-06

### Added
- **Fabric 1.21.11 Mod**:
  - Client-side nametag rendering with custom team prefix (`[NOVA] Steve`).
  - Tab list integration via `PlayerListEntryMixin`.
  - Chat message prefix support via `ChatHudMixin`.
  - StyleEngine supporting Solid colors, 2-color linear gradients, multi-color gradients, and dynamic rainbow cycling.
  - Persistent local disk cache (`.minecraft/config/cattags/cache/teams.json`).
  - Asynchronous background batch resolve client (`POST /api/v1/players/resolve`) with zero frame drop impact.
  - Client commands: `/cattags status`, `/cattags reload`, `/cattags clear`, `/cattags resolve`.
- **Backend Service (Render Ready)**:
  - Express/TypeScript REST API listening on `0.0.0.0:$PORT`.
  - Unauthenticated health check endpoint at `GET /api/v1/health`.
  - PostgreSQL schema and migration runner with indexed player lookup tables.
  - S3-compatible ObjectStorageProvider abstraction for team logos.
  - Rate limiting, CORS, Helmet, and JWT authentication.
  - In-game cracked verification token generator (`POST /api/v1/teams/:id/verify`).
- **Web Dashboard**:
  - React/Vite/Tailwind CSS dashboard with dark theme (`#080B12`, `#3B82F6`).
  - Real-time interactive Minecraft nametag preview (`[NOVA] Steve`).
  - Team creation, directory, member management, and appearance customizer.
- **DevOps & Infrastructure**:
  - Validated Render Blueprint (`render.yaml`).
  - Multi-stage production `Dockerfile`.
  - GitHub Actions CI/CD workflows for automated build, test, and release.
