<?php

namespace App\Services\Chess;

class ChessEngine
{
    public const STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

    /**
     * Files: 0 to 7 -> a to h
     * Ranks: 0 to 7 -> 8 down to 1 (array row 0 is rank 8, row 7 is rank 1)
     */
    public static function squareToIndices(string $sq): array
    {
        $sq = strtolower(trim($sq));
        $file = ord($sq[0]) - ord('a'); // 0..7
        $rank = 8 - (int) $sq[1];        // 0..7
        return [$rank, $file];
    }

    public static function indicesToSquare(int $rank, int $file): string
    {
        return chr(ord('a') + $file) . (8 - $rank);
    }

    /**
     * Parse FEN into an associative state array.
     */
    public static function parseFen(string $fen): array
    {
        $parts = explode(' ', trim($fen));
        $placement = $parts[0] ?? '';
        $turn = $parts[1] ?? 'w';
        $castling = $parts[2] ?? '-';
        $enPassant = $parts[3] ?? '-';
        $halfMoves = isset($parts[4]) ? (int) $parts[4] : 0;
        $fullMoves = isset($parts[5]) ? (int) $parts[5] : 1;

        $board = [];
        $rows = explode('/', $placement);
        for ($r = 0; $r < 8; $r++) {
            $rowStr = $rows[$r] ?? '8';
            $boardRow = [];
            $len = strlen($rowStr);
            for ($i = 0; $i < $len; $i++) {
                $char = $rowStr[$i];
                if (ctype_digit($char)) {
                    $emptyCount = (int) $char;
                    for ($e = 0; $e < $emptyCount; $e++) {
                        $boardRow[] = null;
                    }
                } else {
                    $boardRow[] = $char;
                }
            }
            // Ensure 8 columns
            while (count($boardRow) < 8) {
                $boardRow[] = null;
            }
            $board[] = $boardRow;
        }

        return [
            'board' => $board,
            'turn' => $turn,
            'castling' => $castling,
            'en_passant' => $enPassant,
            'half_moves' => $halfMoves,
            'full_moves' => $fullMoves,
        ];
    }

    /**
     * Render board state back to a standard FEN string.
     */
    public static function renderFen(array $state): string
    {
        $board = $state['board'];
        $rows = [];

        for ($r = 0; $r < 8; $r++) {
            $empty = 0;
            $rowStr = '';
            for ($c = 0; $c < 8; $c++) {
                $p = $board[$r][$c];
                if ($p === null) {
                    $empty++;
                } else {
                    if ($empty > 0) {
                        $rowStr .= $empty;
                        $empty = 0;
                    }
                    $rowStr .= $p;
                }
            }
            if ($empty > 0) {
                $rowStr .= $empty;
            }
            $rows[] = $rowStr;
        }

        return implode('/', $rows) . ' ' .
            $state['turn'] . ' ' .
            ($state['castling'] ?: '-') . ' ' .
            ($state['en_passant'] ?: '-') . ' ' .
            $state['half_moves'] . ' ' .
            $state['full_moves'];
    }

