import { Clock, Calendar } from 'lucide-react'
import type { Game } from '../../types/game'
import { useAuth } from '../../context/AuthContext'

interface MatchHistoryListProps {
  matches: Game[]
}

export function MatchHistoryList({ matches }: MatchHistoryListProps) {
  const { user } = useAuth()

  if (matches.length === 0) {
    return (
      <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800/80 text-center">
        <div className="w-10 h-10 rounded-xl bg-slate-800/80 flex items-center justify-center mx-auto mb-2 text-slate-400 text-lg">
          📜
        </div>
        <div className="text-xs font-semibold text-slate-300">No Matches Played Yet</div>
        <p className="text-[11px] text-slate-500 mt-0.5">
          Your completed games and rating progression will appear here.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2.5">
      {matches.map((match) => {
        const isWhite = user && match.white_player?.id === user.id
        const opponent = isWhite ? match.black_player : match.white_player
        const isWinner = user && match.winner_id === user.id
        const isDraw = match.winner_id === null

        return (
          <div
            key={match.code}
            className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between gap-3 text-xs"
          >
            <div className="flex items-center gap-3">
              <span
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                  isDraw
                    ? 'bg-slate-700/60 text-slate-300 border border-slate-600'
                    : isWinner
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                }`}
              >
                {isDraw ? 'Draw' : isWinner ? 'Victory' : 'Defeat'}
              </span>

              <div>
                <div className="font-semibold text-white flex items-center gap-1.5">
                  vs {opponent ? opponent.username : 'Unknown'}
                  {opponent && (
                    <span className="text-[10px] text-slate-400">({opponent.rating})</span>
                  )}
                </div>
                <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                  <span className="capitalize">{match.end_reason?.replace('_', ' ') || 'Completed'}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5 text-slate-500" />
                    {match.time_control.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-right text-[11px] text-slate-500 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-600" />
              <span>{new Date(match.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
