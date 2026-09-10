import { useEffect, useState } from 'react'
import { api } from './lib/api'
import { AuthProvider, useAuth } from './context/AuthContext'
import { AuthModal } from './components/auth/AuthModal'
import { UserMenu } from './components/auth/UserMenu'
import { AuthGuard } from './components/auth/AuthGuard'
import {
  Activity,
  CheckCircle2,
  Database,
  Radio,
  RefreshCw,
  Server,
  Shield,
  Layers,
  Clock,
  Sparkles,
  AlertTriangle,
  UserCheck,
  Trophy,
  Calendar,
  LogIn,
  UserPlus
} from 'lucide-react'

interface HealthResponse {
  status: string
  service: string
  database: string
  broadcasting: string
  timestamp: string
}

function MainDashboard() {
  const { user, isAuthenticated, isLoading: authLoading, refreshUser } = useAuth()

  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [loadingHealth, setLoadingHealth] = useState<boolean>(true)
  const [healthError, setHealthError] = useState<string | null>(null)
  const [latency, setLatency] = useState<number | null>(null)

  // Auth modal state
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login')

  const checkHealth = async () => {
    setLoadingHealth(true)
    setHealthError(null)
    const startTime = performance.now()
    try {
      const response = await api.get<HealthResponse>('/api/health')
      const endTime = performance.now()
      setLatency(Math.round(endTime - startTime))
      setHealth(response.data)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown connection error'
      setHealthError(message)
    } finally {
      setLoadingHealth(false)
    }
  }

  useEffect(() => {
    checkHealth()
  }, [])

  const openAuth = (mode: 'login' | 'register') => {
    setAuthModalMode(mode)
    setAuthModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Navigation / Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-500/20 font-black text-xl text-slate-950">
              ♟
            </div>
            <div>
              <div className="font-bold tracking-tight text-lg flex items-center gap-2">
                Chessmaster
                <span className="text-xs uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Phase 1
                </span>
              </div>
              <p className="text-xs text-slate-400">Multiplayer Chess Platform</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* System Status Indicator */}
            <span className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700/80 text-xs">
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${health?.status === 'healthy' ? 'bg-emerald-400' : 'bg-amber-400'} opacity-75`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${health?.status === 'healthy' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
              </span>
              {health?.status === 'healthy' ? 'API Active' : 'Connecting...'}
            </span>

            {/* Auth Actions or User Profile */}
            {authLoading ? (
              <div className="w-24 h-8 bg-slate-800/60 animate-pulse rounded-xl"></div>
            ) : isAuthenticated && user ? (
              <UserMenu />
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openAuth('login')}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Sign In
                </button>
                <button
                  onClick={() => openAuth('register')}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-emerald-900/30 transition cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto px-6 py-10 w-full">
        {/* Phase Banner */}
        <div className="mb-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-semibold mb-4 border border-emerald-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            Phase 1: Sanctum SPA Authentication Active
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
            Multiplayer Chess Engine & Auth Hub
          </h1>
          <p className="text-slate-400 max-w-2xl text-sm sm:text-base leading-relaxed">
            Players can register, log in with username or email, verify session cookies, and access
            authenticated resources calibrated with standard 1200 starting ELO.
          </p>
        </div>

        {/* User Session Spotlight Card */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 mb-8 shadow-xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-2xl text-emerald-400 font-bold shrink-0">
                {isAuthenticated && user ? user.username.charAt(0).toUpperCase() : '♟'}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-bold text-white">
                    {isAuthenticated && user ? user.username : 'Guest Player'}
                  </h2>
                  {isAuthenticated && user ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30 flex items-center gap-1">
                      <UserCheck className="w-3 h-3" /> Authenticated
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 text-xs font-semibold border border-slate-700">
                      Unauthenticated Session
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {isAuthenticated && user
                    ? `Registered email: ${user.email} • Player ID #${user.id}`
                    : 'Log in or create a player profile to test authentication and protected state.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              {isAuthenticated && user ? (
                <div className="flex items-center gap-4 bg-slate-950/70 border border-slate-800 px-4 py-2.5 rounded-xl">
                  <div className="text-right">
                    <div className="text-[11px] text-slate-400 font-medium">Calibrated Rating</div>
                    <div className="text-base font-bold text-emerald-400 flex items-center gap-1">
                      <Trophy className="w-4 h-4 text-amber-400" />
                      {user.rating} ELO
                    </div>
                  </div>
                  <button
                    onClick={refreshUser}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                    title="Refresh profile from /api/user"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => openAuth('login')}
                    className="flex-1 sm:flex-initial px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition cursor-pointer"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => openAuth('register')}
                    className="flex-1 sm:flex-initial px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-emerald-900/30 transition cursor-pointer"
                  >
                    Create Player Account
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Protected Area Preview with AuthGuard */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              AuthGuard Protected Area Demo
            </h3>
            <span className="text-xs text-slate-500">Accessible only when authenticated</span>
          </div>

          <AuthGuard onRequestLogin={() => openAuth('login')}>
            <div className="p-6 rounded-2xl bg-slate-900 border border-emerald-500/30 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl"></div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
                    Verified Protected Route
                  </div>
                  <h4 className="text-base font-bold text-white">
                    Welcome back, {user?.name || user?.username}!
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-lg">
                    This component is guarded by <code className="text-emerald-300 bg-slate-950 px-1 py-0.5 rounded">&lt;AuthGuard&gt;</code>. 
                    Your session cookie is active and your player profile is successfully loaded from <code className="text-emerald-300 bg-slate-950 px-1 py-0.5 rounded">GET /api/user</code>.
                  </p>
                </div>
                <div className="flex items-center gap-3 bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 shrink-0">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  <span>Joined: {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Today'}</span>
                </div>
              </div>
            </div>
          </AuthGuard>
        </div>

        {/* System Architecture Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Backend Card */}
          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-sm hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">Backend API</span>
              <Server className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-xl font-bold text-white mb-1">
              {loadingHealth ? 'Checking...' : health?.service || 'Laravel 11'}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              {health ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>REST Endpoints Active</span>
                </>
              ) : (
                <span className="text-amber-400">Connecting...</span>
              )}
            </div>
          </div>

          {/* Database Card */}
          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-sm hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">Database</span>
              <Database className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="text-xl font-bold text-white mb-1">PostgreSQL 16</div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              {health?.database === 'connected' ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 capitalize">Users Migrated</span>
                </>
              ) : (
                <span className="text-amber-400">{health?.database || 'Connecting...'}</span>
              )}
            </div>
          </div>

          {/* Real-time Card */}
          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-sm hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">Broadcasting</span>
              <Radio className="w-5 h-5 text-purple-400" />
            </div>
            <div className="text-xl font-bold text-white mb-1 capitalize">
              {health?.broadcasting || 'Laravel Reverb'}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>WebSockets Ready</span>
            </div>
          </div>

          {/* Auth Card */}
          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-sm hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">Auth Engine</span>
              <Shield className="w-5 h-5 text-amber-400" />
            </div>
            <div className="text-xl font-bold text-white mb-1">Laravel Sanctum</div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>SPA Stateful Cookies</span>
            </div>
          </div>
        </div>

        {/* API Health Probe */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-400" />
                API Health & Latency Probe
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Probes <code className="px-1.5 py-0.5 bg-slate-800 rounded text-emerald-300">GET /api/health</code> via reverse proxy.
              </p>
            </div>
            <button
              onClick={checkHealth}
              disabled={loadingHealth}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium text-xs rounded-xl flex items-center gap-2 transition shadow-md shadow-emerald-900/40 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingHealth ? 'animate-spin' : ''}`} />
              {loadingHealth ? 'Pinging...' : 'Ping API Now'}
            </button>
          </div>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <div className="text-slate-400 mb-1">Roundtrip Latency</div>
              <div className="text-lg font-bold text-emerald-400 flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {latency !== null ? `${latency} ms` : '—'}
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <div className="text-slate-400 mb-1">Server Timestamp</div>
              <div className="text-xs font-mono text-slate-200 mt-1 truncate">
                {health?.timestamp || '—'}
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <div className="text-slate-400 mb-1">Auth & CSRF Integration</div>
              <div className="text-xs font-semibold text-emerald-400 mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Sanctum CSRF Cookie Active
              </div>
            </div>
          </div>

          {healthError && (
            <div className="mt-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <div>
                <span className="font-semibold">Notice:</span> {healthError} — Make sure the Laravel backend server is running (<code className="bg-rose-950/80 px-1 py-0.5 rounded text-rose-200">php artisan serve</code>).
              </div>
            </div>
          )}
        </div>

        {/* Development Phases Roadmap */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white">Project Phases & Architectural Roadmap</h2>
          </div>
          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 font-bold flex items-center justify-center text-xs">✓</span>
                <div>
                  <div className="font-semibold text-white">Phase 0 — Project Setup & Architecture</div>
                  <div className="text-emerald-400/80">Monorepo scaffold, PostgreSQL, Reverb WebSockets, Vite proxy, and Sanctum SPA config.</div>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                Completed
              </span>
            </div>

            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 font-bold flex items-center justify-center text-xs">1</span>
                <div>
                  <div className="font-semibold text-white">Phase 1 — Authentication</div>
                  <div className="text-emerald-400/80">Registration, login with email/username, logout, SPA cookie auth guards, 1200 ELO baseline.</div>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                Ready to Complete
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 flex items-center justify-between opacity-80">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 font-bold flex items-center justify-center text-xs">2</span>
                <div>
                  <div className="font-semibold text-slate-200">Phase 2 — Landing Page</div>
                  <div className="text-slate-400">Public marketing page with chess theme and authentication CTAs.</div>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 font-semibold">
                Up Next
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 flex items-center justify-between opacity-60">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-400 font-bold flex items-center justify-center text-xs">3</span>
                <div>
                  <div className="font-semibold text-slate-300">Phase 3 — Dashboard</div>
                  <div className="text-slate-500">Authenticated player hub, quick play, profile stats, and match history.</div>
                </div>
              </div>
              <span className="px-2 py-0.5 text-slate-500 font-medium">Pending</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 flex items-center justify-between opacity-60">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-400 font-bold flex items-center justify-center text-xs">4</span>
                <div>
                  <div className="font-semibold text-slate-300">Phase 4 — Core Chess Gameplay</div>
                  <div className="text-slate-500">Authoritative move validation, Reverb real-time sync, clock timing, and game end conditions.</div>
                </div>
              </div>
              <span className="px-2 py-0.5 text-slate-500 font-medium">Pending</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 flex items-center justify-between opacity-60">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-400 font-bold flex items-center justify-center text-xs">5</span>
                <div>
                  <div className="font-semibold text-slate-300">Phase 5 — Polish & Hardening</div>
                  <div className="text-slate-500">Reconnect handling, persistence, error states, and cosmetics extensibility preparation.</div>
                </div>
              </div>
              <span className="px-2 py-0.5 text-slate-500 font-medium">Pending</span>
            </div>
          </div>
        </div>
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
        Multiplayer Chess Platform &copy; 2026 &bull; Architected with Laravel 11, React + TypeScript & PostgreSQL
      </footer>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <MainDashboard />
    </AuthProvider>
  )
}
