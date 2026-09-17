<?php

namespace App\Http\Controllers\Api;

use App\Events\DrawDeclined;
use App\Events\DrawOffered;
use App\Events\GameEnded;
use App\Events\MoveMade;
use App\Events\PlayerJoined;
use App\Http\Controllers\Controller;
use App\Http\Resources\GameResource;
use App\Models\Game;
use App\Models\User;
use App\Services\Chess\ChessEngine;
use App\Services\Chess\ChessBot;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class GameController extends Controller
{
    /**
     * Time control durations in seconds.
     */
    protected const TIME_CONTROLS = [
        'bullet_1_0' => 60,
        'blitz_3_2' => 180,
        'blitz_5_0' => 300,
        'rapid_10_0' => 600,
        'classical_30_0' => 1800,
    ];

    /**
     * Increments in seconds per move.
     */
    protected const TIME_CONTROL_INCREMENTS = [
        'bullet_1_0' => 0,
        'blitz_3_2' => 2,
        'blitz_5_0' => 0,
        'rapid_10_0' => 0,
        'classical_30_0' => 0,
    ];

    /**
     * Create a new multiplayer chess game room.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'time_control' => ['nullable', 'string', 'in:bullet_1_0,blitz_3_2,blitz_5_0,rapid_10_0,classical_30_0'],
            'color' => ['nullable', 'string', 'in:white,black,random'],
            'is_bot' => ['nullable', 'boolean'],
            'bot_difficulty' => ['nullable', 'string', 'in:easy,medium,hard'],
        ]);

        /** @var User $user */
        $user = $request->user();
        $timeControl = $validated['time_control'] ?? 'rapid_10_0';
        $colorPreference = $validated['color'] ?? 'random';
        $duration = self::TIME_CONTROLS[$timeControl] ?? 600;
        $isBot = ! empty($validated['is_bot']);
        $botDifficulty = $validated['bot_difficulty'] ?? 'medium';

        // Determine player color assignment
        if ($colorPreference === 'random') {
            $isWhite = (bool) random_int(0, 1);
        } else {
            $isWhite = $colorPreference === 'white';
        }

        // Generate unique room code
        do {
            $code = ($isBot ? 'BOT-' : 'CH-') . strtoupper(Str::random(6));
        } while (Game::where('code', $code)->exists());

        $whitePlayerId = null;
        $blackPlayerId = null;

        if ($isBot) {
            $botUser = User::getOrCreateBotUser($botDifficulty);
            $whitePlayerId = $isWhite ? $user->id : $botUser->id;
            $blackPlayerId = $isWhite ? $botUser->id : $user->id;
        } else {
            $whitePlayerId = $isWhite ? $user->id : null;
            $blackPlayerId = $isWhite ? null : $user->id;
        }

        $game = Game::create([
            'code' => $code,
            'white_player_id' => $whitePlayerId,
            'black_player_id' => $blackPlayerId,
            'status' => $isBot ? 'in_progress' : 'waiting',
            'fen' => ChessEngine::STARTING_FEN,
            'time_control' => $timeControl,
            'white_time_remaining' => $duration,
            'black_time_remaining' => $duration,
            'turn' => 'white',
            'last_move_at' => $isBot ? now() : null,
            'is_bot' => $isBot,
            'bot_difficulty' => $isBot ? $botDifficulty : null,
        ]);

        $game->load(['whitePlayer', 'blackPlayer']);

        return response()->json([
            'message' => $isBot ? 'Bot match started.' : 'Game room created successfully.',
            'game' => new GameResource($game),
        ], 201);
    }

    /**
     * Join an existing game room by code.
     */
    public function join(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => ['required', 'string'],
        ]);

        $code = strtoupper(trim($validated['code']));
        $game = Game::where('code', $code)->first();

        if (! $game) {
            throw ValidationException::withMessages([
                'code' => 'No chess match was found with that room code.',
            ]);
        }

        /** @var User $user */
        $user = $request->user();

        // If user is already in the game, simply return it
        if ($game->hasPlayer($user)) {
            $game->load(['whitePlayer', 'blackPlayer']);
            return response()->json([
                'message' => 'Rejoined game room.',
                'game' => new GameResource($game),
            ]);
        }

        if ($game->status !== 'waiting') {
            throw ValidationException::withMessages([
                'code' => 'This match is already in progress or completed.',
            ]);
        }

        // Assign to whichever slot is vacant
        if ($game->white_player_id === null) {
            $game->white_player_id = $user->id;
        } elseif ($game->black_player_id === null) {
            $game->black_player_id = $user->id;
        } else {
            throw ValidationException::withMessages([
                'code' => 'This room already has two active players.',
            ]);
        }

        // Both players are now present - start match
        $game->status = 'in_progress';
        $game->last_move_at = now();
        $game->save();

        $game->load(['whitePlayer', 'blackPlayer']);

        // Broadcast to notify waiting player that game has started
        $this->safeBroadcast(new PlayerJoined($game));

        return response()->json([
            'message' => 'Successfully joined game match.',
            'game' => new GameResource($game),
        ]);
    }

    /**
     * Show game details by code.
     */
    public function show(string $code): JsonResponse
    {
        $game = Game::with(['whitePlayer', 'blackPlayer', 'winner', 'drawOfferedBy'])
            ->where('code', strtoupper(trim($code)))
            ->firstOrFail();

        return response()->json([
            'game' => new GameResource($game),
        ]);
    }

    /**
     * Execute an authoritative chess move.
     */
    public function move(Request $request, string $code): JsonResponse
    {
        $validated = $request->validate([
            'from' => ['required', 'string', 'regex:/^[a-h][1-8]$/i'],
            'to' => ['required', 'string', 'regex:/^[a-h][1-8]$/i'],
            'promotion' => ['nullable', 'string', 'in:q,r,b,n,Q,R,B,N'],
        ]);

        $game = Game::with(['whitePlayer', 'blackPlayer'])
            ->where('code', strtoupper(trim($code)))
            ->firstOrFail();

        /** @var User $user */
        $user = $request->user();

        if (! $game->hasPlayer($user)) {
            throw ValidationException::withMessages([
                'game' => 'You are not a registered player in this match.',
            ]);
        }

        if ($game->status === 'waiting') {
            throw ValidationException::withMessages([
                'game' => 'Game is waiting for an opponent to join.',
            ]);
        }

        if ($game->status !== 'in_progress') {
            throw ValidationException::withMessages([
                'game' => 'This game is already completed.',
            ]);
        }

        // Enforce turn authorization
        $isWhiteTurn = ($game->turn === 'white');
        $expectedPlayerId = $isWhiteTurn ? $game->white_player_id : $game->black_player_id;

        if ($user->id !== $expectedPlayerId) {
            throw ValidationException::withMessages([
                'turn' => 'It is not your turn to move.',
            ]);
        }

        // Calculate clock time
        $now = now();
        $elapsed = 0;
        if ($game->last_move_at) {
            $elapsed = (int) abs($now->diffInSeconds($game->last_move_at));
        }

        $timeKey = $isWhiteTurn ? 'white_time_remaining' : 'black_time_remaining';
        $currentClock = $game->$timeKey;

        // Check if player ran out of time
        if (($currentClock - $elapsed) <= 0) {
            $game->$timeKey = 0;
            $game->status = 'completed';
            $game->winner_id = $isWhiteTurn ? $game->black_player_id : $game->white_player_id;
            $game->end_reason = 'timeout';
            $game->save();

            $this->safeBroadcast(new GameEnded($game, $game->winner_id, 'timeout'));

            throw ValidationException::withMessages([
                'timeout' => 'Time expired! You ran out of time.',
            ]);
        }

        // Authoritatively validate move through ChessEngine
        $engineResult = ChessEngine::validateAndMakeMove(
            $game->fen,
            $validated['from'],
            $validated['to'],
            $validated['promotion'] ?? null
        );

        if (! $engineResult['valid']) {
            throw ValidationException::withMessages([
                'move' => $engineResult['error'] ?? 'Illegal move rejected by server engine.',
            ]);
        }

        // Apply clock update with increment
        $increment = self::TIME_CONTROL_INCREMENTS[$game->time_control] ?? 0;
        $remaining = max(1, ($currentClock - $elapsed) + $increment);
        $game->$timeKey = $remaining;
        $game->last_move_at = $now;

        // Apply new FEN and switch turn
        $game->fen = $engineResult['new_fen'];
        $game->turn = $isWhiteTurn ? 'black' : 'white';

        // Update PGN record
        $san = $engineResult['san'];
        $moveNumber = (int) (ChessEngine::parseFen($game->fen)['full_moves']);
        if ($isWhiteTurn) {
            $game->pgn = trim(($game->pgn ? $game->pgn . ' ' : '') . $moveNumber . '. ' . $san);
        } else {
            $game->pgn = trim(($game->pgn ? $game->pgn . ' ' : '') . $san);
        }

        // Move clears any active draw offers
        $game->draw_offered_by = null;

        // Process game over scenarios
        if ($engineResult['is_checkmate']) {
            $game->status = 'completed';
            $game->winner_id = $user->id;
            $game->end_reason = 'checkmate';
        } elseif ($engineResult['is_stalemate']) {
            $game->status = 'completed';
            $game->winner_id = null;
            $game->end_reason = 'stalemate';
        } elseif ($engineResult['is_draw']) {
            $game->status = 'completed';
            $game->winner_id = null;
            $game->end_reason = 'draw_50_moves';
        }

        $game->save();
        $game->load(['whitePlayer', 'blackPlayer', 'winner']);

        $moveData = [
            'from' => strtolower($validated['from']),
            'to' => strtolower($validated['to']),
            'promotion' => $validated['promotion'] ?? null,
            'san' => $san,
        ];

        // Broadcast move event
        $this->safeBroadcast(new MoveMade($game, $moveData, $engineResult));

        return response()->json([
            'message' => 'Move processed.',
            'game' => new GameResource($game),
            'move' => $moveData,
            'engine' => $engineResult,
        ]);
    }

    /**
     * Execute an authoritative computer bot move for a bot match.
     */
    public function botMove(Request $request, string $code): JsonResponse
    {
        $game = Game::with(['whitePlayer', 'blackPlayer'])
            ->where('code', strtoupper(trim($code)))
            ->firstOrFail();

        if (! $game->is_bot) {
            throw ValidationException::withMessages([
                'game' => 'This match is not a bot game.',
            ]);
        }

        if ($game->status !== 'in_progress') {
            throw ValidationException::withMessages([
                'game' => 'Game is not currently in progress.',
            ]);
        }

        /** @var User $user */
        $user = $request->user();
        if (! $game->hasPlayer($user)) {
            throw ValidationException::withMessages([
                'game' => 'You are not a player in this bot match.',
            ]);
        }

        // Determine bot player ID and current turn
        $isWhiteTurn = ($game->turn === 'white');
        $botPlayerId = $game->white_player_id === $user->id ? $game->black_player_id : $game->white_player_id;
        $currentTurnPlayerId = $isWhiteTurn ? $game->white_player_id : $game->black_player_id;

        if ($currentTurnPlayerId !== $botPlayerId) {
            throw ValidationException::withMessages([
                'turn' => "It is not the bot's turn to move.",
            ]);
        }

        // Calculate clock time for bot
        $now = now();
        $elapsed = 0;
        if ($game->last_move_at) {
            $elapsed = (int) abs($now->diffInSeconds($game->last_move_at));
        }

        $timeKey = $isWhiteTurn ? 'white_time_remaining' : 'black_time_remaining';
        $currentClock = $game->$timeKey;

        if (($currentClock - $elapsed) <= 0) {
            $game->$timeKey = 0;
            $game->status = 'completed';
            $game->winner_id = $user->id;
            $game->end_reason = 'timeout';
            $game->save();

            $this->safeBroadcast(new GameEnded($game, $game->winner_id, 'timeout'));

            return response()->json([
                'message' => 'Bot ran out of time.',
                'game' => new GameResource($game),
            ]);
        }

        // Pick bot move
        $bestMove = ChessBot::chooseMove($game->fen, $game->bot_difficulty ?? 'medium');

        if (! $bestMove) {
            $state = ChessEngine::parseFen($game->fen);
            $inCheck = ChessEngine::isInCheck($state['board'], $state['turn']);

            $game->status = 'completed';
            $game->winner_id = $inCheck ? $user->id : null;
            $game->end_reason = $inCheck ? 'checkmate' : 'stalemate';
            $game->save();

            $this->safeBroadcast(new GameEnded($game, $game->winner_id, $game->end_reason));

            return response()->json([
                'message' => 'Game concluded.',
                'game' => new GameResource($game),
            ]);
        }

        // Validate and apply move
        $engineResult = ChessEngine::validateAndMakeMove(
            $game->fen,
            $bestMove['from'],
            $bestMove['to'],
            $bestMove['promotion'] ?? null
        );

        if (! $engineResult['valid']) {
            Log::error("Bot attempted invalid move: {$bestMove['from']} to {$bestMove['to']} in FEN: {$game->fen}");
            throw ValidationException::withMessages([
                'bot' => 'Bot generated an invalid move.',
            ]);
        }

        // Clock update
        $increment = self::TIME_CONTROL_INCREMENTS[$game->time_control] ?? 0;
        $remaining = max(1, ($currentClock - $elapsed) + $increment);
        $game->$timeKey = $remaining;
        $game->last_move_at = $now;

        // Apply new FEN and switch turn to player
        $game->fen = $engineResult['new_fen'];
        $game->turn = $isWhiteTurn ? 'black' : 'white';

        // Update PGN record
        $san = $engineResult['san'];
        $moveNumber = (int) (ChessEngine::parseFen($game->fen)['full_moves']);
        if ($isWhiteTurn) {
            $game->pgn = trim(($game->pgn ? $game->pgn . ' ' : '') . $moveNumber . '. ' . $san);
        } else {
            $game->pgn = trim(($game->pgn ? $game->pgn . ' ' : '') . $san);
        }

        $game->draw_offered_by = null;

        if ($engineResult['is_checkmate']) {
            $game->status = 'completed';
            $game->winner_id = $botPlayerId;
            $game->end_reason = 'checkmate';
        } elseif ($engineResult['is_stalemate']) {
            $game->status = 'completed';
            $game->winner_id = null;
            $game->end_reason = 'stalemate';
        } elseif ($engineResult['is_draw']) {
            $game->status = 'completed';
            $game->winner_id = null;
            $game->end_reason = 'draw_50_moves';
        }

        $game->save();
        $game->load(['whitePlayer', 'blackPlayer', 'winner']);

        $moveData = [
            'from' => strtolower($bestMove['from']),
            'to' => strtolower($bestMove['to']),
            'promotion' => $bestMove['promotion'] ?? null,
            'san' => $san,
        ];

        // Broadcast move event
        $this->safeBroadcast(new MoveMade($game, $moveData, $engineResult));

        return response()->json([
            'message' => 'Bot move processed.',
            'game' => new GameResource($game),
            'move' => $moveData,
            'engine' => $engineResult,
        ]);
    }

    /**
     * Resign from the current game.
     */
    public function resign(Request $request, string $code): JsonResponse
    {
        $game = Game::with(['whitePlayer', 'blackPlayer'])
            ->where('code', strtoupper(trim($code)))
            ->firstOrFail();

        /** @var User $user */
        $user = $request->user();

        if (! $game->hasPlayer($user)) {
            throw ValidationException::withMessages([
                'game' => 'You are not a player in this match.',
            ]);
        }

        if ($game->status !== 'in_progress') {
            throw ValidationException::withMessages([
                'game' => 'Match is not currently in progress.',
            ]);
        }

        $opponent = $game->opponentOf($user);
        $game->status = 'completed';
        $game->winner_id = $opponent?->id;
        $game->end_reason = 'resignation';
        $game->save();
        $game->load(['whitePlayer', 'blackPlayer', 'winner']);

        $this->safeBroadcast(new GameEnded($game, $opponent?->id, 'resignation'));

        return response()->json([
            'message' => 'You have resigned.',
            'game' => new GameResource($game),
        ]);
    }

    /**
     * Offer a draw to opponent.
     */
    public function offerDraw(Request $request, string $code): JsonResponse
    {
        $game = Game::where('code', strtoupper(trim($code)))->firstOrFail();
        /** @var User $user */
        $user = $request->user();

        if (! $game->hasPlayer($user)) {
            throw ValidationException::withMessages(['game' => 'You are not playing in this match.']);
        }

        if ($game->status !== 'in_progress') {
            throw ValidationException::withMessages(['game' => 'Game is not in progress.']);
        }

        // If playing against a bot, bot automatically evaluates whether to accept
        if ($game->is_bot) {
            $state = ChessEngine::parseFen($game->fen);
            $eval = ChessBot::evaluatePosition($state);
            $isBotWhite = ($game->white_player_id !== $user->id);
            $botAdvantage = $isBotWhite ? $eval : -$eval;

            // If bot has no significant advantage (botAdvantage <= 50 centipawns), it accepts
            if ($botAdvantage <= 50) {
                $game->status = 'completed';
                $game->winner_id = null;
                $game->end_reason = 'draw_agreement';
                $game->draw_offered_by = null;
                $game->save();
                $game->load(['whitePlayer', 'blackPlayer', 'winner']);

                $this->safeBroadcast(new GameEnded($game, null, 'draw_agreement'));

                return response()->json([
                    'message' => 'The bot accepted your draw offer.',
                    'game' => new GameResource($game),
                ]);
            }

            return response()->json([
                'message' => 'The bot declined your draw offer.',
                'game' => new GameResource($game),
            ]);
        }

        $game->draw_offered_by = $user->id;
        $game->save();

        $this->safeBroadcast(new DrawOffered($game, $user->id));

        return response()->json([
            'message' => 'Draw offered to opponent.',
            'game' => new GameResource($game),
        ]);
    }

    /**
     * Accept a draw offer from opponent.
     */
    public function acceptDraw(Request $request, string $code): JsonResponse
    {
        $game = Game::where('code', strtoupper(trim($code)))->firstOrFail();
        /** @var User $user */
        $user = $request->user();

        if (! $game->hasPlayer($user)) {
            throw ValidationException::withMessages(['game' => 'You are not playing in this match.']);
        }

        if ($game->status !== 'in_progress') {
            throw ValidationException::withMessages(['game' => 'Game is not in progress.']);
        }

        if (! $game->draw_offered_by || $game->draw_offered_by === $user->id) {
            throw ValidationException::withMessages(['draw' => 'No active draw offer from your opponent to accept.']);
        }

        $game->status = 'completed';
        $game->winner_id = null;
        $game->end_reason = 'draw_agreement';
        $game->draw_offered_by = null;
        $game->save();
        $game->load(['whitePlayer', 'blackPlayer', 'winner']);

        $this->safeBroadcast(new GameEnded($game, null, 'draw_agreement'));

        return response()->json([
            'message' => 'Draw agreed. Match ended.',
            'game' => new GameResource($game),
        ]);
    }

    /**
     * Decline opponent's draw offer.
     */
    public function declineDraw(Request $request, string $code): JsonResponse
    {
        $game = Game::where('code', strtoupper(trim($code)))->firstOrFail();
        /** @var User $user */
        $user = $request->user();

        if (! $game->hasPlayer($user)) {
            throw ValidationException::withMessages(['game' => 'You are not playing in this match.']);
        }

        $opponent = $game->opponentOf($user);
        if ($game->draw_offered_by !== $opponent?->id) {
            throw ValidationException::withMessages(['draw' => 'No opponent draw offer to decline.']);
        }

        $game->draw_offered_by = null;
        $game->save();

        $this->safeBroadcast(new DrawDeclined($game, $user->id));

        return response()->json([
            'message' => 'Draw offer declined.',
            'game' => new GameResource($game),
        ]);
    }

    /**
     * Claim victory when opponent clock expires.
     */
    public function claimTimeout(Request $request, string $code): JsonResponse
    {
        $game = Game::where('code', strtoupper(trim($code)))->firstOrFail();
        /** @var User $user */
        $user = $request->user();

        if (! $game->hasPlayer($user)) {
            throw ValidationException::withMessages(['game' => 'You are not playing in this match.']);
        }

        if ($game->status !== 'in_progress') {
            throw ValidationException::withMessages(['game' => 'Game is not in progress.']);
        }

        $now = now();
        $elapsed = $game->last_move_at ? (int) abs($now->diffInSeconds($game->last_move_at)) : 0;
        $isWhiteTurn = ($game->turn === 'white');
        $timeKey = $isWhiteTurn ? 'white_time_remaining' : 'black_time_remaining';
        $remaining = $game->$timeKey - $elapsed;

        if ($remaining > 0) {
            throw ValidationException::withMessages([
                'timeout' => 'Opponent still has time remaining on their clock (' . $remaining . 's).',
            ]);
        }

        $game->$timeKey = 0;
        $game->status = 'completed';
        $game->winner_id = $isWhiteTurn ? $game->black_player_id : $game->white_player_id;
        $game->end_reason = 'timeout';
        $game->save();
        $game->load(['whitePlayer', 'blackPlayer', 'winner']);

        $this->safeBroadcast(new GameEnded($game, $game->winner_id, 'timeout'));

        return response()->json([
            'message' => 'Claimed win on timeout.',
            'game' => new GameResource($game),
        ]);
    }

    /**
     * Safely broadcast events without failing HTTP requests if WebSockets are unreachable.
     */
    protected function safeBroadcast(object $event): void
    {
        try {
            broadcast($event);
        } catch (\Throwable $e) {
            Log::warning('WebSocket broadcast skipped/failed: ' . $e->getMessage(), [
                'event' => get_class($event),
            ]);
        }
    }
}
