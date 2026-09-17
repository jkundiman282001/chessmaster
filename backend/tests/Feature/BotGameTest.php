<?php

namespace Tests\Feature;

use App\Events\MoveMade;
use App\Models\Game;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Tests\TestCase;

class BotGameTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create(['username' => 'chess_fan']);
    }

    public function test_can_create_bot_game(): void
    {
        $response = $this->actingAs($this->user)->postJson('/api/games', [
            'color' => 'white',
            'time_control' => 'rapid_10_0',
            'is_bot' => true,
            'bot_difficulty' => 'hard',
        ]);

        $response->assertStatus(201)
            ->assertJson([
                'message' => 'Bot match started.',
                'game' => [
                    'status' => 'in_progress',
                    'turn' => 'white',
                    'is_bot' => true,
                    'bot_difficulty' => 'hard',
                    'white_player' => [
                        'id' => $this->user->id,
                        'username' => 'chess_fan',
                    ],
                    'black_player' => [
                        'username' => 'bot_hard',
                    ],
                ],
            ]);

        $this->assertDatabaseHas('games', [
            'is_bot' => true,
            'bot_difficulty' => 'hard',
            'white_player_id' => $this->user->id,
            'status' => 'in_progress',
        ]);
    }

    public function test_human_move_and_subsequent_bot_move(): void
    {
        Event::fake([MoveMade::class]);

        $createResponse = $this->actingAs($this->user)->postJson('/api/games', [
            'color' => 'white',
            'time_control' => 'rapid_10_0',
            'is_bot' => true,
            'bot_difficulty' => 'medium',
        ]);

        $code = $createResponse->json('game.code');

        // Human plays e2 -> e4
        $moveResponse = $this->actingAs($this->user)->postJson("/api/games/{$code}/move", [
            'from' => 'e2',
            'to' => 'e4',
        ]);

        $moveResponse->assertStatus(200);
        $this->assertEquals('black', $moveResponse->json('game.turn'));

        // Bot makes move
        $botMoveResponse = $this->actingAs($this->user)->postJson("/api/games/{$code}/bot-move");

        $botMoveResponse->assertStatus(200)
            ->assertJson([
                'message' => 'Bot move processed.',
                'game' => [
                    'turn' => 'white',
                ],
            ]);

        $this->assertNotEmpty($botMoveResponse->json('move.from'));
        $this->assertNotEmpty($botMoveResponse->json('move.to'));
        $this->assertNotEmpty($botMoveResponse->json('move.san'));
    }

    public function test_cannot_trigger_bot_move_when_it_is_human_turn(): void
    {
        $createResponse = $this->actingAs($this->user)->postJson('/api/games', [
            'color' => 'white',
            'time_control' => 'rapid_10_0',
            'is_bot' => true,
            'bot_difficulty' => 'easy',
        ]);

        $code = $createResponse->json('game.code');

        // Currently it is White's turn (human), so bot-move should fail
        $response = $this->actingAs($this->user)->postJson("/api/games/{$code}/bot-move");

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['turn']);
    }

    public function test_user_can_resign_against_bot(): void
    {
        $createResponse = $this->actingAs($this->user)->postJson('/api/games', [
            'color' => 'white',
            'time_control' => 'rapid_10_0',
            'is_bot' => true,
            'bot_difficulty' => 'easy',
        ]);

        $code = $createResponse->json('game.code');

        $resignResponse = $this->actingAs($this->user)->postJson("/api/games/{$code}/resign");

        $resignResponse->assertStatus(200)
            ->assertJson([
                'message' => 'You have resigned.',
                'game' => [
                    'status' => 'completed',
                    'end_reason' => 'resignation',
                ],
            ]);
    }
}