    /**
     * Determine if a given square is attacked by any piece of the attacking color.
     */
    public static function isSquareAttacked(array $board, int $targetR, int $targetF, string $byColor): bool
    {
        // 1. Pawn attacks
        $pawnP = $byColor === 'w' ? 'P' : 'p';
        $pawnDir = $byColor === 'w' ? 1 : -1; // White attacks upwards (r - 1), so attacker is at r + 1
        $attackerR = $targetR + $pawnDir;
        if ($attackerR >= 0 && $attackerR < 8) {
            if ($targetF - 1 >= 0 && $board[$attackerR][$targetF - 1] === $pawnP) {
                return true;
            }
            if ($targetF + 1 < 8 && $board[$attackerR][$targetF + 1] === $pawnP) {
                return true;
            }
        }

        // 2. Knight attacks
        $knightP = $byColor === 'w' ? 'N' : 'n';
        $knightOffsets = [
            [-2, -1], [-2, 1], [-1, -2], [-1, 2],
            [1, -2], [1, 2], [2, -1], [2, 1]
        ];
        foreach ($knightOffsets as [$dr, $df]) {
            $nr = $targetR + $dr;
            $nf = $targetF + $df;
            if ($nr >= 0 && $nr < 8 && $nf >= 0 && $nf < 8) {
                if ($board[$nr][$nf] === $knightP) {
                    return true;
                }
            }
        }

        // 3. King attacks (adjacent squares)
        $kingP = $byColor === 'w' ? 'K' : 'k';
        for ($dr = -1; $dr <= 1; $dr++) {
            for ($df = -1; $df <= 1; $df++) {
                if ($dr === 0 && $df === 0) continue;
                $kr = $targetR + $dr;
                $kf = $targetF + $df;
                if ($kr >= 0 && $kr < 8 && $kf >= 0 && $kf < 8) {
                    if ($board[$kr][$kf] === $kingP) {
                        return true;
                    }
                }
            }
        }

        // 4. Sliding pieces: Orthogonal (Rook / Queen)
        $orthogonalRays = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        $rookP = $byColor === 'w' ? 'R' : 'r';
        $queenP = $byColor === 'w' ? 'Q' : 'q';
        foreach ($orthogonalRays as [$dr, $df]) {
            $r = $targetR + $dr;
            $f = $targetF + $df;
            while ($r >= 0 && $r < 8 && $f >= 0 && $f < 8) {
                $p = $board[$r][$f];
                if ($p !== null) {
                    if ($p === $rookP || $p === $queenP) {
                        return true;
                    }
                    break; // Blocked
                }
                $r += $dr;
                $f += $df;
            }
        }

        // 5. Sliding pieces: Diagonal (Bishop / Queen)
        $diagonalRays = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
        $bishopP = $byColor === 'w' ? 'B' : 'b';
        foreach ($diagonalRays as [$dr, $df]) {
            $r = $targetR + $dr;
            $f = $targetF + $df;
            while ($r >= 0 && $r < 8 && $f >= 0 && $f < 8) {
                $p = $board[$r][$f];
                if ($p !== null) {
                    if ($p === $bishopP || $p === $queenP) {
                        return true;
                    }
                    break; // Blocked
                }
                $r += $dr;
                $f += $df;
            }
        }

        return false;
    }

    /**
     * Determine if king of given color is in check.
     */
    public static function isInCheck(array $board, string $color): bool
    {
        $kingChar = $color === 'w' ? 'K' : 'k';
        $enemyColor = $color === 'w' ? 'b' : 'w';

        // Find king
        $kingR = -1;
        $kingF = -1;
        for ($r = 0; $r < 8; $r++) {
            for ($f = 0; $f < 8; $f++) {
                if ($board[$r][$f] === $kingChar) {
                    $kingR = $r;
                    $kingF = $f;
                    break 2;
                }
            }
        }

        if ($kingR === -1) {
            return false; // Should not happen in valid chess
        }

        return self::isSquareAttacked($board, $kingR, $kingF, $enemyColor);
    }

    /**
     * Generate all pseudo-legal moves for a given position.
     */
    public static function generatePseudoLegalMoves(array $state): array
    {
        $board = $state['board'];
        $turn = $state['turn'];
        $moves = [];

        for ($r = 0; $r < 8; $r++) {
            for ($f = 0; $f < 8; $f++) {
                $p = $board[$r][$f];
                if ($p === null) continue;

                $isWhitePiece = ctype_upper($p);
                if (($turn === 'w' && ! $isWhitePiece) || ($turn === 'b' && $isWhitePiece)) {
                    continue;
                }

                $type = strtolower($p);
                switch ($type) {
                    case 'p':
                        self::generatePawnMoves($state, $r, $f, $moves);
                        break;
                    case 'n':
                        self::generateKnightMoves($state, $r, $f, $moves);
                        break;
                    case 'b':
                        self::generateBishopMoves($state, $r, $f, $moves);
                        break;
                    case 'r':
                        self::generateRookMoves($state, $r, $f, $moves);
                        break;
                    case 'q':
                        self::generateQueenMoves($state, $r, $f, $moves);
                        break;
                    case 'k':
                        self::generateKingMoves($state, $r, $f, $moves);
                        break;
                }
            }
        }

        return $moves;
    }

