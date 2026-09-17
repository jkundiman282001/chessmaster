<?php

namespace App\Services\Chess;

class ChessBot
{
    // Piece Base Values in Centipawns
    public const PIECE_VALUES = [
        'p' => 100,
        'n' => 320,
        'b' => 330,
        'r' => 500,
        'q' => 900,
        'k' => 20000,
    ];

    // Piece-Square Tables (From White's perspective: row 0 = rank 8, row 7 = rank 1)
    // For Black pieces, we flip the row: (7 - row).
    protected const PAWN_PST = [
        [ 0,  0,  0,  0,  0,  0,  0,  0],
        [50, 50, 50, 50, 50, 50, 50, 50],
        [10, 10, 20, 30, 30, 20, 10, 10],
        [ 5,  5, 10, 25, 25, 10,  5,  5],
        [ 0,  0,  0, 20, 20,  0,  0,  0],
        [ 5, -5,-10,  0,  0,-10, -5,  5],
        [ 5, 10, 10,-20,-20, 10, 10,  5],
        [ 0,  0,  0,  0,  0,  0,  0,  0],
    ];

    protected const KNIGHT_PST = [
        [-50,-40,-30,-30,-30,-30,-40,-50],
        [-40,-20,  0,  0,  0,  0,-20,-40],
        [-30,  0, 10, 15, 15, 10,  0,-30],
        [-30,  5, 15, 20, 20, 15,  5,-30],
        [-30,  0, 15, 20, 20, 15,  0,-30],
        [-30,  5, 10, 15, 15, 10,  5,-30],
        [-40,-20,  0,  5,  5,  0,-20,-40],
        [-50,-40,-30,-30,-30,-30,-40,-50],
    ];

    protected const BISHOP_PST = [
        [-20,-10,-10,-10,-10,-10,-10,-20],
        [-10,  0,  0,  0,  0,  0,  0,-10],
        [-10,  0,  5, 10, 10,  5,  0,-10],
        [-10,  5,  5, 10, 10,  5,  5,-10],
        [-10,  0, 10, 10, 10, 10,  0,-10],
        [-10, 10, 10, 10, 10, 10, 10,-10],
        [-10,  5,  0,  0,  0,  0,  5,-10],
        [-20,-10,-10,-10,-10,-10,-10,-20],
    ];

    protected const ROOK_PST = [
        [ 0,  0,  0,  0,  0,  0,  0,  0],
        [ 5, 10, 10, 10, 10, 10, 10,  5],
        [-5,  0,  0,  0,  0,  0,  0, -5],
        [-5,  0,  0,  0,  0,  0,  0, -5],
        [-5,  0,  0,  0,  0,  0,  0, -5],
        [-5,  0,  0,  0,  0,  0,  0, -5],
        [-5,  0,  0,  0,  0,  0,  0, -5],
        [ 0,  0,  0,  5,  5,  0,  0,  0],
    ];

    protected const QUEEN_PST = [
        [-20,-10,-10, -5, -5,-10,-10,-20],
        [-10,  0,  0,  0,  0,  0,  0,-10],
        [-10,  0,  5,  5,  5,  5,  0,-10],
        [ -5,  0,  5,  5,  5,  5,  0, -5],
        [  0,  0,  5,  5,  5,  5,  0, -5],
        [-10,  5,  5,  5,  5,  5,  0,-10],
        [-10,  0,  5,  0,  0,  0,  0,-10],
        [-20,-10,-10, -5, -5,-10,-10,-20],
    ];

    protected const KING_MIDDLE_PST = [
        [-30,-40,-40,-50,-50,-40,-40,-30],
        [-30,-40,-40,-50,-50,-40,-40,-30],
        [-30,-40,-40,-50,-50,-40,-40,-30],
        [-30,-40,-40,-50,-50,-40,-40,-30],
        [-20,-30,-30,-40,-40,-30,-30,-20],
        [-10,-20,-20,-20,-20,-20,-20,-10],
        [ 20, 20,  0,  0,  0,  0, 20, 20],
        [ 20, 30, 10,  0,  0, 10, 30, 20],
    ];

