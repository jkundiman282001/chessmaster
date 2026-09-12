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
      <div className="p-10 rounded-2xl bg-slate-900/30 border border-white/5 text-center">
        <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-white/10 flex items-center justify-center mx-auto mb-3 text-slate-400 text-xl shadow-inner">
          ♟
        </div>
        <div className="text-sm font-bold text-slate-200">No Active Matches</div>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
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
            className="p-4 rounded-2xl glass-card border border-white/5 hover:border-emerald-500/30 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
          >
            <div className="flex items-center gap-3.5">
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-lg shadow-md shrink-0 transition-transform group-hover:scale-105 ${
                  isWhite
                    ? 'bg-slate-100 text-slate-950 border border-white'
                    : 'bg-slate-900 text-slate-200 border border-slate-700'
                }`}
                title={`You are playing as ${isWhite ? 'White' : 'Black'}`}
              >
                {isWhite ? '♔' : '♚'}
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-white">
                    {opponent ? opponent.username : 'Awaiting Opponent'}
                  </span>
                  {opponent && (
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 font-mono">
                      {opponent.rating} ELO
                    </span>
                  )}
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1.5 ${
                      isWaiting
                        ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                        : isUserTurn
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isWaiting ? 'bg-amber-400 animate-ping' : isUserTurn ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                      }`}
                    />
                    {isWaiting ? 'Waiting for Player' : isUserTurn ? 'Your Turn' : "Opponent's Turn"}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    {game.time_control.replace('_', ' ').replace('_', '+')}
                  </span>
                  <span>&bull;</span>
                  <span>Turn: <strong className="capitalize text-slate-300">{game.turn}</strong></span>
                  <span>&bull;</span>
                  <span className="font-mono text-slate-400 font-semibold">{game.code}</span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
              <button
                onClick={() => copyCode(game.code)}
                className="px-3 py-2 bg-slate-900/90 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-white text-xs font-mono font-semibold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                title="Copy room code"
              >
                {copiedCode === game.code ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{copiedCode === game.code ? 'Copied' : 'Share'}</span>
              </button>

              <button
                onClick={() => onSelectGame?.(game)}
                className="flex-1 sm:flex-initial px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>{isWaiting ? 'Enter Lobby' : 'Resume'}</span>
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
