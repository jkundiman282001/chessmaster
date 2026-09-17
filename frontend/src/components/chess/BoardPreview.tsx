import { useState } from 'react'
import { ShieldCheck, Zap } from 'lucide-react'
import { ChessPiece } from './ChessPiece'

type ThemeOption = 'walnut' | 'emerald' | 'slate' | 'amber'

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

export function BoardPreview({ theme: initialTheme = 'walnut' }: BoardPreviewProps) {
  const [theme, setTheme] = useState<ThemeOption>(initialTheme)
  const [hoveredSquare, setHoveredSquare] = useState<string | null>(null)
  const [selectedSquare, setSelectedSquare] = useState<string | null>('e4')

  const themeStyles = {
    walnut: {
      light: 'bg-[#e8dcc0]',
      dark: 'bg-[#5c4430]',
      accent: '#c69a52',
      border: 'border-[#c69a52]/25',
      glow: 'shadow-[#c69a52]/10',
      highlight: 'bg-[#c69a52]/30',
      selected: 'bg-[#e3c07f]/55',
    },
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
        className="absolute -inset-4 bg-gradient-to-tr from-[#c69a52]/12 via-[#4b6249]/8 to-[#e3c07f]/12 rounded-3xl blur-2xl -z-10 pointer-events-none transition-all duration-700"
      />

      {/* Floating HUD: Top Server Status Pill */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full glass-card border border-brass/15 text-[11px] font-medium text-parchment shadow-lg">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-felt-light opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-felt-light"></span>
          </span>
          <ShieldCheck className="w-3.5 h-3.5 text-brass" />
          <span className="font-mono text-[10px]">Server validated &bull; FEN authoritative</span>
        </div>

        {/* Board theme selector buttons */}
        <div className="flex items-center gap-1 bg-ink-raised/90 p-1 rounded-xl border border-ink-line backdrop-blur-md">
          {(['walnut', 'emerald', 'slate'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={`px-2 py-0.5 text-[10px] font-semibold capitalize rounded-lg transition-all cursor-pointer ${
                theme === t
                  ? 'bg-brass text-ink shadow-sm'
                  : 'text-parchment-dim hover:text-parchment'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Modern Board Frame */}
      <div className="relative rounded-2xl glass-panel p-3 sm:p-4 shadow-2xl border border-ink-line overflow-hidden">
        <div className="aspect-square w-full rounded-xl overflow-hidden shadow-inner border border-black/30 grid grid-cols-8 grid-rows-8">
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
                      className={`absolute top-0.5 left-1 text-[9px] font-bold leading-none select-none font-mono ${
                        isDark ? 'text-white/40' : 'text-black/40'
                      }`}
                    >
                      {ranks[rIdx]}
                    </span>
                  )}
                  {rIdx === 7 && (
                    <span
                      className={`absolute bottom-0.5 right-1 text-[9px] font-bold leading-none select-none font-mono ${
                        isDark ? 'text-white/40' : 'text-black/40'
                      }`}
                    >
                      {files[cIdx]}
                    </span>
                  )}

                  {/* Interactive Legal Move Target Dot */}
                  {isLegalDot && (
                    <span className="absolute w-3.5 h-3.5 rounded-full bg-black/30 shadow-sm border border-[#c69a52]/50 pointer-events-none animate-pulse" />
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
        <div className="mt-3 pt-2.5 border-t border-ink-line flex items-center justify-between text-xs text-parchment-dim px-1">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brass opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brass"></span>
            </span>
            <span className="text-[11px] font-medium text-parchment">
              1. e4 e5 <span className="font-mono text-brass-light">2. Nf3</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-parchment-dim">
            <Zap className="w-3.5 h-3.5 text-brass" />
            <span className="font-mono">&lt;5ms</span>
          </div>
        </div>
      </div>
    </div>
  )
}