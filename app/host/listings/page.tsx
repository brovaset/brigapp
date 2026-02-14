'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import Link from 'next/link'
import { motion } from 'framer-motion'
import FloatingCard from '@/components/FloatingCard'
import NeonButton from '@/components/NeonButton'
import { LoadingSpinner, Modal, ErrorMessage } from '@/components/ui'
import { formatCurrency, parseResponseJson } from '@/lib/utils'
import type { Listing } from '@/types'

export default function HostListingsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const fetchListings = useCallback(async () => {
    try {
      const res = await fetch('/api/listings')
      const data = await parseResponseJson<{ listings?: Listing[] }>(res)

      if (data?.listings) {
        // Filter to only show user's listings
        const myListings = data.listings.filter(
          (l: Listing) => l.host?.id === user?.userId || l.hostId === user?.userId
        )
        setListings(myListings)
      }
    } catch (error) {
      console.error('Error fetching listings:', error)
      setError('Failed to load listings')
    } finally {
      setLoading(false)
    }
  }, [user?.userId])

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    fetchListings()
  }, [user, router, fetchListings])

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/listings/${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const data = await parseResponseJson<{ error?: string }>(res)
        setError(data?.error || 'Failed to delete listing')
        return
      }

      setListings(listings.filter((l) => l.id !== id))
      setDeleteConfirm(null)
    } catch (error) {
      console.error('Error deleting listing:', error)
      setError('Failed to delete listing')
    }
  }

  const handleToggleActive = async (listing: Listing) => {
    try {
      const res = await fetch(`/api/listings/${listing.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !listing.isActive }),
      })

      if (!res.ok) {
        const data = await parseResponseJson<{ error?: string }>(res)
        setError(data?.error || 'Failed to update listing')
        return
      }

      setListings(
        listings.map((l) => (l.id === listing.id ? { ...l, isActive: !l.isActive } : l))
      )
    } catch (error) {
      console.error('Error updating listing:', error)
      setError('Failed to update listing')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <button
          onClick={() => router.push('/dashboard')}
          className="mb-6 text-car-neon hover:text-car-electric transition-colors font-medium"
        >
          ← Back to Dashboard
        </button>

        <div className="flex justify-between items-center mb-8">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-gray-900"
          >
            My Listings
          </motion.h1>
          <Link href="/host/listings/new">
            <NeonButton variant="primary">
              Create New Listing
            </NeonButton>
          </Link>
        </div>

        {error && <ErrorMessage message={error} className="mb-6" onClose={() => setError('')} />}

        {listings.length === 0 ? (
          <FloatingCard glowColor="electric" delay={0}>
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-car-electric/20 flex items-center justify-center mb-4 mx-auto">
                <svg className="w-8 h-8 text-car-electric" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h8m0 0v8m0-8l-3 3m3-3l-3 3" /></svg>
              </div>
              <h2 className="text-2xl font-bold mb-4 text-gray-900">No Listings Yet</h2>
              <p className="text-gray-600 mb-8">
                Create your first listing to start earning passive income from your parking space
              </p>
              <Link href="/host/listings/new">
                <NeonButton variant="primary" className="text-lg px-8 py-4">
                  Create Your First Listing
                </NeonButton>
              </Link>
            </div>
          </FloatingCard>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing, index) => (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <FloatingCard glowColor={listing.isActive ? 'electric' : 'turbo'} delay={0}>
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-semibold mb-2 text-gray-900 flex-1">{listing.title}</h2>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ml-2 ${
                        listing.isActive
                          ? 'bg-car-electric/20 text-car-electric border border-car-electric/40'
                          : 'bg-gray-200 text-gray-600 border border-gray-300'
                      }`}
                    >
                      {listing.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{listing.address}</p>

                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-1">Pricing</p>
                    <p className="font-semibold text-car-neon">
                      {formatCurrency(listing.pricePerHour)}/hour
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatCurrency(listing.pricePerDay)}/day
                    </p>
                  </div>

                  {listing.maxVehicleSize && (
                    <p className="text-sm text-gray-600 mb-4">
                      Max size: <span className="text-car-electric font-medium">{listing.maxVehicleSize}</span>
                    </p>
                  )}

                  {listing.averageRating && listing.averageRating > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4 fill-yellow-400 inline" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" /></svg>
                        <span className="text-gray-900 font-semibold">
                          {listing.averageRating.toFixed(1)}
                        </span>
                        <span className="text-gray-500 text-sm">
                          ({listing.ratingCount || 0} reviews)
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-4 border-t border-gray-200">
                    <Link href={`/host/listings/${listing.id}`} className="flex-1">
                      <NeonButton variant="outline" className="w-full text-sm">
                        Manage
                      </NeonButton>
                    </Link>
                    <Link href={`/host/listings/${listing.id}/edit`} className="flex-1">
                      <NeonButton variant="outline" className="w-full text-sm">
                        Edit
                      </NeonButton>
                    </Link>
                    <NeonButton
                      variant={listing.isActive ? 'outline' : 'primary'}
                      onClick={() => handleToggleActive(listing)}
                      className="flex-1 text-sm"
                    >
                      {listing.isActive ? 'Deactivate' : 'Activate'}
                    </NeonButton>
                  </div>

                  <NeonButton
                    variant="outline"
                    onClick={() => setDeleteConfirm(listing.id)}
                    className="w-full mt-2 text-sm border-car-speed/50 text-car-speed hover:bg-car-speed/10"
                  >
                    Delete
                  </NeonButton>
                </FloatingCard>
              </motion.div>
            ))}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={deleteConfirm !== null}
          onClose={() => setDeleteConfirm(null)}
          title="Delete Listing"
          size="sm"
          footer={
            <>
              <NeonButton variant="outline" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </NeonButton>
              <NeonButton
                variant="primary"
                onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
                className="bg-car-speed/20 border-car-speed/50 text-car-speed hover:bg-car-speed/30"
              >
                Delete
              </NeonButton>
            </>
          }
        >
          <p className="text-gray-600">
            Are you sure you want to delete this listing? This action cannot be undone.
          </p>
        </Modal>
      </div>
    </div>
  )
}
