'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string
            callback: (response: { credential: string }) => void
            auto_select?: boolean
          }) => void
          renderButton: (
            element: HTMLElement,
            options: { theme?: string; size?: string; width?: number; text?: string }
          ) => void
        }
      }
    }
  }
}

interface GoogleSignInButtonProps {
  onError?: (message: string) => void
  redirectTo?: string
}

export default function GoogleSignInButton({ onError, redirectTo = '/dashboard' }: GoogleSignInButtonProps) {
  const buttonRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { login } = useAuth()
  const [loading, setLoading] = useState(false)

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

  useEffect(() => {
    if (!clientId) {
      console.warn('NEXT_PUBLIC_GOOGLE_CLIENT_ID not set - Google Sign-In disabled')
      return
    }

    const loadGoogleScript = () => {
      if (window.google?.accounts?.id) {
        initGoogleSignIn()
        return
      }
      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      script.onload = initGoogleSignIn
      document.head.appendChild(script)
    }

    const initGoogleSignIn = () => {
      if (!window.google?.accounts?.id || !buttonRef.current) return

      window.google.accounts.id.initialize({
        client_id: clientId,
        auto_select: false,
        callback: async (response) => {
          setLoading(true)
          try {
            const res = await fetch('/api/auth/google', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ credential: response.credential }),
            })

            const data = await res.json()

            if (!res.ok) {
              onError?.(data.error || 'Google sign-in failed')
              return
            }

            login(data.token)
            router.push(redirectTo)
          } catch {
            onError?.('Something went wrong')
          } finally {
            setLoading(false)
          }
        },
      })

      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: 'outline',
        size: 'large',
        width: 320,
        text: 'continue_with',
      })
    }

    loadGoogleScript()
  }, [clientId, login, router, redirectTo, onError])

  if (!clientId) {
    return null
  }

  return (
    <div className="relative">
      <div
        ref={buttonRef}
        className={`min-h-[44px] flex items-center justify-center ${loading ? 'opacity-50 pointer-events-none' : ''}`}
      />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-car-neon border-t-transparent" />
        </div>
      )}
    </div>
  )
}
