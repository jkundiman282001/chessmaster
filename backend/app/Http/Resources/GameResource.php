<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GameResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'status' => $this->status,
            'time_control' => $this->time_control,
            'turn' => $this->turn,
            'fen' => $this->fen,
            'pgn' => $this->pgn,
            'white_time_remaining' => $this->white_time_remaining,
            'black_time_remaining' => $this->black_time_remaining,
            'white_player' => $this->whitePlayer ? [
                'id' => $this->whitePlayer->id,
                'username' => $this->whitePlayer->username,
                'rating' => $this->whitePlayer->rating,
                'avatar' => $this->whitePlayer->avatar,
            ] : null,
            'black_player' => $this->blackPlayer ? [
                'id' => $this->blackPlayer->id,
                'username' => $this->blackPlayer->username,
                'rating' => $this->blackPlayer->rating,
                'avatar' => $this->blackPlayer->avatar,
            ] : null,
            'winner_id' => $this->winner_id,
            'end_reason' => $this->end_reason,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
