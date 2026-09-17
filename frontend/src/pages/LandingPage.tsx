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
  Layers,
  Users,
  Lock,
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
    <div className="min-h-screen bg-[#050811] text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white relative overflow-hidden">
      {/* Background ambient lighting effects */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[450px] bg-gradient-to-b from-emerald-500/10 via-sky-500/5 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-0 w-[600px] h-[500px] bg-gradient-to-tl from-indigo-500/10 via-emerald-500/5 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-[#070c18]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-xl text-slate-950 font-black shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-200">
              ♟
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-white flex items-center gap-2">
                Chessmaster
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Online
                </span>
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#features" className="hover:text-emerald-400 transition-colors">
              Architecture & Features
            </a>
            <a href="#how-it-works" className="hover:text-emerald-400 transition-colors">
              How It Works
            </a>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/dashboard"
                  className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-900/40 hover:shadow-emerald-900/60 transition-all cursor-pointer"
                >
                  <Trophy className="w-3.5 h-3.5" />
                  <span>Match Hub</span>
                </Link>
                <UserMenu />
              </div>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={() => openAuth('login')}
                  className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => openAuth('register')}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all cursor-pointer"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Headline & Call To Action */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Tag Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-emerald-500/30 shadow-lg backdrop-blur-md text-xs font-semibold text-emerald-300">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>Next-Generation Multiplayer Chess Engine</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15]">
              Every move <span className="text-gradient-emerald">verified</span>.
              <br />
              Every player <span className="text-gradient">ranked</span>.
            </h1>

            {/* Subheading */}
            <p className="text-slate-400 text-base sm:text-lg lg:text-xl max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              A high-performance chess arena designed with server-authoritative move validation, zero client trust, real-time Reverb WebSockets, and standard 1200 ELO competitive calibration.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              {isAuthenticated && user ? (
                <Link
                  to="/dashboard"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-extrabold text-sm shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2.5 transition-all cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-slate-950" />
                  <span>Enter Match Hub ({user.username})</span>
                </Link>
              ) : (
                <>
                  <button
                    onClick={() => openAuth('register')}
                    className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-sm shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer group"
                  >
                    <Play className="w-4 h-4 fill-slate-950" />
                    <span>Create Account &amp; Play</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </button>

                  <button
                    onClick={() => openAuth('login')}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white font-bold text-sm border border-slate-700/80 backdrop-blur-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <LogIn className="w-4 h-4 text-slate-400" />
                    <span>Existing Player Sign In</span>
                  </button>
                </>
              )}
            </div>

            {/* Metric Highlights Pills */}
            <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl mx-auto lg:mx-0">
              {[
                { label: 'Authority', value: '100% Server', icon: ShieldCheck, color: 'text-emerald-400' },
                { label: 'Latency', value: '<5ms Ping', icon: Zap, color: 'text-amber-400' },
                { label: 'Starting ELO', value: '1200 Rating', icon: Trophy, color: 'text-sky-400' },
                { label: 'Security', value: 'Anti-Cheat', icon: Lock, color: 'text-purple-400' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="p-3 rounded-xl bg-slate-900/60 border border-white/5 backdrop-blur-sm"
                >
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                    <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
                    <span>{stat.label}</span>
                  </div>
                  <div className="font-mono font-bold text-sm text-white">{stat.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Live Interactive Chess Preview */}
          <div className="lg:col-span-5 flex justify-center w-full">
            <BoardPreview theme="emerald" />
          </div>
        </div>
      </section>

      {/* Feature Highlights Section */}
      <section id="features" className="py-20 border-b border-white/5 bg-[#080d1a]/50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs uppercase font-bold tracking-widest text-emerald-400">
              High Integrity Engine
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Architected for Competitive Chess
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Chess demands uncompromising server authority, instant clock synchronization, and cheat resistance. We built the platform on production-grade standards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: ShieldCheck,
                color: 'text-emerald-400',
                bg: 'bg-emerald-500/10 border-emerald-500/20',
                title: 'Authoritative Validation',
                body: 'Client moves are treated as untrusted intent. The backend engine recalculates the FEN board, legal moves, check/checkmate, and turn order before committing.',
              },
              {
                icon: Zap,
                color: 'text-amber-400',
                bg: 'bg-amber-500/10 border-amber-500/20',
                title: 'Native WebSockets',
                body: 'First-party Laravel Reverb integration provides real-time event broadcasting for moves, spectator events, draw negotiations, and clock decrements.',
              },
              {
                icon: Trophy,
                color: 'text-sky-400',
                bg: 'bg-sky-500/10 border-sky-500/20',
                title: '1200 ELO Calibration',
                body: 'Every registered account enters the platform calibrated at standard 1200 ELO. High-concurrency database indexing powers instantaneous matchmaking.',
              },
              {
                icon: Sparkles,
                color: 'text-purple-400',
                bg: 'bg-purple-500/10 border-purple-500/20',
                title: 'Cosmetics Ready',
                body: 'Built with modular skin registries. Dynamic vector SVG piece sets and custom board palettes are structured to plug in seamlessly without touching core game logic.',
              },
            ].map((f) => (
              <div
                key={f.title}
                className="group p-6 rounded-2xl glass-card border border-white/5 hover:border-emerald-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-950/20"
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 border ${f.bg} ${f.color}`}
                >
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white mb-2 group-hover:text-emerald-300 transition-colors">
                  {f.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-14 space-y-2">
            <span className="text-xs uppercase font-bold tracking-widest text-sky-400">
              Simple Workflow
            </span>
            <h2 className="text-3xl font-black text-white">How It Works</h2>
            <p className="text-slate-400 text-sm">
              Start competing with friends or rivals across the globe in seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Create or Join Room',
                description: 'Pick your preferred time control (Bullet, Blitz, Rapid, or Classical) and generate a secure 8-character invite code.',
                icon: Layers,
              },
              {
                step: '02',
                title: 'Real-Time Matchplay',
                description: 'Play with responsive touch or drag-and-drop moves. Synchronized clocks and legal moves are verified on every single ply.',
                icon: Users,
              },
              {
                step: '03',
                title: 'Climb the Leaderboard',
                description: 'Every completed match dynamically updates player ratings and records full PGN notations to your personal match archive.',
                icon: Trophy,
              },
            ].map((s) => (
              <div
                key={s.step}
                className="relative p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-sm space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400">
                    <s.icon className="w-5 h-5" />
                  </div>
                  <span className="font-mono text-2xl font-black text-slate-700">{s.step}</span>
                </div>
                <h3 className="text-base font-bold text-white">{s.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 bg-[#04060d] text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">Chessmaster Platform</span>
            <span>&bull;</span>
            <span>Full-Stack Laravel 11 &amp; React 19 Engine</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#features" className="hover:text-emerald-400 transition-colors">
              Architecture
            </a>
            <a href="#how-it-works" className="hover:text-emerald-400 transition-colors">
              How It Works
            </a>
            <span className="text-slate-600">&copy; {new Date().getFullYear()} Chessmaster</span>
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