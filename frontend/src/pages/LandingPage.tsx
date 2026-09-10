import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ShieldCheck,
  Zap,
  Trophy,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Play,
  LogIn,
  Activity,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { AuthModal } from '../components/auth/AuthModal'
import { UserMenu } from '../components/auth/UserMenu'
import { BoardPreview } from '../components/chess/BoardPreview'

export function LandingPage() {
  const { user, isAuthenticated } = useAuth()
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('register')

  const openAuth = (mode: 'login' | 'register') => {
    setAuthModalMode(mode)
    setAuthModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Navigation Header */}
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
                  Phase 2
                </span>
              </div>
            </div>
          </div>

          {/* Center navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-300">
            <a href="#features" className="hover:text-emerald-400 transition">
              Architecture & Features
            </a>
            <a href="#how-it-works" className="hover:text-emerald-400 transition">
              How It Works
            </a>
            <Link to="/health" className="flex items-center gap-1 hover:text-emerald-400 transition">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              API Diagnostics
            </Link>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/dashboard"
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white shadow-sm transition"
                >
                  <Trophy className="w-3.5 h-3.5" />
                  Dashboard
                </Link>
                <UserMenu />
              </div>
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
                  Play Free
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden border-b border-slate-800/60">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Hero Left Column */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              Production-Grade Authoritative Multiplayer
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1]">
              Master the Board. <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 bg-clip-text text-transparent">
                Outthink the World.
              </span>
            </h1>

            <p className="text-slate-400 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Experience real-time online chess engineered with server-authoritative move validation, 
              zero cheat tolerance, native WebSockets, and standard 1200 ELO competitive rating.
            </p>

            {/* CTA Button Group */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              {isAuthenticated && user ? (
                <div className="flex items-center gap-3">
                  <Link
                    to="/dashboard"
                    className="w-full sm:w-auto px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl shadow-xl shadow-emerald-950/60 flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    Enter Match Hub ({user.username})
                  </Link>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => openAuth('register')}
                    className="w-full sm:w-auto px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl shadow-xl shadow-emerald-950/60 flex items-center justify-center gap-2 transition cursor-pointer group"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    Create Account & Play Free
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </button>

                  <button
                    onClick={() => openAuth('login')}
                    className="w-full sm:w-auto px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white font-semibold text-sm rounded-xl border border-slate-700/80 transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <LogIn className="w-4 h-4 text-slate-400" />
                    Existing Player Login
                  </button>
                </>
              )}
            </div>

            {/* Trust / Metric Badges */}
            <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-800/80 max-w-md mx-auto lg:mx-0 text-left">
              <div>
                <div className="text-xl font-black text-white flex items-center gap-1">
                  100%
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-[11px] text-slate-400">Server Validated</div>
              </div>
              <div>
                <div className="text-xl font-black text-white flex items-center gap-1">
                  &lt;5ms
                  <Zap className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-[11px] text-slate-400">Reverb WebSockets</div>
              </div>
              <div>
                <div className="text-xl font-black text-white flex items-center gap-1">
                  1200
                  <Trophy className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="text-[11px] text-slate-400">Standard Starting ELO</div>
              </div>
            </div>
          </div>

          {/* Hero Right Column: Interactive Themeable Chessboard */}
          <div className="lg:col-span-5 flex justify-center">
            <BoardPreview theme="emerald" />
          </div>
        </div>
      </section>

      {/* Feature Highlights Section */}
      <section id="features" className="py-20 border-b border-slate-800/60 bg-slate-950/40">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs uppercase tracking-wider font-semibold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 inline-block mb-3">
              Engineered for Competitive Play
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
              Architecture Built with Chess Integrity
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              Unlike simplistic board games, chess demands uncompromising server authority, instant clock synchronization, and anti-cheat enforcement.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="bg-slate-900/70 border border-slate-800 p-6 rounded-2xl hover:border-slate-700 transition">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-5">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Authoritative Validation</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Client moves are treated as intent. The server chess engine parses the FEN, verifies legality, turns, checks, and timers before committing state.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-900/70 border border-slate-800 p-6 rounded-2xl hover:border-slate-700 transition">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-5">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Native WebSockets</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Powered by first-party Laravel Reverb. Enjoy synchronized move broadcasts, spectator hooks, and authoritative game timers without 3rd-party latency.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-900/70 border border-slate-800 p-6 rounded-2xl hover:border-slate-700 transition">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-5">
                <Trophy className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">1200 ELO Calibration</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Every new competitor enters the platform calibrated at standard 1200 ELO. Indexed database schemas ensure rapid matchmaking and leaderboards.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-slate-900/70 border border-slate-800 p-6 rounded-2xl hover:border-slate-700 transition">
              <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 mb-5">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Cosmetics Extensibility</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Themeable component abstractions and extensible inventory schemas ready to receive custom board skins and piece sets in future updates without refactoring.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 border-b border-slate-800/60">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
              How to Play in Three Steps
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              Seamlessly transition from guest to grandmaster with zero complex setup.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative bg-slate-900/50 border border-slate-800/80 p-8 rounded-2xl">
              <span className="w-10 h-10 rounded-full bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-sm mb-4">
                1
              </span>
              <h3 className="text-base font-bold text-white mb-2">Create Player Profile</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Register with a unique username and email. Your account is immediately initialized with a 1200 ELO rating and secure session cookies.
              </p>
            </div>

            <div className="relative bg-slate-900/50 border border-slate-800/80 p-8 rounded-2xl">
              <span className="w-10 h-10 rounded-full bg-slate-800 text-emerald-400 border border-slate-700 font-black flex items-center justify-center text-sm mb-4">
                2
              </span>
              <h3 className="text-base font-bold text-white mb-2">Join Lobby or Create Room</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Queue for instant matchmaking or generate a custom match link to challenge a friend to a blitz, rapid, or standard game.
              </p>
            </div>

            <div className="relative bg-slate-900/50 border border-slate-800/80 p-8 rounded-2xl">
              <span className="w-10 h-10 rounded-full bg-slate-800 text-emerald-400 border border-slate-700 font-black flex items-center justify-center text-sm mb-4">
                3
              </span>
              <h3 className="text-base font-bold text-white mb-2">Authoritative Real-Time Play</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Make your move with optimistic client preview. Watch moves sync across devices via WebSockets with server-validated clocks and checkmate detection.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="relative rounded-3xl bg-gradient-to-br from-emerald-950/80 via-slate-900 to-slate-900 border border-emerald-500/30 p-8 sm:p-12 text-center overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>

            <span className="text-xs uppercase tracking-wider font-semibold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 inline-block mb-4">
              Phase 2 Active
            </span>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
              Ready to Make Your Opening Move?
            </h2>

            <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto mb-8">
              Join Chessmaster now to experience fair, authoritative, and competitive online chess.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {isAuthenticated && user ? (
                <Link
                  to="/dashboard"
                  className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-950/60 transition cursor-pointer flex items-center gap-2"
                >
                  <Trophy className="w-4 h-4" />
                  Go to Player Dashboard
                </Link>
              ) : (
                <>
                  <button
                    onClick={() => openAuth('register')}
                    className="w-full sm:w-auto px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-950/60 transition cursor-pointer"
                  >
                    Create Free Account
                  </button>
                  <button
                    onClick={() => openAuth('login')}
                    className="w-full sm:w-auto px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs sm:text-sm rounded-xl border border-slate-700 transition cursor-pointer"
                  >
                    Sign In to Existing Account
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-10 bg-slate-950 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">♟</span>
            <span className="font-bold text-slate-300">Chessmaster Platform</span>
            <span>&bull;</span>
            <span>Multiplayer Chess &copy; 2026</span>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/health" className="hover:text-emerald-400 transition">
              Diagnostics & Health
            </Link>
            <a href="#features" className="hover:text-emerald-400 transition">
              Architecture
            </a>
            <span className="text-slate-600">Built with Laravel 11, React 19, TypeScript & PostgreSQL</span>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
      />
    </div>
  )
}
