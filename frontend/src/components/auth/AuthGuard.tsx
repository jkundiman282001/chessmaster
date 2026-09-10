import { type ReactNode } from 'react'
import { Lock, Loader2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

interface AuthGuardProps {
  children: ReactNode
  fallback?: ReactNode
  onRequestLogin?: () => void
}

export function AuthGuard({
  children,
  fallback,
  onRequestLogin,
}: AuthGuardProps) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-400">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-400 mr-2" />
        <span className="text-xs">Authenticating session...</span>
      </div>
    )
  }

  if (!user) {
    if (fallback) return <>{fallback}</>

    return (
      <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center max-w-md mx-auto">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-3">
          <Lock className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-white mb-1">Protected Area</h3>
        <p className="text-xs text-slate-400 mb-4">
          You must be logged in with a registered player account to access match lobbies and live gameplay.
        </p>
        {onRequestLogin && (
          <button
            onClick={onRequestLogin}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl transition cursor-pointer shadow-md shadow-emerald-900/30"
          >
            Sign In or Register
          </button>
        )}
      </div>
    )
  }

  return <>{children}</>
}
