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
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-2/5 bg-gray-950 flex-col justify-between p-12">
        <Link href="/">
          <Logo size="sm" showText={true} className="flex-row" />
        </Link>
        <div>
          <h2 className="text-3xl font-bold text-white mb-3 leading-tight">
            Earn from your<br />empty driveway.
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            List once and let drivers find you — or sign up as a driver and start parking smarter.
          </p>
        </div>
        <p className="text-gray-600 text-xs">© 2026 BRIGAP</p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="w-full max-w-sm"
        >
          {/* Mobile logo */}
          <div className="flex justify-center mb-8 lg:hidden">
            <Logo size="sm" showText={true} className="flex-row" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">Create account</h1>
          <p className="text-sm text-gray-500 mb-8">Join BRIGAP — it's free</p>

          {error && <ErrorMessage message={error} className="mb-5" />}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="text"
                label="First name"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="Jane"
              />
              <Input
                type="text"
                label="Last name"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="Smith"
              />
            </div>

            <Input
              type="email"
              label="Email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="you@example.com"
            />

            <Input
              type="tel"
              label="Phone (optional)"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1 (555) 000-0000"
            />

            <Input
              type="password"
              label="Password"
              required
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
              className="w-full py-3 bg-car-neon text-white font-semibold rounded-xl hover:bg-car-electric transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
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
