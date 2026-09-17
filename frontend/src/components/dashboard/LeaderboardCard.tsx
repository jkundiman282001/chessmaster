import { Trophy, Medal, Crown } from 'lucide-react'
import type { LeaderboardEntry } from '../../types/game'

interface LeaderboardCardProps {
  entries: LeaderboardEntry[]
  currentUserId?: number
}

export function LeaderboardCard({ entries, currentUserId }: LeaderboardCardProps) {
  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <span className="w-6 h-6 rounded-full bg-gradient-to-br from-brass-light to-brass text-ink font-black text-xs flex items-center justify-center shadow-md shadow-black/30">
            1
          </span>
        )
      case 2:
        return (
          <span className="w-6 h-6 rounded-full bg-gradient-to-br from-ivory to-parchment text-ink font-black text-xs flex items-center justify-center shadow-md">
            2
          </span>
        )
      case 3:
        return (
          <span className="w-6 h-6 rounded-full bg-gradient-to-br from-brass-dim to-walnut text-ivory font-black text-xs flex items-center justify-center shadow-md">
            3
          </span>
        )
      default:
        return (
          <span className="w-6 h-6 text-parchment-dim font-bold text-xs flex items-center justify-center font-mono">
            {rank}
          </span>
        )
    }
  }

  return (
    <div className="glass-panel rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-ink-line shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-extrabold text-ivory uppercase tracking-wider flex items-center gap-2">
          <Trophy className="w-4 h-4 text-brass" />
          <span>Platform Leaderboard</span>
        </h3>
        <span className="text-[10px] uppercase font-bold text-parchment-dim tracking-wider">Top Competitors</span>
      </div>

      <div className="divide-y divide-ink-line">
        {entries.slice(0, 5).map((player) => {
          const isMe = currentUserId === player.id

          return (
            <div
              key={player.id}
              className={`py-3 flex items-center justify-between text-xs transition-all ${
                isMe
                  ? 'bg-brass/10 px-3 rounded-xl border border-brass/25 -mx-1 my-0.5'
                  : 'hover:bg-white/[0.02] px-1'
              }`}
            >
              <div className="flex items-center gap-3">
                {getRankBadge(player.rank)}
                <div className="w-7 h-7 rounded-lg bg-ink-raised border border-ink-line text-brass font-extrabold text-xs flex items-center justify-center shadow-xs">
                  {player.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className={`font-bold ${isMe ? 'text-brass-light' : 'text-ivory'}`}>
                      {player.username}
                    </span>
                    {player.rank === 1 && <Crown className="w-3 h-3 text-brass" />}
                  </div>
                  {isMe && <span className="text-[9px] text-brass-light font-bold uppercase">(You)</span>}
                </div>
              </div>

              <div className="flex items-center gap-1.5 font-black text-brass-light font-mono">
                <Medal className="w-3.5 h-3.5 text-brass-dim" />
                <span>{player.rating}</span>
              </div>
            </div>
          )
        })}

        {entries.length === 0 && (
          <div className="py-8 text-center text-xs text-parchment-dim">
            No rated players recorded yet.
          </div>
        )}
      </div>
    </div>
  )
}