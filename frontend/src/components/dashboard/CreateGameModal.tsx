import { useState } from 'react'
import { X, Zap, Clock, ShieldCheck, Loader2, Copy, Check, Bot, Users, Sparkles } from 'lucide-react'
import { api } from '../../lib/api'
import type { Game, TimeControlKey } from '../../types/game'

interface CreateGameModalProps {
  isOpen: boolean
  onClose: () => void
  onGameCreated: (game: Game) => void
}

type GameMode = 'bot' | 'friend'
type BotDifficulty = 'easy' | 'medium' | 'hard'

const TIME_OPTIONS: { id: TimeControlKey; label: string; desc: string; icon: string; badge: string }[] = [
  { id: 'bullet_1_0', label: '1 min Bullet', desc: 'Fast & chaotic', icon: '⚡', badge: '1 | 0' },
  { id: 'blitz_3_2', label: '3 min + 2s Blitz', desc: 'Tournament standard', icon: '🔥', badge: '3 | 2' },
  { id: 'blitz_5_0', label: '5 min Blitz', desc: 'Tactical clash', icon: '⏱', badge: '5 | 0' },
  { id: 'rapid_10_0', label: '10 min Rapid', desc: 'Balanced strategy', icon: '♟', badge: '10 | 0' },
  { id: 'classical_30_0', label: '30 min Classical', desc: 'Deep calculation', icon: '🧠', badge: '30 | 0' },
]

const BOT_DIFFICULTIES: {
  id: BotDifficulty
  title: string
  rating: string
  desc: string
  emoji: string
  badgeColor: string
  activeBorder: string
}[] = [
  {
    id: 'easy',
    title: 'Beginner',
    rating: '~800 ELO',
    desc: 'Casual, forgiving tactics',
    emoji: '🌱',
    badgeColor: 'bg-felt/20 text-felt-light border-felt-light/30',
    activeBorder: 'border-felt-light bg-felt/10 ring-1 ring-felt-light/30',
  },
  {
    id: 'medium',
    title: 'Intermediate',
    rating: '~1400 ELO',
    desc: 'Minimax & positional play',
    emoji: '⚔️',
    badgeColor: 'bg-brass/20 text-brass-light border-brass/30',
    activeBorder: 'border-brass bg-brass/10 ring-1 ring-brass/30',
  },
  {
    id: 'hard',
    title: 'Master',
    rating: '~2000 ELO',
    desc: 'Deep depth & aggressive',
    emoji: '👑',
    badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    activeBorder: 'border-rose-500 bg-rose-500/10 ring-1 ring-rose-500/30',
  },
]

