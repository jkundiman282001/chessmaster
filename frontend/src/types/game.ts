import type { User } from './auth'

export type TimeControlKey =
  | 'bullet_1_0'
  | 'blitz_3_2'
  | 'blitz_5_0'
  | 'rapid_10_0'
  | 'classical_30_0'

export interface UserStats {
  total_games: number
  wins: number
  losses: number
  draws: number
  win_rate: number
}

export interface PlayerSummary {
  id: number
  username: string
  rating: number
  avatar: string | null
}

export interface Game {
  id: number
  code: string
  status: 'waiting' | 'in_progress' | 'completed' | 'aborted'
  time_control: TimeControlKey
  turn: 'white' | 'black'
  fen: string
  pgn: string | null
  white_time_remaining: number
  black_time_remaining: number
  white_player: PlayerSummary | null
  black_player: PlayerSummary | null
  winner_id: number | null
  end_reason: string | null
  created_at: string
  updated_at: string
}

export interface LeaderboardEntry {
  rank: number
  id: number
  username: string
  name: string | null
  rating: number
  avatar: string | null
  stats: UserStats
}

export interface DashboardResponse {
  user: User & { stats: UserStats }
  active_games: Game[]
  recent_matches: Game[]
  leaderboard: LeaderboardEntry[]
}

export interface CreateGamePayload {
  time_control?: TimeControlKey
  color?: 'white' | 'black' | 'random'
}
