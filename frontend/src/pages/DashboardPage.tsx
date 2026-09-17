import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Trophy,
  Swords,
  Plus,
  LogIn,
  Sparkles,
  Percent,
  CheckCircle2,
  Calendar,
  Radio,
  TrendingUp,
  Award,
} from 'lucide-react'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { AuthGuard } from '../components/auth/AuthGuard'
import { UserMenu } from '../components/auth/UserMenu'
import { CreateGameModal } from '../components/dashboard/CreateGameModal'
import { JoinGameModal } from '../components/dashboard/JoinGameModal'
import { ActiveGamesList } from '../components/dashboard/ActiveGamesList'
import { MatchHistoryList } from '../components/dashboard/MatchHistoryList'
import { LeaderboardCard } from '../components/dashboard/LeaderboardCard'
import { CosmeticsPreviewCard } from '../components/dashboard/CosmeticsPreviewCard'
import type { DashboardResponse, Game } from '../types/game'

export function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [data, setData] = useState<DashboardResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [joinModalOpen, setJoinModalOpen] = useState(false)

  const fetchDashboardData = async () => {
    try {
      const response = await api.get<DashboardResponse>('/api/dashboard')
      setData(response.data)
    } catch {
      // Handled gracefully
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const handleGameCreated = (newGame: Game) => {
    setData((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        active_games: [newGame, ...prev.active_games],
      }
    })
    navigate(`/play/${newGame.code}`)
  }

  const handleGameJoined = (joinedGame: Game) => {
    setData((prev) => {
      if (!prev) return prev
      const exists = prev.active_games.some((g) => g.code === joinedGame.code)
      return {
        ...prev,
        active_games: exists
          ? prev.active_games.map((g) => (g.code === joinedGame.code ? joinedGame : g))
          : [joinedGame, ...prev.active_games],
      }
    })
    navigate(`/play/${joinedGame.code}`)
  }

  return (
    <AuthGuard onRequestLogin={() => navigate('/')}>
      <div className="min-h-screen bg-[#050811] text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white relative">
        {/* Ambient background glow */}
        <div className="fixed top-0 right-1/4 w-[700px] h-[350px] bg-gradient-to-b from-emerald-500/10 via-sky-500/5 to-transparent blur-3xl pointer-events-none -z-10" />

        {/* Navigation Header */}
        <header className="border-b border-white/5 bg-[#070c18]/80 backdrop-blur-xl sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center gap-2.5 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center font-black text-xl text-slate-950 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-200">
                  ♟
                </div>
                <div>
                  <div className="font-extrabold tracking-tight text-lg text-white flex items-center gap-2">
                    Chessmaster
                    <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Match Hub
                    </span>
                  </div>
                </div>
              </Link>
            </div>

            <div className="flex items-center gap-2.5">
              <UserMenu />
            </div>
          </div>
        </header>

        {/* Main Dashboard Content */}
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full space-y-6 sm:space-y-8">
          {/* Welcome Player Card */}
          <div className="relative rounded-2xl sm:rounded-3xl glass-panel p-6 sm:p-8 shadow-xl overflow-hidden border border-white/10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
              <div className="flex items-center gap-4 sm:gap-5">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-slate-950 font-black text-2xl sm:text-3xl flex items-center justify-center shadow-xl shadow-emerald-950/50 shrink-0">
                  {user?.username.charAt(0).toUpperCase()}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white">
                      Welcome back, {user?.name || user?.username}!
                    </h1>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 text-xs font-bold border border-emerald-500/30 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-emerald-400" /> Competitor
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-400">
                    Ready for your next match? Create a tournament room or enter an opponent's code below.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 w-full lg:w-auto">
                <button
                  onClick={() => setCreateModalOpen(true)}
                  className="flex-1 lg:flex-initial px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Match</span>
                </button>
                <button
                  onClick={() => setJoinModalOpen(true)}
                  className="flex-1 lg:flex-initial px-5 py-3 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white font-bold text-xs sm:text-sm rounded-xl border border-white/10 transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4 text-emerald-400" />
                  <span>Join by Code</span>
                </button>
              </div>
            </div>
          </div>

          {/* Performance & Rating Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* ELO Rating Card */}
            <div className="glass-card p-5 rounded-2xl border border-white/5 relative overflow-hidden group hover:border-amber-500/30 transition-all duration-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Rating</span>
                <Trophy className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white font-mono flex items-baseline gap-1.5">
                {user?.rating ?? 1200}
                <span className="text-xs font-bold text-amber-400">ELO</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                <Award className="w-3 h-3 text-emerald-400" />
                <span>Standard Calibration</span>
              </div>
            </div>

            {/* Win Rate Card */}
            <div className="glass-card p-5 rounded-2xl border border-white/5 relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Win Rate</span>
                <Percent className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white font-mono">
                {data?.user.stats.win_rate ?? 0}%
              </div>
              <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-emerald-400" />
                <span>Across completed games</span>
              </div>
            </div>

            {/* Total Matches Card */}
            <div className="glass-card p-5 rounded-2xl border border-white/5 relative overflow-hidden group hover:border-indigo-500/30 transition-all duration-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Matches</span>
                <Swords className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white font-mono">
                {data?.user.stats.total_games ?? 0}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Total archived games
              </div>
            </div>

            {/* Win / Loss / Draw Record */}
            <div className="glass-card p-5 rounded-2xl border border-white/5 relative overflow-hidden group hover:border-teal-500/30 transition-all duration-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Record</span>
                <CheckCircle2 className="w-4 h-4 text-teal-400" />
              </div>
              <div className="text-sm sm:text-base font-black font-mono space-x-2 mt-1">
                <span className="text-emerald-400">{data?.user.stats.wins ?? 0}W</span>
                <span className="text-rose-400">{data?.user.stats.losses ?? 0}L</span>
                <span className="text-slate-400">{data?.user.stats.draws ?? 0}D</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Wins &bull; Losses &bull; Draws
              </div>
            </div>
          </div>

          {/* Main Content Grid: Matches (Left) vs Sidebar (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
            {/* Left 8 Columns: Active Matches & History */}
            <div className="lg:col-span-8 space-y-6 sm:space-y-8">
              {/* Active Matches Section */}
              <div className="glass-panel rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-white/10 shadow-sm">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2.5">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <Radio className="w-4 h-4 text-emerald-400" />
                    <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">
                      Active Games ({data?.active_games.length ?? 0})
                    </h2>
                  </div>
                  <button
                    onClick={() => setCreateModalOpen(true)}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New Game</span>
                  </button>
                </div>

                {loading ? (
                  <div className="p-10 text-center text-xs text-slate-400 animate-pulse">
                    Loading matches...
                  </div>
                ) : (
                  <ActiveGamesList
                    games={data?.active_games ?? []}
                    onSelectGame={(game) => {
                      navigate(`/play/${game.code}`)
                    }}
                  />
                )}
              </div>

              {/* Match History Section */}
              <div className="glass-panel rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-white/10 shadow-sm">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-indigo-400" />
                    <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">
                      Match History ({data?.recent_matches.length ?? 0})
                    </h2>
                  </div>
                </div>

                {loading ? (
                  <div className="p-10 text-center text-xs text-slate-400 animate-pulse">
                    Loading history...
                  </div>
                ) : (
                  <MatchHistoryList matches={data?.recent_matches ?? []} />
                )}
              </div>
            </div>

            {/* Right 4 Columns: Leaderboard & Equipped Loadout */}
            <div className="lg:col-span-4 space-y-6">
              <LeaderboardCard
                entries={data?.leaderboard ?? []}
                currentUserId={user?.id}
              />
              <CosmeticsPreviewCard />
            </div>
          </div>
        </main>

        {/* Create Game Modal */}
        <CreateGameModal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onGameCreated={handleGameCreated}
        />

        {/* Join Game Modal */}
        <JoinGameModal
          isOpen={joinModalOpen}
          onClose={() => setJoinModalOpen(false)}
          onGameJoined={handleGameJoined}
        />
      </div>
    </AuthGuard>
  )
}
