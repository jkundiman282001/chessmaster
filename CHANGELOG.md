# Changelog

All notable changes to this project will be documented in this file.
This file is automatically updated by the AI Agent Skill (`document-code-changes`).

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [Unreleased] - 2026-09-10

### Added (Phase 4: Core Multiplayer Chess Gameplay)
- **Authoritative Server-Side Chess Engine (`ChessEngine.php`)**:
  - Comprehensive FEN parsing and serialization (`parseFen`, `renderFen`).
  - Strict legal move generation and validation for all piece types (Pawns, Knights, Bishops, Rooks, Queens, Kings).
  - King check, double check, and discovered check attack detection (`isInCheck`, `isSquareAttacked`).
  - En passant capture handling with rank-specific target tracking and pawn removal.
  - Castling validation (kingside `O-O`, queenside `O-O-O`) with full check, through-check, and rights tracking.
  - Pawn promotion to Queen, Rook, Bishop, or Knight (`validateAndMakeMove` promotion handling).
  - Checkmate, stalemate, and 50-move rule draw condition detection.
  - Standard Algebraic Notation (SAN) generation (`e4`, `Nf3`, `exd6`, `O-O`, `Qxf7#`).
- **Comprehensive Chess Engine Unit Tests (`ChessEngineTest.php`)**:
  - 10 unit tests covering starting position parsing, FEN round-trip, pawn advances, illegal moves, turn violations, Scholar's Mate checkmate, castling, en passant, promotion, and stalemate.
- **Clock & Match State Database Migration**:
  - Added `last_move_at` timestamp and `draw_offered_by` user foreign key to `games` table in PostgreSQL.
  - Real-time elapsed time calculation per move with time control increment support.
- **Multiplayer Gameplay Controller & Endpoints (`GameController.php` & `routes/api.php`)**:
  - `POST /api/games/{code}/move`: Authoritatively validates turn, evaluates clock countdown, executes move via `ChessEngine`, records PGN, checks end conditions, and broadcasts `MoveMade`.
  - `POST /api/games/{code}/resign`: Resigns match and awards victory to opponent.
  - `POST /api/games/{code}/draw-offer`: Issues draw offer to opponent.
  - `POST /api/games/{code}/draw-accept`: Concludes match in mutually agreed draw.
  - `POST /api/games/{code}/draw-decline`: Safely clears pending draw offer.
  - `POST /api/games/{code}/timeout-claim`: Claims win when opponent's clock reaches 0.
- **Real-Time WebSocket Events (`backend/app/Events/`)**:
  - Created `MoveMade`, `GameEnded`, `DrawOffered`, `DrawDeclined`, and `PlayerJoined` broadcasting immediately via `ShouldBroadcastNow` on `game.{code}` channel.
- **Comprehensive Gameplay Feature Test Suite (`GamePlayTest.php`)**:
  - 9 feature tests verifying legal moves, out-of-turn rejection, illegal moves, spectator blocking, checkmate resolution, resignation, draw flow, and timeout victory.
- **Frontend Real-Time Client (`frontend/src/lib/echo.ts`)**:
  - Configured Laravel Echo with Reverb WebSockets for instant bidirectional event delivery.
- **Crisp SVG Chess Pieces (`ChessPiece.tsx`)**:
  - Designed vector SVG components for all 12 pieces with theme-adaptive styling.
- **Interactive Chessboard Component (`Chessboard.tsx`)**:
  - Optimistic legal move dots and capture rings powered by `chess.js`.
  - Click-to-move and drag-and-drop interaction.
  - Automatic board flipping based on assigned player color (White / Black).
  - Last-move square highlights and king-in-check crimson glow indicator.
  - Interactive pawn promotion modal.
  - Multi-theme support (`emerald`, `slate`, `amber`).
- **Full Multiplayer Game Room Page (`GameRoomPage.tsx`)**:
  - Room view at `/play/:code` with player cards, ratings, and live countdown clocks.
  - Subscribes to Reverb events (`.move.made`, `.player.joined`, `.game.ended`, `.draw.offered`).
  - Formatted PGN move notation history list with auto-scroll.
  - Resign and draw offer action buttons with confirmation dialogs.
  - Waiting room lobby with one-click room code and invite link copying.
  - Game over celebratory / draw victory modal.
