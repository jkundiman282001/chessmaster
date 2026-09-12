import React, { useState, useMemo, useCallback } from 'react'
import { Chess, type Square } from 'chess.js'
import { ChessPiece } from './ChessPiece'
import clsx from 'clsx'

export interface ChessboardProps {
  fen: string
  turn: 'white' | 'black'
  playerColor?: 'white' | 'black' | null
  interactive?: boolean
  lastMove?: { from: string; to: string } | null
  isCheck?: boolean
  onMove?: (move: { from: string; to: string; promotion?: string }) => void
  theme?: 'emerald' | 'slate' | 'amber'
  className?: string
}

interface PromotionState {
  from: string
  to: string
  color: 'w' | 'b'
}

export const Chessboard: React.FC<ChessboardProps> = ({
  fen,
  turn,
  playerColor = 'white',
  interactive = true,
  lastMove = null,
  isCheck = false,
  onMove,
  theme = 'emerald',
  className = '',
}) => {
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null)
  const [draggedSquare, setDraggedSquare] = useState<string | null>(null)
  const [promotionPending, setPromotionPending] = useState<PromotionState | null>(null)

  // Initialize chess.js instance based on current FEN
  const chess = useMemo(() => {
    try {
      return new Chess(fen)
    } catch {
      return new Chess()
    }
  }, [fen])

  const isFlipped = playerColor === 'black'
  const isTurn = interactive && (!playerColor || playerColor === turn)

  // Board square ranks and files
  const ranks = isFlipped ? [1, 2, 3, 4, 5, 6, 7, 8] : [8, 7, 6, 5, 4, 3, 2, 1]
  const files = isFlipped ? ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'] : ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']

  // Find king square in check
  const kingInCheckSquare = useMemo(() => {
    if (!isCheck) return null
    const targetTurn = chess.turn()

    for (let r = 0; r < 8; r++) {
      for (let f = 0; f < 8; f++) {
        const fileChar = String.fromCharCode('a'.charCodeAt(0) + f)
        const rankNum = 8 - r
        const sq = `${fileChar}${rankNum}` as Square
        const piece = chess.get(sq)
        if (piece && piece.type === 'k' && piece.color === targetTurn) {
          return sq
        }
      }
    }
    return null
  }, [chess, isCheck])

  // Legal destination squares for currently selected piece
  const legalMovesForSelected = useMemo<string[]>(() => {
    if (!selectedSquare || !isTurn) return []
    try {
      const verboseMoves = chess.moves({ square: selectedSquare as Square, verbose: true })
      return verboseMoves.map(m => m.to as string)
    } catch {
      return []
    }
  }, [chess, selectedSquare, isTurn])

  // Theme color styles
  const themeClasses = {
    emerald: {
      light: 'bg-[#eeeed2] text-[#779952]',
      dark: 'bg-[#769656] text-[#eeeed2]',
      selected: 'bg-amber-300/80 ring-2 ring-amber-400 inset-0',
      lastMove: 'bg-amber-200/50',
      legalDot: 'bg-slate-900/30 ring-1 ring-white/40',
      legalCapture: 'border-4 border-slate-900/40',
    },
    slate: {
      light: 'bg-slate-200 text-slate-700',
      dark: 'bg-slate-600 text-slate-200',
      selected: 'bg-sky-400/70 ring-2 ring-sky-300 inset-0',
      lastMove: 'bg-sky-300/40',
      legalDot: 'bg-slate-900/35 ring-1 ring-white/40',
      legalCapture: 'border-4 border-slate-900/40',
    },
    amber: {
      light: 'bg-[#f0d9b5] text-[#b58863]',
      dark: 'bg-[#b58863] text-[#f0d9b5]',
      selected: 'bg-yellow-300/80 ring-2 ring-yellow-400 inset-0',
      lastMove: 'bg-yellow-300/40',
      legalDot: 'bg-yellow-950/30 ring-1 ring-white/40',
      legalCapture: 'border-4 border-yellow-950/40',
    },
  }[theme]

  const attemptMove = useCallback((from: string, to: string) => {
    if (!isTurn) return

    try {
      const moves = chess.moves({ square: from as Square, verbose: true })
      const matched = moves.find(m => m.to === to)

      if (!matched) {
        setSelectedSquare(null)
        return
      }

      // Check if move requires pawn promotion
      if (matched.promotion || matched.flags.includes('p') || matched.flags.includes('cp')) {
        setPromotionPending({
          from,
          to,
          color: chess.turn(),
        })
        setSelectedSquare(null)
        return
      }

      // Legal move
      onMove?.({ from, to })
      setSelectedSquare(null)
    } catch {
      setSelectedSquare(null)
    }
  }, [chess, isTurn, onMove])

  const handleSquareClick = (square: string) => {
    if (!isTurn) return

    const piece = chess.get(square as Square)
    const isOwnPiece = piece && (
      (chess.turn() === 'w' && piece.color === 'w') ||
      (chess.turn() === 'b' && piece.color === 'b')
    )

    if (selectedSquare === null) {
      if (isOwnPiece) {
        setSelectedSquare(square)
      }
    } else {
      if (selectedSquare === square) {
        setSelectedSquare(null)
      } else if (legalMovesForSelected.includes(square)) {
        attemptMove(selectedSquare, square)
      } else if (isOwnPiece) {
        setSelectedSquare(square)
      } else {
        setSelectedSquare(null)
      }
    }
  }

  const handleDragStart = (e: React.DragEvent, square: string) => {
    if (!isTurn) return
    const piece = chess.get(square as Square)
    if (!piece || piece.color !== chess.turn()) return

    setDraggedSquare(square)
    setSelectedSquare(square)
    e.dataTransfer.setData('text/plain', square)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, targetSquare: string) => {
    e.preventDefault()
    const fromSquare = draggedSquare || e.dataTransfer.getData('text/plain')
    setDraggedSquare(null)

    if (fromSquare && fromSquare !== targetSquare) {
      attemptMove(fromSquare, targetSquare)
    }
  }

  const completePromotion = (pieceType: 'q' | 'r' | 'b' | 'n') => {
    if (!promotionPending) return
    onMove?.({
      from: promotionPending.from,
      to: promotionPending.to,
      promotion: pieceType,
    })
    setPromotionPending(null)
  }

  return (
    <div
      className={clsx(
        'relative select-none aspect-square w-full max-w-[min(100vw-1.5rem,540px)] mx-auto rounded-2xl overflow-hidden shadow-2xl border-2 sm:border-4 border-slate-800 bg-[#070c18]',
        className
      )}
      style={{ touchAction: 'manipulation' }}
    >
      {/* 8x8 Board Grid */}
      <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
        {ranks.map((rank, rankIdx) =>
          files.map((file, fileIdx) => {
            const square = `${file}${rank}`
            const isLight = (rankIdx + fileIdx) % 2 === 0
            const piece = chess.get(square as Square)

            const isSelected = selectedSquare === square
            const isLastMove = lastMove && (lastMove.from === square || lastMove.to === square)
            const isKingCheck = kingInCheckSquare === square
            const isLegalDest = legalMovesForSelected.includes(square)
            const isCaptureTarget = isLegalDest && piece !== null

            return (
              <div
                key={square}
                onClick={() => handleSquareClick(square)}
                onDragOver={handleDragOver}
                onDrop={e => handleDrop(e, square)}
                className={clsx(
                  'relative flex items-center justify-center cursor-pointer transition-colors duration-100',
                  isLight ? themeClasses.light : themeClasses.dark,
                  isSelected && themeClasses.selected,
                  !isSelected && isLastMove && themeClasses.lastMove,
                  isKingCheck && 'bg-rose-500/80 ring-4 ring-rose-600 ring-inset'
                )}
              >
                {/* File coordinate notation on bottom row */}
                {rankIdx === 7 && (
                  <span
                    className={clsx(
                      'absolute bottom-0.5 right-1 text-[9px] sm:text-[10px] font-bold pointer-events-none select-none opacity-75',
                      isLight ? 'text-slate-800/60' : 'text-amber-100/70'
                    )}
                  >
                    {file}
                  </span>
                )}

                {/* Rank coordinate notation on left column */}
                {fileIdx === 0 && (
                  <span
                    className={clsx(
                      'absolute top-0.5 left-1 text-[9px] sm:text-[10px] font-bold pointer-events-none select-none opacity-75',
                      isLight ? 'text-slate-800/60' : 'text-amber-100/70'
                    )}
                  >
                    {rank}
                  </span>
                )}

                {/* Chess piece visual with drop shadow and touch optimization */}
                {piece && (
                  <div
                    draggable={isTurn && piece.color === chess.turn()}
                    onDragStart={e => handleDragStart(e, square)}
                    className={clsx(
                      'w-[86%] h-[86%] flex items-center justify-center transition-transform duration-100 drop-shadow-md',
                      isTurn && piece.color === chess.turn()
                        ? 'cursor-grab active:cursor-grabbing hover:scale-105'
                        : 'cursor-default'
                    )}
                  >
                    <ChessPiece piece={piece.color === 'w' ? piece.type.toUpperCase() : piece.type.toLowerCase()} />
                  </div>
                )}

                {/* Legal move dot indicator */}
                {isLegalDest && !piece && (
                  <div className="absolute w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-slate-900/35 border border-white/20 pointer-events-none animate-pulse" />
                )}

                {/* Legal capture target indicator */}
                {isCaptureTarget && (
                  <div className="absolute inset-1 sm:inset-1.5 rounded-full border-3 sm:border-4 border-slate-900/40 pointer-events-none" />
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Pawn Promotion Modal Picker */}
      {promotionPending && (
        <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-150 p-4">
          <div className="bg-[#0b101f] border border-white/10 rounded-2xl p-5 shadow-2xl text-center max-w-sm w-full mx-auto">
            <h3 className="text-base font-extrabold text-white mb-1">Promote Pawn</h3>
            <p className="text-xs text-slate-400 mb-4">Choose your promotion piece:</p>
            <div className="grid grid-cols-4 gap-2.5">
              {[
                { type: 'q', label: 'Queen' },
                { type: 'r', label: 'Rook' },
                { type: 'b', label: 'Bishop' },
                { type: 'n', label: 'Knight' },
              ].map(({ type, label }) => {
                const promoChar = promotionPending.color === 'w' ? type.toUpperCase() : type
                return (
                  <button
                    key={type}
                    onClick={() => completePromotion(type as any)}
                    className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-900 hover:bg-emerald-600/30 border border-slate-800 hover:border-emerald-500 transition-all group cursor-pointer"
                  >
                    <div className="w-10 h-10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <ChessPiece piece={promoChar} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-300 mt-1">{label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
