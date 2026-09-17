import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ShieldCheck,
  Zap,
  Trophy,
  Sparkles,
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

const LEDGER_STATS = [
  { label: 'Every move', value: 'Server-verified', icon: ShieldCheck },
  { label: 'Move broadcast', value: '< 5ms', icon: Zap },
  { label: 'New accounts', value: '1200 rating', icon: Trophy },
  { label: 'Client trust', value: 'None', icon: Lock },
]

const FEATURES = [
  {
    numeral: 'I',
    icon: ShieldCheck,
    title: 'The board never takes your word for it',
    body: 'A move you send is a request, not a fact. Our Laravel engine rebuilds the position from the last known FEN and checks it for legality, check, and checkmate before anything reaches your opponent.',
  },
  {
    numeral: 'II',
    icon: Zap,
    title: 'Moves travel over an open line, not a poll',
    body: 'Laravel Reverb keeps a live socket open for every game — moves, draw offers, resignations, and clock ticks arrive the instant they happen, for both players and anyone spectating.',
  },
  {
    numeral: 'III',
    icon: Trophy,
    title: 'A rating that means the same thing for everyone',
    body: 'Every account opens at a standard 1200, so your first win and your hundredth are measured on one scale. Ratings update the moment a game ends — no batch jobs, no delay.',
  },
  {
    numeral: 'IV',
    icon: Sparkles,
    title: "Cosmetics have a home, even though it's not built yet",
    body: "The piece and board renderer already reads from a skin registry instead of hardcoded assets, so a medieval set or a new palette drops in later without touching how a single game is played.",
  },
]

const STEPS = [
  {
    move: '1. e4',
    title: 'Open a room',
    icon: Layers,
    body: 'Choose Bullet, Blitz, Rapid, or Classical and get an 8-character code to send to whoever you\'re playing.',
  },
  {
    move: '2. Nf3',
    title: 'Play it out',
    icon: Users,
    body: 'Drag a piece or tap two squares. The clock, the check indicator, and your opponent\'s screen all update together.',
  },
  {
    move: '3. O-O',
    title: 'See where you land',
    icon: Trophy,
    body: 'The result updates your rating immediately and files the full game as PGN in your match history.',
  },
]

