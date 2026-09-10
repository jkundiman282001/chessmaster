<?php

namespace App\Events;

use App\Models\Game;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PlayerJoined implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public Game $game
    ) {}

    public function broadcastAs(): string
    {
        return 'player.joined';
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('game.' . $this->game->code),
        ];
    }

    public function broadcastWith(): array
    {
        return [
            'game_code' => $this->game->code,
            'status' => $this->game->status,
            'white_player' => $this->game->whitePlayer ? [
                'id' => $this->game->whitePlayer->id,
                'username' => $this->game->whitePlayer->username,
                'rating' => $this->game->whitePlayer->rating,
                'avatar' => $this->game->whitePlayer->avatar,
            ] : null,
            'black_player' => $this->game->blackPlayer ? [
                'id' => $this->game->blackPlayer->id,
                'username' => $this->game->blackPlayer->username,
                'rating' => $this->game->blackPlayer->rating,
                'avatar' => $this->game->blackPlayer->avatar,
            ] : null,
        ];
    }
}
