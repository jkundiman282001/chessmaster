<?php

namespace Tests\Unit;

use App\Services\Chess\ChessEngine;
use PHPUnit\Framework\TestCase;

class ChessEngineTest extends TestCase
{
    public function test_starting_fen_parses_correctly(): void
    {
        $state = ChessEngine::parseFen(ChessEngine::STARTING_FEN);

        $this->assertEquals('w', $state['turn']);
        $this->assertEquals('KQkq', $state['castling']);
        $this->assertEquals('-', $state['en_passant']);
        $this->assertEquals(0, $state['half_moves']);
        $this->assertEquals(1, $state['full_moves']);

        // Check pieces on board
        $this->assertEquals('R', $state['board'][7][0]);
        $this->assertEquals('K', $state['board'][7][4]);
        $this->assertEquals('k', $state['board'][0][4]);
        $this->assertEquals('p', $state['board'][1][0]);
        $this->assertNull($state['board'][3][3]);
    }

    public function test_renders_starting_fen_roundtrip(): void
    {
        $state = ChessEngine::parseFen(ChessEngine::STARTING_FEN);
        $rendered = ChessEngine::renderFen($state);

        $this->assertEquals(ChessEngine::STARTING_FEN, $rendered);
    }

    public function test_valid_opening_move_e2_to_e4(): void
    {
        $result = ChessEngine::validateAndMakeMove(ChessEngine::STARTING_FEN, 'e2', 'e4');

        $this->assertTrue($result['valid']);
        $this->assertEquals('e4', $result['san']);
        $this->assertFalse($result['is_check']);
        $this->assertFalse($result['is_checkmate']);
        $this->assertStringContainsString('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1', $result['new_fen']);
    }

    public function test_rejects_illegal_move_for_knight(): void
    {
        // Moving knight to square it cannot reach from starting position
        $result = ChessEngine::validateAndMakeMove(ChessEngine::STARTING_FEN, 'b1', 'e4');

        $this->assertFalse($result['valid']);
        $this->assertNotEmpty($result['error']);
    }

    public function test_rejects_moving_opponent_piece(): void
    {
        // White to move, trying to move black pawn e7
        $result = ChessEngine::validateAndMakeMove(ChessEngine::STARTING_FEN, 'e7', 'e5');

        $this->assertFalse($result['valid']);
        $this->assertStringContainsString("not w's piece", $result['error']);
    }

    public function test_scholars_mate_checkmate(): void
    {
        // 1. e4 e5
        $r1 = ChessEngine::validateAndMakeMove(ChessEngine::STARTING_FEN, 'e2', 'e4');
        $this->assertTrue($r1['valid']);

        $r2 = ChessEngine::validateAndMakeMove($r1['new_fen'], 'e7', 'e5');
        $this->assertTrue($r2['valid']);

        // 2. Bc4 Nc6
        $r3 = ChessEngine::validateAndMakeMove($r2['new_fen'], 'f1', 'c4');
        $this->assertTrue($r3['valid']);

        $r4 = ChessEngine::validateAndMakeMove($r3['new_fen'], 'b8', 'c6');
        $this->assertTrue($r4['valid']);

        // 3. Qh5 Nf6??
        $r5 = ChessEngine::validateAndMakeMove($r4['new_fen'], 'd1', 'h5');
        $this->assertTrue($r5['valid']);

        $r6 = ChessEngine::validateAndMakeMove($r5['new_fen'], 'g8', 'f6');
        $this->assertTrue($r6['valid']);

        // 4. Qxf7#
        $r7 = ChessEngine::validateAndMakeMove($r6['new_fen'], 'h5', 'f7');
        $this->assertTrue($r7['valid']);
        $this->assertTrue($r7['is_check']);
        $this->assertTrue($r7['is_checkmate']);
        $this->assertEquals('Qxf7#', $r7['san']);
    }

    public function test_kingside_castling(): void
    {
        // Position where white can castle kingside: e1, f1, g1, h1
        // Clear f1 and g1
        $fen = 'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4';

        $result = ChessEngine::validateAndMakeMove($fen, 'e1', 'g1');
        $this->assertTrue($result['valid']);
        $this->assertEquals('O-O', $result['san']);

        $state = ChessEngine::parseFen($result['new_fen']);
        $this->assertEquals('K', $state['board'][7][6]); // g1
        $this->assertEquals('R', $state['board'][7][5]); // f1
        $this->assertNull($state['board'][7][4]);         // e1
        $this->assertNull($state['board'][7][7]);         // h1
        $this->assertStringNotContainsString('K', $state['castling']);
    }

    public function test_en_passant(): void
    {
        // White pawn on e5, Black pawn advances d7 -> d5
        $fenBefore = 'rnbqkbnr/pppppppp/8/4P3/8/8/PPPP1PPP/RNBQKBNR b KQkq - 0 2';
        $moveD5 = ChessEngine::validateAndMakeMove($fenBefore, 'd7', 'd5');
        $this->assertTrue($moveD5['valid']);

        $stateAfterD5 = ChessEngine::parseFen($moveD5['new_fen']);
        $this->assertEquals('d6', $stateAfterD5['en_passant']);

        // White captures exd6 e.p.
        $moveEp = ChessEngine::validateAndMakeMove($moveD5['new_fen'], 'e5', 'd6');
        $this->assertTrue($moveEp['valid']);
        $this->assertEquals('exd6', $moveEp['san']);

        $stateAfterEp = ChessEngine::parseFen($moveEp['new_fen']);
        $this->assertEquals('P', $stateAfterEp['board'][2][3]); // d6
        $this->assertNull($stateAfterEp['board'][3][3]);        // d5 (captured black pawn is gone!)
        $this->assertNull($stateAfterEp['board'][3][4]);        // e5
    }

    public function test_pawn_promotion(): void
    {
        // White pawn on a7 about to promote to a8
        $fen = '8/P7/8/8/8/8/8/4K2k w - - 0 1';
        $result = ChessEngine::validateAndMakeMove($fen, 'a7', 'a8', 'q');

        $this->assertTrue($result['valid']);
        $this->assertEquals('a8=Q+', $result['san']); // checks enemy king on h1
        $state = ChessEngine::parseFen($result['new_fen']);
        $this->assertEquals('Q', $state['board'][0][0]);
        $this->assertTrue($result['is_check']);
    }

    public function test_stalemate_detection(): void
    {
        // Classic stalemate position: Black king on a8, White queen on c7, White king on c6
        // Black has no legal moves and is NOT in check
        $fen = 'k7/2Q5/2K5/8/8/8/8/8 b - - 0 1';

        $state = ChessEngine::parseFen($fen);
        $this->assertFalse(ChessEngine::isInCheck($state['board'], 'b'));
        $legalMoves = ChessEngine::generateLegalMoves($state);
        $this->assertEmpty($legalMoves);

        // Making a move that results in stalemate:
        // White king on c6, Black king on a8, White Queen on b6. White moves Qb6 to c7.
        $fenBefore = 'k7/8/1QK5/8/8/8/8/8 w - - 0 1';
        $result = ChessEngine::validateAndMakeMove($fenBefore, 'b6', 'c7');

        $this->assertTrue($result['valid']);
        $this->assertFalse($result['is_check']);
        $this->assertTrue($result['is_stalemate']);
        $this->assertTrue($result['is_draw']);
    }
}