export function LandingPage() {
  const { user, isAuthenticated } = useAuth()
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('register')

  const openAuth = (mode: 'login' | 'register') => {
    setAuthModalMode(mode)
    setAuthModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-ink text-ivory font-sans flex flex-col selection:bg-brass selection:text-ink relative overflow-hidden">
      {/* Ambient light — brass and felt, not neon */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[450px] bg-gradient-to-b from-[#c69a52]/8 via-[#4b6249]/4 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-0 w-[600px] h-[500px] bg-gradient-to-tl from-[#4b6249]/8 via-transparent to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-ink/85 backdrop-blur-xl border-b border-ink-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brass to-walnut flex items-center justify-center text-xl text-ink font-display font-black shadow-lg shadow-black/30 group-hover:scale-105 transition-transform duration-200">
              ♟
            </div>
            <div>
              <span className="font-display font-bold text-lg tracking-tight text-ivory">
                Chessmaster
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm text-parchment">
            <a href="#features" className="hover:text-brass-light transition-colors">
              The engine
            </a>
            <a href="#how-it-works" className="hover:text-brass-light transition-colors">
              How to start
            </a>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/dashboard"
                  className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-brass hover:bg-brass-light text-ink text-xs font-bold shadow-lg shadow-black/30 transition-all cursor-pointer"
                >
                  <Trophy className="w-3.5 h-3.5" />
                  <span>Match hub</span>
                </Link>
                <UserMenu />
              </div>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={() => openAuth('login')}
                  className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-parchment hover:text-ivory transition-colors cursor-pointer"
                >
                  Sign in
                </button>
                <button
                  onClick={() => openAuth('register')}
                  className="px-4 py-2 text-xs sm:text-sm font-bold rounded-xl bg-brass hover:bg-brass-light text-ink shadow-lg shadow-black/30 transition-all cursor-pointer"
                >
                  Create account
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-14 pb-20 md:pt-20 md:pb-28 border-b border-ink-line board-field">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Headline & Call To Action */}
          <div className="lg:col-span-7 space-y-7 text-center lg:text-left relative">
            {/* Ghost notation watermark */}
            <span
              aria-hidden
              className="hidden lg:block absolute -top-10 -left-4 font-mono text-[13px] tracking-widest text-brass/25 select-none"
            >
              1. e4 e5&nbsp;&nbsp;2. Nf3 Nc6&nbsp;&nbsp;3. Bb5
            </span>

            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 text-xs font-medium text-parchment">
              <span className="w-4 h-[2px] bg-brass inline-block" />
              <span>Rated multiplayer chess</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.5rem] font-bold text-ivory tracking-tight leading-[1.12]">
              The board doesn't take anyone's word for it.
              <span className="text-gradient-brass"> Neither do we.</span>
            </h1>

            {/* Subheading */}
            <p className="text-parchment text-base sm:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Every move is replayed against the real position on our server before
              your opponent ever sees it, sent over an open socket in real time,
              starting every new player at a clean 1200 rating.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
              {isAuthenticated && user ? (
                <Link
                  to="/dashboard"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-brass hover:bg-brass-light text-ink font-bold text-sm shadow-xl shadow-black/30 flex items-center justify-center gap-2.5 transition-all cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-ink" />
                  <span>Enter match hub, {user.username}</span>
                </Link>
              ) : (
                <>
                  <button
                    onClick={() => openAuth('register')}
                    className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-brass hover:bg-brass-light text-ink font-bold text-sm shadow-xl shadow-black/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-ink" />
                    <span>Create your account</span>
                  </button>

                  <button
                    onClick={() => openAuth('login')}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-ink-raised hover:bg-ink-line text-parchment hover:text-ivory font-semibold text-sm border border-ink-line flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <LogIn className="w-4 h-4 text-parchment-dim" />
                    <span>Sign in</span>
                  </button>
                </>
              )}
            </div>

            {/* Ledger stat strip */}
            <div className="pt-6 flex flex-wrap justify-center lg:justify-start divide-x divide-ink-line max-w-xl mx-auto lg:mx-0 -mx-1">
              {LEDGER_STATS.map((stat) => (
                <div key={stat.label} className="px-4 py-1 first:pl-1 flex flex-col gap-1 min-w-[7rem]">
                  <div className="flex items-center gap-1.5 text-[11px] text-parchment-dim">
                    <stat.icon className="w-3 h-3 text-brass" />
                    <span>{stat.label}</span>
                  </div>
                  <div className="font-mono font-semibold text-sm text-ivory">{stat.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Live Interactive Chess Preview */}
          <div className="lg:col-span-5 flex justify-center w-full">
            <BoardPreview theme="walnut" />
          </div>
        </div>
      </section>

      {/* Feature Highlights Section */}
      <section id="features" className="py-20 border-b border-ink-line relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-16 space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-medium text-parchment">
              <span className="w-4 h-[2px] bg-brass inline-block" />
              <span>The engine underneath</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-ivory tracking-tight">
              Built like tournament equipment, not a toy.
            </h2>
            <p className="text-parchment text-sm sm:text-base leading-relaxed">
              Chess has no room for a desynced board or a move that quietly didn't
              land. Here's what that requirement actually shaped.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-0">
            {FEATURES.map((f) => (
              <div
                key={f.numeral}
                className="py-7 border-t border-ink-line flex gap-5"
              >
                <span className="font-display text-2xl text-brass-dim shrink-0 w-8 pt-0.5">
                  {f.numeral}
                </span>
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5 text-brass">
                    <f.icon className="w-4 h-4" />
                    <h3 className="text-sm font-bold text-ivory">{f.title}</h3>
                  </div>
                  <p className="text-[13px] text-parchment leading-relaxed">{f.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 border-b border-ink-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl mb-14 space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-medium text-parchment">
              <span className="w-4 h-[2px] bg-brass inline-block" />
              <span>From here to your first game</span>
            </div>
            <h2 className="font-display text-3xl font-bold text-ivory tracking-tight">
              Three moves to a rated game
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((s) => (
              <div
                key={s.move}
                className="relative p-6 rounded-2xl bg-ink-raised/60 border border-ink-line space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-ink border border-ink-line flex items-center justify-center text-brass">
                    <s.icon className="w-5 h-5" />
                  </div>
                  <span className="font-mono text-lg font-semibold text-brass-dim">{s.move}</span>
                </div>
                <h3 className="text-base font-bold text-ivory">{s.title}</h3>
                <p className="text-[13px] text-parchment leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 bg-ink-raised/60 text-parchment-dim text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-parchment">Chessmaster</span>
            <span className="text-ink-line">&bull;</span>
            <span>Laravel 11 &amp; React 19</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#features" className="hover:text-brass-light transition-colors">
              The engine
            </a>
            <a href="#how-it-works" className="hover:text-brass-light transition-colors">
              How to start
            </a>
            <span>&copy; {new Date().getFullYear()} Chessmaster</span>
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