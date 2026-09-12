import { useState } from 'react'
import { ShieldCheck, Zap } from 'lucide-react'
import { ChessPiece } from './ChessPiece'

type ThemeOption = 'emerald' | 'slate' | 'amber'

// Classical Open Game snapshot for landing demonstration
const SAMPLE_POSITION: (string | null)[][] = [
  ['r', 'n', 'b', 'q', 'k', null, null, 'r'],
  ['p', 'p', 'p', null, null, 'p', 'p', 'p'],
  [null, null, null, null, null, 'n', null, null],
  [null, null, 'b', 'p', 'p', null, null, null],
  [null, null, 'B', null, 'P', null, null, null],
  [null, null, null, null, null, 'N', null, null],
  ['P', 'P', 'P', 'P', null, 'P', 'P', 'P'],
  ['R', 'N', 'B', 'Q', 'K', null, null, 'R'],
]

interface BoardPreviewProps {
  theme?: ThemeOption
}

export function BoardPreview({ theme: initialTheme = 'emerald' }: BoardPreviewProps) {
  const [theme, setTheme] = useState<ThemeOption>(initialTheme)
  const [hoveredSquare, setHoveredSquare] = useState<string | null>(null)
  const [selectedSquare, setSelectedSquare] = useState<string | null>('e4')

  const themeStyles = {
    emerald: {
      light: 'bg-[#eeeed2]',
      dark: 'bg-[#769656]',
      accent: '#10b981',
      border: 'border-emerald-500/30',
      glow: 'shadow-emerald-500/10',
      highlight: 'bg-emerald-400/40',
      selected: 'bg-amber-400/50',
    },
    slate: {
      light: 'bg-slate-200',
      dark: 'bg-slate-600',
      accent: '#38bdf8',
      border: 'border-sky-500/30',
      glow: 'shadow-sky-500/10',
      highlight: 'bg-sky-400/40',
      selected: 'bg-sky-400/50',
    },
    amber: {
      light: 'bg-[#f0d9b5]',
      dark: 'bg-[#b58863]',
      accent: '#f59e0b',
      border: 'border-amber-500/30',
      glow: 'shadow-amber-500/10',
      highlight: 'bg-amber-400/40',
      selected: 'bg-yellow-400/50',
    },
  }[theme]

  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
  const ranks = ['8', '7', '6', '5', '4', '3', '2', '1']

  const legalPreviewMoves = selectedSquare === 'e4' ? ['e5', 'd5'] : []

  return (
    <div className="relative w-full max-w-[440px] sm:max-w-[480px] mx-auto select-none">
      {/* Decorative ambient background blur */}
      <div
        className="absolute -inset-4 bg-gradient-to-tr from-emerald-500/15 via-sky-500/10 to-purple-500/15 rounded-3xl blur-2xl -z-10 pointer-events-none transition-all duration-700"
      />

      {/* Floating HUD: Top Server Status Pill */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full glass-card border border-white/10 text-[11px] font-medium text-slate-300 shadow-lg">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Server Validated &bull; Authoritative FEN</span>
        </div>

        {/* Board theme selector buttons */}
        <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800 backdrop-blur-md">
          {(['emerald', 'slate', 'amber'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={`px-2 py-0.5 text-[10px] font-semibold capitalize rounded-lg transition-all ${
                theme === t
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Modern Board Frame */}
      <div className="relative rounded-2xl glass-panel p-3 sm:p-4 shadow-2xl border border-slate-700/60 overflow-hidden">
        <div className="aspect-square w-full rounded-xl overflow-hidden shadow-inner border border-black/20 grid grid-cols-8 grid-rows-8">
          {SAMPLE_POSITION.map((row, rIdx) =>
            row.map((piece, cIdx) => {
              const isDark = (rIdx + cIdx) % 2 === 1
              const squareName = `${files[cIdx]}${ranks[rIdx]}`
              const isHovered = hoveredSquare === squareName
              const isSelected = selectedSquare === squareName
              const isMoveHistory = squareName === 'e4' || squareName === 'e2'
              const isLegalDot = legalPreviewMoves.includes(squareName)

              return (
                <div
                  key={squareName}
                  onClick={() => setSelectedSquare(selectedSquare === squareName ? null : squareName)}
                  onMouseEnter={() => setHoveredSquare(squareName)}
                  onMouseLeave={() => setHoveredSquare(null)}
                  className={`relative flex items-center justify-center cursor-pointer transition-colors duration-150 ${
                    isDark ? themeStyles.dark : themeStyles.light
                  } ${isSelected ? themeStyles.selected : ''} ${
                    !isSelected && isMoveHistory ? themeStyles.highlight : ''
                  }`}
                >
                  {/* Coordinate labels */}
                  {cIdx === 0 && (
                    <span
                      className={`absolute top-0.5 left-1 text-[9px] font-bold leading-none select-none ${
                        isDark ? 'text-white/40' : 'text-slate-800/40'
                      }`}
                    >
                      {ranks[rIdx]}
                    </span>
                  )}
                  {rIdx === 7 && (
                    <span
                      className={`absolute bottom-0.5 right-1 text-[9px] font-bold leading-none select-none ${
                        isDark ? 'text-white/40' : 'text-slate-800/40'
                      }`}
                    >
                      {files[cIdx]}
                    </span>
                  )}

                  {/* Interactive Legal Move Target Dot */}
                  {isLegalDot && (
                    <span className="absolute w-3.5 h-3.5 rounded-full bg-emerald-950/40 shadow-sm border border-emerald-400/40 pointer-events-none animate-pulse" />
                  )}

                  {/* Hover outline */}
                  {isHovered && !isSelected && (
                    <div className="absolute inset-0 bg-white/10 ring-2 ring-white/30 rounded-xs pointer-events-none" />
                  )}

                  {/* Piece Component with gentle drop shadow */}
                  {piece && (
                    <div className="relative z-10 w-[82%] h-[82%] flex items-center justify-center drop-shadow-md transition-transform duration-150 hover:scale-110 active:scale-95">
                      <ChessPiece piece={piece} />
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>

        {/* Bottom Sub-bar */}
        <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 px-1">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
            </span>
            <span className="text-[11px] font-medium text-slate-300">
              Move Sync: <span className="font-mono text-emerald-400">1. e4 e5 2. Nf3</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>&lt; 5ms latency</span>
          </div>
        </div>
      </div>
    </div>
  )
}