    protected static function generatePawnMoves(array $state, int $r, int $f, array &$moves): void
    {
        $board = $state['board'];
        $turn = $state['turn'];
        $dir = $turn === 'w' ? -1 : 1;
        $startRow = $turn === 'w' ? 6 : 1;
        $promoRow = $turn === 'w' ? 0 : 7;

        // 1 square forward
        $nextR = $r + $dir;
        if ($nextR >= 0 && $nextR < 8 && $board[$nextR][$f] === null) {
            if ($nextR === $promoRow) {
                foreach (['q', 'r', 'b', 'n'] as $promo) {
                    $moves[] = ['from' => [$r, $f], 'to' => [$nextR, $f], 'promotion' => $promo];
                }
            } else {
                $moves[] = ['from' => [$r, $f], 'to' => [$nextR, $f], 'promotion' => null];

                // 2 squares forward from start rank
                $doubleR = $r + (2 * $dir);
                if ($r === $startRow && $board[$doubleR][$f] === null) {
                    $moves[] = ['from' => [$r, $f], 'to' => [$doubleR, $f], 'promotion' => null];
                }
            }
        }

        // Diagonal captures
        foreach ([-1, 1] as $df) {
            $capF = $f + $df;
            if ($nextR >= 0 && $nextR < 8 && $capF >= 0 && $capF < 8) {
                $target = $board[$nextR][$capF];
                $isEnemy = $target !== null && (
                    ($turn === 'w' && ctype_lower($target)) ||
                    ($turn === 'b' && ctype_upper($target))
                );

                // Regular capture
                if ($isEnemy) {
                    if ($nextR === $promoRow) {
                        foreach (['q', 'r', 'b', 'n'] as $promo) {
                            $moves[] = ['from' => [$r, $f], 'to' => [$nextR, $capF], 'promotion' => $promo];
                        }
                    } else {
                        $moves[] = ['from' => [$r, $f], 'to' => [$nextR, $capF], 'promotion' => null];
                    }
                }

                // En passant
                if ($state['en_passant'] !== '-') {
                    [$epR, $epF] = self::squareToIndices($state['en_passant']);
                    if ($nextR === $epR && $capF === $epF) {
                        $moves[] = ['from' => [$r, $f], 'to' => [$nextR, $capF], 'promotion' => null, 'is_en_passant' => true];
                    }
                }
            }
        }
    }

    protected static function generateKnightMoves(array $state, int $r, int $f, array &$moves): void
    {
        $board = $state['board'];
        $turn = $state['turn'];
        $offsets = [
            [-2, -1], [-2, 1], [-1, -2], [-1, 2],
            [1, -2], [1, 2], [2, -1], [2, 1]
        ];

        foreach ($offsets as [$dr, $df]) {
            $nr = $r + $dr;
            $nf = $f + $df;
            if ($nr >= 0 && $nr < 8 && $nf >= 0 && $nf < 8) {
                $target = $board[$nr][$nf];
                if ($target === null || ($turn === 'w' && ctype_lower($target)) || ($turn === 'b' && ctype_upper($target))) {
                    $moves[] = ['from' => [$r, $f], 'to' => [$nr, $nf], 'promotion' => null];
                }
            }
        }
    }

    protected static function generateRayMoves(array $state, int $r, int $f, array $directions, array &$moves): void
    {
        $board = $state['board'];
        $turn = $state['turn'];

        foreach ($directions as [$dr, $df]) {
            $nr = $r + $dr;
            $nf = $f + $df;
            while ($nr >= 0 && $nr < 8 && $nf >= 0 && $nf < 8) {
                $target = $board[$nr][$nf];
                if ($target === null) {
                    $moves[] = ['from' => [$r, $f], 'to' => [$nr, $nf], 'promotion' => null];
                } else {
                    if (($turn === 'w' && ctype_lower($target)) || ($turn === 'b' && ctype_upper($target))) {
                        $moves[] = ['from' => [$r, $f], 'to' => [$nr, $nf], 'promotion' => null];
                    }
                    break;
                }
                $nr += $dr;
                $nf += $df;
            }
        }
    }

    protected static function generateBishopMoves(array $state, int $r, int $f, array &$moves): void
    {
        self::generateRayMoves($state, $r, $f, [[-1, -1], [-1, 1], [1, -1], [1, 1]], $moves);
    }

    protected static function generateRookMoves(array $state, int $r, int $f, array &$moves): void
    {
        self::generateRayMoves($state, $r, $f, [[-1, 0], [1, 0], [0, -1], [0, 1]], $moves);
    }

