<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\GameResource;
use App\Models\Game;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
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
     * Create a new multiplayer chess game room.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'time_control' => ['nullable', 'string', 'in:bullet_1_0,blitz_3_2,blitz_5_0,rapid_10_0,classical_30_0'],
            'color' => ['nullable', 'string', 'in:white,black,random'],
        ]);

        /** @var User $user */
        $user = $request->user();
        $timeControl = $validated['time_control'] ?? 'rapid_10_0';
        $colorPreference = $validated['color'] ?? 'random';
        $duration = self::TIME_CONTROLS[$timeControl] ?? 600;

        // Determine player color assignment
        if ($colorPreference === 'random') {
            $isWhite = (bool) random_int(0, 1);
        } else {
            $isWhite = $colorPreference === 'white';
        }

        // Generate unique room code
        do {
            $code = 'CH-' . strtoupper(Str::random(6));
        } while (Game::where('code', $code)->exists());

        $game = Game::create([
            'code' => $code,
            'white_player_id' => $isWhite ? $user->id : null,
            'black_player_id' => $isWhite ? null : $user->id,
            'status' => 'waiting',
            'fen' => 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
            'time_control' => $timeControl,
            'white_time_remaining' => $duration,
            'black_time_remaining' => $duration,
            'turn' => 'white',
        ]);

        $game->load(['whitePlayer', 'blackPlayer']);

        return response()->json([
            'message' => 'Game room created successfully.',
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
        $game->save();

        $game->load(['whitePlayer', 'blackPlayer']);

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
        $game = Game::with(['whitePlayer', 'blackPlayer', 'winner'])
            ->where('code', strtoupper(trim($code)))
            ->firstOrFail();

        return response()->json([
            'game' => new GameResource($game),
        ]);
    }
}