export function CreateGameModal({ isOpen, onClose, onGameCreated }: CreateGameModalProps) {
  const [mode, setMode] = useState<GameMode>('bot')
  const [difficulty, setDifficulty] = useState<BotDifficulty>('medium')
  const [timeControl, setTimeControl] = useState<TimeControlKey>('rapid_10_0')
  const [color, setColor] = useState<'random' | 'white' | 'black'>('white')
  const [submitting, setSubmitting] = useState(false)
  const [createdGame, setCreatedGame] = useState<Game | null>(null)
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const payload = {
        time_control: timeControl,
        color,
        is_bot: mode === 'bot',
        bot_difficulty: mode === 'bot' ? difficulty : undefined,
      }

      const response = await api.post<{ message: string; game: Game }>('/api/games', payload)

      if (mode === 'bot') {
        // Bot games start immediately - enter match directly!
        onGameCreated(response.data.game)
        onClose()
      } else {
        // Friend room - show code screen to copy
        setCreatedGame(response.data.game)
        onGameCreated(response.data.game)
      }
    } catch {
      // Handled
    } finally {
      setSubmitting(false)
    }
  }

  const handleCopyCode = () => {
    if (!createdGame) return
    navigator.clipboard.writeText(createdGame.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleClose = () => {
    setCreatedGame(null)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-ink-raised border border-ink-line rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-ink-line bg-ink/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brass/15 border border-brass/30 flex items-center justify-center text-brass font-bold text-sm">
              {mode === 'bot' ? '🤖' : '♟'}
            </div>
            <h3 className="text-sm font-bold text-ivory">
              {mode === 'bot' ? 'Play vs Computer Bot' : 'Create Room with Friend'}
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-xl text-parchment-dim hover:text-ivory hover:bg-white/5 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {createdGame ? (
          /* Room Created Success View (for friend multiplayer rooms) */
          <div className="p-6 text-center space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-brass/15 border border-brass/30 text-brass flex items-center justify-center mx-auto shadow-lg shadow-black/40">
              <ShieldCheck className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h4 className="text-lg font-extrabold text-ivory">Game Room Created!</h4>
              <p className="text-xs text-parchment-dim max-w-xs mx-auto">
                Share this room code with an opponent to start playing in real time.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-ink/90 border border-brass/30 flex items-center justify-between gap-3 shadow-inner">
              <div className="text-left">
                <div className="text-[10px] text-parchment-dim font-bold uppercase tracking-wider">Room Code</div>
                <div className="text-2xl font-mono font-black text-brass-light tracking-wider">
                  {createdGame.code}
                </div>
              </div>
              <button
                onClick={handleCopyCode}
                className="px-4 py-2.5 bg-ink-line hover:bg-ink-line/70 text-parchment text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer border border-ink-line"
              >
                {copied ? <Check className="w-4 h-4 text-felt-light" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>

            <div className="text-xs text-parchment-dim flex items-center justify-center gap-2">
              <Clock className="w-3.5 h-3.5 text-parchment-dim" />
              <span>Format: {createdGame.time_control.replace('_', ' ').replace('_', '+')}</span>
            </div>

            <button
              onClick={handleClose}
              className="w-full py-3 px-4 bg-gradient-to-r from-brass to-brass-dim hover:from-brass-light hover:to-brass text-ink font-extrabold text-xs rounded-xl transition cursor-pointer shadow-lg shadow-black/40"
            >
              Enter Game Room
            </button>
          </div>
        ) : (
          /* Create Form */
          <form onSubmit={handleCreate} className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto">
            {/* Mode Switch: Bot vs Friend */}
            <div>
              <label className="block text-xs font-bold text-parchment mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brass" />
                Game Mode
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-ink/80 border border-ink-line rounded-xl">
                <button
                  type="button"
                  onClick={() => setMode('bot')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                    mode === 'bot'
                      ? 'bg-gradient-to-r from-brass to-brass-dim text-ink shadow-md'
                      : 'text-parchment-dim hover:text-ivory hover:bg-white/5'
                  }`}
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>Play vs Bot</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMode('friend')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                    mode === 'friend'
                      ? 'bg-gradient-to-r from-brass to-brass-dim text-ink shadow-md'
                      : 'text-parchment-dim hover:text-ivory hover:bg-white/5'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Play vs Friend</span>
                </button>
              </div>
            </div>

            {/* Bot Difficulty Selector (Only if Bot mode) */}
            {mode === 'bot' && (
              <div className="space-y-2">
                <label className="block text-xs font-bold text-parchment flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Bot className="w-3.5 h-3.5 text-brass-dim" />
                    Bot Difficulty
                  </span>
                  <span className="text-[10px] text-parchment-dim font-normal">AI strength</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {BOT_DIFFICULTIES.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setDifficulty(d.id)}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                        difficulty === d.id
                          ? d.activeBorder
                          : 'bg-ink/60 border-ink-line text-parchment hover:border-brass-dim/40'
                      }`}
                    >
                      <span className="text-xl">{d.emoji}</span>
                      <div className="text-xs font-bold text-ivory">{d.title}</div>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${d.badgeColor}`}
                      >
                        {d.rating}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Time Control Options */}
            <div>
              <label className="block text-xs font-bold text-parchment mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-brass" />
                  Time Control
                </span>
                <span className="text-[10px] text-parchment-dim font-normal">Clocks</span>
              </label>
              <div className="grid grid-cols-1 gap-1.5 max-h-40 overflow-y-auto pr-1">
                {TIME_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setTimeControl(opt.id)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      timeControl === opt.id
                        ? 'bg-brass/10 border-brass/50 text-ivory shadow-sm ring-1 ring-brass/30'
                        : 'bg-ink/60 border-ink-line text-parchment hover:border-brass-dim/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">{opt.icon}</span>
                      <div>
                        <div className="text-xs font-bold text-ivory">{opt.label}</div>
                        <div className="text-[10px] text-parchment-dim">{opt.desc}</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-ink-raised border border-ink-line text-[10px] font-mono text-parchment">
                      {opt.badge}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selection */}
            <div>
              <label className="block text-xs font-bold text-parchment mb-2 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-brass" />
                Play As
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setColor('white')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    color === 'white'
                      ? 'bg-ivory text-ink border-ivory shadow-md'
                      : 'bg-ink/60 border-ink-line text-parchment hover:border-brass-dim/40'
                  }`}
                >
                  <span>♔</span> White
                </button>
                <button
                  type="button"
                  onClick={() => setColor('random')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    color === 'random'
                      ? 'bg-gradient-to-r from-brass to-brass-dim text-ink border-brass shadow-md shadow-black/40'
                      : 'bg-ink/60 border-ink-line text-parchment hover:border-brass-dim/40'
                  }`}
                >
                  <span>🎲</span> Random
                </button>
                <button
                  type="button"
                  onClick={() => setColor('black')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    color === 'black'
                      ? 'bg-walnut-deep text-ivory border-walnut shadow-md'
                      : 'bg-ink/60 border-ink-line text-parchment hover:border-brass-dim/40'
                  }`}
                >
                  <span>♚</span> Black
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 bg-gradient-to-r from-brass to-brass-dim hover:from-brass-light hover:to-brass disabled:opacity-50 text-ink font-extrabold text-xs rounded-xl shadow-lg shadow-black/40 flex items-center justify-center gap-2 transition cursor-pointer mt-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-ink" />
                  <span>Starting Match...</span>
                </>
              ) : mode === 'bot' ? (
                <>
                  <Bot className="w-4 h-4 text-ink" />
                  <span>Start Match vs Bot</span>
                </>
              ) : (
                'Create Game Room'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}