    protected static function generateQueenMoves(array $state, int $r, int $f, array &$moves): void
    {
        self::generateRayMoves($state, $r, $f, [
            [-1, 0], [1, 0], [0, -1], [0, 1],
            [-1, -1], [-1, 1], [1, -1], [1, 1]
        ], $moves);
    }

    protected static function generateKingMoves(array $state, int $r, int $f, array &$moves): void
    {
        $board = $state['board'];
        $turn = $state['turn'];

        // Regular 1-square moves
        for ($dr = -1; $dr <= 1; $dr++) {
            for ($df = -1; $df <= 1; $df++) {
                if ($dr === 0 && $df === 0) continue;
                $nr = $r + $dr;
                $nf = $f + $df;
                if ($nr >= 0 && $nr < 8 && $nf >= 0 && $nf < 8) {
                    $target = $board[$nr][$nf];
                    if ($target === null || ($turn === 'w' && ctype_lower($target)) || ($turn === 'b' && ctype_upper($target))) {
                        $moves[] = ['from' => [$r, $f], 'to' => [$nr, $nf], 'promotion' => null];
                    }
                }
            }
        }

        // Castling
        $castling = $state['castling'];
        $enemyColor = $turn === 'w' ? 'b' : 'w';

        if ($turn === 'w' && $r === 7 && $f === 4) {
            // White Kingside (K): e1 to g1
            if (str_contains($castling, 'K') &&
                $board[7][5] === null && $board[7][6] === null &&
                $board[7][7] === 'R' &&
                ! self::isSquareAttacked($board, 7, 4, $enemyColor) &&
                ! self::isSquareAttacked($board, 7, 5, $enemyColor) &&
                ! self::isSquareAttacked($board, 7, 6, $enemyColor)
            ) {
                $moves[] = ['from' => [7, 4], 'to' => [7, 6], 'promotion' => null, 'is_castling' => 'K'];
            }

            // White Queenside (Q): e1 to c1
            if (str_contains($castling, 'Q') &&
                $board[7][1] === null && $board[7][2] === null && $board[7][3] === null &&
                $board[7][0] === 'R' &&
                ! self::isSquareAttacked($board, 7, 4, $enemyColor) &&
                ! self::isSquareAttacked($board, 7, 3, $enemyColor) &&
                ! self::isSquareAttacked($board, 7, 2, $enemyColor)
            ) {
                $moves[] = ['from' => [7, 4], 'to' => [7, 2], 'promotion' => null, 'is_castling' => 'Q'];
            }
        } elseif ($turn === 'b' && $r === 0 && $f === 4) {
            // Black Kingside (k): e8 to g8
            if (str_contains($castling, 'k') &&
                $board[0][5] === null && $board[0][6] === null &&
                $board[0][7] === 'r' &&
                ! self::isSquareAttacked($board, 0, 4, $enemyColor) &&
                ! self::isSquareAttacked($board, 0, 5, $enemyColor) &&
                ! self::isSquareAttacked($board, 0, 6, $enemyColor)
            ) {
                $moves[] = ['from' => [0, 4], 'to' => [0, 6], 'promotion' => null, 'is_castling' => 'k'];
            }

            // Black Queenside (q): e8 to c8
            if (str_contains($castling, 'q') &&
                $board[0][1] === null && $board[0][2] === null && $board[0][3] === null &&
                $board[0][0] === 'r' &&
                ! self::isSquareAttacked($board, 0, 4, $enemyColor) &&
                ! self::isSquareAttacked($board, 0, 3, $enemyColor) &&
                ! self::isSquareAttacked($board, 0, 2, $enemyColor)
            ) {
                $moves[] = ['from' => [0, 4], 'to' => [0, 2], 'promotion' => null, 'is_castling' => 'q'];
            }
        }
    }

