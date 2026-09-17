<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Game extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'white_player_id',
        'black_player_id',
        'status',
        'fen',
        'pgn',
        'time_control',
        'white_time_remaining',
        'black_time_remaining',
        'turn',
        'last_move_at',
        'winner_id',
        'end_reason',
        'draw_offered_by',
        'is_bot',
        'bot_difficulty',
    ];

    protected $casts = [
        'white_time_remaining' => 'integer',
        'black_time_remaining' => 'integer',
        'last_move_at' => 'datetime',
        'draw_offered_by' => 'integer',
        'is_bot' => 'boolean',
    ];

    /**
     * The player who currently offered a draw, if any.
     */
    public function drawOfferedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'draw_offered_by');
    }

    /**
     * The white player.
     */
    public function whitePlayer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'white_player_id');
    }

    /**
     * The black player.
     */
    public function blackPlayer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'black_player_id');
    }

    /**
     * The winning player.
     */
    public function winner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'winner_id');
    }

    /**
     * Determine if a user is participating in this game.
     */
    public function hasPlayer(User $user): bool
    {
        return $this->white_player_id === $user->id || $this->black_player_id === $user->id;
    }

    /**
     * Get the opponent of the given user.
     */
    public function opponentOf(User $user): ?User
    {
        if ($this->white_player_id === $user->id) {
            return $this->blackPlayer;
        }

        if ($this->black_player_id === $user->id) {
            return $this->whitePlayer;
        }

        return null;
    }

    /**
     * Get user color ('white', 'black', or null).
     */
    public function colorOf(User $user): ?string
    {
        if ($this->white_player_id === $user->id) {
            return 'white';
        }

        if ($this->black_player_id === $user->id) {
            return 'black';
        }

        return null;
    }
}
