'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { formatCurrency } from '@/lib/utils'
import AnimatedBackground from '@/components/AnimatedBackground'
import FloatingCard from '@/components/FloatingCard'
import NeonButton from '@/components/NeonButton'
import { motion } from 'framer-motion'

interface BlockedDate {
  id: string
  startDate: string
  endDate: string
  reason?: string
}

export default function ListingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [listing, setListing] = useState<any>(null)
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([])
  const [loading, setLoading] = useState(true)
  const [showBlockForm, setShowBlockForm] = useState(false)
  const [blockForm, setBlockForm] = useState({
    startDate: '',
    endDate: '',
    reason: '',
  })

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    fetchListing()
    fetchBlockedDates()
  }, [params.id, user, router])

  const fetchListing = async () => {
    try {
      const res = await fetch(`/api/listings/${params.id}`)
      const data = await res.json()
      if (res.ok && data) {
        setListing(data)
      } else {
        alert('Listing not found')
        router.push('/host/listings')
      }
    } catch (error) {
      console.error('Error fetching listing:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchBlockedDates = async () => {
    try {
      const res = await fetch(`/api/listings/${params.id}/blocked-dates`)
      const data = await res.json()
      if (data.blockedDates) {
        setBlockedDates(data.blockedDates)
      }
    } catch (error) {
      console.error('Error fetching blocked dates:', error)
    }
  }

  const handleBlockDate = async () => {
    if (!blockForm.startDate || !blockForm.endDate) {
      alert('Please select start and end dates')
      return
    }

    try {
      const res = await fetch(`/api/listings/${params.id}/blocked-dates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(blockForm),
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.error || 'Failed to block dates')
        return
      }

      setBlockForm({ startDate: '', endDate: '', reason: '' })
      setShowBlockForm(false)
      fetchBlockedDates()
    } catch (error) {
      console.error('Error blocking dates:', error)
      alert('Failed to block dates')
    }
  }

  const handleUnblockDate = async (blockedDateId: string) => {
    if (!confirm('Are you sure you want to unblock these dates?')) return

    try {
      const res = await fetch(
        `/api/listings/${params.id}/blocked-dates?blockedDateId=${blockedDateId}`,
        { method: 'DELETE' }
      )

      if (!res.ok) {
        alert('Failed to unblock dates')
        return
      }

      fetchBlockedDates()
    } catch (error) {
      console.error('Error unblocking dates:', error)
      alert('Failed to unblock dates')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-car-neon border-t-transparent"></div>
          <p className="text-gray-600 text-lg font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  if (!listing) {
    return null
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <AnimatedBackground />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <button
          onClick={() => router.push('/host/listings')}
          className="mb-6 text-neon-cyan hover:text-neon-pink transition-colors"
        >
          ← Back to Listings
        </button>

        <FloatingCard glowColor="pink" className="mb-6">
          <h1 className="text-3xl font-bold mb-4 text-white">{listing.title}</h1>
          <p className="text-gray-300 mb-2">{listing.address}</p>
          <p className="text-gray-300 mb-4">{listing.description}</p>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-400">Price per Hour</p>
              <p className="text-xl font-semibold text-neon-cyan">
                {formatCurrency(listing.pricePerHour)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Price per Day</p>
              <p className="text-xl font-semibold text-neon-cyan">
                {formatCurrency(listing.pricePerDay)}
              </p>
            </div>
          </div>
        </FloatingCard>

        {/* Blocked Dates Section */}
        <FloatingCard glowColor="purple" className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-white">Availability Calendar</h2>
            <NeonButton
              variant="secondary"
              onClick={() => setShowBlockForm(!showBlockForm)}
            >
              {showBlockForm ? 'Cancel' : '+ Block Dates'}
            </NeonButton>
          </div>

          {showBlockForm && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10"
            >
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-neon-cyan">
                    Start Date
                  </label>
                  <input
                    type="datetime-local"
                    value={blockForm.startDate}
                    onChange={(e) =>
                      setBlockForm({ ...blockForm, startDate: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-neon-cyan">
                    End Date
                  </label>
                  <input
                    type="datetime-local"
                    value={blockForm.endDate}
                    onChange={(e) =>
                      setBlockForm({ ...blockForm, endDate: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-neon-cyan">
                  Reason (Optional)
                </label>
                <input
                  type="text"
                  value={blockForm.reason}
                  onChange={(e) =>
                    setBlockForm({ ...blockForm, reason: e.target.value })
                  }
                  placeholder="e.g., Personal use, Maintenance..."
                  className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400"
                />
              </div>
              <NeonButton variant="primary" onClick={handleBlockDate}>
                Block Dates
              </NeonButton>
            </motion.div>
          )}

          {blockedDates.length === 0 ? (
            <p className="text-gray-400 text-center py-4">
              No blocked dates. Your listing is available for all dates.
            </p>
          ) : (
            <div className="space-y-2">
              {blockedDates.map((blocked) => (
                <div
                  key={blocked.id}
                  className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/10"
                >
                  <div>
                    <p className="text-white font-medium">
                      {new Date(blocked.startDate).toLocaleString()} -{' '}
                      {new Date(blocked.endDate).toLocaleString()}
                    </p>
                    {blocked.reason && (
                      <p className="text-sm text-gray-400">{blocked.reason}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleUnblockDate(blocked.id)}
                    className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm"
                  >
                    Unblock
                  </button>
                </div>
              ))}
            </div>
          )}
        </FloatingCard>
      </div>
    </div>
  )
}

