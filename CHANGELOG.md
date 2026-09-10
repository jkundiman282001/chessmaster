# Changelog

All notable changes to this project will be documented in this file.
This file is automatically updated by the AI Agent Skill (`document-code-changes`).

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [Unreleased] - 2026-09-10

### Added
- **Phase 0 Monorepo Scaffold**: Established decoupled monorepo architecture with `backend/` (Laravel 11 REST API) and `frontend/` (React 19 + TypeScript + Vite).
- **PostgreSQL Database Integration**: Connected Laravel to PostgreSQL 16 (`chessmaster` database) and executed baseline migrations (`users`, `cache`, `jobs`, `personal_access_tokens`).
- **Laravel Reverb WebSockets**: Installed and configured `laravel/reverb` broadcasting provider with Pusher-compatible WebSocket configuration on port 8080.
- **Laravel Sanctum SPA Authentication**: Configured stateful SPA cookie authentication (`EnsureFrontendRequestsAreStateful`) and enabled CORS with credentials for local Vite proxy.
- **Health Check API Route**: Implemented `GET /api/health` returning live database connection status, broadcasting driver, and server timestamp.
- **Frontend Architecture & Dashboard**: Configured Tailwind CSS v4, Lucide icons, Axios API client with CSRF cookie handling, and Vite dev server reverse proxy for `/api` and `/sanctum`.
- **Phase 0 Health UI**: Interactive React dashboard reporting real-time connectivity status, roundtrip latency, and development roadmap progress.
- **Developer Convenience Scripts**: Added root `package.json` with scripts for running frontend, backend, reverb, and migrations concurrently.

### Design Decisions
- **Decoupled Monorepo**: Selected independent `backend/` and `frontend/` directories within a unified repository to preserve clean API boundary semantics while streamlining single-repo version control.
- **Authoritative Server Principle**: Committed to server-authoritative move validation for multiplayer integrity, using frontend `chess.js` strictly for client-side previews.
- **Sanctum Stateful Cookies**: Chose HttpOnly cookie-based SPA session authentication over local-storage bearer tokens to eliminate client-side token exposure to XSS.
- **Tailwind CSS v4 Engine**: Adopted `@tailwindcss/vite` for lightning-fast modern styling with CSS-native theming hooks for the future cosmetics system.
