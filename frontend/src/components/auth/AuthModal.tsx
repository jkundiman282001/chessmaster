import { useState } from 'react'
import axios from 'axios'
import {
  Lock,
  Mail,
  User as UserIcon,
  X,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import type { ApiErrorResponse } from '../../types/auth'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  initialMode?: 'login' | 'register'
}

export function AuthModal({
  isOpen,
  onClose,
  initialMode = 'login',
}: AuthModalProps) {
  const { login, register } = useAuth()
  const [mode, setMode] = useState<'login' | 'register'>(initialMode)
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})

  // Form states
  const [loginIdentifier, setLoginIdentifier] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  const [regUsername, setRegUsername] = useState('')
  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regPasswordConfirmation, setRegPasswordConfirmation] = useState('')

  if (!isOpen) return null

  const resetErrors = () => {
    setGeneralError(null)
    setSuccessMessage(null)
    setFieldErrors({})
  }

  const handleModeChange = (newMode: 'login' | 'register') => {
    setMode(newMode)
    resetErrors()
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    resetErrors()
    setSubmitting(true)

    try {
      await login({
        login: loginIdentifier,
        password: loginPassword,
      })
      setSuccessMessage('Logged in successfully!')
      setTimeout(() => {
        onClose()
      }, 500)
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response) {
        const data = err.response.data as ApiErrorResponse
        if (data.errors) {
          setFieldErrors(data.errors)
        } else {
          setGeneralError(data.message || 'Login failed. Please verify credentials.')
        }
      } else {
        setGeneralError('Network error connecting to auth service.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    resetErrors()
    setSubmitting(true)

    try {
      await register({
        username: regUsername,
        name: regName || undefined,
        email: regEmail,
        password: regPassword,
        password_confirmation: regPasswordConfirmation,
      })
      setSuccessMessage('Account created! Welcome to Chessmaster.')
      setTimeout(() => {
        onClose()
      }, 500)
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response) {
        const data = err.response.data as ApiErrorResponse
        if (data.errors) {
          setFieldErrors(data.errors)
        } else {
          setGeneralError(data.message || 'Registration failed.')
        }
      } else {
        setGeneralError('Network error connecting to registration service.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header with Mode Toggle */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2">
            <span className="text-xl">♟</span>
            <div className="flex bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
              <button
                type="button"
                onClick={() => handleModeChange('login')}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition ${
                  mode === 'login'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => handleModeChange('register')}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition ${
                  mode === 'register'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Register
              </button>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Alerts */}
        {generalError && (
          <div className="mx-5 mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{generalError}</span>
          </div>
        )}

        {successMessage && (
          <div className="mx-5 mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Modal Form Body */}
        <div className="p-6">
          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Username or Email
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="grandmaster or player@chess.com"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
                {fieldErrors.login && (
                  <p className="text-xs text-rose-400 mt-1">
                    {fieldErrors.login[0]}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
                {fieldErrors.password && (
                  <p className="text-xs text-rose-400 mt-1">
                    {fieldErrors.password[0]}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2 transition cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In to Play'
                )}
              </button>

              <div className="text-center mt-3 text-xs text-slate-400">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => handleModeChange('register')}
                  className="text-emerald-400 hover:underline font-medium"
                >
                  Create one here
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Username <span className="text-emerald-400">*</span>
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder="e.g. bobby_fischer"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
                {fieldErrors.username && (
                  <p className="text-xs text-rose-400 mt-1">
                    {fieldErrors.username[0]}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Display Name <span className="text-slate-500">(Optional)</span>
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Bobby Fischer"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Email <span className="text-emerald-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="you@domain.com"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
                {fieldErrors.email && (
                  <p className="text-xs text-rose-400 mt-1">
                    {fieldErrors.email[0]}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Password <span className="text-emerald-400">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Min 8 chars"
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Confirm Password <span className="text-emerald-400">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={regPasswordConfirmation}
                      onChange={(e) => setRegPasswordConfirmation(e.target.value)}
                      placeholder="Repeat password"
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                    />
                  </div>
                </div>
              </div>

              {fieldErrors.password && (
                <p className="text-xs text-rose-400 mt-0.5">
                  {fieldErrors.password[0]}
                </p>
              )}

              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
                <span className="text-emerald-400 font-bold">★</span>
                <span>Starting rating will be calibrated at <strong>1200 ELO</strong>.</span>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2 transition cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>

              <div className="text-center mt-2 text-xs text-slate-400">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => handleModeChange('login')}
                  className="text-emerald-400 hover:underline font-medium"
                >
                  Sign in instead
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
