import { useState, useRef, useEffect } from 'react'
import { LogOut, Trophy, ChevronDown } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export function UserMenu() {
  const { user, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
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

  // Get first letter of username for avatar
  const initial = user.username.charAt(0).toUpperCase()

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-1.5 pl-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 transition cursor-pointer"
      >
        {/* User initials / avatar */}
        <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-black text-xs flex items-center justify-center shadow-inner">
          {initial}
        </div>

        {/* Username and Rating */}
        <div className="text-left">
          <div className="text-xs font-bold text-white flex items-center gap-1.5">
            {user.username}
            <span className="flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 text-[10px] font-semibold border border-amber-500/20">
              <Trophy className="w-2.5 h-2.5" />
              {user.rating}
            </span>
          </div>
        </div>

        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="p-4 border-b border-slate-800 bg-slate-950/60">
            <div className="text-xs font-bold text-white">{user.name || user.username}</div>
            <div className="text-[11px] text-slate-400 truncate">{user.email}</div>
            <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Standard Rating</span>
              <span className="font-bold text-emerald-400 flex items-center gap-1">
                <Trophy className="w-3 h-3 text-amber-400" />
                {user.rating} ELO
              </span>
            </div>
          </div>

          <div className="p-2">
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/10 rounded-xl transition cursor-pointer disabled:opacity-50"
            >
              <LogOut className="w-4 h-4" />
              {loggingOut ? 'Signing out...' : 'Sign Out'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