- **Navigation & Dashboard Integration**:
  - Added protected `/play/:code` route in `App.tsx`.
  - Updated `DashboardPage.tsx` and `ActiveGamesList.tsx` to navigate directly to `/play/${game.code}` when creating, joining, or resuming games.

### Added (Phase 3)
- **Authoritative Game Model & Resources**: Built `Game.php` with player relationships and helper scopes, along with `GameResource.php` for safe API serialization.
- **Dashboard & Matchmaking Endpoints**: Implemented `GET /api/dashboard` (active games, recent matches, leaderboard, player stats), `POST /api/games` (create room with time controls: bullet, blitz, rapid, classical), `POST /api/games/join` (join room by invite code), and `GET /api/games/{code}`.
- **Comprehensive Dashboard Test Suite**: Implemented `DashboardTest.php` testing dashboard data retrieval, game room generation, 2-player room joining, and code validation (16 total tests passing, 78 assertions).
- **Authenticated Dashboard UI**: Built `DashboardPage.tsx` with player summary, ELO rating card, win-rate breakdown, and match history.
- **Matchmaking Modals & Lists**: Created `CreateGameModal` (with custom time controls & color selection), `JoinGameModal` (code entry), `ActiveGamesList` (live status badges & copy code action), and `MatchHistoryList` (outcomes & time controls).
- **Community Leaderboard & Cosmetics Loadout Hook**: Created `LeaderboardCard` (top platform players) and `CosmeticsPreviewCard` (active default theme with architectural slots for future skin unlocks).

### Added (Phase 2)
- **Phase 2 Public Landing Page**: Built comprehensive responsive landing page (`LandingPage.tsx`) with dark chess theme, hero presentation, architectural pillar cards, and 3-step gameplay onboarding.
- **Themeable Chessboard Preview**: Created `BoardPreview.tsx` demonstrating classical piece rendering, coordinate notation, live WebSocket move highlights (e2-e4), and extensible theme token styles (`classic`, `emerald`, `wood`).
- **React Router Integration**: Added `react-router-dom` with routes for `/` (LandingPage), `/health` (Architecture Diagnostics Hub), and fallback handling.
- **Diagnostics Hub View**: Factored telemetry and Phase roadmap tracker into dedicated `HealthPage.tsx` accessible via navbar diagnostics link.

### Added (Phase 1)
- **Phase 1 User Profile Migration**: Added `username` (unique, indexed), `rating` (default 1200 ELO baseline), and `avatar` placeholder to PostgreSQL `users` table.
- **Sanctum Authentication Endpoints**: Implemented `POST /api/register`, `POST /api/login`, `POST /api/logout`, and `GET /api/user` with session cookie stateful authentication.
- **Dual Login & Brute-Force Rate Limiting**: Built `LoginRequest` allowing login via either username or email with rate-limiting throttle (5 attempts/min) to prevent brute-force attacks.
- **Validation & Safe Transformation**: Added `RegisterRequest` with username pattern checks and `UserResource` protecting sensitive attributes while surfacing calibrated rating and profile data.
- **Authentication Test Suite**: Implemented `AuthenticationTest.php` covering registration, duplicate validation, dual login methods, invalid passwords, profile retrieval, and logout (11 passing tests, 46 assertions).
- **Frontend Auth Architecture**: Created `AuthContext` and `useAuth` hook with automated CSRF initialization, session restoration, and reactive auth state.
- **Frontend Auth UI Components**: Built `AuthModal` (tabbed login/registration with field-level validation errors), `UserMenu` (avatar initials, ELO rating pill, dropdown logout), and `AuthGuard` (route protection wrapper).

### Changed
- **App Dashboard**: Enhanced dashboard with player session card, live authenticated state display, and AuthGuard protected section demo.

### Added (Phase 0)
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
