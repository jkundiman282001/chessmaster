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
      <div className="relative w-full max-w-sm bg-ink-raised border border-ink-line rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-ink-line bg-ink/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brass/15 border border-brass/30 flex items-center justify-center text-brass font-bold text-sm">
              ♟
            </div>
            <h3 className="text-sm font-bold text-ivory">Join Match by Code</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-parchment-dim hover:text-ivory hover:bg-white/5 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleJoin} className="p-5 sm:p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-parchment mb-1.5">
              Room Invite Code
            </label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. CH-8A9K2L"
              className="w-full bg-ink/80 border border-ink-line rounded-xl px-4 py-3 text-base font-mono tracking-widest text-center text-ivory placeholder-parchment-dim/60 focus:outline-none focus:border-brass focus:ring-2 focus:ring-brass/20 transition uppercase font-bold"
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
            className="w-full py-3 px-4 bg-gradient-to-r from-brass to-brass-dim hover:from-brass-light hover:to-brass disabled:opacity-50 text-ink font-extrabold text-xs rounded-xl shadow-lg shadow-black/40 flex items-center justify-center gap-2 transition cursor-pointer"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-ink" />
                <span>Entering arena...</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4 text-ink" />
                <span>Join Match Now</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}