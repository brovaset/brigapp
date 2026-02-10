'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/components/AuthProvider'
import SearchBar from '@/components/SearchBar'
import ListingCard from '@/components/ListingCard'
import Logo from '@/components/Logo'
import { parseResponseJson } from '@/lib/utils'
import type { Listing } from '@/types'

export default function Home() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [listings, setListings] = useState<Listing[]>([])
  const [loadingListings, setLoadingListings] = useState(true)

  useEffect(() => {
    if (user) {
      router.push('/dashboard')
    }
  }, [user, router])

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

  if (user) {
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-5xl mx-auto"
          >
            <SearchBar />
          </motion.div>
        </div>
      </div>

      {/* Featured Listings */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Explore parking spaces</h2>
          <motion.button
            onClick={() => router.push('/search')}
            whileHover={{ x: 4 }}
            className="text-car-neon hover:text-car-electric font-semibold text-sm underline transition-colors"
          >
            Show all
          </motion.button>
        </div>

        {loadingListings ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square bg-gradient-to-br from-car-neon/10 to-car-electric/10 rounded-xl mb-3"></div>
                <div className="h-4 bg-car-neon/10 rounded mb-2"></div>
                <div className="h-3 bg-car-electric/10 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {listings.map((listing, index) => (
              <ListingCard key={listing.id} listing={listing} index={index} />
            ))}
          </div>
        )}

        {listings.length === 0 && !loadingListings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 px-6 bg-white/80 rounded-xl border border-gray-200/80"
          >
            <p className="text-gray-600 text-lg mb-2">No listings available at the moment</p>
            <p className="text-gray-500 text-sm">Check back soon or try a different location</p>
          </motion.div>
        )}
      </div>

      {/* Features Section */}
      <div className="bg-gray-50/80 py-20 mt-20 border-t border-gray-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-14 tracking-tight">
            Why choose BRIGAP?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -6, scale: 1.02 }}
              viewport={{ once: true }}
              className="group cursor-default text-center p-6 bg-white/95 backdrop-blur-sm rounded-xl border border-gray-200/80 border-l-4 border-l-car-neon shadow-lg hover:shadow-[0_8px_30px_rgba(0,122,255,0.15)] hover:bg-gradient-to-br hover:from-white hover:to-car-neon/5 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-lg bg-car-neon/20 mb-4 flex items-center justify-center group-hover:bg-car-neon/30 group-hover:scale-110 transition-all duration-300">
                <svg className="w-6 h-6 text-car-neon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Easy Search</h3>
              <p className="text-gray-600">
                Find available parking spots instantly with our interactive map and smart filters.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -6, scale: 1.02 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="group cursor-default text-center p-6 bg-white/95 backdrop-blur-sm rounded-xl border border-gray-200/80 border-l-4 border-l-car-electric shadow-lg hover:shadow-[0_8px_30px_rgba(52,199,89,0.15)] hover:bg-gradient-to-br hover:from-white hover:to-car-electric/5 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-lg bg-car-electric/20 mb-4 flex items-center justify-center group-hover:bg-car-electric/30 group-hover:scale-110 transition-all duration-300">
                <svg className="w-6 h-6 text-car-electric" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Secure Payments</h3>
              <p className="text-gray-600">
                Book and pay securely with our integrated payment system. Your money is protected.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -6, scale: 1.02 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="group cursor-default text-center p-6 bg-white/95 backdrop-blur-sm rounded-xl border border-gray-200/80 border-l-4 border-l-car-turbo shadow-lg hover:shadow-[0_8px_30px_rgba(88,86,214,0.15)] hover:bg-gradient-to-br hover:from-white hover:to-car-turbo/5 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-lg bg-car-turbo/20 mb-4 flex items-center justify-center group-hover:bg-car-turbo/30 group-hover:scale-110 transition-all duration-300">
                <svg className="w-6 h-6 text-car-turbo" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Trusted Platform</h3>
              <p className="text-gray-600">
                Verified users, ratings, and reviews ensure a safe and reliable experience.
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-car-neon/8 via-car-electric/12 to-car-neon/8 py-16 mt-16 border-t border-gray-200/80 relative overflow-hidden">
        <div className="absolute inset-0 headlight-beam"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Ready to get started?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of drivers and hosts already using BRIGAP
          </p>
          <div className="flex gap-4 justify-center">
            <motion.button
              onClick={() => router.push('/register?role=driver')}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-3 bg-gradient-to-r from-car-neon to-car-electric text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 active:shadow-md"
            >
              Find Parking
            </motion.button>
            <motion.button
              onClick={() => router.push('/register?role=host')}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-3 bg-white text-car-neon rounded-lg border-2 border-car-neon/50 font-semibold shadow-md hover:bg-car-neon/5 hover:border-car-neon transition-all duration-200 active:bg-car-neon/10"
            >
              List Your Space
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  )
}