    /**
     * Choose the best move for the current position and difficulty.
     *
     * @return array{from: string, to: string, promotion: ?string}|null
     */
    public static function chooseMove(string $fen, string $difficulty = 'medium'): ?array
    {
        $state = ChessEngine::parseFen($fen);
        $legalMoves = ChessEngine::generateLegalMoves($state);

        if (empty($legalMoves)) {
            return null;
        }

        $difficulty = strtolower($difficulty);
        $selectedMove = match ($difficulty) {
            'easy' => self::chooseEasyMove($state, $legalMoves),
            'hard' => self::chooseMinimaxMove($state, $legalMoves, depth: 3, addJitter: false),
            default => self::chooseMinimaxMove($state, $legalMoves, depth: 2, addJitter: true),
        };

        if ($selectedMove === null) {
            $selectedMove = $legalMoves[array_rand($legalMoves)];
        }

        [$fromR, $fromF] = $selectedMove['from'];
        [$toR, $toF] = $selectedMove['to'];

        return [
            'from' => ChessEngine::indicesToSquare($fromR, $fromF),
            'to' => ChessEngine::indicesToSquare($toR, $toF),
            'promotion' => $selectedMove['promotion'] ?? ($selectedMove['promotion'] ?? null),
        ];
    }

    /**
     * Easy bot logic:
     * - 30% chance to look for a capturing move or checkmate.
     * - 70% chance to pick a random legal move (with slight preference for non-blunder moves).
     */
    protected static function chooseEasyMove(array $state, array $legalMoves): array
    {
        $turn = $state['turn'];
        $captures = [];

        foreach ($legalMoves as $move) {
            [$toR, $toF] = $move['to'];
            $destPiece = $state['board'][$toR][$toF];
            if ($destPiece !== null || ! empty($move['is_en_passant'])) {
                $captures[] = $move;
            }
        }

        // 35% chance to play a capture if one exists
        if (! empty($captures) && mt_rand(1, 100) <= 35) {
            return $captures[array_rand($captures)];
        }

        // Otherwise pick any legal move
        return $legalMoves[array_rand($legalMoves)];
    }

    /**
     * Minimax move search with Alpha-Beta pruning.
     */
    protected static function chooseMinimaxMove(array $state, array $legalMoves, int $depth, bool $addJitter): ?array
    {
        $isWhite = $state['turn'] === 'w';
        $bestScore = $isWhite ? -9999999 : 9999999;
        $bestMoves = [];

        // Sort moves to optimize alpha-beta pruning (captures first)
        $legalMoves = self::orderMoves($state, $legalMoves);

        $alpha = -9999999;
        $beta = 9999999;

        foreach ($legalMoves as $move) {
            $nextState = ChessEngine::applyMoveToState($state, $move);
            $score = self::minimax($nextState, $depth - 1, $alpha, $beta, ! $isWhite);

            if ($addJitter) {
                // Add tiny jitter (+/- 10 points) for human-like variety in medium
                $score += mt_rand(-10, 10);
            }

            if ($isWhite) {
                if ($score > $bestScore) {
                    $bestScore = $score;
                    $bestMoves = [$move];
                } elseif ($score === $bestScore) {
                    $bestMoves[] = $move;
                }
                $alpha = max($alpha, $bestScore);
            } else {
                if ($score < $bestScore) {
                    $bestScore = $score;
                    $bestMoves = [$move];
                } elseif ($score === $bestScore) {
                    $bestMoves[] = $move;
                }
                $beta = min($beta, $bestScore);
            }

            if ($beta <= $alpha) {
                break;
            }
        }

        if (empty($bestMoves)) {
            return null;
        }

        return $bestMoves[array_rand($bestMoves)];
    }

