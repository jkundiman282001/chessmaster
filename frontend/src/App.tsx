import { useEffect, useState } from 'react'
import { api } from './lib/api'
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
  AlertTriangle
} from 'lucide-react'

interface HealthResponse {
  status: string
  service: string
  database: string
  broadcasting: string
  timestamp: string
}

export default function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [latency, setLatency] = useState<number | null>(null)

  const checkHealth = async () => {
    setLoading(true)
    setError(null)
    const startTime = performance.now()
    try {
      const response = await api.get<HealthResponse>('/api/health')
      const endTime = performance.now()
      setLatency(Math.round(endTime - startTime))
      setHealth(response.data)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown connection error'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkHealth()
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Navigation / Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-500/20 font-black text-xl text-slate-950">
              ♟
            </div>
            <div>
              <div className="font-bold tracking-tight text-lg flex items-center gap-2">
                Chessmaster
                <span className="text-xs uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Phase 0
                </span>
              </div>
              <p className="text-xs text-slate-400">Multiplayer Chess Platform</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${health?.status === 'healthy' ? 'bg-emerald-400' : 'bg-amber-400'} opacity-75`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${health?.status === 'healthy' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
              </span>
              {health?.status === 'healthy' ? 'System Operational' : 'Connecting...'}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto px-6 py-10 w-full">
        {/* Hero Section */}
        <div className="mb-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-semibold mb-4 border border-emerald-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            Architecture & Foundation Initialized
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
            Multiplayer Architecture Health Dashboard
          </h1>
          <p className="text-slate-400 max-w-2xl text-sm sm:text-base leading-relaxed">
            Phase 0 scaffold is verified. Full-stack communication between the Vite React frontend, 
            Laravel 11 REST API, PostgreSQL database, and Reverb broadcasting is active.
          </p>
        </div>

        {/* Status Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Backend Card */}
          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-sm hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">Backend API</span>
              <Server className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-xl font-bold text-white mb-1">
              {loading ? 'Checking...' : health?.service || 'Laravel 11'}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              {health ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>REST API Connected</span>
                </>
              ) : (
                <span className="text-amber-400">Pending connection</span>
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
                  <span className="text-emerald-400 capitalize">{health.database}</span>
                </>
              ) : (
                <span className="text-amber-400">{health?.database || 'Connecting...'}</span>
              )}
            </div>
          </div>

          {/* Real-time Card */}
          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-sm hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">Real-Time</span>
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
              <span>SPA Stateful Sessions</span>
            </div>
          </div>
        </div>

        {/* Live API Tester / Control Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-400" />
                API Health Probe
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Probes the backend <code className="px-1.5 py-0.5 bg-slate-800 rounded text-emerald-300">GET /api/health</code> endpoint via Vite proxy.
              </p>
            </div>
            <button
              onClick={checkHealth}
              disabled={loading}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium text-xs rounded-xl flex items-center gap-2 transition shadow-md shadow-emerald-900/40 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Pinging...' : 'Ping API Now'}
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
              <div className="text-slate-400 mb-1">CORS & CSRF Proxy</div>
              <div className="text-xs font-semibold text-emerald-400 mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Vite Reverse Proxy Active (Port 5173 ➔ 8000)
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <div>
                <span className="font-semibold">Connection Notice:</span> {error} — Ensure the Laravel server is running with <code className="bg-rose-950/80 px-1 py-0.5 rounded text-rose-200">php artisan serve</code>.
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
                <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 font-bold flex items-center justify-center text-xs">0</span>
                <div>
                  <div className="font-semibold text-white">Phase 0 — Project Setup & Architecture</div>
                  <div className="text-emerald-400/80">Monorepo scaffold, PostgreSQL, Reverb WebSockets, Vite proxy, and Sanctum SPA config.</div>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                Ready to Complete
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 flex items-center justify-between opacity-80">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 font-bold flex items-center justify-center text-xs">1</span>
                <div>
                  <div className="font-semibold text-slate-200">Phase 1 — Authentication</div>
                  <div className="text-slate-400">Registration, login, logout, SPA cookie auth guards, and user rating/avatar placeholders.</div>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 font-semibold">
                Up Next
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 flex items-center justify-between opacity-60">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-400 font-bold flex items-center justify-center text-xs">2</span>
                <div>
                  <div className="font-semibold text-slate-300">Phase 2 — Landing Page</div>
                  <div className="text-slate-500">Public marketing page with clean chess theme and authentication CTAs.</div>
                </div>
              </div>
              <span className="px-2 py-0.5 text-slate-500 font-medium">Pending</span>
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

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
        Multiplayer Chess Platform &copy; 2026 &bull; Architected with Laravel 11, React + TypeScript & PostgreSQL
      </footer>
    </div>
  )
}
