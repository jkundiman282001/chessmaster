<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

#[Fillable(['username', 'name', 'email', 'password', 'rating', 'avatar'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'rating' => 'integer',
        ];
    }

    /**
     * Games where user plays as White.
     */
    public function whiteGames(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Game::class, 'white_player_id');
    }

    /**
     * Games where user plays as Black.
     */
    public function blackGames(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Game::class, 'black_player_id');
    }

    /**
     * Compute real-time match statistics for the user.
     */
    public function getStats(): array
    {
        $userId = $this->id;

        $completedGames = Game::where(function ($q) use ($userId) {
            $q->where('white_player_id', $userId)
              ->orWhere('black_player_id', $userId);
        })->where('status', 'completed')->get();

        $wins = $completedGames->where('winner_id', $userId)->count();
        $draws = $completedGames->where('winner_id', null)->count();
        $total = $completedGames->count();
        $losses = $total - $wins - $draws;
        $winRate = $total > 0 ? round(($wins / $total) * 100) : 0;

        return [
            'total_games' => $total,
            'wins' => $wins,
            'losses' => $losses,
            'draws' => $draws,
            'win_rate' => $winRate,
        ];
    }

    /**
     * Retrieve or create a bot user instance by difficulty.
     */
    public static function getOrCreateBotUser(string $difficulty = 'medium'): self
    {
        $difficulty = strtolower($difficulty);
        $botConfigs = [
            'easy' => [
                'username' => 'bot_easy',
                'name' => 'ChessBot (Easy)',
                'email' => 'bot_easy@chessmaster.local',
                'rating' => 800,
            ],
            'medium' => [
                'username' => 'bot_medium',
                'name' => 'ChessBot (Medium)',
                'email' => 'bot_medium@chessmaster.local',
                'rating' => 1400,
            ],
            'hard' => [
                'username' => 'bot_hard',
                'name' => 'ChessBot (Master)',
                'email' => 'bot_hard@chessmaster.local',
                'rating' => 2000,
            ],
        ];

        $config = $botConfigs[$difficulty] ?? $botConfigs['medium'];

        return self::firstOrCreate(
            ['username' => $config['username']],
            [
                'name' => $config['name'],
                'email' => $config['email'],
                'password' => bcrypt('chessmaster_bot_key_' . $config['username']),
                'rating' => $config['rating'],
            ]
        );
    }
}
