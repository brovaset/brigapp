'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { motion } from 'framer-motion'
import ListingCard from '@/components/ListingCard'
import { LoadingSpinner } from '@/components/ui'
import type { Listing } from '@/types'

export default function SavedPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [savedListings, setSavedListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    fetchSavedListings()
  }, [user, router])

  const fetchSavedListings = async () => {
    try {
      const res = await fetch('/api/saved')
      const data = await res.json()
      if (res.ok && data.listings) {
        setSavedListings(data.listings)
      }
    } catch (error) {
      console.error('Error fetching saved listings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (listingId: string) => {
    try {
      await fetch(`/api/saved?listingId=${listingId}`, { method: 'DELETE' })
      setSavedListings(savedListings.filter((l) => l.id !== listingId))
    } catch (error) {
      console.error('Error removing saved listing:', error)
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Saved Listings</h1>
          <p className="text-gray-600">
            {savedListings.length > 0
              ? `${savedListings.length} saved ${savedListings.length === 1 ? 'listing' : 'listings'}`
              : 'Your saved parking spots will appear here'}
          </p>
        </motion.div>

        {savedListings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200/80 p-12 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-car-electric/10 flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8 text-car-electric" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No saved listings yet</h2>
            <p className="text-gray-600 mb-6 max-w-sm mx-auto leading-relaxed">
              Start exploring and save your favorite parking spots for quick access later
            </p>
            <Link href="/search">
              <button
                type="button"
                className="px-6 py-3 bg-gradient-to-r from-car-neon to-car-electric text-white rounded-lg hover:opacity-90 transition-opacity font-semibold shadow-md"
              >
                Explore Listings
              </button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {savedListings.map((listing, index) => (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="relative group"
              >
                <ListingCard listing={listing} index={index} />
                <button
                  onClick={() => handleRemove(listing.id)}
                  className="absolute top-6 right-6 p-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-colors shadow-sm opacity-0 group-hover:opacity-100"
                >
                  <svg
                    className="w-5 h-5 fill-red-500 text-red-500"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

