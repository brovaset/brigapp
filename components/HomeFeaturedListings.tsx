'use client'

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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Popular spaces</h2>
          <p className="text-sm text-gray-500 mt-0.5">Verified parking options near you</p>
        </div>
        <button
          onClick={() => router.push('/search')}
          className="text-sm font-medium text-car-neon hover:text-car-electric transition-colors whitespace-nowrap"
        >
          View all →
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[4/3] bg-gray-100 rounded-xl mb-3" />
              <div className="h-3.5 bg-gray-100 rounded mb-2 w-3/4" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 py-16 px-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-700 mb-1">No spaces listed yet</p>
          <p className="text-xs text-gray-400 mb-5">Be the first to list your driveway or garage.</p>
          <button
            onClick={() => router.push('/register?role=host')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white text-xs font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            List your space →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {listings.map((listing, index) => (
            <ListingCard key={listing.id} listing={listing} index={index} />
          ))}
        </div>
      )}
    </>
  )
}
