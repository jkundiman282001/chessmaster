import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Trophy,
  Swords,
  Plus,
  LogIn,
  RefreshCw,
  Activity,
  Sparkles,
  Percent,
  CheckCircle2,
  Calendar,
  Radio
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
  const { user, refreshUser } = useAuth()
  const navigate = useNavigate()

  const [data, setData] = useState<DashboardResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [joinModalOpen, setJoinModalOpen] = useState(false)

  const fetchDashboardData = async () => {
    try {
      const response = await api.get<DashboardResponse>('/api/dashboard')
      setData(response.data)
    } catch {
      // Handled
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const handleRefresh = () => {
    setRefreshing(true)
    refreshUser()
    fetchDashboardData()
  }

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
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white">
        {/* Navigation Header */}
        <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-500/20 font-black text-xl text-slate-950">
                  ♟
                </div>
                <div>
                  <div className="font-bold tracking-tight text-lg flex items-center gap-2">
                    Chessmaster
                    <span className="text-xs uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Phase 3 Hub
                    </span>
                  </div>
                </div>
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 text-xs font-semibold transition cursor-pointer"
                title="Refresh dashboard data"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-emerald-400' : ''}`} />
                <span>Sync</span>
              </button>

              <Link
                to="/health"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 text-xs font-semibold transition"
              >
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Diagnostics</span>
              </Link>

              <UserMenu />
            </div>
          </div>
        </header>

        {/* Main Dashboard Content */}
        <main className="flex-1 max-w-6xl mx-auto px-6 py-8 w-full space-y-8">
          {/* Welcome Banner */}
          <div className="relative rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-6 shadow-xl overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
              <div className="flex items-start sm:items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-emerald-900/40 shrink-0">
                  {user?.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl font-black text-white">
                      Welcome, {user?.name || user?.username}!
                    </h1>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Player Hub
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Ready for your next match? Create a room or enter an opponent's code below.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={() => setCreateModalOpen(true)}
                  className="flex-1 sm:flex-initial px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-950/60 flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Create Match
                </button>
                <button
                  onClick={() => setJoinModalOpen(true)}
                  className="flex-1 sm:flex-initial px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-xs rounded-xl border border-slate-700 transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4 text-emerald-400" />
                  Join by Code
                </button>
              </div>
            </div>
          </div>

          {/* Performance & Rating Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* ELO Rating Card */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Rating</span>
                <Trophy className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-white font-mono flex items-baseline gap-1">
                {user?.rating ?? 1200}
                <span className="text-xs font-medium text-amber-400">ELO</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Standard Chess Calibration
              </div>
            </div>

            {/* Win Rate Card */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Win Rate</span>
                <Percent className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-white font-mono">
                {data?.user.stats.win_rate ?? 0}%
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Across completed games
              </div>
            </div>

            {/* Total Matches Card */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Matches</span>
                <Swords className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-2xl font-black text-white font-mono">
                {data?.user.stats.total_games ?? 0}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Total finished games
              </div>
            </div>

            {/* Win / Loss / Draw Record */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Record</span>
                <CheckCircle2 className="w-4 h-4 text-teal-400" />
              </div>
              <div className="text-sm font-black font-mono space-x-2 mt-1">
                <span className="text-emerald-400 font-bold">{data?.user.stats.wins ?? 0}W</span>
                <span className="text-rose-400 font-bold">{data?.user.stats.losses ?? 0}L</span>
                <span className="text-slate-400 font-bold">{data?.user.stats.draws ?? 0}D</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Wins • Losses • Draws
              </div>
            </div>
          </div>

          {/* Main Dual Grid: Matches (Left) vs Sidebar (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left 8 Columns: Active Matches & History */}
            <div className="lg:col-span-8 space-y-8">
              {/* Active Matches Section */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-emerald-400" />
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                      Active Games ({data?.active_games.length ?? 0})
                    </h2>
                  </div>
                  <button
                    onClick={() => setCreateModalOpen(true)}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    New Game
                  </button>
                </div>

                {loading ? (
                  <div className="p-8 text-center text-xs text-slate-400 animate-pulse">
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
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-indigo-400" />
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                      Recent Match History
                    </h2>
                  </div>
                  <span className="text-xs text-slate-500">Last 10 Games</span>
                </div>

                {loading ? (
                  <div className="p-8 text-center text-xs text-slate-400 animate-pulse">
                    Loading match history...
                  </div>
                ) : (
                  <MatchHistoryList matches={data?.recent_matches ?? []} />
                )}
              </div>
            </div>

            {/* Right 4 Columns: Cosmetics Loadout & Leaderboard */}
            <div className="lg:col-span-4 space-y-6">
              {/* Cosmetics Preview Card */}
              <CosmeticsPreviewCard />

              {/* Leaderboard Card */}
              <LeaderboardCard
                entries={data?.leaderboard ?? []}
                currentUserId={user?.id}
              />
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

        {/* Footer */}
        <footer className="border-t border-slate-800/80 py-8 bg-slate-950 text-xs text-slate-500">
          <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">♟</span>
              <span className="font-bold text-slate-300">Chessmaster Platform</span>
              <span>&bull;</span>
              <span>Phase 3 Authenticated Dashboard</span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/" className="hover:text-emerald-400 transition">
                Landing Page
              </Link>
              <Link to="/health" className="hover:text-emerald-400 transition">
                System Diagnostics
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </AuthGuard>
  )
}
