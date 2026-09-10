<?php

namespace Tests\Feature;

use App\Events\GameEnded;
use App\Events\MoveMade;
use App\Models\Game;
use App\Models\User;
use App\Services\Chess\ChessEngine;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Tests\TestCase;

class GamePlayTest extends TestCase
{
    use RefreshDatabase;

    protected User $whitePlayer;
    protected User $blackPlayer;
    protected Game $game;

    protected function setUp(): void
    {
        parent::setUp();

        $this->whitePlayer = User::factory()->create(['username' => 'white_player']);
        $this->blackPlayer = User::factory()->create(['username' => 'black_player']);

        $this->game = Game::create([
            'code' => 'CH-PLAY01',
            'white_player_id' => $this->whitePlayer->id,
            'black_player_id' => $this->blackPlayer->id,
            'status' => 'in_progress',
            'fen' => ChessEngine::STARTING_FEN,
            'time_control' => 'rapid_10_0',
            'white_time_remaining' => 600,
            'black_time_remaining' => 600,
            'turn' => 'white',
            'last_move_at' => now(),
        ]);
    }

    public function test_player_can_make_legal_move(): void
    {
        Event::fake([MoveMade::class]);

        $response = $this->actingAs($this->whitePlayer)->postJson("/api/games/{$this->game->code}/move", [
            'from' => 'e2',
            'to' => 'e4',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Move processed.',
                'move' => [
                    'from' => 'e2',
                    'to' => 'e4',
                    'san' => 'e4',
                ],
            ]);

        $this->game->refresh();
        $this->assertEquals('black', $this->game->turn);
        $this->assertEquals('1. e4', $this->game->pgn);
        $this->assertStringContainsString('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3', $this->game->fen);

        Event::assertDispatched(MoveMade::class, function ($event) {
            return $event->game->code === $this->game->code &&
                   $event->moveData['san'] === 'e4';
        });
    }

    public function test_rejects_out_of_turn_move(): void
    {
        // Black tries to move when it's White's turn
        $response = $this->actingAs($this->blackPlayer)->postJson("/api/games/{$this->game->code}/move", [
            'from' => 'e7',
            'to' => 'e5',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['turn']);
    }

    public function test_rejects_illegal_move(): void
    {
        // White pawn cannot move to d5 from starting position
        $response = $this->actingAs($this->whitePlayer)->postJson("/api/games/{$this->game->code}/move", [
            'from' => 'e2',
            'to' => 'd5',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['move']);
    }

    public function test_rejects_move_from_spectator_or_third_party(): void
    {
        $spectator = User::factory()->create(['username' => 'spectator']);

        $response = $this->actingAs($spectator)->postJson("/api/games/{$this->game->code}/move", [
            'from' => 'e2',
            'to' => 'e4',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['game']);
    }

    public function test_checkmate_ends_game_and_assigns_winner(): void
    {
        Event::fake([MoveMade::class]);

        // Setup position one move before Scholar's Mate
        // White queen on h5, White bishop on c4, Black king on e8, pawn on f7
        // 1. e4 e5 2. Bc4 Nc6 3. Qh5 Nf6 4. Qxf7#
        // FEN before 4. Qxf7# :
        // White to move, Qh5 can take f7
        $fenBeforeMate = 'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4';
        $this->game->update([
            'fen' => $fenBeforeMate,
            'turn' => 'white',
            'pgn' => '1. e4 e5 2. Bc4 Nc6 3. Qh5 Nf6',
        ]);

        $response = $this->actingAs($this->whitePlayer)->postJson("/api/games/{$this->game->code}/move", [
            'from' => 'h5',
            'to' => 'f7',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'move' => ['san' => 'Qxf7#'],
                'engine' => [
                    'is_checkmate' => true,
                    'is_check' => true,
                ],
            ]);

        $this->game->refresh();
        $this->assertEquals('completed', $this->game->status);
        $this->assertEquals($this->whitePlayer->id, $this->game->winner_id);
        $this->assertEquals('checkmate', $this->game->end_reason);
    }

    public function test_player_can_resign(): void
    {
        Event::fake([GameEnded::class]);

        $response = $this->actingAs($this->whitePlayer)->postJson("/api/games/{$this->game->code}/resign");

        $response->assertStatus(200);

        $this->game->refresh();
        $this->assertEquals('completed', $this->game->status);
        $this->assertEquals($this->blackPlayer->id, $this->game->winner_id);
        $this->assertEquals('resignation', $this->game->end_reason);

        Event::assertDispatched(GameEnded::class);
    }

    public function test_draw_offer_and_acceptance_flow(): void
    {
        Event::fake([GameEnded::class]);

        // White offers draw
        $offerRes = $this->actingAs($this->whitePlayer)->postJson("/api/games/{$this->game->code}/draw-offer");
        $offerRes->assertStatus(200);

        $this->game->refresh();
        $this->assertEquals($this->whitePlayer->id, $this->game->draw_offered_by);

        // Black accepts draw
        $acceptRes = $this->actingAs($this->blackPlayer)->postJson("/api/games/{$this->game->code}/draw-accept");
        $acceptRes->assertStatus(200);

        $this->game->refresh();
        $this->assertEquals('completed', $this->game->status);
        $this->assertNull($this->game->winner_id);
        $this->assertEquals('draw_agreement', $this->game->end_reason);

        Event::assertDispatched(GameEnded::class);
    }

    public function test_draw_offer_can_be_declined(): void
    {
        // White offers draw
        $this->actingAs($this->whitePlayer)->postJson("/api/games/{$this->game->code}/draw-offer");

        // Black declines
        $declineRes = $this->actingAs($this->blackPlayer)->postJson("/api/games/{$this->game->code}/draw-decline");
        $declineRes->assertStatus(200);

        $this->game->refresh();
        $this->assertNull($this->game->draw_offered_by);
        $this->assertEquals('in_progress', $this->game->status);
    }

    public function test_timeout_claim_when_opponent_time_expired(): void
    {
        Event::fake([GameEnded::class]);

        // White turn, but White has 0 seconds remaining
        $this->game->update([
            'white_time_remaining' => 5,
            'turn' => 'white',
            'last_move_at' => now()->subSeconds(10), // 10 seconds elapsed > 5 seconds
        ]);

        $response = $this->actingAs($this->blackPlayer)->postJson("/api/games/{$this->game->code}/timeout-claim");

        $response->assertStatus(200);

        $this->game->refresh();
        $this->assertEquals('completed', $this->game->status);
        $this->assertEquals($this->blackPlayer->id, $this->game->winner_id);
        $this->assertEquals('timeout', $this->game->end_reason);

        Event::assertDispatched(GameEnded::class);
    }
}
