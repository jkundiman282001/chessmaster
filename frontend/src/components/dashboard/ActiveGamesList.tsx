import { useState } from 'react'
import { Copy, Check, Clock, Radio } from 'lucide-react'
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
      <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800/80 text-center">
        <div className="w-10 h-10 rounded-xl bg-slate-800/80 flex items-center justify-center mx-auto mb-2 text-slate-400 text-lg">
          ♟
        </div>
        <div className="text-xs font-semibold text-slate-300">No Active Matches</div>
        <p className="text-[11px] text-slate-500 mt-0.5">
          Start a new game or join with an invite code to begin playing.
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

        return (
          <div
            key={game.code}
            className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700/80 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base shadow-sm shrink-0 ${
                  isWhite
                    ? 'bg-slate-200 text-slate-950 border border-white'
                    : 'bg-slate-800 text-slate-200 border border-slate-700'
                }`}
                title={`You are playing as ${isWhite ? 'White' : 'Black'}`}
              >
                {isWhite ? '♔' : '♚'}
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-white">
                    {opponent ? opponent.username : 'Awaiting Opponent'}
                  </span>
                  {opponent && (
                    <span className="text-[10px] font-semibold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                      {opponent.rating} ELO
                    </span>
                  )}
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 ${
                      isWaiting
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isWaiting ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'
                      }`}
                    ></span>
                    {isWaiting ? 'Waiting for Player' : 'Match In Progress'}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {game.time_control.replace('_', ' ')}
                  </span>
                  <span>•</span>
                  <span>Turn: <strong className="capitalize text-slate-300">{game.turn}</strong></span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={() => copyCode(game.code)}
                className="px-2.5 py-1.5 bg-slate-950/80 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-mono rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                title="Copy room code to share with opponent"
              >
                {copiedCode === game.code ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-semibold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>{game.code}</span>
                  </>
                )}
              </button>

              <button
                onClick={() => onSelectGame?.(game)}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg shadow-sm transition cursor-pointer flex items-center gap-1.5"
              >
                <Radio className="w-3 h-3" />
                {isWaiting ? 'Open Room' : 'Resume'}
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
