import axios from 'axios'

const apiBaseUrl = import.meta.env.VITE_API_URL || ''

export const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
})

// Automatically attach Bearer token if stored in localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('chessmaster_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Helper to initialize CSRF protection before stateful auth requests
export async function getCsrfCookie(): Promise<void> {
  // Only needed if no Bearer token is stored
  if (!localStorage.getItem('chessmaster_token')) {
    try {
      await api.get('/sanctum/csrf-cookie')
    } catch {
      // Non-fatal if using Bearer token
    }
  }
}
