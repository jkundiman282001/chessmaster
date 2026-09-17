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

// Helper to initialize CSRF protection before stateful auth requests
export async function getCsrfCookie(): Promise<void> {
  await api.get('/sanctum/csrf-cookie')
}
