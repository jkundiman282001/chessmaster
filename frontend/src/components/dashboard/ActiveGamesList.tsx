import { useState } from 'react'
import { Copy, Check, Clock, Play } from 'lucide-react'
import type { Game } from '../../types/game'
import { useAuth } from '../../context/AuthContext'

interface ActiveGamesListProps {
  games: Game[]
  onSelectGame?: (game: Game) => void
}

export function ActiveGamesList({ games, onSelectGame }: ActiveGamesListProps) {
  const { user } = useAuth()
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  if (games.length === 0) {
    return (
      <div className="p-10 rounded-2xl bg-ink-raised/40 border border-ink-line text-center">
        <div className="w-12 h-12 rounded-2xl bg-ink border border-ink-line flex items-center justify-center mx-auto mb-3 text-parchment-dim text-xl shadow-inner">
          ♟
        </div>
        <div className="text-sm font-bold text-ivory">No Active Matches</div>
        <p className="text-xs text-parchment-dim mt-1 max-w-sm mx-auto">
          Create a room or join with an opponent's invite code to begin playing in real time.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {games.map((game) => {
        const isWhite = user && game.white_player?.id === user.id
        const opponent = isWhite ? game.black_player : game.white_player
        const isWaiting = game.status === 'waiting'
        const isUserTurn = user && !isWaiting && (
          (game.turn === 'white' && isWhite) ||
          (game.turn === 'black' && !isWhite)
        )

        return (
          <div
            key={game.code}
            className="p-4 rounded-2xl glass-card border border-ink-line hover:border-brass/30 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
          >
            <div className="flex items-center gap-3.5">
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-lg shadow-md shrink-0 transition-transform group-hover:scale-105 ${
                  isWhite
                    ? 'bg-ivory text-ink border border-ivory'
                    : 'bg-walnut-deep text-ivory border border-walnut'
                }`}
                title={`You are playing as ${isWhite ? 'White' : 'Black'}`}
              >
                {isWhite ? '♔' : '♚'}
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-ivory">
                    {opponent ? opponent.username : 'Awaiting Opponent'}
                  </span>
                  {opponent && (
                    <span className="text-[10px] font-bold text-brass-light bg-brass/10 px-2 py-0.5 rounded-full border border-brass/25 font-mono">
                      {opponent.rating} ELO
                    </span>
                  )}
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1.5 ${
                      isWaiting
                        ? 'bg-brass/10 text-brass-light border border-brass/25'
                        : isUserTurn
                        ? 'bg-felt/15 text-felt-light border border-felt-light/30'
                        : 'bg-ink-raised text-parchment-dim border border-ink-line'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isWaiting ? 'bg-brass animate-ping' : isUserTurn ? 'bg-felt-light animate-pulse' : 'bg-parchment-dim'
                      }`}
                    />
                    {isWaiting ? 'Waiting for Player' : isUserTurn ? 'Your Turn' : "Opponent's Turn"}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-parchment-dim mt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-parchment-dim" />
                    {game.time_control.replace('_', ' ').replace('_', '+')}
                  </span>
                  <span>&bull;</span>
                  <span>Turn: <strong className="capitalize text-parchment">{game.turn}</strong></span>
                  <span>&bull;</span>
                  <span className="font-mono text-parchment-dim font-semibold">{game.code}</span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-ink-line">
              <button
                onClick={() => copyCode(game.code)}
                className="px-3 py-2 bg-ink-raised hover:bg-ink-line border border-ink-line text-parchment hover:text-ivory text-xs font-mono font-semibold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                title="Copy room code"
              >
                {copiedCode === game.code ? (
                  <Check className="w-3.5 h-3.5 text-felt-light" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{copiedCode === game.code ? 'Copied' : 'Share'}</span>
              </button>

              <button
                onClick={() => onSelectGame?.(game)}
                className="flex-1 sm:flex-initial px-4 py-2 bg-brass hover:bg-brass-light text-ink font-bold text-xs rounded-xl shadow-lg shadow-black/40 flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-ink" />
                <span>{isWaiting ? 'Enter Lobby' : 'Resume'}</span>
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}