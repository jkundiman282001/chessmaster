import { useState } from 'react'
import { X, Zap, Clock, ShieldCheck, Loader2, Copy, Check } from 'lucide-react'
import { api } from '../../lib/api'
import type { Game, TimeControlKey } from '../../types/game'

interface CreateGameModalProps {
  isOpen: boolean
  onClose: () => void
  onGameCreated: (game: Game) => void
}

const TIME_OPTIONS: { id: TimeControlKey; label: string; desc: string; icon: string }[] = [
  { id: 'bullet_1_0', label: '1 min Bullet', desc: 'Fast & chaotic', icon: '⚡' },
  { id: 'blitz_3_2', label: '3 min + 2s Blitz', desc: 'Tournament standard', icon: '🔥' },
  { id: 'blitz_5_0', label: '5 min Blitz', desc: 'Tactical clash', icon: '⏱' },
  { id: 'rapid_10_0', label: '10 min Rapid', desc: 'Balanced strategy', icon: '♟' },
  { id: 'classical_30_0', label: '30 min Classical', desc: 'Deep calculation', icon: '🧠' },
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
      // handled
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <span className="text-xl">♟</span>
            <h3 className="text-sm font-bold text-white">Create Chess Room</h3>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {createdGame ? (
          /* Room Created Success View */
          <div className="p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>

            <div>
              <h4 className="text-lg font-bold text-white mb-1">Game Room Ready!</h4>
              <p className="text-xs text-slate-400">
                Share this room code with an opponent to begin playing in real time.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
              <div className="text-left">
                <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Room Code</div>
                <div className="text-xl font-mono font-black text-emerald-400 tracking-wider">
                  {createdGame.code}
                </div>
              </div>
              <button
                onClick={handleCopyCode}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>

            <div className="text-xs text-slate-400 flex items-center justify-center gap-2">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Time Control: {createdGame.time_control.replace('_', ' ')}</span>
            </div>

            <button
              onClick={handleClose}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl transition cursor-pointer shadow-md shadow-emerald-950/40"
            >
              Done & Return to Dashboard
            </button>
          </div>
        ) : (
          /* Create Form */
          <form onSubmit={handleCreate} className="p-6 space-y-5">
            {/* Time Control Options */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                Select Time Control
              </label>
              <div className="grid grid-cols-1 gap-2">
                {TIME_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setTimeControl(opt.id)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition cursor-pointer ${
                      timeControl === opt.id
                        ? 'bg-emerald-500/10 border-emerald-500/50 text-white shadow-sm'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">{opt.icon}</span>
                      <div>
                        <div className="text-xs font-bold">{opt.label}</div>
                        <div className="text-[11px] text-slate-400">{opt.desc}</div>
                      </div>
                    </div>
                    {timeControl === opt.id && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selection */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Play As
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setColor('white')}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    color === 'white'
                      ? 'bg-slate-200 text-slate-900 border-white font-bold'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span>♔</span> White
                </button>
                <button
                  type="button"
                  onClick={() => setColor('random')}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    color === 'random'
                      ? 'bg-emerald-600 text-white border-emerald-500 font-bold shadow-md shadow-emerald-950/50'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span>🎲</span> Random
                </button>
                <button
                  type="button"
                  onClick={() => setColor('black')}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    color === 'black'
                      ? 'bg-slate-800 text-white border-slate-600 font-bold'
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
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 transition cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating Room...
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
