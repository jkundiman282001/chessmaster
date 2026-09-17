import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { LogOut, Trophy, ChevronDown, LayoutDashboard, Sparkles } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export function UserMenu() {
  const { user, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!user) return null

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await logout()
      setIsOpen(false)
    } finally {
      setLoggingOut(false)
    }
  }

  const initial = user.username.charAt(0).toUpperCase()

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 p-1.5 pl-2 rounded-xl bg-ink-raised/90 hover:bg-ink-raised border border-brass/15 hover:border-brass/30 transition-all cursor-pointer shadow-sm"
      >
        {/* User initials / avatar */}
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brass to-walnut text-ink font-black text-xs flex items-center justify-center shadow-md shadow-black/40">
          {initial}
        </div>

        {/* Username and Rating */}
        <div className="text-left hidden sm:block">
          <div className="text-xs font-bold text-ivory flex items-center gap-1.5">
            <span>{user.username}</span>
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-brass/10 text-brass-light text-[10px] font-bold border border-brass/25 font-mono">
              <Trophy className="w-2.5 h-2.5 text-brass" />
              {user.rating}
            </span>
          </div>
        </div>

        <ChevronDown
          className={`w-3.5 h-3.5 text-parchment-dim transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-ink-raised border border-brass/15 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl">
          <div className="p-4 border-b border-ink-line bg-ink/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brass to-walnut text-ink font-black text-sm flex items-center justify-center shadow-md">
                {initial}
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-ivory truncate">{user.name || user.username}</div>
                <div className="text-[11px] text-parchment-dim truncate">{user.email}</div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-ink-line flex items-center justify-between text-xs">
              <span className="text-parchment-dim flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-felt-light" /> Standard ELO
              </span>
              <span className="font-mono font-black text-brass-light flex items-center gap-1">
                <Trophy className="w-3 h-3 text-brass" />
                {user.rating}
              </span>
            </div>
          </div>

          <div className="p-2 space-y-1">
            <Link
              to="/dashboard"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-parchment hover:text-ivory hover:bg-ink/60 rounded-xl transition cursor-pointer"
            >
              <LayoutDashboard className="w-4 h-4 text-brass" />
              <span>Match Dashboard</span>
            </Link>

            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition cursor-pointer disabled:opacity-50"
            >
              <LogOut className="w-4 h-4" />
              <span>{loggingOut ? 'Signing out...' : 'Sign Out'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}