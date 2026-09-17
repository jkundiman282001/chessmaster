# Changelog

All notable changes to this project will be documented in this file.
This file is automatically updated by the AI Agent Skill (`document-code-changes`).

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [Unreleased] - 2026-09-17

### Added
- **Zero-Cost Production Deployment (Render + Neon + Vercel)**:
  - **Neon Serverless PostgreSQL Integration**:
    - Configured support for Neon's free-tier serverless PostgreSQL via `DB_URL` with SSL mode enforcement (`sslmode=require`).
    - Documented Neon connection string structure in [`backend/.env.example`](file:///mnt/c/Users/Japhet/Desktop/Personal%20Projects/chessmaster/backend/.env.example).
  - **Render Free-Tier Docker Containerization**:
    - Created production Alpine-based [`Dockerfile`](file:///mnt/c/Users/Japhet/Desktop/Personal%20Projects/chessmaster/backend/Dockerfile) with PHP 8.3 FPM, Nginx, Supervisord, Composer, and PostgreSQL extensions (`pdo_pgsql`, `pgsql`, `bcmath`, `mbstring`, `zip`, `opcache`, `pcntl`).
    - Created [`backend/docker/nginx.conf`](file:///mnt/c/Users/Japhet/Desktop/Personal%20Projects/chessmaster/backend/docker/nginx.conf) and [`backend/docker/supervisord.conf`](file:///mnt/c/Users/Japhet/Desktop/Personal%20Projects/chessmaster/backend/docker/supervisord.conf).
    - Created [`backend/docker/entrypoint.sh`](file:///mnt/c/Users/Japhet/Desktop/Personal%20Projects/chessmaster/backend/docker/entrypoint.sh) with dynamic `$PORT` replacement, automatic database migration execution (`php artisan migrate --force`), and production caching (`config:cache`, `route:cache`, `view:cache`).
    - Created [`render.yaml`](file:///mnt/c/Users/Japhet/Desktop/Personal%20Projects/chessmaster/render.yaml) Blueprint configuration for 1-click deployment on Render's free tier.
    - Updated [`backend/config/cors.php`](file:///mnt/c/Users/Japhet/Desktop/Personal%20Projects/chessmaster/backend/config/cors.php) with multi-origin parsing and `#^https://.*\.vercel\.app$#` pattern matching to support all Vercel deployment URLs.
  - **Vercel Free-Tier Frontend Hosting**:
    - Created [`frontend/vercel.json`](file:///mnt/c/Users/Japhet/Desktop/Personal%20Projects/chessmaster/frontend/vercel.json) for Single Page Application client routing (rewriting unmatched routes to `/index.html`) and aggressive asset caching for pieces and assets.
    - Updated [`frontend/src/lib/api.ts`](file:///mnt/c/Users/Japhet/Desktop/Personal%20Projects/chessmaster/frontend/src/lib/api.ts) to support the `VITE_API_URL` environment variable for direct Render API connections.

### Fixed
- **Docker Build Directory Structure for Alpine**:
  - Resolved `cp: can't create '/etc/supervisor/conf.d/supervisord.conf': No such file or directory` error by pre-creating `/etc/supervisor/conf.d`, `/etc/nginx/http.d`, `/run/nginx`, and `/var/log/supervisor` directories before copying configuration files.
  - Added dual-context detection in [`Dockerfile`](file:///mnt/c/Users/Japhet/Desktop/Personal%20Projects/chessmaster/Dockerfile) and [`backend/Dockerfile`](file:///mnt/c/Users/Japhet/Desktop/Personal%20Projects/chessmaster/backend/Dockerfile) to seamlessly handle builds whether Render executes with root `.` context or `backend` context.

- **AI Chess Bot Feature with Difficulty Tiers**:
  - Built high-performance chess bot service [`ChessBot.php`](file:///mnt/c/Users/Japhet/Desktop/Personal%20Projects/chessmaster/backend/app/Services/Chess/ChessBot.php) supporting three distinct difficulty levels:
    - **Easy (Beginner ~800 ELO)**: Random legal move selection with weighted 1-ply capture opportunities.
    - **Medium (Intermediate ~1400 ELO)**: Depth-2 Minimax search with Alpha-Beta pruning, Piece-Square Tables (PST), and realistic positional jitter.
    - **Hard (Master ~2000 ELO)**: Depth-3 Minimax search with Alpha-Beta pruning, MVV-LVA move ordering (captures & promotions first), checkmate prioritization, and full PST evaluation.
  - Added database migration [`2026_09_17_120000_add_bot_columns_to_games_table.php`](file:///mnt/c/Users/Japhet/Desktop/Personal%20Projects/chessmaster/backend/database/migrations/2026_09_17_120000_add_bot_columns_to_games_table.php) adding `is_bot` (boolean) and `bot_difficulty` (`easy`, `medium`, `hard`) columns to `games`.
  - Added `User::getOrCreateBotUser(string $difficulty)` in [`User.php`](file:///mnt/c/Users/Japhet/Desktop/Personal%20Projects/chessmaster/backend/app/Models/User.php) to represent bot opponents as dedicated system accounts (`bot_easy`, `bot_medium`, `bot_hard`) preserving relational database integrity and Elo ratings.
  - Added authoritative bot move API endpoint `POST /api/games/{code}/bot-move` in [`GameController.php`](file:///mnt/c/Users/Japhet/Desktop/Personal%20Projects/chessmaster/backend/app/Http/Controllers/Api/GameController.php) and [`routes/api.php`](file:///mnt/c/Users/Japhet/Desktop/Personal%20Projects/chessmaster/backend/routes/api.php) to safely validate and execute bot moves with clock management, checkmate/stalemate resolution, and real-time Reverb event broadcasting.
  - Enhanced `offerDraw` in [`GameController.php`](file:///mnt/c/Users/Japhet/Desktop/Personal%20Projects/chessmaster/backend/app/Http/Controllers/Api/GameController.php) to automatically evaluate board position using `ChessBot::evaluatePosition` and accept or decline draws intelligently.
  - Upgraded [`CreateGameModal.tsx`](file:///mnt/c/Users/Japhet/Desktop/Personal%20Projects/chessmaster/frontend/src/components/dashboard/CreateGameModal.tsx) with a sleek segmented toggle for **Play vs Bot** vs **Play vs Friend**, interactive difficulty cards (Beginner, Intermediate, Master), and direct match launch.
  - Updated [`GameRoomPage.tsx`](file:///mnt/c/Users/Japhet/Desktop/Personal%20Projects/chessmaster/frontend/src/pages/GameRoomPage.tsx) with automated bot turn execution, realistic 400–700ms thinking delay, animated bot thinking badge (`Thinking... 🧠`), and bot match status indicators.
  - Created unit test suite [`ChessBotTest.php`](file:///mnt/c/Users/Japhet/Desktop/Personal%20Projects/chessmaster/backend/tests/Unit/ChessBotTest.php) and feature test suite [`BotGameTest.php`](file:///mnt/c/Users/Japhet/Desktop/Personal%20Projects/chessmaster/backend/tests/Feature/BotGameTest.php) covering opening moves, checkmate detection, move validation, clock updates, resignation, and draw offers.

- **Default Piece Sets Integration (`White Classic` & `Black Classic`)**:
  - Configured [`ChessPiece.tsx`](file:///mnt/c/Users/Japhet/Desktop/Personal%20Projects/chessmaster/frontend/src/components/chess/ChessPiece.tsx) to use the full PNG piece sets from [`frontend/public/pieces/White Classic/`](file:///mnt/c/Users/Japhet/Desktop/Personal%20Projects/chessmaster/frontend/public/pieces/White%20Classic/) and [`frontend/public/pieces/Black Classic/`](file:///mnt/c/Users/Japhet/Desktop/Personal%20Projects/chessmaster/frontend/public/pieces/Black%20Classic/) as the default in-game pieces.
  - Mapped pieces (`pawn`, `knight`, `bishop`, `rook`, `queen`, `king`) to transparent PNG assets for both White and Black sides.
  - Added robust per-piece fallback to inline vector SVGs if any asset fails to load.
  - Updated [`CosmeticsPreviewCard.tsx`](file:///mnt/c/Users/Japhet/Desktop/Personal%20Projects/chessmaster/frontend/src/components/dashboard/CosmeticsPreviewCard.tsx) and [`frontend/public/pieces/README.md`](file:///mnt/c/Users/Japhet/Desktop/Personal%20Projects/chessmaster/frontend/public/pieces/README.md) to document the default piece sets.

## [2026-09-12] - 2026-09-12

### Added
- **Custom Chess Piece Assets Architecture**:
  - Created dedicated asset directories [`frontend/public/pieces/`](file:///mnt/c/Users/Japhet/Desktop/Personal%20Projects/chessmaster/frontend/public/pieces/) and [`frontend/src/assets/pieces/`](file:///mnt/c/Users/Japhet/Desktop/Personal%20Projects/chessmaster/frontend/src/assets/pieces/).
  - Provided complete template vector SVG files for all 12 pieces (`w_p`, `w_n`, `w_b`, `w_r`, `w_q`, `w_k`, `b_p`, `b_n`, `b_b`, `b_r`, `b_q`, `b_k`).
  - Added [`README.md`](file:///mnt/c/Users/Japhet/Desktop/Personal%20Projects/chessmaster/frontend/public/pieces/README.md) documenting file naming conventions, formats (SVG, PNG, WebP), and paths for Windows and WSL.
  - Integrated user's custom transparent pawn PNG assets ([`w_p.png`](file:///mnt/c/Users/Japhet/Desktop/Personal%20Projects/chessmaster/frontend/public/pieces/w_p.png) and [`b_p.png`](file:///mnt/c/Users/Japhet/Desktop/Personal%20Projects/chessmaster/frontend/public/pieces/b_p.png)) in [`frontend/public/pieces/`](file:///mnt/c/Users/Japhet/Desktop/Personal%20Projects/chessmaster/frontend/public/pieces/) and updated [`ChessPiece.tsx`](file:///mnt/c/Users/Japhet/Desktop/Personal%20Projects/chessmaster/frontend/src/components/chess/ChessPiece.tsx) to prioritize them.
  - Enhanced [`ChessPiece.tsx`](file:///mnt/c/Users/Japhet/Desktop/Personal%20Projects/chessmaster/frontend/src/components/chess/ChessPiece.tsx) to automatically load custom piece assets from `/pieces/` with fallback to inline vector SVGs.

### Changed
- **Comprehensive Modern UI & Responsive Redesign**:
  - **Global Theme & Styling (`frontend/src/index.css`)**:
    - Replaced retro pixel-art theme with modern luxury dark mode palette (`#050811`, `#070c18`, `#0b101f`).
    - Added glassmorphic utility classes (`.glass-panel`, `.glass-card`), subtle glowing borders (`.glow-emerald`, `.glow-amber`), gradient text utilities, and modern scrollbars.
    - Set `touch-action: manipulation` and tap-highlight suppression for mobile responsiveness.
  - **Landing Page (`LandingPage.tsx` & `BoardPreview.tsx`)**:
    - Removed retro fonts (`Press Start 2P`, `VT323`) and CRT scanline styling in favor of crisp modern typography.
    - Upgraded `BoardPreview.tsx` to render crisp vector SVG chess pieces with interactive legal move indicators and board theme switcher.
    - Redesigned hero section with glowing gradient pill tags, high-impact headline, responsive CTA button grouping, and interactive stats cards.
    - Modernized architecture features grid and 3-step interactive "How It Works" workflow.
  - **Authentication Experience (`AuthModal.tsx` & `UserMenu.tsx`)**:
    - Transformed `AuthModal` into a luxury glassmorphic dialog with seamless mode toggling, refined inputs with emerald focus rings, and mobile-drawer scrollable styling.
    - Enhanced `UserMenu` with avatar ring, rating badge, ELO summary, and backdrop blur dropdown menu.
  - **Dashboard Hub (`DashboardPage.tsx` and subcomponents)**:
    - Redesigned player header banner with prominent initial badge, competitor flair, and instant match creation/join buttons.
    - Modernized 4-metric statistics grid (Rating, Win Rate, Matches, W/L/D record) with icons and trend labels.
    - Refreshed `ActiveGamesList.tsx` and `MatchHistoryList.tsx` with responsive cards, turn indicators, 1-click room code copying, and review links.
    - Upgraded `LeaderboardCard.tsx` with gold/silver/bronze podium rank badges and current player highlight.
    - Polished `CreateGameModal.tsx` and `JoinGameModal.tsx` with format speed badges (Bullet, Blitz, Rapid, Classical) and room code sharing.
  - **Gameplay & Arena Experience (`GameRoomPage.tsx` & `Chessboard.tsx`)**:
    - Implemented mobile-first layout: opponent HUD stacked directly above board, user HUD stacked below board, with touch-optimized squares (`touch-action: manipulation`) and responsive dimensions (`max-w-[min(100vw-1.5rem,540px)]`).
    - Enhanced digital clocks with &le;30s countdown warning pulses and glowing turn indicators.
    - Placed quick action bar (Offer Draw, Resign) directly under player bar for rapid thumb reach on mobile screens.
    - Provided responsive notation drawer and victory/draw game completion cards.
  - **System Diagnostics (`HealthPage.tsx`)**:
    - Refreshed architecture telemetry grid, probe cards, and progress roadmap to match the modern dark obsidian theme.

## [Phase 4] - 2026-09-10

### Fixed
- **Resilient Broadcast & Fallback Architecture**:
  - Implemented `safeBroadcast()` in `GameController.php` so that moves and game actions never crash with HTTP 500 when the WebSocket server is offline or restarting.
  - Added seamless HTTP polling fallback in `GameRoomPage.tsx` to keep the chessboard, clocks, and game state 100% functional even if WebSockets are unreachable.
  - Normalized Reverb host binding to `127.0.0.1` and `0.0.0.0` in `.env` to prevent IPv6 `::1` connection refused errors on Linux/WSL2.
  - Added visual connection status badge in `GameRoomPage.tsx` header indicating "Live" or "HTTP Sync".

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
