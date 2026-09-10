export interface User {
  id: number
  username: string
  name: string | null
  email: string
  rating: number
  avatar: string | null
  created_at: string
}

export interface AuthResponse {
  message: string
  user: User
}

export interface LoginCredentials {
  login: string
  password: string
  remember?: boolean
}

export interface RegisterCredentials {
  username: string
  name?: string
  email: string
  password: string
  password_confirmation: string
}

export interface ApiErrorResponse {
  message: string
  errors?: Record<string, string[]>
}
