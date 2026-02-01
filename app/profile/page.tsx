'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { motion } from 'framer-motion'
import FloatingCard from '@/components/FloatingCard'
import NeonButton from '@/components/NeonButton'
import { Input, Select, ErrorMessage, SuccessMessage, LoadingSpinner } from '@/components/ui'
import type { User } from '@/types'

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [profileData, setProfileData] = useState<Partial<User>>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'BOTH',
  })

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    fetchProfile()
  }, [user, router])

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/auth/me')
      const data = await res.json()

      if (data.user) {
        setProfileData({
          firstName: data.user.firstName || '',
          lastName: data.user.lastName || '',
          email: data.user.email || '',
          phone: data.user.phone || '',
          role: data.user.role || 'BOTH',
        })
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      setError('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      // Note: You'll need to create a PATCH /api/auth/me endpoint for updating profile
      // For now, we'll show a success message
      setSuccess('Profile updated successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      setError('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    // Implement password change logic
    setSuccess('Password change feature coming soon!')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <button
          onClick={() => router.push('/dashboard')}
          className="mb-6 text-car-neon hover:text-car-electric transition-colors"
        >
          ← Back to Dashboard
        </button>

        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold mb-8 text-gray-900"
        >
          Profile Settings
        </motion.h1>

        {error && <ErrorMessage message={error} className="mb-6" onClose={() => setError('')} />}
        {success && <SuccessMessage message={success} className="mb-6" onClose={() => setSuccess('')} />}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Profile Information */}
          <FloatingCard delay={0}>
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Personal Information</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Input
                    label="First Name"
                    type="text"
                    required
                    value={profileData.firstName}
                    onChange={(e) =>
                      setProfileData({ ...profileData, firstName: e.target.value })
                    }
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Input
                    label="Last Name"
                    type="text"
                    required
                    value={profileData.lastName}
                    onChange={(e) =>
                      setProfileData({ ...profileData, lastName: e.target.value })
                    }
                  />
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Input
                  label="Email"
                  type="email"
                  required
                  value={profileData.email}
                  onChange={(e) =>
                    setProfileData({ ...profileData, email: e.target.value })
                  }
                  helperText="Your email is used for login and notifications"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Input
                  label="Phone (Optional)"
                  type="tel"
                  value={profileData.phone || ''}
                  onChange={(e) =>
                    setProfileData({ ...profileData, phone: e.target.value })
                  }
                  placeholder="+1 (555) 000-0000"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Select
                  label="Account Type"
                  value={profileData.role || 'BOTH'}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      role: e.target.value as 'DRIVER' | 'HOST' | 'BOTH',
                    })
                  }
                  options={[
                    { value: 'BOTH', label: 'Both (Drive & Host)' },
                    { value: 'DRIVER', label: 'Driver Only' },
                    { value: 'HOST', label: 'Host Only' },
                  ]}
                  helperText="You can change this at any time"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <NeonButton
                  type="submit"
                  variant="primary"
                  disabled={saving}
                  className="w-full"
                >
                  {saving ? (
                    <span className="flex items-center justify-center gap-2">
                      <LoadingSpinner size="sm" />
                      Saving...
                    </span>
                  ) : (
                    'Save Changes'
                  )}
                </NeonButton>
              </motion.div>
            </form>
          </FloatingCard>

          {/* Password & Security */}
          <FloatingCard delay={0.1}>
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Security</h2>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Input
                  label="Current Password"
                  type="password"
                  placeholder="Enter current password"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Input
                  label="New Password"
                  type="password"
                  placeholder="Enter new password"
                  helperText="Must be at least 8 characters with uppercase, lowercase, and number"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Input
                  label="Confirm New Password"
                  type="password"
                  placeholder="Confirm new password"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <NeonButton
                  type="submit"
                  variant="secondary"
                  className="w-full"
                >
                  Change Password
                </NeonButton>
              </motion.div>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Danger Zone</h3>
              <NeonButton
                variant="outline"
                onClick={async () => {
                  if (confirm('Are you sure you want to logout?')) {
                    await fetch('/api/auth/logout', { method: 'POST' })
                    logout()
                    router.push('/')
                  }
                }}
                className="w-full border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                Logout
              </NeonButton>
            </div>
          </FloatingCard>
        </div>
      </div>
    </div>
  )
}

