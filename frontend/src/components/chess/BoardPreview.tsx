import { useState } from 'react'
import { ShieldCheck, Zap } from 'lucide-react'

/**
 * Pixel-art chess piece sprites.
 * Each entry is an 8x8 bitmap: 'X' = filled pixel, '.' = empty.
 * Kept deliberately blocky/low-res — this is the point, not a limitation.
 */
const SPRITES: Record<string, string[]> = {
  p: [
    '...XX...',
    '..XXXX..',
    '..XXXX..',
    '...XX...',
    '..XXXX..',
    '.XXXXXX.',
    'XXXXXXXX',
    'XXXXXXXX',
  ],
  r: [
    'X.X.X.X.',
    'XXXXXXXX',
    '.XXXXXX.',
    '.XXXXXX.',
    '..XXXX..',
    '.XXXXXX.',
    'XXXXXXXX',
    'XXXXXXXX',
  ],
  n: [
    '...XXX..',
    '..XXXXX.',
    '.XXX.XX.',
    '.XX..XX.',
    'XXXXXXX.',
    '.XXXXXX.',
    '..XXXXX.',
    'XXXXXXXX',
  ],
  b: [
    '...XX...',
    '..XXXX..',
    '...XX...',
    '..XXXX..',
    '..XXXX..',
    '...XX...',
    '.XXXXXX.',
    'XXXXXXXX',
  ],
  q: [
    'X.X.X.X.',
    '.XXXXXX.',
    '..XXXX..',
    '..XXXX..',
    '.XXXXXX.',
    '.XXXXXX.',
    'XXXXXXXX',
    'XXXXXXXX',
  ],
  k: [
    '...XX...',
    '..XXXX..',
    '...XX...',
    '.XXXXXX.',
    '..XXXX..',
    '.XXXXXX.',
    'XXXXXXXX',
    'XXXXXXXX',
  ],
}

type PieceCode = 'p' | 'r' | 'n' | 'b' | 'q' | 'k' | 'P' | 'R' | 'N' | 'B' | 'Q' | 'K'

// Classical Italian Game / Open Game snapshot for landing page demonstration
const SAMPLE_POSITION: (PieceCode | null)[][] = [
  ['r', 'n', 'b', 'q', 'k', null, null, 'r'],
  ['p', 'p', 'p', null, null, 'p', 'p', 'p'],
  [null, null, null, null, null, 'n', null, null],
  [null, null, 'b', 'p', 'p', null, null, null],
  [null, null, 'B', null, 'P', null, null, null],
  [null, null, null, null, null, 'N', null, null],
  ['P', 'P', 'P', 'P', null, 'P', 'P', 'P'],
  ['R', 'N', 'B', 'Q', 'K', null, null, 'R'],
]

function PixelPiece({ code }: { code: PieceCode }) {
  const isWhite = code === code.toUpperCase()
  const rows = SPRITES[code.toLowerCase()]
  const fill = isWhite ? 'var(--px-cream)' : 'var(--px-ink)'
  const stroke = isWhite ? 'var(--px-ink)' : 'var(--px-cream)'

  return (
    <svg viewBox="0 0 8 8" className="w-[72%] h-[72%]" shapeRendering="crispEdges">
      {rows.map((row, y) =>
        row.split('').map((cell, x) =>
          cell === 'X' ? (
            <rect
              key={`${x}-${y}`}
              x={x}
              y={y}
              width={1}
              height={1}
              fill={fill}
              stroke={stroke}
              strokeWidth={0.08}
            />
          ) : null
        )
      )}
    </svg>
  )
}

interface BoardPreviewProps {
  theme?: 'classic' | 'emerald' | 'wood'
}

