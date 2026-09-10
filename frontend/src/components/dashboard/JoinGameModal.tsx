import { useState } from 'react'
import axios from 'axios'
import { X, LogIn, AlertCircle, Loader2 } from 'lucide-react'
import { api } from '../../lib/api'
import type { Game } from '../../types/game'
import type { ApiErrorResponse } from '../../types/auth'

interface JoinGameModalProps {
  isOpen: boolean
  onClose: () => void
  onGameJoined: (game: Game) => void
}

export function JoinGameModal({ isOpen, onClose, onGameJoined }: JoinGameModalProps) {
  const [code, setCode] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      const response = await api.post<{ message: string; game: Game }>('/api/games/join', {
        code: code.trim().toUpperCase(),
      })
      onGameJoined(response.data.game)
      onClose()
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response) {
        const data = err.response.data as ApiErrorResponse
        setError(data.errors?.code?.[0] || data.message || 'Unable to join game.')
      } else {
        setError('Network error connecting to game match.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <span className="text-xl">♟</span>
            <h3 className="text-sm font-bold text-white">Join Match by Code</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleJoin} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Room Invite Code
            </label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. CH-8A9K2L"
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm font-mono tracking-widest text-center text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition uppercase"
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !code.trim()}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 transition cursor-pointer"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Joining...
              </>
            ) : (
              <>
                <LogIn className="w-3.5 h-3.5" />
                Join Match Now
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
