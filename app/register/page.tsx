'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { motion } from 'framer-motion'
import Logo from '@/components/Logo'
import { Input, Select, ErrorMessage, LoadingSpinner } from '@/components/ui'
import GoogleSignInButton from '@/components/GoogleSignInButton'
import { parseResponseJson, mapAuthError } from '@/lib/utils'

function RegisterContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: searchParams.get('role') === 'host' ? 'HOST'
      : searchParams.get('role') === 'driver' ? 'DRIVER'
      : 'BOTH',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await parseResponseJson<{ token?: string; error?: string }>(res)
      if (!res.ok) { setError(data?.error || 'Registration failed'); return }
      login(data.token)
      router.push('/dashboard')
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
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-car-neon/10 rounded-full blur-3xl" />

        {/* Content */}
        <div className="relative z-10">
          <Link href="/">
            <Logo size="sm" showText onDark />
          </Link>
        </div>

        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-[11px] font-medium text-white/60 tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-car-neon" />
            Start earning today
          </div>
          <h2 className="text-3xl font-bold text-white leading-tight">
            Earn from your<br />empty driveway.
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
            List once and let drivers find you — or sign up as a driver and start parking smarter.
          </p>
        </div>

        {/* Social proof */}
        <div className="relative z-10 flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3 border border-white/10">
          <div className="flex -space-x-2">
            {['#f97316', '#3b82f6', '#10b981', '#8b5cf6'].map((c, i) => (
              <div
                key={i}
                className="w-7 h-7 rounded-full border-2 border-gray-950 flex items-center justify-center text-[10px] font-bold text-white"
                style={{ backgroundColor: c }}
              >
                {String.fromCharCode(65 + i)}
              </div>
            ))}
          </div>
          <div>
            <p className="text-white text-xs font-medium">5,000+ spaces listed</p>
            <p className="text-gray-500 text-[11px]">Join the community</p>
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="w-full max-w-sm py-8"
        >
          {/* Mobile logo */}
          <div className="flex justify-center mb-8 lg:hidden">
            <Logo size="sm" showText />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-1 tracking-tight">Create account</h1>
          <p className="text-sm text-gray-500 mb-8">Join brigap — it's free</p>

          {error && <ErrorMessage message={error} className="mb-5" />}

          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="on">
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="text"
                label="First name"
                required
                autoComplete="given-name"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="Jane"
              />
              <Input
                type="text"
                label="Last name"
                required
                autoComplete="family-name"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="Smith"
              />
            </div>

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
              type="tel"
              label="Phone (optional)"
              autoComplete="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1 (555) 000-0000"
            />

            <Input
              type="password"
              label="Password"
              required
              autoComplete="new-password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Min. 8 characters"
              helperText="Uppercase, lowercase, and a number required"
            />

            <Select
              label="I want to"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as 'DRIVER' | 'HOST' | 'BOTH' })}
              options={[
                { value: 'BOTH',   label: 'Both (find parking & host)' },
                { value: 'DRIVER', label: 'Find parking only' },
                { value: 'HOST',   label: 'List my space only' },
              ]}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-car-neon text-white font-semibold rounded-xl hover:bg-car-electric transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
            >
              {loading ? <><LoadingSpinner size="sm" /> Creating account…</> : 'Create account'}
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
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-car-neon hover:text-car-electric transition-colors">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-car-neon border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <RegisterContent />
    </Suspense>
  )
}
