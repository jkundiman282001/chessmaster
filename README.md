# Chessmaster — Multiplayer Online Chess Platform

A production-grade, real-time multiplayer chess platform built with Laravel 11, React 19, TypeScript, PostgreSQL, and Laravel Reverb WebSockets.

---

## 🏛 Architecture Overview

- **Decoupled Monorepo Structure**:
  - `backend/` — Laravel 11 REST API, PostgreSQL migrations, Laravel Sanctum SPA authentication, and Laravel Reverb WebSocket broadcaster.
  - `frontend/` — React 19 + TypeScript powered by Vite, Tailwind CSS v4, Lucide icons, and Axios with reverse proxy.
- **Server Authority Principle**:
  - Move legality, clock management, turn enforcement, and game termination conditions are computed and validated exclusively on the server.
  - The client provides optimistic interaction and local move previews via `chess.js`, but the authoritative state resides in PostgreSQL.
- **Future-Proof Cosmetics Architecture**:
  - Themeable chessboard UI components and extensible database schema design allowing cosmetic board themes, custom piece sets, and player flair to be added seamlessly in future updates without refactoring core game logic.

---

## 🧰 Tech Stack

| Layer | Technology | Role |
|---|---|---|
| **Backend API** | Laravel 11 (PHP 8.3+) | Authoritative game engine, REST API, state persistence |
| **Frontend SPA** | React 19 + TypeScript (Vite) | Client UI, board rendering, optimistic move generation |
| **Database** | PostgreSQL 16 | Relational data store for users, games, moves, and future cosmetics |
| **Real-Time** | Laravel Reverb | Pusher-compatible native WebSockets for live move sync |
| **Auth** | Laravel Sanctum | Stateful SPA cookie authentication (HttpOnly + CSRF protected) |
| **Styling** | Tailwind CSS v4 | Responsive modern dark chess theme |

---

## 🚀 Quick Start & Local Development

### 1. Prerequisites
- PHP 8.3+ with `pdo_pgsql` extension enabled
- Composer 2.8+
- Node.js 20+ & NPM
- PostgreSQL 16 running on `127.0.0.1:5432` with database `chessmaster`

### 2. Environment Configuration
The backend `.env` is pre-configured for local PostgreSQL:
```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=chessmaster
DB_USERNAME=postgres
DB_PASSWORD=postgres

BROADCAST_CONNECTION=reverb
REVERB_APP_ID=chessmaster
REVERB_APP_KEY=chessmasterkey
REVERB_APP_SECRET=chessmastersecret
REVERB_HOST="localhost"
REVERB_PORT=8080
REVERB_SCHEME="http"
```

### 3. Running Development Servers
You can start each service in separate terminal tabs:

```bash
# Terminal 1: Start Laravel REST API (port 8000)
npm run dev:backend
# or: cd backend && php artisan serve

# Terminal 2: Start Laravel Reverb WebSocket Server (port 8080)
npm run dev:reverb
# or: cd backend && php artisan reverb:start

# Terminal 3: Start Vite React SPA (port 5173 with proxy to backend)
npm run dev
# or: cd frontend && npm run dev
```

Visit **`http://localhost:5173`** to access the application and inspect the Phase 0 health probe.

---

## 🗺 Development Roadmap

- [x] **Phase 0 — Project Setup & Architecture**: Decoupled monorepo scaffold, PostgreSQL database, Laravel Reverb WebSockets, Sanctum SPA configuration, Vite reverse proxy, and health probe dashboard.
- [ ] **Phase 1 — Authentication**: User registration, login, logout, SPA cookie auth guards, and user rating/avatar placeholders.
- [ ] **Phase 2 — Landing Page**: Public marketing page with chess theme and authentication CTAs.
- [ ] **Phase 3 — Dashboard**: Authenticated player hub, matchmaking triggers, profile stats, and match history.
- [ ] **Phase 4 — Core Chess Gameplay**: Authoritative server-side move validation, Reverb real-time sync, clock management, and end conditions.
- [ ] **Phase 5 — Polish & Hardening**: Reconnection handling mid-game, persistence, edge-case hardening, and cosmetics extensibility preparation.
- [ ] **Future Updates**: Cosmetics shop & inventory (board skins, custom piece sets, profile flairs), ranked ELO ladder, spectator mode, chat.
