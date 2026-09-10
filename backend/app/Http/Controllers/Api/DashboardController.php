<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\GameResource;
use App\Http\Resources\UserResource;
use App\Models\Game;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * Get the authenticated player's dashboard data.
     */
    public function index(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $userId = $user->id;

        // Active games (in progress or waiting for opponent)
        $activeGames = Game::with(['whitePlayer', 'blackPlayer'])
            ->where(function ($query) use ($userId) {
                $query->where('white_player_id', $userId)
                    ->orWhere('black_player_id', $userId);
            })
            ->whereIn('status', ['waiting', 'in_progress'])
            ->orderByDesc('updated_at')
            ->get();

        // Recent finished matches
        $recentMatches = Game::with(['whitePlayer', 'blackPlayer', 'winner'])
            ->where(function ($query) use ($userId) {
                $query->where('white_player_id', $userId)
                    ->orWhere('black_player_id', $userId);
            })
            ->where('status', 'completed')
            ->orderByDesc('updated_at')
            ->limit(10)
            ->get();

        // Platform leaderboard
        $leaderboard = User::orderByDesc('rating')
            ->limit(10)
            ->get()
            ->map(function (User $u, int $index) {
                return [
                    'rank' => $index + 1,
                    'id' => $u->id,
                    'username' => $u->username,
                    'name' => $u->name,
                    'rating' => $u->rating,
                    'avatar' => $u->avatar,
                    'stats' => $u->getStats(),
                ];
            });

        return response()->json([
            'user' => new UserResource($user),
            'active_games' => GameResource::collection($activeGames),
            'recent_matches' => GameResource::collection($recentMatches),
            'leaderboard' => $leaderboard,
        ]);
    }
}
