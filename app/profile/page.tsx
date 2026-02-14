'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { motion } from 'framer-motion'
import FloatingCard from '@/components/FloatingCard'
import NeonButton from '@/components/NeonButton'
import { Input, Select, ErrorMessage, SuccessMessage, LoadingSpinner } from '@/components/ui'
import { parseResponseJson } from '@/lib/utils'
import type { User } from '@/types'

export default function ProfilePage() {
  const { user, logout, refreshUser } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [profileData, setProfileData] = useState<Partial<User>>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'BOTH',
    profileImageUrl: null,
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
      const data = await parseResponseJson<{ user?: Partial<User> }>(res)

      if (data?.user) {
        setProfileData({
          firstName: data.user.firstName || '',
          lastName: data.user.lastName || '',
          email: data.user.email || '',
          phone: data.user.phone || '',
          role: data.user.role || 'BOTH',
          profileImageUrl: data.user.profileImageUrl ?? null,
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
      const res = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          phone: profileData.phone || null,
          role: profileData.role,
          profileImageUrl: profileData.profileImageUrl ?? null,
        }),
      })
      const data = await parseResponseJson<{ user?: User; error?: string }>(res)
      if (!res.ok) {
        setError(data?.error || 'Failed to update profile')
        return
      }
      if (data?.user) {
        setProfileData((prev) => ({ ...prev, ...data.user }))
        await refreshUser()
      }
      setSuccess('Profile updated successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } catch {
      setError('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleProfileImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingImage(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('type', 'profile')
      fd.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await parseResponseJson<{ url?: string; error?: string }>(res)
      if (!res.ok) {
        setError(data?.error || 'Failed to upload image')
        return
      }
      if (data?.url) {
        setProfileData((prev) => ({ ...prev, profileImageUrl: data.url }))
        const patchRes = await fetch('/api/auth/me', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profileImageUrl: data.url }),
        })
        if (patchRes.ok) await refreshUser()
        setSuccess('Profile photo updated!')
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch {
      setError('Failed to upload image')
    } finally {
      setUploadingImage(false)
      e.target.value = ''
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

            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200">
              <div className="relative">
                {profileData.profileImageUrl ? (
                  <Image
                    src={profileData.profileImageUrl}
                    alt="Profile"
                    width={96}
                    height={96}
                    className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-car-neon to-car-electric flex items-center justify-center text-white text-2xl font-semibold">
                    {profileData.firstName?.[0]?.toUpperCase() || profileData.email?.[0]?.toUpperCase() || '?'}
                  </div>
                )}
                {uploadingImage && (
                  <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                    <LoadingSpinner size="sm" />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Profile photo</label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="block w-full text-sm text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-car-neon/10 file:text-car-neon hover:file:bg-car-neon/20"
                  onChange={handleProfileImageChange}
                  disabled={uploadingImage}
                />
                <p className="text-xs text-gray-500 mt-1">JPEG, PNG, WebP or GIF. Max 5MB.</p>
              </div>
            </div>

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