export function BoardPreview({ theme = 'emerald' }: BoardPreviewProps) {
  const [hoveredSquare, setHoveredSquare] = useState<string | null>(null)

  // Pixel-palette theme definitions — flat colors only, no gradients
  const themeStyles = {
    emerald: {
      light: 'bg-[#c9d9b3]',
      dark: 'bg-[#3f6b4f]',
      accent: '#ffb347',
      tagBorder: 'border-[#ffb347]/50',
      tagText: 'text-[#ffcd85]',
    },
    classic: {
      light: 'bg-[#d7dde6]',
      dark: 'bg-[#3a4a63]',
      accent: '#7fd1ff',
      tagBorder: 'border-[#7fd1ff]/50',
      tagText: 'text-[#a9e4ff]',
    },
    wood: {
      light: 'bg-[#e8c98a]',
      dark: 'bg-[#8a5a2b]',
      accent: '#ff6b57',
      tagBorder: 'border-[#ff6b57]/50',
      tagText: 'text-[#ff9a8c]',
    },
  }[theme]

  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
  const ranks = ['8', '7', '6', '5', '4', '3', '2', '1']

  return (
    <div className="relative select-none" style={{ fontFamily: 'var(--font-body)' }}>
      {/* Cartridge-style HUD tag: top */}
      <div
        className={`pixel-corners-sm absolute -top-4 left-5 bg-[var(--px-ink)] border-2 ${themeStyles.tagBorder} px-2.5 py-1 flex items-center gap-1.5 text-[11px] z-20`}
      >
        <ShieldCheck className="w-3.5 h-3.5" style={{ color: themeStyles.accent }} />
        <span className={themeStyles.tagText}>SERVER VALIDATED</span>
      </div>

      {/* Cartridge-style HUD tag: bottom */}
      <div
        className={`pixel-corners-sm absolute -bottom-4 right-5 bg-[var(--px-ink)] border-2 ${themeStyles.tagBorder} px-2.5 py-1 flex items-center gap-1.5 text-[11px] z-20`}
      >
        <Zap className="w-3.5 h-3.5" style={{ color: themeStyles.accent }} />
        <span className={themeStyles.tagText}>SYNC e2&nbsp;&#9656;&nbsp;e4</span>
      </div>

      {/* Board frame — hard pixel bezel, no blur, no rounding */}
      <div
        className="relative bg-[var(--px-ink)] p-3 sm:p-4"
        style={{
          border: '4px solid var(--px-line)',
          boxShadow: '8px 8px 0 0 rgba(0,0,0,0.55)',
        }}
      >
        <div className="aspect-square w-full max-w-[420px] sm:max-w-[460px] mx-auto grid grid-cols-8 grid-rows-8 border-2 border-[var(--px-line)]">
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
                  className={`relative flex items-center justify-center cursor-pointer ${
                    isDark ? themeStyles.dark : themeStyles.light
                  }`}
                >
                  {/* Coordinate labels on edges */}
                  {cIdx === 0 && (
                    <span
                      className="absolute top-0.5 left-1 text-[9px] leading-none opacity-50"
                      style={{ color: isDark ? '#fff' : '#000' }}
                    >
                      {ranks[rIdx]}
                    </span>
                  )}
                  {rIdx === 7 && (
                    <span
                      className="absolute bottom-0.5 right-1 text-[9px] leading-none opacity-50"
                      style={{ color: isDark ? '#fff' : '#000' }}
                    >
                      {files[cIdx]}
                    </span>
                  )}

                  {/* Move target: hard blink, not a blurred pulse */}
                  {squareName === 'e4' && (
                    <span
                      className="absolute w-3 h-3"
                      style={{ backgroundColor: themeStyles.accent, animation: 'pixelBlink 1s steps(1) infinite' }}
                    />
                  )}

                  {/* Hover marker: solid square outline, not a glow ring */}
                  {isHovered && (
                    <span
                      className="absolute inset-0.5 pointer-events-none"
                      style={{ border: `2px solid ${themeStyles.accent}` }}
                    />
                  )}

                  {isMoveHighlight && (
                    <span className="absolute inset-0" style={{ backgroundColor: `${themeStyles.accent}33` }} />
                  )}

                  {/* Piece sprite */}
                  {piece && (
                    <div className="relative z-10 w-full h-full flex items-center justify-center">
                      <PixelPiece code={piece} />
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>

        {/* Cartridge label strip */}
        <div className="mt-3 pt-2.5 border-t-2 border-[var(--px-line)] flex items-center justify-between text-[11px] text-[var(--px-muted)] px-1">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2" style={{ backgroundColor: themeStyles.accent }} />
            SKIN: <span className="text-[var(--px-cream)] capitalize">{theme}</span>
          </span>
          <span className="hidden sm:inline">SKIN SYSTEM &middot; PHASE 5+</span>
        </div>
      </div>
    </div>
  )
}