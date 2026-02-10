'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { formatCurrency, parseResponseJson } from '@/lib/utils'
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
      const data = await parseResponseJson(res)
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
      const data = await parseResponseJson<{ blockedDates?: BlockedDate[] }>(res)
      if (data?.blockedDates) {
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

      const data = await parseResponseJson<{ error?: string }>(res)

      if (!res.ok) {
        alert(data?.error || 'Failed to block dates')
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <button
          onClick={() => router.push('/host/listings')}
          className="mb-6 text-car-neon hover:text-car-electric transition-colors font-medium"
        >
          ← Back to Listings
        </button>

        <FloatingCard glowColor="neon" className="mb-6">
          <h1 className="text-3xl font-bold mb-4 text-gray-900">{listing.title}</h1>
          <p className="text-gray-600 mb-2">{listing.address}</p>
          <p className="text-gray-600 mb-4">{listing.description}</p>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-500">Price per Hour</p>
              <p className="text-xl font-semibold text-car-neon">
                {formatCurrency(listing.pricePerHour)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Price per Day</p>
              <p className="text-xl font-semibold text-car-neon">
                {formatCurrency(listing.pricePerDay)}
              </p>
            </div>
          </div>
        </FloatingCard>

        {/* Blocked Dates Section */}
        <FloatingCard glowColor="electric" className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Availability Calendar</h2>
            <NeonButton
              variant="outline"
              onClick={() => setShowBlockForm(!showBlockForm)}
            >
              {showBlockForm ? 'Cancel' : '+ Block Dates'}
            </NeonButton>
          </div>

          {showBlockForm && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Start Date
                  </label>
                  <input
                    type="datetime-local"
                    value={blockForm.startDate}
                    onChange={(e) =>
                      setBlockForm({ ...blockForm, startDate: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-car-neon focus:border-car-neon"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    End Date
                  </label>
                  <input
                    type="datetime-local"
                    value={blockForm.endDate}
                    onChange={(e) =>
                      setBlockForm({ ...blockForm, endDate: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-car-neon focus:border-car-neon"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Reason (Optional)
                </label>
                <input
                  type="text"
                  value={blockForm.reason}
                  onChange={(e) =>
                    setBlockForm({ ...blockForm, reason: e.target.value })
                  }
                  placeholder="e.g., Personal use, Maintenance..."
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-car-neon focus:border-car-neon"
                />
              </div>
              <NeonButton variant="primary" onClick={handleBlockDate}>
                Block Dates
              </NeonButton>
            </motion.div>
          )}

          {blockedDates.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No blocked dates. Your listing is available for all dates.
            </p>
          ) : (
            <div className="space-y-2">
              {blockedDates.map((blocked) => (
                <div
                  key={blocked.id}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div>
                    <p className="text-gray-900 font-medium">
                      {new Date(blocked.startDate).toLocaleString()} -{' '}
                      {new Date(blocked.endDate).toLocaleString()}
                    </p>
                    {blocked.reason && (
                      <p className="text-sm text-gray-600">{blocked.reason}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleUnblockDate(blocked.id)}
                    className="px-4 py-2 bg-car-speed/10 text-car-speed rounded-lg hover:bg-car-speed/20 transition-colors text-sm font-medium"
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

