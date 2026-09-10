import { Trophy, Medal } from 'lucide-react'
import type { LeaderboardEntry } from '../../types/game'

interface LeaderboardCardProps {
  entries: LeaderboardEntry[]
  currentUserId?: number
}

export function LeaderboardCard({ entries, currentUserId }: LeaderboardCardProps) {
  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] flex items-center justify-center">1</span>
      case 2:
        return <span className="w-5 h-5 rounded-full bg-slate-300 text-slate-950 font-black text-[10px] flex items-center justify-center">2</span>
      case 3:
        return <span className="w-5 h-5 rounded-full bg-amber-700 text-white font-black text-[10px] flex items-center justify-center">3</span>
      default:
        return <span className="w-5 h-5 text-slate-500 font-bold text-xs flex items-center justify-center">{rank}</span>
    }
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-400" />
          Platform Leaderboard
        </h3>
        <span className="text-[11px] text-slate-500">Top Competitors</span>
      </div>

      <div className="divide-y divide-slate-800/80">
        {entries.slice(0, 5).map((player) => {
          const isMe = currentUserId === player.id

          return (
            <div
              key={player.id}
              className={`py-2.5 flex items-center justify-between text-xs transition ${
                isMe ? 'bg-emerald-500/10 px-2 rounded-lg -mx-2' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                {getRankBadge(player.rank)}
                <div className="w-6 h-6 rounded-md bg-slate-800 text-emerald-400 font-bold text-[11px] flex items-center justify-center">
                  {player.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <span className={`font-semibold ${isMe ? 'text-emerald-400 font-bold' : 'text-slate-200'}`}>
                    {player.username}
                  </span>
                  {isMe && <span className="text-[9px] text-emerald-500 ml-1.5 font-bold uppercase">(You)</span>}
                </div>
              </div>

              <div className="flex items-center gap-1.5 font-bold text-amber-400 font-mono">
                <Medal className="w-3.5 h-3.5 text-amber-500/80" />
                <span>{player.rating}</span>
              </div>
            </div>
          )
        })}

        {entries.length === 0 && (
          <div className="py-6 text-center text-xs text-slate-500">
            No rated players recorded yet.
          </div>
        )}
      </div>
    </div>
  )
}
