'use client'

import { Suspense, useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/components/AuthProvider'
import SearchBar from '@/components/SearchBar'
import Logo from '@/components/Logo'
import { parseResponseJson } from '@/lib/utils'
import type { Listing } from '@/types'

const HomeFeaturedListings = dynamic(
  () => import('@/components/HomeFeaturedListings'),
  { ssr: true, loading: () => <div className="h-64 animate-pulse bg-gray-100 rounded-xl" /> }
)

const HomeFeaturesSection = dynamic(
  () => import('@/components/HomeFeaturesSection'),
  { ssr: true, loading: () => <div className="h-96 bg-gray-50/80" /> }
)

export default function Home() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [listings, setListings] = useState<Listing[]>([])
  const [loadingListings, setLoadingListings] = useState(true)

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  useEffect(() => {
    fetchFeaturedListings()
  }, [])

  const fetchFeaturedListings = async () => {
    try {
      const res = await fetch('/api/listings?limit=12')
      const data = await parseResponseJson<{ listings?: Listing[] }>(res)
      if (data?.listings) {
        setListings(data.listings.slice(0, 12))
      }
    } catch (error) {
      console.error('Error fetching listings:', error)
    } finally {
      setLoadingListings(false)
    }
  }

  if (!loading && user) {
    return null
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section with Search */}
      <div className="relative bg-gradient-to-b from-gray-50/90 via-white to-gray-50/90 pb-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-6 flex justify-center"
            >
              <Logo size="lg" showText={false} />
            </motion.div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-4 tracking-tight">
              Find parking near you
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Discover driveways, parking spots, and spaces available for rent in your area
            </p>
          </motion.div>

          {/* Search Bar */}
          <Suspense fallback={<div className="h-14 max-w-5xl mx-auto rounded-xl bg-gray-100 animate-pulse" />}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="max-w-5xl mx-auto"
            >
              <SearchBar />
            </motion.div>
          </Suspense>
        </div>
      </div>

      {/* Featured Listings - lazy-loaded to defer framer-motion */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <HomeFeaturedListings listings={listings} loading={loadingListings} />
      </div>

      {/* Features + CTA - lazy-loaded to defer framer-motion */}
      <HomeFeaturesSection />
    </div>
  )
}