    /**
     * Minimax recursive evaluation with alpha-beta pruning.
     */
    protected static function minimax(array $state, int $depth, int $alpha, int $beta, bool $isMaximizing): int
    {
        $turn = $state['turn'];
        $legalMoves = ChessEngine::generateLegalMoves($state);

        // Terminal state check
        if (empty($legalMoves)) {
            $inCheck = ChessEngine::isInCheck($state['board'], $turn);
            if ($inCheck) {
                // Checkmate: return large score adjusted by depth (prefer faster mate)
                return $turn === 'w' ? (-100000 - $depth) : (100000 + $depth);
            }
            // Stalemate
            return 0;
        }

        // Draw by 50-move rule
        if ($state['half_moves'] >= 100) {
            return 0;
        }

        if ($depth <= 0) {
            return self::evaluatePosition($state);
        }

        $legalMoves = self::orderMoves($state, $legalMoves);

        if ($isMaximizing) {
            $maxEval = -9999999;
            foreach ($legalMoves as $move) {
                $nextState = ChessEngine::applyMoveToState($state, $move);
                $eval = self::minimax($nextState, $depth - 1, $alpha, $beta, false);
                $maxEval = max($maxEval, $eval);
                $alpha = max($alpha, $eval);
                if ($beta <= $alpha) {
                    break;
                }
            }
            return $maxEval;
        } else {
            $minEval = 9999999;
            foreach ($legalMoves as $move) {
                $nextState = ChessEngine::applyMoveToState($state, $move);
                $eval = self::minimax($nextState, $depth - 1, $alpha, $beta, true);
                $minEval = min($minEval, $eval);
                $beta = min($beta, $eval);
                if ($beta <= $alpha) {
                    break;
                }
            }
            return $minEval;
        }
    }

    /**
     * Static position evaluation: positive for White advantage, negative for Black advantage.
     */
    public static function evaluatePosition(array $state): int
    {
        $board = $state['board'];
        $score = 0;

        for ($r = 0; $r < 8; $r++) {
            for ($f = 0; $f < 8; $f++) {
                $p = $board[$r][$f];
                if ($p === null) {
                    continue;
                }

                $isWhite = ctype_upper($p);
                $type = strtolower($p);
                $val = self::PIECE_VALUES[$type] ?? 0;
                $pstVal = self::getPstValue($type, $r, $f, $isWhite);

                $totalPieceVal = $val + $pstVal;

                if ($isWhite) {
                    $score += $totalPieceVal;
                } else {
                    $score -= $totalPieceVal;
                }
            }
        }

        return $score;
    }

    /**
     * Look up piece-square value.
     */
    protected static function getPstValue(string $type, int $r, int $f, bool $isWhite): int
    {
        // For black pieces, flip the rank coordinate
        $lookupR = $isWhite ? $r : (7 - $r);

        return match ($type) {
            'p' => self::PAWN_PST[$lookupR][$f] ?? 0,
            'n' => self::KNIGHT_PST[$lookupR][$f] ?? 0,
            'b' => self::BISHOP_PST[$lookupR][$f] ?? 0,
            'r' => self::ROOK_PST[$lookupR][$f] ?? 0,
            'q' => self::QUEEN_PST[$lookupR][$f] ?? 0,
            'k' => self::KING_MIDDLE_PST[$lookupR][$f] ?? 0,
            default => 0,
        };
    }

    /**
     * Order moves to improve alpha-beta pruning cutoff rate.
     * Captures and promotions first.
     */
    protected static function orderMoves(array $state, array $moves): array
    {
        $board = $state['board'];

        usort($moves, function (array $a, array $b) use ($board) {
            $scoreA = 0;
            $scoreB = 0;

            // Give priority to promotions
            if (! empty($a['promotion'])) $scoreA += 900;
            if (! empty($b['promotion'])) $scoreB += 900;

            // MVV-LVA (Most Valuable Victim - Least Valuable Attacker) heuristic
            $destA = $board[$a['to'][0]][$a['to'][1]] ?? null;
            if ($destA !== null) {
                $victimValA = self::PIECE_VALUES[strtolower($destA)] ?? 0;
                $attackerA = $board[$a['from'][0]][$a['from'][1]] ?? null;
                $attackerValA = $attackerA ? (self::PIECE_VALUES[strtolower($attackerA)] ?? 0) : 0;
                $scoreA += ($victimValA * 10) - $attackerValA;
            }

            $destB = $board[$b['to'][0]][$b['to'][1]] ?? null;
            if ($destB !== null) {
                $victimValB = self::PIECE_VALUES[strtolower($destB)] ?? 0;
                $attackerB = $board[$b['from'][0]][$b['from'][1]] ?? null;
                $attackerValB = $attackerB ? (self::PIECE_VALUES[strtolower($attackerB)] ?? 0) : 0;
                $scoreB += ($victimValB * 10) - $attackerValB;
            }

            return $scoreB <=> $scoreA;
        });

        return $moves;
    }
}
