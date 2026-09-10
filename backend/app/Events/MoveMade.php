<?php

namespace App\Events;

use App\Models\Game;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MoveMade implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public Game $game,
        public array $moveData,
        public array $engineResult
    ) {}

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'move.made';
    }

    /**
     * The channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        return [
            new Channel('game.' . $this->game->code),
        ];
    }

    /**
     * Get the data to broadcast.
     *
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return [
            'game_code' => $this->game->code,
            'move' => $this->moveData,
            'fen' => $this->game->fen,
            'turn' => $this->game->turn,
            'status' => $this->game->status,
            'white_time_remaining' => $this->game->white_time_remaining,
            'black_time_remaining' => $this->game->black_time_remaining,
            'last_move_at' => $this->game->last_move_at?->toIso8601String(),
            'winner_id' => $this->game->winner_id,
            'end_reason' => $this->game->end_reason,
            'is_check' => $this->engineResult['is_check'] ?? false,
            'is_checkmate' => $this->engineResult['is_checkmate'] ?? false,
            'is_stalemate' => $this->engineResult['is_stalemate'] ?? false,
            'is_draw' => $this->engineResult['is_draw'] ?? false,
            'san' => $this->engineResult['san'] ?? null,
            'pgn' => $this->game->pgn,
        ];
    }
}
