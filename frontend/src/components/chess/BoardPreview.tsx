import { useState } from 'react'
import { Sparkles, ShieldCheck, Zap } from 'lucide-react'

// Standard Unicode/SVG chess piece mapping
const PIECES: Record<string, string> = {
  p: '♟', // black pawn
  r: '♜', // black rook
  n: '♞', // black knight
  b: '♝', // black bishop
  q: '♛', // black queen
  k: '♚', // black king
  P: '♙', // white pawn
  R: '♖', // white rook
  N: '♘', // white knight
  B: '♗', // white bishop
  Q: '♕', // white queen
  K: '♔', // white king
}

// Classical Italian Game / Open Game snapshot for landing page demonstration
const SAMPLE_POSITION: (string | null)[][] = [
  ['r', 'n', 'b', 'q', 'k', null, null, 'r'], // rank 8 (black castled)
  ['p', 'p', 'p', null, null, 'p', 'p', 'p'], // rank 7
  [null, null, null, null, null, 'n', null, null], // rank 6: Nf6
  [null, null, 'b', 'p', 'p', null, null, null], // rank 5: Bc5, d5, e5
  [null, null, 'B', null, 'P', null, null, null], // rank 4: Bc4, e4
  [null, null, null, null, null, 'N', null, null], // rank 3: Nf3
  ['P', 'P', 'P', 'P', null, 'P', 'P', 'P'], // rank 2
  ['R', 'N', 'B', 'Q', 'K', null, null, 'R'], // rank 1
]

interface BoardPreviewProps {
  theme?: 'classic' | 'emerald' | 'wood'
}

export function BoardPreview({ theme = 'emerald' }: BoardPreviewProps) {
  const [hoveredSquare, setHoveredSquare] = useState<string | null>(null)

  // Theme definitions (extensible for future cosmetics)
  const themeStyles = {
    emerald: {
      light: 'bg-[#eeeed2] text-slate-900',
      dark: 'bg-[#769656] text-white',
      border: 'border-slate-800 shadow-emerald-950/40',
      highlight: 'ring-4 ring-amber-400/80 z-10',
    },
    classic: {
      light: 'bg-slate-200 text-slate-900',
      dark: 'bg-slate-700 text-white',
      border: 'border-slate-800 shadow-slate-950/50',
      highlight: 'ring-4 ring-blue-400/80 z-10',
    },
    wood: {
      light: 'bg-[#f0d9b5] text-amber-950',
      dark: 'bg-[#b58863] text-white',
      border: 'border-amber-950/60 shadow-amber-950/40',
      highlight: 'ring-4 ring-emerald-400/80 z-10',
    },
  }[theme]

  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
  const ranks = ['8', '7', '6', '5', '4', '3', '2', '1']

  return (
    <div className="relative group select-none">
      {/* Glow Backdrop */}
      <div className="absolute -inset-2 bg-gradient-to-r from-emerald-600/30 to-teal-500/20 rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition duration-1000"></div>

      {/* Main Board Container */}
      <div className={`relative bg-slate-900 border-2 rounded-2xl p-3 sm:p-4 shadow-2xl ${themeStyles.border}`}>
        {/* Floating Authoritative Status Badge */}
        <div className="absolute -top-3.5 left-6 bg-slate-950 border border-emerald-500/40 px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 z-20">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Server-Authoritative Validation</span>
        </div>

        {/* Dynamic Move Highlight Badge */}
        <div className="absolute -bottom-3.5 right-6 bg-slate-950 border border-amber-500/40 px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5 text-[11px] font-semibold text-amber-300 z-20">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>Live WebSocket Sync: e2 ➔ e4</span>
        </div>

        {/* 8x8 Chess Grid */}
        <div className="aspect-square w-full max-w-[420px] sm:max-w-[460px] mx-auto grid grid-cols-8 grid-rows-8 rounded-xl overflow-hidden shadow-inner border border-black/30">
          {SAMPLE_POSITION.map((row, rIdx) =>
            row.map((piece, cIdx) => {
              const isDark = (rIdx + cIdx) % 2 === 1
              const squareName = `${files[cIdx]}${ranks[rIdx]}`
              const isHovered = hoveredSquare === squareName
              const isMoveHighlight = squareName === 'e4' || squareName === 'e2'

              return (
                <div
                  key={squareName}
                  onMouseEnter={() => setHoveredSquare(squareName)}
                  onMouseLeave={() => setHoveredSquare(null)}
                  className={`relative flex items-center justify-center text-3xl sm:text-4xl transition-all duration-150 cursor-pointer ${
                    isDark ? themeStyles.dark : themeStyles.light
                  } ${isMoveHighlight ? 'brightness-110 !bg-amber-300/40' : ''} ${
                    isHovered ? themeStyles.highlight : ''
                  }`}
                >
                  {/* Coordinate labels on edges */}
                  {cIdx === 0 && (
                    <span className="absolute top-0.5 left-1 text-[9px] font-bold opacity-40 leading-none">
                      {ranks[rIdx]}
                    </span>
                  )}
                  {rIdx === 7 && (
                    <span className="absolute bottom-0.5 right-1 text-[9px] font-bold opacity-40 leading-none">
                      {files[cIdx]}
                    </span>
                  )}

                  {/* Move Target indicator */}
                  {squareName === 'e4' && (
                    <span className="absolute inset-0 m-auto w-3 h-3 rounded-full bg-emerald-500/80 animate-ping"></span>
                  )}

                  {/* Piece Symbol */}
                  {piece && (
                    <span
                      className={`relative z-10 transition-transform duration-200 drop-shadow-sm ${
                        piece === piece.toUpperCase()
                          ? 'text-white filter drop-shadow-[0_1.5px_1.5px_rgba(0,0,0,0.8)]'
                          : 'text-slate-950 filter drop-shadow-[0_1px_1px_rgba(255,255,255,0.4)]'
                      } ${isHovered ? 'scale-115' : ''}`}
                    >
                      {PIECES[piece]}
                    </span>
                  )}
                </div>
              )
            })
          )}
        </div>

        {/* Extensibility Tag */}
        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 px-1">
          <span className="flex items-center gap-1 text-slate-400">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            Theme: <span className="text-slate-200 capitalize font-medium">{theme} Slate</span>
          </span>
          <span className="text-slate-500">Board skin system extensible for Phase 5+</span>
        </div>
      </div>
    </div>
  )
}
