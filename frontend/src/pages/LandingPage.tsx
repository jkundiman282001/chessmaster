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
    <div
      className="min-h-screen text-[var(--px-cream)] flex flex-col selection:bg-[var(--px-amber)] selection:text-[var(--px-ink)]"
      style={{ backgroundColor: 'var(--px-bg)', fontFamily: 'var(--font-body)' }}
    >
      {/* Design tokens, retro pixel type, and structural utilities.
          In production, move this into a global stylesheet / index.html <link>
          rather than an inline <style> tag. */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap');

        :root {
          --font-display: 'Press Start 2P', monospace;
          --font-body: 'VT323', monospace;

          --px-bg: #0b0e1a;
          --px-panel: #121729;
          --px-line: #2a3358;
          --px-ink: #05060b;
          --px-cream: #f4ecd8;
          --px-muted: #8b93b8;
          --px-amber: #ffb347;
          --px-crimson: #ef5b5b;
        }

        .font-display { font-family: var(--font-display); }

        .pixel-corners {
          clip-path: polygon(
            0 10px, 10px 10px, 10px 0,
            calc(100% - 10px) 0, calc(100% - 10px) 10px, 100% 10px,
            100% calc(100% - 10px), calc(100% - 10px) calc(100% - 10px), calc(100% - 10px) 100%,
            10px 100%, 10px calc(100% - 10px), 0 calc(100% - 10px)
          );
        }
        .pixel-corners-sm {
          clip-path: polygon(
            0 4px, 4px 4px, 4px 0,
            calc(100% - 4px) 0, calc(100% - 4px) 4px, 100% 4px,
            100% calc(100% - 4px), calc(100% - 4px) calc(100% - 4px), calc(100% - 4px) 100%,
            4px 100%, 4px calc(100% - 4px), 0 calc(100% - 4px)
          );
        }
        .pixel-btn {
          transition: transform 0.08s steps(2), box-shadow 0.08s steps(2);
          box-shadow: 4px 4px 0 0 var(--px-ink);
        }
        .pixel-btn:hover { transform: translate(-2px, -2px); box-shadow: 6px 6px 0 0 var(--px-ink); }
        .pixel-btn:active { transform: translate(2px, 2px); box-shadow: 1px 1px 0 0 var(--px-ink); }

        @keyframes pixelBlink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }

        .scanlines::before {
          content: '';
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 50;
          background: repeating-linear-gradient(
            0deg,
            rgba(0,0,0,0.12) 0px,
            rgba(0,0,0,0.12) 1px,
            transparent 1px,
            transparent 3px
          );
          opacity: 0.35;
        }
      `}</style>

      <div className="scanlines flex flex-col min-h-screen">
        {/* Navigation Header */}
        <header
          className="sticky top-0 z-40"
          style={{ backgroundColor: 'var(--px-panel)', borderBottom: '3px solid var(--px-line)' }}
        >
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="pixel-corners-sm w-10 h-10 flex items-center justify-center text-xl"
                style={{ backgroundColor: 'var(--px-amber)', color: 'var(--px-ink)', border: '2px solid var(--px-ink)' }}
              >
                &#9823;
              </div>
              <div className="flex items-center gap-2">
                <span className="font-display text-[13px] tracking-tight text-[var(--px-cream)]">
                  CHESSMASTER
                </span>
                <span
                  className="pixel-corners-sm text-[9px] font-display px-1.5 py-1"
                  style={{ backgroundColor: 'var(--px-crimson)', color: 'var(--px-ink)' }}
                >
                  PH.2
                </span>
              </div>
            </div>

            {/* Center navigation links */}
            <nav className="hidden md:flex items-center gap-6 text-base text-[var(--px-muted)]">
              <a href="#features" className="hover:text-[var(--px-amber)] transition">
                Architecture &amp; features
              </a>
              <a href="#how-it-works" className="hover:text-[var(--px-amber)] transition">
                How it works
              </a>
              <Link to="/health" className="flex items-center gap-1.5 hover:text-[var(--px-amber)] transition">
                <Activity className="w-4 h-4" />
                API diagnostics
              </Link>
            </nav>

            {/* Right Action Buttons */}
            <div className="flex items-center gap-3">
              {isAuthenticated && user ? (
                <div className="flex items-center gap-3">
                  <Link
                    to="/dashboard"
                    className="pixel-corners-sm pixel-btn hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-sm font-display"
                    style={{ backgroundColor: 'var(--px-amber)', color: 'var(--px-ink)', border: '2px solid var(--px-ink)' }}
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
                    className="flex items-center gap-1.5 px-3 py-1.5 text-base text-[var(--px-muted)] hover:text-[var(--px-cream)] transition cursor-pointer"
                  >
                    <LogIn className="w-4 h-4" />
                    Sign in
                  </button>
                  <button
                    onClick={() => openAuth('register')}
                    className="pixel-corners-sm pixel-btn flex items-center gap-1.5 px-3.5 py-1.5 text-[11px] font-display cursor-pointer"
                    style={{ backgroundColor: 'var(--px-amber)', color: 'var(--px-ink)', border: '2px solid var(--px-ink)' }}
                  >
                    Play free
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative pt-14 pb-20 md:pt-20 md:pb-28" style={{ borderBottom: '3px solid var(--px-line)' }}>
          <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-14 items-center">
            {/* Hero Left Column */}
            <div className="lg:col-span-7 space-y-7 text-center lg:text-left">
              <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl text-[var(--px-cream)] leading-[1.6]">
                Every move verified.
                <br />
                Every player ranked.
              </h1>

              <p className="text-[var(--px-muted)] text-xl sm:text-2xl max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Real-time online chess with server-authoritative move validation, zero cheat
                tolerance, native WebSockets, and standard 1200 ELO competitive rating for every
                new player.
              </p>

              {/* CTA Button Group */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                {isAuthenticated && user ? (
                  <Link
                    to="/dashboard"
                    className="pixel-corners pixel-btn w-full sm:w-auto px-6 py-4 text-sm font-display flex items-center justify-center gap-2 cursor-pointer"
                    style={{ backgroundColor: 'var(--px-amber)', color: 'var(--px-ink)', border: '3px solid var(--px-ink)' }}
                  >
                    <Play className="w-4 h-4 fill-[var(--px-ink)]" />
                    Enter match hub ({user.username})
                  </Link>
                ) : (
                  <>
                    <button
                      onClick={() => openAuth('register')}
                      className="pixel-corners pixel-btn w-full sm:w-auto px-6 py-4 text-sm font-display flex items-center justify-center gap-2 cursor-pointer"
                      style={{ backgroundColor: 'var(--px-amber)', color: 'var(--px-ink)', border: '3px solid var(--px-ink)' }}
                    >
                      <Play className="w-4 h-4 fill-[var(--px-ink)]" />
                      Create account &amp; play
                      <ChevronRight className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => openAuth('login')}
                      className="pixel-corners pixel-btn w-full sm:w-auto px-6 py-4 text-sm font-display flex items-center justify-center gap-2 cursor-pointer"
                      style={{ backgroundColor: 'var(--px-panel)', color: 'var(--px-cream)', border: '3px solid var(--px-line)' }}
                    >
                      <LogIn className="w-4 h-4" />
                      Existing player login
                    </button>
                  </>
                )}
              </div>

              {/* Stat Cartridges */}
              <div className="pt-6 grid grid-cols-3 gap-3 max-w-md mx-auto lg:mx-0">
                {[
                  { value: '100%', label: 'Server validated', icon: ShieldCheck, color: 'var(--px-amber)' },
                  { value: '<5ms', label: 'Reverb WebSockets', icon: Zap, color: 'var(--px-crimson)' },
                  { value: '1200', label: 'Starting ELO', icon: Trophy, color: '#7fd1ff' },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="pixel-corners-sm px-2.5 py-3 text-left"
                    style={{ backgroundColor: 'var(--px-panel)', border: '2px solid var(--px-line)' }}
                  >
                    <div className="font-display text-sm text-[var(--px-cream)] flex items-center gap-1.5 mb-1.5">
                      {stat.value}
                    </div>
                    <div className="text-[13px] text-[var(--px-muted)] flex items-center gap-1">
                      <stat.icon className="w-3.5 h-3.5 shrink-0" style={{ color: stat.color }} />
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Right Column: Interactive Themeable Chessboard */}
            <div className="lg:col-span-5 flex justify-center pt-6 lg:pt-0">
              <BoardPreview theme="emerald" />
            </div>
          </div>
        </section>

        {/* Feature Highlights Section */}
        <section id="features" className="py-20" style={{ borderBottom: '3px solid var(--px-line)', backgroundColor: 'var(--px-panel)' }}>
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="font-display text-xl sm:text-2xl text-[var(--px-cream)] leading-loose mb-4">
                Architecture built with chess integrity
              </h2>
              <p className="text-[var(--px-muted)] text-lg sm:text-xl">
                Unlike simplistic board games, chess demands uncompromising server authority,
                instant clock synchronization, and anti-cheat enforcement.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: ShieldCheck,
                  color: 'var(--px-amber)',
                  title: 'Authoritative validation',
                  body: 'Client moves are treated as intent. The server chess engine parses the FEN, verifies legality, turns, checks, and timers before committing state.',
                },
                {
                  icon: Zap,
                  color: 'var(--px-crimson)',
                  title: 'Native WebSockets',
                  body: 'Powered by first-party Laravel Reverb. Synchronized move broadcasts, spectator hooks, and authoritative game timers without third-party latency.',
                },
                {
                  icon: Trophy,
                  color: '#7fd1ff',
                  title: '1200 ELO calibration',
                  body: 'Every new competitor enters the platform calibrated at standard 1200 ELO. Indexed database schemas keep matchmaking and leaderboards fast.',
                },
                {
                  icon: Sparkles,
                  color: '#c084fc',
                  title: 'Cosmetics extensibility',
                  body: 'Themeable component abstractions and extensible inventory schemas ready to receive custom board skins and piece sets, no refactoring required.',
                },
              ].map((f) => (
                <div
                  key={f.title}
                  className="pixel-corners p-6"
                  style={{ backgroundColor: 'var(--px-bg)', border: '2px solid var(--px-line)' }}
                >
                  <div
                    className="pixel-corners-sm w-11 h-11 flex items-center justify-center mb-5"
                    style={{ backgroundColor: 'var(--px-panel)', border: `2px solid ${f.color}` }}
                  >
                    <f.icon className="w-5 h-5" style={{ color: f.color }} />
                  </div>
                  <h3 className="font-display text-[13px] text-[var(--px-cream)] leading-loose mb-2.5">{f.title}</h3>
                  <p className="text-base text-[var(--px-muted)] leading-relaxed">{f.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20" style={{ borderBottom: '3px solid var(--px-line)' }}>
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="font-display text-xl sm:text-2xl text-[var(--px-cream)] leading-loose mb-4">
                How to play in three steps
              </h2>
              <p className="text-[var(--px-muted)] text-lg sm:text-xl">
                Go from guest to grandmaster with zero complex setup.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  n: '1',
                  title: 'Create player profile',
                  body: 'Register with a unique username and email. Your account is immediately initialized with a 1200 ELO rating and secure session cookies.',
                  active: true,
                },
                {
                  n: '2',
                  title: 'Join lobby or create room',
                  body: 'Queue for instant matchmaking or generate a custom match link to challenge a friend to a blitz, rapid, or standard game.',
                  active: false,
                },
                {
                  n: '3',
                  title: 'Authoritative real-time play',
                  body: 'Make your move with optimistic client preview. Watch moves sync across devices via WebSockets with server-validated clocks and checkmate detection.',
                  active: false,
                },
              ].map((step) => (
                <div
                  key={step.n}
                  className="pixel-corners p-8"
                  style={{ backgroundColor: 'var(--px-panel)', border: '2px solid var(--px-line)' }}
                >
                  <span
                    className="pixel-corners-sm w-10 h-10 font-display text-sm flex items-center justify-center mb-5"
                    style={
                      step.active
                        ? { backgroundColor: 'var(--px-amber)', color: 'var(--px-ink)', border: '2px solid var(--px-ink)' }
                        : { backgroundColor: 'var(--px-bg)', color: 'var(--px-amber)', border: '2px solid var(--px-line)' }
                    }
                  >
                    {step.n}
                  </span>
                  <h3 className="font-display text-[13px] text-[var(--px-cream)] leading-loose mb-2.5">{step.title}</h3>
                  <p className="text-base text-[var(--px-muted)] leading-relaxed">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action Banner */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-6">
            <div
              className="pixel-corners relative p-8 sm:p-12 text-center overflow-hidden"
              style={{ backgroundColor: 'var(--px-panel)', border: '3px solid var(--px-amber)' }}
            >
              {/* Hard-edged pixel starburst instead of a blurred gradient orb */}
              <div
                className="absolute -top-6 -right-6 w-16 h-16 opacity-70"
                style={{
                  backgroundColor: 'var(--px-amber)',
                  clipPath:
                    'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
                }}
              />

              <span
                className="pixel-corners-sm inline-block text-[10px] font-display px-3 py-1.5 mb-5"
                style={{ backgroundColor: 'var(--px-crimson)', color: 'var(--px-ink)' }}
              >
                PHASE 2 ACTIVE
              </span>

              <h2 className="font-display text-xl sm:text-2xl text-[var(--px-cream)] leading-loose mb-4">
                Ready to make your opening move?
              </h2>

              <p className="text-[var(--px-muted)] text-lg sm:text-xl max-w-xl mx-auto mb-8">
                Join Chessmaster now for fair, authoritative, competitive online chess.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                {isAuthenticated && user ? (
                  <Link
                    to="/dashboard"
                    className="pixel-corners-sm pixel-btn px-6 py-3.5 text-xs sm:text-sm font-display flex items-center gap-2 cursor-pointer"
                    style={{ backgroundColor: 'var(--px-amber)', color: 'var(--px-ink)', border: '2px solid var(--px-ink)' }}
                  >
                    <Trophy className="w-4 h-4" />
                    Go to player dashboard
                  </Link>
                ) : (
                  <>
                    <button
                      onClick={() => openAuth('register')}
                      className="pixel-corners-sm pixel-btn w-full sm:w-auto px-6 py-3.5 text-xs sm:text-sm font-display cursor-pointer"
                      style={{ backgroundColor: 'var(--px-amber)', color: 'var(--px-ink)', border: '2px solid var(--px-ink)' }}
                    >
                      Create free account
                    </button>
                    <button
                      onClick={() => openAuth('login')}
                      className="pixel-corners-sm pixel-btn w-full sm:w-auto px-6 py-3.5 text-xs sm:text-sm font-display cursor-pointer"
                      style={{ backgroundColor: 'var(--px-bg)', color: 'var(--px-cream)', border: '2px solid var(--px-line)' }}
                    >
                      Sign in to existing account
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-10 text-base text-[var(--px-muted)]" style={{ borderTop: '3px solid var(--px-line)' }}>
          <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span style={{ color: 'var(--px-amber)' }}>&#9823;</span>
              <span className="text-[var(--px-cream)]">Chessmaster Platform</span>
              <span>&bull;</span>
              <span>Multiplayer chess &copy; 2026</span>
            </div>

            <div className="flex items-center gap-6">
              <Link to="/health" className="hover:text-[var(--px-amber)] transition">
                Diagnostics &amp; health
              </Link>
              <a href="#features" className="hover:text-[var(--px-amber)] transition">
                Architecture
              </a>
              <span>Built with Laravel 11, React 19, TypeScript &amp; PostgreSQL</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Auth Modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} initialMode={authModalMode} />
    </div>
  )
}