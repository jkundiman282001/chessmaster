import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { api } from '../lib/api'
import type {
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
  User,
} from '../types/auth'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (credentials: LoginCredentials) => Promise<User>
  register: (credentials: RegisterCredentials) => Promise<User>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem('chessmaster_token')
    if (!token) {
      setUser(null)
      setIsLoading(false)
      return
    }

    try {
      const response = await api.get<{ user: User }>('/api/user')
      setUser(response.data.user)
    } catch {
      localStorage.removeItem('chessmaster_token')
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshUser()
  }, [refreshUser])

  const login = async (credentials: LoginCredentials): Promise<User> => {
    const response = await api.post<AuthResponse>('/api/login', credentials)
    if (response.data.token) {
      localStorage.setItem('chessmaster_token', response.data.token)
    }
    setUser(response.data.user)
    return response.data.user
  }

  const register = async (credentials: RegisterCredentials): Promise<User> => {
    const response = await api.post<AuthResponse>('/api/register', credentials)
    if (response.data.token) {
      localStorage.setItem('chessmaster_token', response.data.token)
    }
    setUser(response.data.user)
    return response.data.user
  }

  const logout = async (): Promise<void> => {
    try {
      await api.post('/api/logout')
    } finally {
      localStorage.removeItem('chessmaster_token')
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
