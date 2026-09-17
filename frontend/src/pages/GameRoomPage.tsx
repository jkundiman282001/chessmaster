import { useEffect, useState, useRef, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  Clock,
  Flag,
  Handshake,
  Copy,
  Check,
  ArrowLeft,
  Users,
  Trophy,
  AlertCircle,
  Share2,
  Bot,
  Loader2,
} from 'lucide-react'
import { api } from '../lib/api'
import { getEcho } from '../lib/echo'
import { useAuth } from '../context/AuthContext'
import { Chessboard } from '../components/chess/Chessboard'
import type {
  Game,
  MoveEventPayload,
  GameEndedPayload,
  DrawOfferedPayload,
  PlayerJoinedPayload,
} from '../types/game'

export function GameRoomPage() {
  const { code } = useParams<{ code: string }>()
  const { user } = useAuth()

  const [game, setGame] = useState<Game | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null)
  const [isCheck, setIsCheck] = useState(false)
  const [whiteClock, setWhiteClock] = useState(600)
  const [blackClock, setBlackClock] = useState(600)
  const [drawOfferIncoming, setDrawOfferIncoming] = useState(false)
  const [showResignConfirm, setShowResignConfirm] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [boardTheme, setBoardTheme] = useState<'emerald' | 'slate' | 'amber'>('emerald')
  const [wsStatus, setWsStatus] = useState<'connected' | 'connecting' | 'fallback'>('connecting')
  const [botThinking, setBotThinking] = useState(false)

  const movesContainerRef = useRef<HTMLDivElement>(null)

  // Determine user's role in this match
  const playerColor = useMemo<'white' | 'black' | null>(() => {
    if (!game || !user) return null
    if (game.white_player?.id === user.id) return 'white'
    if (game.black_player?.id === user.id) return 'black'
    return null
  }, [game, user])

  const isUserTurn = useMemo(() => {
    if (!game || !playerColor || game.status !== 'in_progress') return false
    return game.turn === playerColor
  }, [game, playerColor])

  const isBotTurn = useMemo(() => {
    if (!game || !game.is_bot || game.status !== 'in_progress' || !playerColor) return false
    return game.turn !== playerColor
  }, [game, playerColor])

  // Fetch initial game state
  useEffect(() => {
    if (!code) return

    let isMounted = true
    const fetchGame = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await api.get<{ game: Game }>(`/api/games/${code}`)
        if (isMounted) {
          setGame(res.data.game)
          setWhiteClock(res.data.game.white_time_remaining)
          setBlackClock(res.data.game.black_time_remaining)
          if (res.data.game.draw_offered_by && user && res.data.game.draw_offered_by !== user.id) {
            setDrawOfferIncoming(true)
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.response?.data?.message || 'Failed to load game room.')
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchGame()

    return () => {
      isMounted = false
    }
  }, [code, user])

  // Subscribe to real-time Reverb channel with connection state monitoring
  useEffect(() => {
    if (!code) return

    try {
      const echo = getEcho()
      const channelName = `game.${code.toUpperCase()}`
      const channel = echo.channel(channelName)

      // Monitor WebSocket connection lifecycle
      const pusher = (echo.connector as any)?.pusher
      if (pusher?.connection) {
        if (pusher.connection.state === 'connected') {
          setWsStatus('connected')
        }
        pusher.connection.bind('connected', () => setWsStatus('connected'))
        pusher.connection.bind('disconnected', () => setWsStatus('fallback'))
        pusher.connection.bind('unavailable', () => setWsStatus('fallback'))
        pusher.connection.bind('failed', () => setWsStatus('fallback'))
      }

      channel.listen('.move.made', (e: MoveEventPayload) => {
        setGame((prev) => {
          if (!prev) return prev
          return {
            ...prev,
            fen: e.fen,
            turn: e.turn,
            status: e.status,
            white_time_remaining: e.white_time_remaining,
            black_time_remaining: e.black_time_remaining,
            last_move_at: e.last_move_at,
            winner_id: e.winner_id,
            end_reason: e.end_reason,
            pgn: e.pgn,
            draw_offered_by: null,
          }
        })

        setWhiteClock(e.white_time_remaining)
        setBlackClock(e.black_time_remaining)
        setLastMove({ from: e.move.from, to: e.move.to })
        setIsCheck(e.is_check)
        setDrawOfferIncoming(false)
        setActionError(null)
      })

      channel.listen('.player.joined', (e: PlayerJoinedPayload) => {
        setGame((prev) => {
          if (!prev) return prev
          return {
            ...prev,
            status: e.status,
            white_player: e.white_player,
            black_player: e.black_player,
          }
        })
      })

      channel.listen('.draw.offered', (e: DrawOfferedPayload) => {
        if (user && e.offered_by !== user.id) {
          setDrawOfferIncoming(true)
        }
      })

      channel.listen('.game.ended', (e: GameEndedPayload) => {
        setGame((prev) => {
          if (!prev) return prev
          return {
            ...prev,
            status: 'completed',
            winner_id: e.winner_id,
            end_reason: e.end_reason,
          }
        })
        setDrawOfferIncoming(false)
      })

      return () => {
        channel.stopListening('.move.made')
        channel.stopListening('.player.joined')
        channel.stopListening('.draw.offered')
        channel.stopListening('.game.ended')
      }
    } catch {
      setWsStatus('fallback')
    }
  }, [code, user])

  // HTTP Polling fallback: if spectator or waiting for opponent, sync every 2.5s
  useEffect(() => {
    if (!code) return

    const pollTimer = setInterval(async () => {
      if (isUserTurn) return

      try {
        const res = await api.get<{ game: Game }>(`/api/games/${code}`)
        const serverGame = res.data.game

        if (
          !game ||
          serverGame.fen !== game.fen ||
          serverGame.status !== game.status ||
          serverGame.turn !== game.turn ||
          serverGame.winner_id !== game.winner_id ||
          serverGame.draw_offered_by !== game.draw_offered_by ||
          (serverGame.status === 'in_progress' && game.status === 'waiting')
        ) {
          setGame(serverGame)
          setWhiteClock(serverGame.white_time_remaining)
          setBlackClock(serverGame.black_time_remaining)
          if (serverGame.draw_offered_by && user && serverGame.draw_offered_by !== user.id) {
            setDrawOfferIncoming(true)
          } else {
            setDrawOfferIncoming(false)
          }
        }
      } catch {
        // Silent catch for background poll
      }
    }, 2500)

    return () => clearInterval(pollTimer)
  }, [code, game?.fen, game?.status, game?.turn, game?.winner_id, game?.draw_offered_by, isUserTurn, user])

  // Active clock countdown timer
  useEffect(() => {
    if (!game || game.status !== 'in_progress') return

    const timer = setInterval(() => {
      if (game.turn === 'white') {
        setWhiteClock((prev) => {
          if (prev <= 1) {
            handleTimeoutClaim()
            return 0
          }
          return prev - 1
        })
      } else {
        setBlackClock((prev) => {
          if (prev <= 1) {
            handleTimeoutClaim()
            return 0
          }
          return prev - 1
        })
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [game?.turn, game?.status])

  // Auto-scroll moves list
  useEffect(() => {
    if (movesContainerRef.current) {
      movesContainerRef.current.scrollTop = movesContainerRef.current.scrollHeight
    }
  }, [game?.pgn])

  // Automated bot move trigger
  useEffect(() => {
    if (!isBotTurn || !code || botThinking) return

    setBotThinking(true)
    const delay = 450 + Math.floor(Math.random() * 250)
    const timer = setTimeout(async () => {
      try {
        const res = await api.post<{ game: Game; move: any; engine: any }>(`/api/games/${code}/bot-move`)
        const updatedGame = res.data.game
        setGame(updatedGame)
        setWhiteClock(updatedGame.white_time_remaining)
        setBlackClock(updatedGame.black_time_remaining)
        if (res.data.move) {
          setLastMove({ from: res.data.move.from, to: res.data.move.to })
        }
        setIsCheck(res.data.engine?.is_check ?? false)
      } catch (err: any) {
        const msg = err.response?.data?.message || 'Bot move failed.'
        setActionError(msg)
      } finally {
        setBotThinking(false)
      }
    }, delay)

    return () => clearTimeout(timer)
  }, [isBotTurn, code, game?.fen])

  // Move submission handler
  const handleMove = async (move: { from: string; to: string; promotion?: string }) => {
    if (!code || !isUserTurn) return

    setActionError(null)
    try {
      const res = await api.post<{ game: Game; move: any; engine: any }>(`/api/games/${code}/move`, move)
      const updatedGame = res.data.game
      setGame(updatedGame)
      setWhiteClock(updatedGame.white_time_remaining)
      setBlackClock(updatedGame.black_time_remaining)
      setLastMove({ from: move.from, to: move.to })
      setIsCheck(res.data.engine?.is_check ?? false)
    } catch (err: any) {
      const msg =
        err.response?.data?.errors?.move?.[0] ||
        err.response?.data?.errors?.turn?.[0] ||
        err.response?.data?.message ||
        'Move rejected.'
      setActionError(msg)

      // Resynchronize client board with server state
      try {
        const syncRes = await api.get<{ game: Game }>(`/api/games/${code}`)
        setGame(syncRes.data.game)
      } catch {
        // Silent catch
      }
    }
  }

  // Resign handler
  const handleResign = async () => {
    if (!code) return
    setShowResignConfirm(false)
    try {
      await api.post(`/api/games/${code}/resign`)
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Failed to resign match.')
    }
  }

  // Draw offer handler
  const handleOfferDraw = async () => {
    if (!code) return
    try {
      await api.post(`/api/games/${code}/draw-offer`)
      setGame((prev) => (prev ? { ...prev, draw_offered_by: user?.id ?? null } : prev))
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Failed to offer draw.')
    }
  }

  // Draw accept handler
  const handleAcceptDraw = async () => {
    if (!code) return
    try {
      await api.post(`/api/games/${code}/draw-accept`)
      setDrawOfferIncoming(false)
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Failed to accept draw.')
    }
  }

  // Draw decline handler
  const handleDeclineDraw = async () => {
    if (!code) return
    try {
      await api.post(`/api/games/${code}/draw-decline`)
      setDrawOfferIncoming(false)
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Failed to decline draw.')
    }
  }

  // Timeout claim handler
  const handleTimeoutClaim = async () => {
    if (!code || !game || game.status !== 'in_progress') return
    try {
      await api.post(`/api/games/${code}/timeout-claim`)
    } catch {
      // Clock check handles
    }
  }

  const copyRoomCode = () => {
    if (!code) return
    navigator.clipboard.writeText(window.location.href)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  // Format seconds to mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(Math.max(0, seconds) / 60)
    const secs = Math.max(0, seconds) % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Parse PGN into move pairs for table display
  const parsedMoves = useMemo(() => {
    if (!game?.pgn) return []
    const tokens = game.pgn.trim().split(/\s+/)
    const pairs: { number: number; white: string; black?: string }[] = []

    let currentNum = 1
    let currentWhite = ''

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i]
      if (token.endsWith('.')) {
        currentNum = parseInt(token.slice(0, -1), 10) || currentNum
      } else if (!currentWhite) {
        currentWhite = token
      } else {
        pairs.push({ number: currentNum, white: currentWhite, black: token })
        currentWhite = ''
        currentNum++
      }
    }

    if (currentWhite) {
      pairs.push({ number: currentNum, white: currentWhite })
    }

    return pairs
  }, [game?.pgn])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050811] flex flex-col items-center justify-center text-slate-300">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-bold text-slate-400 text-sm">Entering match arena...</p>
      </div>
    )
  }

  if (error || !game) {
    return (
      <div className="min-h-screen bg-[#050811] flex flex-col items-center justify-center p-4">
        <div className="glass-panel border border-white/10 rounded-2xl p-8 max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-4" />
          <h2 className="text-xl font-black text-white mb-2">Match Not Found</h2>
          <p className="text-slate-400 text-xs sm:text-sm mb-6">
            {error || 'This game room does not exist or has already expired.'}
          </p>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const whitePlayer = game.white_player
  const blackPlayer = game.black_player

  // Identify top and bottom players based on player orientation
  const topPlayer = playerColor === 'black' ? whitePlayer : blackPlayer
  const topClock = playerColor === 'black' ? whiteClock : blackClock
  const isTopTurn = playerColor === 'black' ? game.turn === 'white' : game.turn === 'black'
  const topColorLabel = playerColor === 'black' ? 'White' : 'Black'

  const bottomPlayer = playerColor === 'black' ? blackPlayer : whitePlayer
  const bottomClock = playerColor === 'black' ? blackClock : whiteClock
  const isBottomTurn = playerColor === 'black' ? game.turn === 'black' : game.turn === 'white'
  const bottomColorLabel = playerColor === 'black' ? 'Black' : 'White'

  const isCompleted = game.status === 'completed'
  const isWinner = user && game.winner_id === user.id
  const isDraw = isCompleted && game.winner_id === null

  return (
    <div className="min-h-screen bg-[#050811] text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white relative">
      {/* Background ambient lighting */}
      <div className="fixed top-0 left-1/3 w-[800px] h-[300px] bg-gradient-to-b from-emerald-500/10 via-sky-500/5 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Top Navigation Bar */}
      <header className="h-16 border-b border-white/5 bg-[#070c18]/80 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between z-20 sticky top-0">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            title="Return to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2.5">
            <span className="font-extrabold text-white text-sm sm:text-base tracking-wide">Match</span>
            <span className="px-2.5 py-0.5 rounded-lg bg-slate-900 border border-white/10 text-xs font-mono font-bold text-emerald-400">
              {game.code}
            </span>
            <span className="text-xs text-slate-400 font-medium hidden sm:inline capitalize">
              &bull; {game.time_control.replace('_', ' ').replace('_', '+')}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Real-time sync status */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-slate-900/90 border border-white/10">
            <span
              className={`w-2 h-2 rounded-full ${
                wsStatus === 'connected' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span className={wsStatus === 'connected' ? 'text-emerald-400' : 'text-amber-300'}>
              {wsStatus === 'connected' ? 'Live' : 'Polling'}
            </span>
          </div>

          {/* Board Theme Selector */}
          <div className="hidden md:flex items-center bg-slate-900/90 rounded-xl p-1 border border-white/10">
            {(['emerald', 'slate', 'amber'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setBoardTheme(t)}
                className={`px-2.5 py-1 text-xs rounded-lg font-semibold capitalize transition-all cursor-pointer ${
                  boardTheme === t
                    ? 'bg-slate-700 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {game.is_bot ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-300">
              <Bot className="w-3.5 h-3.5" />
              <span className="capitalize">{game.bot_difficulty || 'AI'} Bot</span>
            </div>
          ) : (
            <button
              onClick={copyRoomCode}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-200 transition-colors cursor-pointer"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copiedLink ? 'Link Copied!' : 'Share Room'}</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Game Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Board & Player Clocks Column */}
        <div className="lg:col-span-8 flex flex-col items-center w-full max-w-[560px] mx-auto">
          {/* Action error notification */}
          {actionError && (
            <div className="w-full mb-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{actionError}</span>
            </div>
          )}

          {/* Draw Offer Notification Banner */}
          {drawOfferIncoming && (
            <div className="w-full mb-3 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs sm:text-sm flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-2">
                <Handshake className="w-5 h-5 text-amber-400 shrink-0" />
                <span className="font-semibold">Opponent has offered a draw.</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleAcceptDraw}
                  className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Accept
                </button>
                <button
                  onClick={handleDeclineDraw}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition cursor-pointer"
                >
                  Decline
                </button>
              </div>
            </div>
          )}

          {/* Waiting for Opponent Lobby Banner */}
          {game.status === 'waiting' && (
            <div className="w-full mb-4 p-5 rounded-2xl glass-panel border border-emerald-500/30 text-center shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-3 animate-pulse">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-white mb-1">Waiting for opponent to join...</h3>
              <p className="text-xs text-slate-400 mb-4 max-w-sm mx-auto">
                Share this room code with an opponent to start playing in real time.
              </p>
              <div className="flex items-center justify-center gap-2.5">
                <span className="text-xl font-mono font-black text-emerald-400 px-4 py-2 bg-slate-950/80 rounded-xl border border-white/10 tracking-widest">
                  {game.code}
                </span>
                <button
                  onClick={copyRoomCode}
                  className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Top Player Card (Opponent) */}
          <div className="w-full flex items-center justify-between px-3.5 py-2.5 mb-2.5 glass-card border border-white/10 rounded-2xl">
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-xl border flex items-center justify-center font-black text-sm ${
                  game.is_bot
                    ? 'bg-teal-500/20 border-teal-500/30 text-teal-300'
                    : 'bg-slate-800 border-white/10 text-slate-300'
                }`}
              >
                {game.is_bot ? (
                  <Bot className="w-5 h-5" />
                ) : topPlayer?.username ? (
                  topPlayer.username[0].toUpperCase()
                ) : (
                  '?'
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-white">
                    {topPlayer?.username || (game.is_bot ? 'ChessBot' : 'Waiting for player...')}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">({topColorLabel})</span>
                  {game.is_bot && (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20">
                      {game.bot_difficulty || 'AI'}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {topPlayer && (
                    <span className="text-xs text-amber-400 font-bold font-mono">{topPlayer.rating} ELO</span>
                  )}
                  {botThinking && (
                    <span className="flex items-center gap-1 text-[11px] text-teal-400 font-semibold animate-pulse">
                      <Loader2 className="w-3 h-3 animate-spin" /> Thinking...
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Top Clock */}
            <div
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-mono font-black text-base sm:text-lg transition-all ${
                isTopTurn && game.status === 'in_progress'
                  ? topClock <= 30
                    ? 'bg-rose-950/80 text-rose-300 border border-rose-500/50 animate-pulse shadow-rose-950/50'
                    : 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 shadow-md'
                  : 'bg-slate-900/90 text-slate-400 border border-white/5'
              }`}
            >
              <Clock className="w-4 h-4 opacity-75" />
              <span>{formatTime(topClock)}</span>
            </div>
          </div>

          {/* Interactive Chessboard */}
          <div className="w-full flex justify-center">
            <Chessboard
              fen={game.fen}
              turn={game.turn}
              playerColor={playerColor}
              interactive={game.status === 'in_progress' && isUserTurn}
              lastMove={lastMove}
              isCheck={isCheck}
              onMove={handleMove}
              theme={boardTheme}
            />
          </div>

          {/* Bottom Player Card (User) */}
          <div className="w-full flex items-center justify-between px-3.5 py-2.5 mt-2.5 glass-card border border-white/10 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-slate-950 font-black text-sm flex items-center justify-center shadow-md">
                {bottomPlayer?.username ? bottomPlayer.username[0].toUpperCase() : (user?.username?.[0].toUpperCase() ?? 'U')}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-white">
                    {bottomPlayer?.username || user?.username} {playerColor && <span className="text-emerald-400 text-xs font-semibold">(You)</span>}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">({bottomColorLabel})</span>
                </div>
                <span className="text-xs text-amber-400 font-bold font-mono">
                  {(bottomPlayer?.rating ?? user?.rating) || 1200} ELO
                </span>
              </div>
            </div>

            {/* Bottom Clock */}
            <div
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-mono font-black text-base sm:text-lg transition-all ${
                isBottomTurn && game.status === 'in_progress'
                  ? bottomClock <= 30
                    ? 'bg-rose-950/80 text-rose-300 border border-rose-500/50 animate-pulse'
                    : 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 shadow-md'
                  : 'bg-slate-900/90 text-slate-400 border border-white/5'
              }`}
            >
              <Clock className="w-4 h-4 opacity-75" />
              <span>{formatTime(bottomClock)}</span>
            </div>
          </div>

          {/* Mobile Fast In-game Controls */}
          {playerColor && game.status === 'in_progress' && (
            <div className="w-full mt-3 flex items-center justify-between gap-3">
              <button
                onClick={handleOfferDraw}
                disabled={game.draw_offered_by === user?.id}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-white/10 text-xs font-bold text-slate-300 disabled:opacity-50 transition cursor-pointer"
              >
                <Handshake className="w-4 h-4 text-amber-400" />
                <span>{game.draw_offered_by === user?.id ? 'Draw Offered' : 'Offer Draw'}</span>
              </button>

              <button
                onClick={() => setShowResignConfirm(true)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-xs font-bold text-rose-400 transition cursor-pointer"
              >
                <Flag className="w-4 h-4" />
                <span>Resign</span>
              </button>
            </div>
          )}

          {/* Resign Confirmation Popover */}
          {showResignConfirm && (
            <div className="w-full mt-3 p-4 bg-rose-950/40 border border-rose-500/40 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in duration-150">
              <span className="text-xs text-rose-200 font-bold">Are you sure you want to resign?</span>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handleResign}
                  className="flex-1 sm:flex-initial px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Confirm Resign
                </button>
                <button
                  onClick={() => setShowResignConfirm(false)}
                  className="flex-1 sm:flex-initial px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar: Status, Notation & Match Actions */}
        <div className="lg:col-span-4 flex flex-col gap-4 w-full">
          {/* Status Badge Card */}
          <div className="glass-panel border border-white/10 rounded-2xl sm:rounded-3xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Match Status</span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${
                  game.status === 'in_progress'
                    ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                    : game.status === 'waiting'
                    ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                {game.status.replace('_', ' ')}
              </span>
            </div>

            {game.status === 'in_progress' && (
              <div className="flex items-center gap-2.5 text-sm font-bold">
                <div
                  className={`w-3.5 h-3.5 rounded-full shadow-sm ${
                    game.turn === 'white' ? 'bg-white border border-slate-300' : 'bg-slate-950 border border-slate-700'
                  }`}
                />
                <span className="text-white">
                  {game.turn === 'white' ? 'White' : 'Black'}'s turn
                </span>
                {isUserTurn ? (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold ml-auto border border-emerald-500/30">
                    Your Turn
                  </span>
                ) : botThinking ? (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-extrabold ml-auto border border-teal-500/30 flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" /> Bot Thinking...
                  </span>
                ) : null}
              </div>
            )}

            {isCompleted && (
              <div className="pt-3 border-t border-white/10 mt-3">
                <p className="text-sm font-extrabold text-white flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  {isDraw
                    ? 'Game Drawn'
                    : `${game.winner_id === whitePlayer?.id ? whitePlayer?.username : blackPlayer?.username} Won!`}
                </p>
                <p className="text-xs text-slate-400 capitalize mt-1">
                  Reason: {game.end_reason?.replace('_', ' ')}
                </p>
              </div>
            )}
          </div>

          {/* Moves History Notation Table */}
          <div className="glass-panel border border-white/10 rounded-2xl sm:rounded-3xl p-5 flex flex-col h-[320px] shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Notation (PGN)</span>
              <span className="text-xs text-slate-400 font-mono font-semibold">{parsedMoves.length} moves</span>
            </div>

            <div
              ref={movesContainerRef}
              className="flex-1 overflow-y-auto divide-y divide-white/5 text-xs font-mono py-2"
            >
              {parsedMoves.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                  No moves played yet
                </div>
              ) : (
                parsedMoves.map((m) => (
                  <div key={m.number} className="grid grid-cols-12 py-1.5 px-2 hover:bg-white/[0.02] rounded-lg">
                    <span className="col-span-2 text-slate-500 font-bold">{m.number}.</span>
                    <span className="col-span-5 text-slate-200 font-medium">{m.white}</span>
                    <span className="col-span-5 text-slate-200 font-medium">{m.black || ''}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Game Over Actions Card */}
          {isCompleted && (
            <div className="glass-panel border border-white/10 rounded-2xl sm:rounded-3xl p-5 text-center flex flex-col gap-3 shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-amber-400 flex items-center justify-center mx-auto">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-extrabold text-white">
                  {isDraw ? 'Game Concluded in Draw' : isWinner ? 'Victory!' : 'Defeat'}
                </h4>
                <p className="text-xs text-slate-400 capitalize mt-1">
                  Ended by {game.end_reason?.replace('_', ' ')}
                </p>
              </div>
              <Link
                to="/dashboard"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-extrabold text-xs transition cursor-pointer shadow-lg shadow-emerald-950/50 mt-1"
              >
                Return to Match Hub
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
