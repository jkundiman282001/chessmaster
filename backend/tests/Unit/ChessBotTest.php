<?php

namespace Tests\Unit;

use App\Services\Chess\ChessBot;
use App\Services\Chess\ChessEngine;
use PHPUnit\Framework\TestCase;

class ChessBotTest extends TestCase
{
    public function test_bot_selects_legal_opening_move_for_white(): void
    {
        $move = ChessBot::chooseMove(ChessEngine::STARTING_FEN, 'easy');

        $this->assertNotNull($move);
        $this->assertArrayHasKey('from', $move);
        $this->assertArrayHasKey('to', $move);

        $result = ChessEngine::validateAndMakeMove(ChessEngine::STARTING_FEN, $move['from'], $move['to']);
        $this->assertTrue($result['valid']);
    }

    public function test_bot_selects_legal_opening_move_for_black(): void
    {
        // 1. e4 played by white
        $fenAfterE4 = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1';
        $move = ChessBot::chooseMove($fenAfterE4, 'medium');

        $this->assertNotNull($move);
        $result = ChessEngine::validateAndMakeMove($fenAfterE4, $move['from'], $move['to']);
        $this->assertTrue($result['valid']);
    }

    public function test_hard_bot_finds_checkmate_in_one(): void
    {
        // Scholar's mate threat: White Q at h5, B at c4. Black king at e8.
        // Move Qxf7# is checkmate!
        // FEN: r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4
        $scholarFen = 'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4';

        $move = ChessBot::chooseMove($scholarFen, 'hard');

        $this->assertNotNull($move);
        $this->assertEquals('h5', $move['from']);
        $this->assertEquals('f7', $move['to']);

        $result = ChessEngine::validateAndMakeMove($scholarFen, $move['from'], $move['to']);
        $this->assertTrue($result['valid']);
        $this->assertTrue($result['is_checkmate']);
    }

    public function test_hard_bot_defends_or_captures_hanging_queen(): void
    {
        // Hanging queen on d5, black to move can take with pawn or knight
        // FEN: r1bqkbnr/ppp1pppp/2n5/3Q4/8/8/PPPPPPPP/RNB1KBNR b KQkq - 1 2
        $hangingQueenFen = 'r1bqkbnr/ppp1pppp/2n5/3Q4/8/8/PPPPPPPP/RNB1KBNR b KQkq - 1 2';

        $move = ChessBot::chooseMove($hangingQueenFen, 'hard');

        $this->assertNotNull($move);
        // The bot should take the free queen (either Qxd5 or Nxd5)
        $this->assertEquals('d5', $move['to']);
    }

    public function test_evaluate_position_is_balanced_at_start(): void
    {
        $state = ChessEngine::parseFen(ChessEngine::STARTING_FEN);
        $eval = ChessBot::evaluatePosition($state);

        $this->assertEquals(0, $eval);
    }

    public function test_evaluate_position_favors_extra_material(): void
    {
        // White is up a queen
        $fenWhiteUpQueen = 'rnb1kbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
        $state = ChessEngine::parseFen($fenWhiteUpQueen);
        $eval = ChessBot::evaluatePosition($state);

        $this->assertGreaterThan(500, $eval);
    }
}