    /**
     * Apply move to board state (without checking check legality).
     */
    public static function applyMoveToState(array $state, array $move): array
    {
        $newState = $state;
        $board = $state['board'];
        [$fromR, $fromF] = $move['from'];
        [$toR, $toF] = $move['to'];
        $promo = $move['promotion'] ?? null;

        $piece = $board[$fromR][$fromF];
        $isPawn = strtolower($piece) === 'p';
        $isKing = strtolower($piece) === 'k';
        $captured = $board[$toR][$toF];

        // Clear origin
        $board[$fromR][$fromF] = null;

        // Handle en passant capture
        if ($isPawn && ! empty($move['is_en_passant'])) {
            $capR = $state['turn'] === 'w' ? $toR + 1 : $toR - 1;
            $captured = $board[$capR][$toF];
            $board[$capR][$toF] = null;
        }

        // Handle castling rook movement
        if ($isKing && ! empty($move['is_castling'])) {
            $castle = $move['is_castling'];
            if ($castle === 'K') {
                $board[7][7] = null;
                $board[7][5] = 'R';
            } elseif ($castle === 'Q') {
                $board[7][0] = null;
                $board[7][3] = 'R';
            } elseif ($castle === 'k') {
                $board[0][7] = null;
                $board[0][5] = 'r';
            } elseif ($castle === 'q') {
                $board[0][0] = null;
                $board[0][3] = 'r';
            }
        }

        // Place moved piece (or promoted piece)
        if ($promo !== null) {
            $board[$toR][$toF] = $state['turn'] === 'w' ? strtoupper($promo) : strtolower($promo);
        } else {
            $board[$toR][$toF] = $piece;
        }

        // Update castling rights if king or rook moved or was captured
        $castling = $state['castling'];
        if ($piece === 'K') $castling = str_replace(['K', 'Q'], '', $castling);
        if ($piece === 'k') $castling = str_replace(['k', 'q'], '', $castling);
        if ($piece === 'R' && $fromR === 7 && $fromF === 7) $castling = str_replace('K', '', $castling);
        if ($piece === 'R' && $fromR === 7 && $fromF === 0) $castling = str_replace('Q', '', $castling);
        if ($piece === 'r' && $fromR === 0 && $fromF === 7) $castling = str_replace('k', '', $castling);
        if ($piece === 'r' && $fromR === 0 && $fromF === 0) $castling = str_replace('q', '', $castling);

        if ($captured === 'R' && $toR === 7 && $toF === 7) $castling = str_replace('K', '', $castling);
        if ($captured === 'R' && $toR === 7 && $toF === 0) $castling = str_replace('Q', '', $castling);
        if ($captured === 'r' && $toR === 0 && $toF === 7) $castling = str_replace('k', '', $castling);
        if ($captured === 'r' && $toR === 0 && $toF === 0) $castling = str_replace('q', '', $castling);

        // Update En Passant target
        $newEp = '-';
        if ($isPawn && abs($toR - $fromR) === 2) {
            $epR = ($fromR + $toR) / 2;
            $newEp = self::indicesToSquare((int) $epR, $toF);
        }

        // Turn toggle
        $nextTurn = $state['turn'] === 'w' ? 'b' : 'w';

        // Clocks
        $halfMoves = ($isPawn || $captured !== null) ? 0 : $state['half_moves'] + 1;
        $fullMoves = $state['turn'] === 'b' ? $state['full_moves'] + 1 : $state['full_moves'];

        $newState['board'] = $board;
        $newState['turn'] = $nextTurn;
        $newState['castling'] = $castling ?: '-';
        $newState['en_passant'] = $newEp;
        $newState['half_moves'] = $halfMoves;
        $newState['full_moves'] = $fullMoves;

        return $newState;
    }

    /**
     * Generate strictly legal moves (pseudo-legal moves that do not leave king in check).
     */
    public static function generateLegalMoves(array $state): array
    {
        $pseudo = self::generatePseudoLegalMoves($state);
        $legal = [];
        $turn = $state['turn'];

        foreach ($pseudo as $m) {
            $nextState = self::applyMoveToState($state, $m);
            if (! self::isInCheck($nextState['board'], $turn)) {
                $legal[] = $m;
            }
        }

        return $legal;
    }

