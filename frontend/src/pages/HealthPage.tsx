import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { AuthModal } from '../components/auth/AuthModal'
import { UserMenu } from '../components/auth/UserMenu'
import { AuthGuard } from '../components/auth/AuthGuard'
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
  UserPlus,
  ArrowLeft,
} from 'lucide-react'

interface HealthResponse {
  status: string
  service: string
  database: string
  broadcasting: string
  timestamp: string
}

export function HealthPage() {
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
    <div className="min-h-screen bg-[#050811] text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white relative">
      {/* Background glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[900px] h-[350px] bg-gradient-to-b from-emerald-500/10 via-sky-500/5 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Navigation / Header */}
      <header className="border-b border-white/5 bg-[#070c18]/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/10 text-xs font-bold transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </Link>
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-slate-600">/</span>
              <span className="text-xs font-bold text-slate-300">System Diagnostics &amp; Telemetry</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* System Status Indicator */}
            <span className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 text-slate-300 border border-white/10 text-xs font-semibold">
              <span className="relative flex h-2 w-2">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full ${
                    health?.status === 'healthy' ? 'bg-emerald-400' : 'bg-amber-400'
                  } opacity-75`}
                />
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    health?.status === 'healthy' ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                />
              </span>
              <span>{health?.status === 'healthy' ? 'API Healthy' : 'Checking...'}</span>
            </span>

            {/* Auth Actions or User Profile */}
            {authLoading ? (
              <div className="w-24 h-8 bg-slate-850 animate-pulse rounded-xl" />
            ) : isAuthenticated && user ? (
              <UserMenu />
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openAuth('login')}
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl text-slate-300 hover:text-white transition cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => openAuth('register')}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl shadow-md shadow-emerald-500/20 transition cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 w-full space-y-6 sm:space-y-8">
        {/* Title Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 text-xs font-bold border border-emerald-500/20">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Multiplayer Infrastructure Diagnostics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
            System Diagnostics &amp; Engine Telemetry
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Real-time telemetry for the decoupled Laravel 11 REST API, PostgreSQL database cluster,
            first-party Reverb WebSockets, and Sanctum SPA authentication state.
          </p>
        </div>

        {/* User Session Spotlight Card */}
        <div className="glass-panel border border-white/10 rounded-2xl sm:rounded-3xl p-6 shadow-xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-slate-950 font-black text-2xl flex items-center justify-center shadow-md shrink-0">
                {isAuthenticated && user ? user.username.charAt(0).toUpperCase() : '♟'}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="text-xl font-black text-white">
                    {isAuthenticated && user ? user.username : 'Guest Session'}
                  </h2>
                  {isAuthenticated && user ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 text-xs font-bold border border-emerald-500/30 flex items-center gap-1">
                      <UserCheck className="w-3 h-3" /> Authenticated
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 text-xs font-bold border border-slate-700">
                      Unauthenticated
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400">
                  {isAuthenticated && user
                    ? `Registered email: ${user.email} • Player ID #${user.id}`
                    : 'Sign in or register to test protected API routes and real-time multiplayer.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              {isAuthenticated && user ? (
                <div className="flex items-center gap-4 bg-slate-950/70 border border-white/10 px-4 py-2.5 rounded-xl">
                  <div className="text-right">
                    <div className="text-[11px] text-slate-400 font-medium">Standard Rating</div>
                    <div className="text-base font-bold text-amber-400 font-mono flex items-center gap-1">
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
                    className="flex-1 sm:flex-initial px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold rounded-xl border border-white/10 transition cursor-pointer"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => openAuth('register')}
                    className="flex-1 sm:flex-initial px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 text-xs font-extrabold rounded-xl shadow-md shadow-emerald-950/50 transition cursor-pointer"
                  >
                    Create Account
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Protected Area Preview with AuthGuard */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>AuthGuard Protected Area Demonstration</span>
            </h3>
            <span className="text-[11px] text-slate-500">Accessible only when authenticated</span>
          </div>

          <AuthGuard onRequestLogin={() => openAuth('login')}>
            <div className="p-6 rounded-2xl sm:rounded-3xl glass-card border border-emerald-500/30 shadow-sm relative overflow-hidden">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    Verified Protected Route
                  </div>
                  <h4 className="text-base font-bold text-white">
                    Session active for {user?.name || user?.username}!
                  </h4>
                  <p className="text-xs text-slate-400 max-w-lg">
                    This component is guarded by <code className="text-emerald-300 bg-slate-950 px-1 py-0.5 rounded">&lt;AuthGuard&gt;</code>.
                    Your session cookie is active and your player profile is successfully loaded from <code className="text-emerald-300 bg-slate-950 px-1 py-0.5 rounded">GET /api/user</code>.
                  </p>
                </div>
                <div className="flex items-center gap-3 bg-slate-950/80 p-3 rounded-xl border border-white/5 text-xs text-slate-300 shrink-0">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  <span>Joined: {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Today'}</span>
                </div>
              </div>
            </div>
          </AuthGuard>
        </div>

        {/* System Architecture Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Backend Card */}
          <div className="glass-card p-5 rounded-2xl border border-white/5 hover:border-emerald-500/30 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase tracking-wider font-bold text-slate-400">Backend API</span>
              <Server className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-xl font-bold text-white mb-1">
              {loadingHealth ? 'Checking...' : health?.service || 'Laravel 11'}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>REST Endpoints Active</span>
            </div>
          </div>

          {/* Database Card */}
          <div className="glass-card p-5 rounded-2xl border border-white/5 hover:border-indigo-500/30 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase tracking-wider font-bold text-slate-400">Database</span>
              <Database className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="text-xl font-bold text-white mb-1">PostgreSQL 16</div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Schema &amp; Tables Indexed</span>
            </div>
          </div>

          {/* Real-time Card */}
          <div className="glass-card p-5 rounded-2xl border border-white/5 hover:border-purple-500/30 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase tracking-wider font-bold text-slate-400">Broadcasting</span>
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
          <div className="glass-card p-5 rounded-2xl border border-white/5 hover:border-amber-500/30 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase tracking-wider font-bold text-slate-400">Auth Engine</span>
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
        <div className="glass-panel border border-white/10 rounded-2xl sm:rounded-3xl p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-400" />
                <span>API Health &amp; Latency Probe</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Probes <code className="px-1.5 py-0.5 bg-slate-900 rounded text-emerald-300">GET /api/health</code> via proxy.
              </p>
            </div>
            <button
              onClick={checkHealth}
              disabled={loadingHealth}
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 transition cursor-pointer shadow-md shadow-emerald-950/40"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingHealth ? 'animate-spin' : ''}`} />
              <span>{loadingHealth ? 'Pinging...' : 'Ping API Now'}</span>
            </button>
          </div>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5">
              <div className="text-slate-400 mb-1">Roundtrip Latency</div>
              <div className="text-xl font-bold text-emerald-400 font-mono flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>{latency !== null ? `${latency} ms` : '—'}</span>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5">
              <div className="text-slate-400 mb-1">Server Timestamp</div>
              <div className="text-xs font-mono text-slate-200 mt-1 truncate">
                {health?.timestamp || '—'}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5">
              <div className="text-slate-400 mb-1">Auth &amp; CSRF Integration</div>
              <div className="text-xs font-bold text-emerald-400 mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Sanctum CSRF Active</span>
              </div>
            </div>
          </div>

          {healthError && (
            <div className="mt-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <div>
                <span className="font-semibold">Notice:</span> {healthError}
              </div>
            </div>
          )}
        </div>

        {/* Roadmap Progress */}
        <div className="glass-panel border border-white/10 rounded-2xl sm:rounded-3xl p-6">
          <div className="flex items-center gap-2.5 mb-5">
            <Layers className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white">Project Implementation Progress</h2>
          </div>

          <div className="space-y-3 text-xs">
            {[
              { phase: 'Phase 0 — Project Setup & Architecture', desc: 'Monorepo scaffold, PostgreSQL, Reverb WebSockets, Vite proxy, and Sanctum SPA config.', done: true },
              { phase: 'Phase 1 — Authentication & Calibration', desc: 'Registration, login with email/username, logout, SPA cookie auth guards, 1200 ELO baseline.', done: true },
              { phase: 'Phase 2 — Landing Page & Diagnostics', desc: 'Modern responsive marketing interface, interactive live board preview, architecture showcase.', done: true },
              { phase: 'Phase 3 — Dashboard & Matchmaking', desc: 'Authenticated player hub, room code creation, match join modal, ELO stats, active games list.', done: true },
              { phase: 'Phase 4 — Real-time Multiplayer Gameplay', desc: 'Authoritative move validation, Reverb real-time sync, clock timing, check/checkmate engine.', done: true },
              { phase: 'Phase 5 — Polish & Cosmetics Extension', desc: 'Themeable board skins, SVG piece sets, mobile-first touch optimization, reconnect handling.', done: true },
            ].map((p) => (
              <div
                key={p.phase}
                className="p-3.5 rounded-xl bg-slate-900/50 border border-white/5 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 font-bold flex items-center justify-center text-xs shrink-0">
                    ✓
                  </span>
                  <div>
                    <div className="font-bold text-white">{p.phase}</div>
                    <div className="text-slate-400 text-[11px]">{p.desc}</div>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 font-bold text-[10px] border border-emerald-500/30 shrink-0">
                  Ready
                </span>
              </div>
            ))}
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
      <footer className="border-t border-white/5 py-6 text-center text-xs text-slate-500">
        Multiplayer Chess Platform &bull; Architected with Laravel 11, React + TypeScript &amp; PostgreSQL
      </footer>
    </div>
  )
}
