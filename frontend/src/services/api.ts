import axios from 'axios'

// Dev: local backend (override with VITE_API_URL). Production builds always
// use same-origin "/api": on Render FastAPI serves it directly, and on Vercel
// vercel.json rewrites /api/* to the Render backend. This makes stale
// platform env vars (e.g. an old VITE_API_URL baked into a dashboard) harmless.
const API_BASE_URL = import.meta.env.DEV
  ? import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
  : '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      sessionStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
