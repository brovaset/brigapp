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
    <div className="min-h-screen bg-white">
      {/* Hero Section with Search */}
      <div className="relative bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 overflow-hidden pt-20">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-car-neon/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-72 h-72 bg-car-electric/10 rounded-full blur-3xl" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-24 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="mb-8 flex justify-center"
            >
              <div className="relative">
                <div className="absolute inset-0 blur-2xl bg-gradient-to-r from-car-neon to-car-electric opacity-20" />
                <Logo size="lg" showText={false} />
              </div>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-car-neon to-gray-900 mb-6 tracking-tight leading-tight"
            >
              Find Your Perfect Parking
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed font-medium"
            >
              Discover secure parking spaces, garages, and driveways available for rent in your area. Book instantly with confidence.
            </motion.p>
          </motion.div>

          {/* Search Bar */}
          <Suspense fallback={<div className="h-20 max-w-4xl mx-auto rounded-2xl bg-gray-200 animate-pulse" />}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="max-w-4xl mx-auto"
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

