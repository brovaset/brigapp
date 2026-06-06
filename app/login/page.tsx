'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { motion } from 'framer-motion'
import Logo from '@/components/Logo'
import { Input, ErrorMessage, LoadingSpinner } from '@/components/ui'
import GoogleSignInButton from '@/components/GoogleSignInButton'
import { parseResponseJson, mapAuthError } from '@/lib/utils'

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({ email: '', password: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await parseResponseJson<{ token?: string; error?: string }>(res)
      if (!res.ok) { setError(data?.error || 'Login failed'); return }
      if (!data?.token) { setError('Invalid response. Please try again.'); return }
      login(data.token)
      const redirect = searchParams.get('redirect')
      router.push(redirect && redirect.startsWith('/') ? redirect : '/dashboard')
    } catch (err) {
      setError(mapAuthError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex">

      {/* ── Left brand panel ── */}
      <div className="hidden lg:flex lg:w-[42%] relative flex-col justify-between p-12 overflow-hidden bg-gray-950">
        {/* Dot-grid texture */}
        <div
          className="absolute inset-0 opacity-[0.09]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)',
            backgroundSize: '22px 22px',
          }}
        />
        {/* Orange top accent line */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-car-neon" />
        {/* Subtle orange glow */}
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-car-neon/10 rounded-full blur-3xl" />

        {/* Content */}
        <div className="relative z-10">
          <Link href="/">
            <Logo size="sm" showText onDark />
          </Link>
        </div>

        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-[11px] font-medium text-white/60 tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-car-neon" />
            Parking, simplified
          </div>
          <h2 className="text-3xl font-bold text-white leading-tight">
            The smartest way<br />to park.
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
            Thousands of driveways, garages, and private spots ready to book in seconds.
          </p>
        </div>

        <p className="relative z-10 text-gray-600 text-xs">© 2026 brigap</p>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="w-full max-w-sm"
        >
          {/* Mobile logo */}
          <div className="flex justify-center mb-8 lg:hidden">
            <Logo size="sm" showText />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-1 tracking-tight">Welcome back</h1>
          <p className="text-sm text-gray-500 mb-8">Sign in to your account</p>

          {error && <ErrorMessage message={error} className="mb-5" />}

          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="on">
            <Input
              type="email"
              label="Email"
              required
              autoComplete="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="you@example.com"
            />
            <Input
              type="password"
              label="Password"
              required
              autoComplete="current-password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-car-neon text-white font-semibold rounded-xl hover:bg-car-electric transition-colors shadow-sm disabled:opacity-50 mt-2 flex items-center justify-center gap-2 text-sm"
            >
              {loading ? <><LoadingSpinner size="sm" /> Signing in…</> : 'Sign in'}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-white text-xs text-gray-400">or continue with</span>
            </div>
          </div>

          <GoogleSignInButton onError={setError} />

          <p className="mt-6 text-center text-sm text-gray-500">
            No account?{' '}
            <Link href="/register" className="font-medium text-car-neon hover:text-car-electric transition-colors">
              Create one
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-car-neon border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