    /**
     * Authoritatively validate and execute a chess move from FEN.
     *
     * @return array [
     *   'valid' => bool,
     *   'error' => ?string,
     *   'new_fen' => ?string,
     *   'san' => ?string,
     *   'is_check' => bool,
     *   'is_checkmate' => bool,
     *   'is_stalemate' => bool,
     *   'is_draw' => bool,
     * ]
     */
    public static function validateAndMakeMove(string $fen, string $fromSq, string $toSq, ?string $promotion = null): array
    {
        $fromSq = strtolower(trim($fromSq));
        $toSq = strtolower(trim($toSq));
        $promotion = $promotion ? strtolower(trim($promotion)) : null;

        $state = self::parseFen($fen);
        [$fR, $fF] = self::squareToIndices($fromSq);
        [$tR, $tF] = self::squareToIndices($toSq);

        $piece = $state['board'][$fR][$fF] ?? null;
        if ($piece === null) {
            return ['valid' => false, 'error' => "No piece at square {$fromSq}."];
        }

        $isWhitePiece = ctype_upper($piece);
        if (($state['turn'] === 'w' && ! $isWhitePiece) || ($state['turn'] === 'b' && $isWhitePiece)) {
            return ['valid' => false, 'error' => "It is not {$state['turn']}'s piece."];
        }

        $legalMoves = self::generateLegalMoves($state);
        $matchedMove = null;

        foreach ($legalMoves as $m) {
            if ($m['from'][0] === $fR && $m['from'][1] === $fF &&
                $m['to'][0] === $tR && $m['to'][1] === $tF
            ) {
                // If promotion move, match promotion piece
                if ($m['promotion'] !== null) {
                    $reqPromo = $promotion ?: 'q';
                    if ($m['promotion'] === $reqPromo) {
                        $matchedMove = $m;
                        break;
                    }
                } else {
                    $matchedMove = $m;
                    break;
                }
            }
        }

        if ($matchedMove === null) {
            return ['valid' => false, 'error' => "Illegal move {$fromSq} to {$toSq}."];
        }

        // Apply move
        $nextState = self::applyMoveToState($state, $matchedMove);
        $newFen = self::renderFen($nextState);

        // Check conditions for opponent
        $nextTurn = $nextState['turn'];
        $isCheck = self::isInCheck($nextState['board'], $nextTurn);
        $opponentLegalMoves = self::generateLegalMoves($nextState);
        $hasNoMoves = count($opponentLegalMoves) === 0;

        $isCheckmate = $isCheck && $hasNoMoves;
        $isStalemate = ! $isCheck && $hasNoMoves;
        $isDraw = $isStalemate || $nextState['half_moves'] >= 100;

        // Formulate Standard Algebraic Notation (SAN)
        $san = self::buildSan($state, $matchedMove, $isCheck, $isCheckmate);

        return [
            'valid' => true,
            'new_fen' => $newFen,
            'san' => $san,
            'is_check' => $isCheck,
            'is_checkmate' => $isCheckmate,
            'is_stalemate' => $isStalemate,
            'is_draw' => $isDraw,
        ];
    }

    /**
     * Build standard algebraic notation (e.g. e4, Nf3, O-O, exd5, Qxf7#)
     */
    protected static function buildSan(array $state, array $move, bool $isCheck, bool $isCheckmate): string
    {
        [$fromR, $fromF] = $move['from'];
        [$toR, $toF] = $move['to'];
        $board = $state['board'];
        $piece = $board[$fromR][$fromF];
        $isPawn = strtolower($piece) === 'p';
        $fromSq = self::indicesToSquare($fromR, $fromF);
        $toSq = self::indicesToSquare($toR, $toF);

        // Castling notation
        if (! empty($move['is_castling'])) {
            $c = $move['is_castling'];
            $san = ($c === 'K' || $c === 'k') ? 'O-O' : 'O-O-O';
            if ($isCheckmate) return $san . '#';
            if ($isCheck) return $san . '+';
            return $san;
        }

        $san = '';
        if ($isPawn) {
            $isCapture = ($fromF !== $toF);
            if ($isCapture) {
                $san .= $fromSq[0] . 'x' . $toSq;
            } else {
                $san .= $toSq;
            }
            if (! empty($move['promotion'])) {
                $san .= '=' . strtoupper($move['promotion']);
            }
        } else {
            $pieceChar = strtoupper($piece);
            $isCapture = $board[$toR][$toF] !== null;
            $san .= $pieceChar;
            if ($isCapture) {
                $san .= 'x';
            }
            $san .= $toSq;
        }

        if ($isCheckmate) {
            $san .= '#';
        } elseif ($isCheck) {
            $san .= '+';
        }

        return $san;
    }
}
