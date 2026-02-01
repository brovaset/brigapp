'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  userId: string
  email: string
  role: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (token: string) => void
  logout: () => void
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
          .then(res => {
            if (!res.ok) {
              throw new Error('Failed to fetch user')
            }
            return res.json()
          })
          .then(data => {
            if (data.user) {
              setUser({
                userId: data.user.id,
                email: data.user.email,
                role: data.user.role,
              })
            }
          })
          .catch(error => {
            console.error('Auth check error:', error)
            // Clear invalid token
            document.cookie = 'auth-token=; path=/; max-age=0'
          })
          .finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
    } catch (error) {
      console.error('Auth initialization error:', error)
      setLoading(false)
    }
  }, [])

  const login = (token: string) => {
    document.cookie = `auth-token=${token}; path=/; max-age=${7 * 24 * 60 * 60}`
    fetch('/api/auth/me', {
      credentials: 'include',
    })
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to fetch user')
        }
        return res.json()
      })
      .then(data => {
        if (data.user) {
          setUser({
            userId: data.user.id,
            email: data.user.email,
            role: data.user.role,
          })
        }
      })
      .catch(error => {
        console.error('Login error:', error)
      })
  }

  const logout = () => {
    document.cookie = 'auth-token=; path=/; max-age=0'
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
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

