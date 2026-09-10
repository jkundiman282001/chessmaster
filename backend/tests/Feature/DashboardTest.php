<?php

namespace Tests\Feature;

use App\Models\Game;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_access_dashboard_data(): void
    {
        $user = User::factory()->create([
            'username' => 'magnus_fan',
            'rating' => 1250,
        ]);

        $opponent = User::factory()->create([
            'username' => 'hikaru_fan',
            'rating' => 1220,
        ]);

        // Create an active game for user
        Game::create([
            'code' => 'CH-TEST01',
            'white_player_id' => $user->id,
            'black_player_id' => $opponent->id,
            'status' => 'in_progress',
            'time_control' => 'rapid_10_0',
            'white_time_remaining' => 600,
            'black_time_remaining' => 600,
        ]);

        // Create a finished game for user
        Game::create([
            'code' => 'CH-TEST02',
            'white_player_id' => $user->id,
            'black_player_id' => $opponent->id,
            'status' => 'completed',
            'winner_id' => $user->id,
            'end_reason' => 'checkmate',
            'time_control' => 'blitz_5_0',
        ]);

        $response = $this->actingAs($user)->getJson('/api/dashboard');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'user' => [
                    'id',
                    'username',
                    'rating',
                    'stats' => [
                        'total_games',
                        'wins',
                        'losses',
                        'draws',
                        'win_rate',
                    ],
                ],
                'active_games',
                'recent_matches',
                'leaderboard',
            ])
            ->assertJson([
                'user' => [
                    'username' => 'magnus_fan',
                    'stats' => [
                        'total_games' => 1,
                        'wins' => 1,
                        'losses' => 0,
                    ],
                ],
            ]);
    }

    public function test_unauthenticated_user_cannot_access_dashboard(): void
    {
        $response = $this->getJson('/api/dashboard');
        $response->assertStatus(401);
    }

    public function test_user_can_create_game_room(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/games', [
            'time_control' => 'blitz_3_2',
            'color' => 'white',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'message',
                'game' => [
                    'id',
                    'code',
                    'status',
                    'time_control',
                    'white_player',
                ],
            ])
            ->assertJson([
                'game' => [
                    'status' => 'waiting',
                    'time_control' => 'blitz_3_2',
                    'white_player' => [
                        'id' => $user->id,
                    ],
                ],
            ]);

        $this->assertDatabaseHas('games', [
            'white_player_id' => $user->id,
            'status' => 'waiting',
            'time_control' => 'blitz_3_2',
        ]);
    }

    public function test_opponent_can_join_game_room_by_code(): void
    {
        $player1 = User::factory()->create(['username' => 'player_one']);
        $player2 = User::factory()->create(['username' => 'player_two']);

        // Player 1 creates game
        $createResponse = $this->actingAs($player1)->postJson('/api/games', [
            'time_control' => 'rapid_10_0',
            'color' => 'white',
        ]);

        $code = $createResponse->json('game.code');

        // Player 2 joins game
        $joinResponse = $this->actingAs($player2)->postJson('/api/games/join', [
            'code' => $code,
        ]);

        $joinResponse->assertStatus(200)
            ->assertJson([
                'message' => 'Successfully joined game match.',
                'game' => [
                    'code' => $code,
                    'status' => 'in_progress',
                    'white_player' => [
                        'id' => $player1->id,
                    ],
                    'black_player' => [
                        'id' => $player2->id,
                    ],
                ],
            ]);

        $this->assertDatabaseHas('games', [
            'code' => $code,
            'status' => 'in_progress',
            'white_player_id' => $player1->id,
            'black_player_id' => $player2->id,
        ]);
    }

    public function test_joining_invalid_code_fails_with_validation_error(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/games/join', [
            'code' => 'INVALID999',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['code']);
    }
}
