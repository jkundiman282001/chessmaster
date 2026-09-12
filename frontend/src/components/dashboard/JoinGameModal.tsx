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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-[#0b101f] border border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/10 bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-sm">
              ♟
            </div>
            <h3 className="text-sm font-bold text-white">Join Match by Code</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleJoin} className="p-5 sm:p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Room Invite Code
            </label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. CH-8A9K2L"
              className="w-full bg-slate-950/90 border border-slate-700/80 rounded-xl px-4 py-3 text-base font-mono tracking-widest text-center text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition uppercase font-bold"
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
            className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-50 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 transition cursor-pointer"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                <span>Entering arena...</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4 text-slate-950" />
                <span>Join Match Now</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
