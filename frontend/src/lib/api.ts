import axios from 'axios'

export const api = axios.create({
  baseURL: '',
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
