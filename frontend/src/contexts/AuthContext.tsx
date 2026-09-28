import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authService } from '../services/authService'
import { User } from '../types'

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string, rememberMe: boolean) => Promise<void>
  logout: () => void
  updateProfile: (data: {
    full_name?: string
    email?: string
    phone?: string
  }) => Promise<User>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

/**
 * Tokens live in localStorage when "Remember me" is ticked, otherwise in
 * sessionStorage. Both must be checked on boot, otherwise a session-only
 * login is silently dropped on refresh and the user is sent back to /login.
 */
const getStoredToken = (): string | null =>
  localStorage.getItem('token') || sessionStorage.getItem('token')

const clearStoredTokens = () => {
  localStorage.removeItem('token')
  sessionStorage.removeItem('token')
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(getStoredToken())
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = getStoredToken()
      if (storedToken) {
        try {
          const userData = await authService.getMe()
          setUser(userData)
          setToken(storedToken)
        } catch {
          clearStoredTokens()
          setToken(null)
        }
      }
      setIsLoading(false)
    }
    initAuth()
  }, [])

  const login = async (email: string, password: string, rememberMe: boolean) => {
    const response = await authService.login(email, password)
    setUser(response.user)
    setToken(response.access_token)
    if (rememberMe) {
      localStorage.setItem('token', response.access_token)
    } else {
      sessionStorage.setItem('token', response.access_token)
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    clearStoredTokens()
  }

  const updateProfile = async (data: {
    full_name?: string
    email?: string
    phone?: string
  }) => {
    const updated = await authService.updateProfile(data)
    setUser(updated)
    return updated
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
