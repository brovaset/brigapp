'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import ListingCard from '@/components/ListingCard'
import type { Listing } from '@/types'

export default function HomeFeaturedListings({
  listings,
  loading,
}: {
  listings: Listing[]
  loading: boolean
}) {
  const router = useRouter()

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-10">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
          Explore parking spaces
        </h2>
        <motion.button
          onClick={() => router.push('/search')}
          whileHover={{ x: 4 }}
          className="text-car-neon hover:text-car-electric font-semibold text-sm underline transition-colors"
        >
          Show all
        </motion.button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-square bg-gradient-to-br from-car-neon/10 to-car-electric/10 rounded-xl mb-3" />
              <div className="h-4 bg-car-neon/10 rounded mb-2" />
              <div className="h-3 bg-car-electric/10 rounded w-2/3" />
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

      {listings.length === 0 && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 px-6 bg-white/80 rounded-xl border border-gray-200/80"
        >
          <p className="text-gray-600 text-lg mb-2">
            No listings available at the moment
          </p>
          <p className="text-gray-500 text-sm">
            Check back soon or try a different location
          </p>
        </motion.div>
      )}
    </>
  )
}
