import { useState } from 'react'
import { X, Zap, Clock, ShieldCheck, Loader2, Copy, Check } from 'lucide-react'
import { api } from '../../lib/api'
import type { Game, TimeControlKey } from '../../types/game'

interface CreateGameModalProps {
  isOpen: boolean
  onClose: () => void
  onGameCreated: (game: Game) => void
}

const TIME_OPTIONS: { id: TimeControlKey; label: string; desc: string; icon: string; badge: string }[] = [
  { id: 'bullet_1_0', label: '1 min Bullet', desc: 'Fast & chaotic', icon: '⚡', badge: '1 | 0' },
  { id: 'blitz_3_2', label: '3 min + 2s Blitz', desc: 'Tournament standard', icon: '🔥', badge: '3 | 2' },
  { id: 'blitz_5_0', label: '5 min Blitz', desc: 'Tactical clash', icon: '⏱', badge: '5 | 0' },
  { id: 'rapid_10_0', label: '10 min Rapid', desc: 'Balanced strategy', icon: '♟', badge: '10 | 0' },
  { id: 'classical_30_0', label: '30 min Classical', desc: 'Deep calculation', icon: '🧠', badge: '30 | 0' },
]

export function CreateGameModal({ isOpen, onClose, onGameCreated }: CreateGameModalProps) {
  const [timeControl, setTimeControl] = useState<TimeControlKey>('rapid_10_0')
  const [color, setColor] = useState<'random' | 'white' | 'black'>('random')
  const [submitting, setSubmitting] = useState(false)
  const [createdGame, setCreatedGame] = useState<Game | null>(null)
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await api.post<{ message: string; game: Game }>('/api/games', {
        time_control: timeControl,
        color,
      })
      setCreatedGame(response.data.game)
      onGameCreated(response.data.game)
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
      <div className="relative w-full max-w-md bg-[#0b101f] border border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/10 bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-sm">
              ♟
            </div>
            <h3 className="text-sm font-bold text-white">Create Chess Room</h3>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {createdGame ? (
          /* Room Created Success View */
          <div className="p-6 text-center space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-950/50">
              <ShieldCheck className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h4 className="text-lg font-extrabold text-white">Game Room Created!</h4>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Share this room code with an opponent to start playing in real time.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/90 border border-emerald-500/30 flex items-center justify-between gap-3 shadow-inner">
              <div className="text-left">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Room Code</div>
                <div className="text-2xl font-mono font-black text-emerald-400 tracking-wider">
                  {createdGame.code}
                </div>
              </div>
              <button
                onClick={handleCopyCode}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer border border-white/10"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>

            <div className="text-xs text-slate-400 flex items-center justify-center gap-2">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Format: {createdGame.time_control.replace('_', ' ').replace('_', '+')}</span>
            </div>

            <button
              onClick={handleClose}
              className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-extrabold text-xs rounded-xl transition cursor-pointer shadow-lg shadow-emerald-950/50"
            >
              Done &amp; Return to Dashboard
            </button>
          </div>
        ) : (
          /* Create Form */
          <form onSubmit={handleCreate} className="p-5 sm:p-6 space-y-5 overflow-y-auto">
            {/* Time Control Options */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  Select Time Control
                </span>
                <span className="text-[10px] text-slate-500 font-normal">Standard clocks</span>
              </label>
              <div className="grid grid-cols-1 gap-2">
                {TIME_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setTimeControl(opt.id)}
                    className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      timeControl === opt.id
                        ? 'bg-emerald-500/10 border-emerald-500/50 text-white shadow-sm ring-1 ring-emerald-500/30'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{opt.icon}</span>
                      <div>
                        <div className="text-xs font-bold text-white">{opt.label}</div>
                        <div className="text-[11px] text-slate-400">{opt.desc}</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-white/5 text-[10px] font-mono text-slate-300">
                      {opt.badge}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2.5 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Play As
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setColor('white')}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    color === 'white'
                      ? 'bg-white text-slate-950 border-white shadow-md'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span>♔</span> White
                </button>
                <button
                  type="button"
                  onClick={() => setColor('random')}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    color === 'random'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 border-emerald-400 shadow-md shadow-emerald-950/50'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span>🎲</span> Random
                </button>
                <button
                  type="button"
                  onClick={() => setColor('black')}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    color === 'black'
                      ? 'bg-slate-800 text-white border-slate-600 shadow-md'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span>♚</span> Black
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-50 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 transition cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Creating Room...</span>
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
