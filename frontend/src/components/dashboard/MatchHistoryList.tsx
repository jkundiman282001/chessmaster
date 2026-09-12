import { Clock, Calendar, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Game } from '../../types/game'
import { useAuth } from '../../context/AuthContext'

interface MatchHistoryListProps {
  matches: Game[]
}

export function MatchHistoryList({ matches }: MatchHistoryListProps) {
  const { user } = useAuth()

  if (matches.length === 0) {
    return (
      <div className="p-10 rounded-2xl bg-slate-900/30 border border-white/5 text-center">
        <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-white/10 flex items-center justify-center mx-auto mb-3 text-slate-400 text-xl shadow-inner">
          📜
        </div>
        <div className="text-sm font-bold text-slate-200">No Matches Played Yet</div>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          Your completed games and rating progression will automatically appear here.
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
            className="p-3.5 rounded-xl glass-card border border-white/5 hover:border-white/10 flex items-center justify-between gap-3 text-xs transition-all duration-150"
          >
            <div className="flex items-center gap-3">
              <span
                className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider ${
                  isDraw
                    ? 'bg-slate-700/50 text-slate-300 border border-slate-600/50'
                    : isWinner
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-xs'
                    : 'bg-rose-500/15 text-rose-300 border border-rose-500/30 shadow-xs'
                }`}
              >
                {isDraw ? 'Draw' : isWinner ? 'Victory' : 'Defeat'}
              </span>

              <div>
                <div className="font-bold text-white flex items-center gap-2">
                  <span>vs {opponent ? opponent.username : 'Unknown Player'}</span>
                  {opponent && (
                    <span className="text-[10px] text-slate-400 font-mono">({opponent.rating})</span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                  <span className="capitalize">{match.end_reason?.replace('_', ' ') || 'Completed'}</span>
                  <span>&bull;</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {match.time_control.replace('_', ' ').replace('_', '+')}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right text-[11px] text-slate-500 hidden sm:flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-600" />
                <span>{new Date(match.created_at).toLocaleDateString()}</span>
              </div>
              <Link
                to={`/play/${match.code}`}
                className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                title="Review Game"
              >
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )
      })}
    </div>
  )
}
