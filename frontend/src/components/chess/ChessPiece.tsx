import React, { useState } from 'react'

interface ChessPieceProps {
  piece: string // 'P', 'N', 'B', 'R', 'Q', 'K', 'p', 'n', 'b', 'r', 'q', 'k'
  className?: string
}

const PIECE_FILE_NAMES: Record<string, string> = {
  p: 'pawn.png',
  n: 'knight.png',
  b: 'bishop.png',
  r: 'rook.png',
  q: 'queen.png',
  k: 'king.png',
}

export const ChessPiece: React.FC<ChessPieceProps> = ({ piece, className = 'w-full h-full' }) => {
  const [failedPieces, setFailedPieces] = useState<Record<string, boolean>>({})

  const isWhite = piece === piece.toUpperCase()
  const type = piece.toLowerCase()

  // Default game assets: White Classic and Black Classic piece sets
  const folder = isWhite ? 'White Classic' : 'Black Classic'
  const fileName = PIECE_FILE_NAMES[type] || 'pawn.png'
  const assetSrc = `/pieces/${encodeURIComponent(folder)}/${fileName}`

  const hasFailed = failedPieces[piece]

  // Primary: Load default classic pieces from /pieces/White Classic/ and /pieces/Black Classic/
  if (!hasFailed) {
    return (
      <img
        key={assetSrc}
        src={assetSrc}
        alt={`${isWhite ? 'White' : 'Black'} ${type}`}
        className={`${className} object-contain select-none pointer-events-none drop-shadow-md`}
        draggable={false}
        onError={() => setFailedPieces((prev) => ({ ...prev, [piece]: true }))}
      />
    )
  }

  // Fallback: Built-in vector SVGs if asset file is missing or failed
  const fill = isWhite ? '#ffffff' : '#1e293b'
  const stroke = isWhite ? '#334155' : '#0f172a'
  const detail = isWhite ? '#cbd5e1' : '#475569'

  switch (type) {
    case 'p':
      return (
        <svg viewBox="0 0 45 45" className={className}>
          <path
            d="m 22.5,9 c -2.21,0 -4,1.79 -4,4 0,0.89 0.29,1.71 0.78,2.38 C 17.33,16.5 16,18.59 16,21 c 0,2.03 0.94,3.84 2.41,5.03 C 15.41,27.09 11,31.58 11,39.5 l 23,0 c 0,-7.92 -4.41,-12.41 -7.41,-13.47 C 28.06,24.84 29,23.03 29,21 29,18.59 27.67,16.5 25.72,15.38 26.21,14.71 26.5,13 0,-2.21 -1.79,-4 -4,-4 z"
            fill={fill}
            stroke={stroke}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          {isWhite && (
            <path
              d="M 12,38.5 A 21,21 0 0 1 33,38.5"
              fill="none"
              stroke={stroke}
              strokeWidth="1.5"
            />
          )}
        </svg>
      )

    case 'n':
      return (
        <svg viewBox="0 0 45 45" className={className}>
          <g fill={fill} stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M 22,10 C 32.5,11 38.5,18 38,39 L 15,39 C 15,30 25,32.5 23,18" />
            <path d="M 24,18 C 24.38,20.91 18.45,25.37 16,27 C 13,29 13.18,31.34 11,31 C 9.958,30.06 12.41,27.96 11,28 C 10,28 11.19,29.23 10,30 C 9,30 5.997,31 6,26 C 6,24 12,14 12,14 C 12,14 13.89,12.1 14,10.5 C 13.27,7.4 17.07,8.06 18,8.5 C 18.5,9 18,10 18,10 L 22,10 z" />
            <circle cx="15" cy="14" r="1.5" fill={isWhite ? stroke : '#fff'} />
            <path d="M 9.5 25.5 A 0.5 0.5 0 1 1 8.5,25.5 A 0.5 0.5 0 1 1 9.5 25.5 z" fill={isWhite ? stroke : '#fff'} />
          </g>
        </svg>
      )

    case 'b':
      return (
        <svg viewBox="0 0 45 45" className={className}>
          <g fill={fill} stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M 9,36 C 12.39,35.03 19.11,36.43 22.5,34 C 25.89,36.43 32.61,35.03 36,36 C 36,36 37.65,36.54 39,38 C 38.32,38.97 37.35,38.99 36,38.5 C 32.61,37.53 25.89,38.96 22.5,37.5 C 19.11,38.96 12.39,37.53 9,38.5 C 7.646,38.99 6.677,38.97 6,38 C 7.354,36.54 9,36 9,36 z" />
            <path d="M 12,36 C 12,32 11,27 15,22 C 16.5,20.14 19.5,17 19.5,13 A 3,3 0 0 1 25.5,13 C 25.5,17 28.5,20.14 30,22 C 34,27 33,32 33,36 z" />
            <circle cx="22.5" cy="10" r="2.5" />
            <path d="m 17.5,26 10,0 M 15,30 l 15,0" stroke={detail} strokeWidth="1.5" />
            <path d="m 22.5,15.5 0,6 M 20,18.5 l 5,0" stroke={detail} strokeWidth="1.5" />
          </g>
        </svg>
      )

    case 'r':
      return (
        <svg viewBox="0 0 45 45" className={className}>
          <g fill={fill} stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M 9,39 L 36,39 L 36,36 L 9,36 z" />
            <path d="M 12,36 L 12,32 L 33,32 L 33,36 z" />
            <path d="M 11,14 L 11,9 L 15,9 L 15,11 L 20,11 L 20,9 L 25,9 L 25,11 L 30,11 L 30,9 L 34,9 L 34,14" />
            <path d="M 12,32 L 14,14 L 31,14 L 33,32 z" />
            <path d="M 14,16 L 31,16" stroke={detail} strokeWidth="1.5" />
          </g>
        </svg>
      )

    case 'q':
      return (
        <svg viewBox="0 0 45 45" className={className}>
          <g fill={fill} stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="6" cy="12" r="2" />
            <circle cx="14" cy="9" r="2" />
            <circle cx="22.5" cy="8" r="2" />
            <circle cx="31" cy="9" r="2" />
            <circle cx="39" cy="12" r="2" />
            <path d="M 9,26 C 17.5,24.5 30,24.5 36,26 L 38,14 L 31,25 L 22.5,12 L 14,25 L 7,14 z" />
            <path d="M 9,26 C 9,28 10.5,28 11.5,30 C 12.5,31.5 12.5,31 12,33.5 C 10.5,34.5 10.5,36 10,36 C 9,37.5 11,38.5 11,38.5 L 34,38.5 C 34,38.5 36,37.5 35,36 C 34.5,36 34.5,34.5 33,33.5 C 32.5,31 32.5,31.5 33.5,30 C 34.5,28 36,28 36,26 z" />
            <path d="M 11,38.5 L 34,38.5 L 34,40.5 L 11,40.5 z" />
            <circle cx="22.5" cy="27" r="3" fill={detail} stroke="none" />
          </g>
        </svg>
      )

    case 'k':
      return (
        <svg viewBox="0 0 45 45" className={className}>
          <g fill={fill} stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M 22.5,11.63 L 22.5,6" strokeLinejoin="miter" />
            <path d="M 20,8 L 25,8" strokeLinejoin="miter" />
            <path d="M 22.5,25 C 22.5,25 27,17.5 25.5,14.5 C 24,11.5 21,11.5 19.5,14.5 C 18,17.5 22.5,25 22.5,25 z" />
            <path d="M 11.5,37 C 17,40.5 28,40.5 33.5,37 C 36.5,30 36.5,26.5 36.5,24 C 34.5,21.5 29.5,24.5 22.5,24.5 C 15.5,24.5 10.5,21.5 8.5,24 C 8.5,26.5 8.5,30 11.5,37 z" />
            <path d="M 11.5,30 C 17,27 28,27 33.5,30" stroke={detail} strokeWidth="1.5" />
            <path d="M 11.5,33.5 C 17,30.5 28,30.5 33.5,33.5" stroke={detail} strokeWidth="1.5" />
            <path d="M 11.5,37 C 17,34 28,34 33.5,37" stroke={detail} strokeWidth="1.5" />
            <circle cx="22.5" cy="18" r="2" fill={detail} stroke="none" />
          </g>
        </svg>
      )

    default:
      return null
  }
}
