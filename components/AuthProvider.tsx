'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  userId: string
  email: string
  role: string
  firstName?: string
  lastName?: string
  profileImageUrl?: string | null
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (token: string) => void
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing token
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('auth-token='))
        ?.split('=')[1]

      if (token) {
        fetch('/api/auth/me', {
          credentials: 'include',
        })
          .then(async res => {
            const text = await res.text()
            if (!res.ok) {
              throw new Error('Failed to fetch user')
            }
            // Avoid parsing HTML as JSON (e.g. error pages or redirects)
            const trimmed = text.trim()
            if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
              return JSON.parse(text) as { user?: { id: string; email: string; role: string; firstName?: string; lastName?: string; profileImageUrl?: string | null } }
            }
            throw new Error('Invalid response')
          })
          .then(data => {
            if (data?.user) {
              setUser({
                userId: data.user.id,
                email: data.user.email,
                role: data.user.role,
                firstName: data.user.firstName,
                lastName: data.user.lastName,
                profileImageUrl: data.user.profileImageUrl,
              })
            }
          })
          .catch(error => {
            console.error('Auth check error:', error ?? 'Unknown error')
            document.cookie = 'auth-token=; path=/; max-age=0'
          })
          .finally(() => setLoading(false))
      } else {
        queueMicrotask(() => setLoading(false))
      }
    } catch (error) {
      console.error('Auth initialization error:', error)
      queueMicrotask(() => setLoading(false))
    }
  }, [])

  const login = (token: string) => {
    document.cookie = `auth-token=${token}; path=/; max-age=${7 * 24 * 60 * 60}`
    fetch('/api/auth/me', {
      credentials: 'include',
    })
      .then(async res => {
        const text = await res.text()
        if (!res.ok) {
          throw new Error('Failed to fetch user')
        }
        const trimmed = text.trim()
        if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
          return JSON.parse(text) as { user?: { id: string; email: string; role: string; firstName?: string; lastName?: string; profileImageUrl?: string | null } }
        }
        throw new Error('Invalid response')
      })
      .then(data => {
        if (data?.user) {
          setUser({
            userId: data.user.id,
            email: data.user.email,
            role: data.user.role,
            firstName: data.user.firstName,
            lastName: data.user.lastName,
            profileImageUrl: data.user.profileImageUrl,
          })
        }
      })
      .catch(error => {
        console.error('Login error:', error ?? 'Unknown error')
      })
  }

  const logout = () => {
    document.cookie = 'auth-token=; path=/; max-age=0'
    setUser(null)
  }

  const refreshUser = async () => {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' })
      const text = await res.text()
      if (!res.ok || !text.trim().startsWith('{')) return
      const data = JSON.parse(text) as { user?: { id: string; email: string; role: string; firstName?: string; lastName?: string; profileImageUrl?: string | null } }
      if (data?.user) {
        setUser({
          userId: data.user.id,
          email: data.user.email,
          role: data.user.role,
          firstName: data.user.firstName,
          lastName: data.user.lastName,
          profileImageUrl: data.user.profileImageUrl,
        })
      }
    } catch {
      // ignore
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
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

