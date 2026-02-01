'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { formatCurrency } from '@/lib/utils'
import { useAuth } from '@/components/AuthProvider'
import type { Listing } from '@/types'

function parsePhotos(photos: string | string[] | undefined): string[] {
  if (!photos) return []
  if (Array.isArray(photos)) return photos
  try {
    const p = JSON.parse(photos)
    return Array.isArray(p) ? p : []
  } catch {
    return []
  }
}

interface ListingCardProps {
  listing: Listing
  index?: number
}

export default function ListingCard({ listing, index = 0 }: ListingCardProps) {
  const { user } = useAuth()
  const [imageError, setImageError] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)

  const photos = parsePhotos(listing.photos)
  const imageUrl = photos.length > 0 ? photos[0] : null

  useEffect(() => {
    if (user) {
      fetch(`/api/saved?listingId=${listing.id}`)
        .then((r) => r.json())
        .then((d) => setIsFavorite(d.saved))
        .catch(() => {})
    } else {
      const saved = localStorage.getItem('savedListings')
      if (saved) {
        try {
          setIsFavorite(JSON.parse(saved).includes(listing.id))
        } catch {}
      }
    }
  }, [listing.id, user])

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const newState = !isFavorite
    setIsFavorite(newState)

    if (user) {
      try {
        if (newState) {
          await fetch('/api/saved', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ listingId: listing.id }),
          })
        } else {
          await fetch(`/api/saved?listingId=${listing.id}`, { method: 'DELETE' })
        }
      } catch {
        setIsFavorite(!newState)
      }
    } else {
      const saved = localStorage.getItem('savedListings')
      let ids: string[] = saved ? JSON.parse(saved) : []
      if (newState) ids = [...new Set([...ids, listing.id])]
      else ids = ids.filter((id) => id !== listing.id)
      localStorage.setItem('savedListings', JSON.stringify(ids))
    }
  }

  return (
    <Link href={`/listings/${listing.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        whileHover={{ y: -4 }}
        className="group cursor-pointer"
      >
        <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-3 border-2 border-gray-200/80 border-l-4 border-l-car-neon transition-all duration-300 bg-white shadow-md group-hover:shadow-xl group-hover:shadow-[0_8px_25px_rgba(0,122,255,0.12)] group-hover:border-car-neon/40 group-hover:border-l-car-electric">
          {imageUrl && !imageError ? (
            <img
              src={imageUrl}
              alt={listing.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-car-neon/10 via-car-electric/5 to-car-neon/10 flex items-center justify-center">
              <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
            </div>
          )}
          
          {/* Favorite Button */}
          <motion.button
            onClick={handleFavoriteClick}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            className="absolute top-3 right-3 p-2 rounded-full bg-white/95 backdrop-blur-sm hover:bg-white transition-all shadow-md border border-gray-200 hover:border-car-speed/50 focus:outline-none focus:ring-2 focus:ring-car-neon/50"
          >
            <svg
              className={`w-5 h-5 transition-all ${
                isFavorite 
                  ? 'fill-car-speed text-car-speed' 
                  : 'text-gray-400 hover:text-car-neon'
              }`}
              fill="none"
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
          </motion.button>

          {/* Active Badge */}
          {!listing.isActive && (
            <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/95 backdrop-blur-sm text-car-speed text-xs font-semibold border border-car-speed/30 shadow-md">
              Inactive
            </div>
          )}
        </div>

        <div className="space-y-1">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate group-hover:text-car-neon transition-colors">
                {listing.title}
              </h3>
              <p className="text-sm text-gray-600 truncate">{listing.address}</p>
            </div>
            {listing.averageRating && listing.averageRating > 0 && (
              <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                <svg className="w-4 h-4 fill-yellow-400" viewBox="0 0 20 20">
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                </svg>
                <span className="text-sm font-medium text-gray-900">
                  {listing.averageRating.toFixed(1)}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">{listing.city}, {listing.state}</span>
            {listing.distance !== undefined && (
              <span className="text-car-neon font-semibold">
                {listing.distance < 1 
                  ? `${Math.round(listing.distance * 1000)}m`
                  : `${listing.distance.toFixed(1)}km`}
              </span>
            )}
          </div>

          <div className="flex items-baseline gap-1 pt-1">
            <span className="text-lg font-semibold text-car-electric">
              {formatCurrency(listing.pricePerHour)}
            </span>
            <span className="text-sm text-gray-600">/ hour</span>
            {listing.pricePerDay > 0 && (
              <>
                <span className="mx-1 text-gray-400">·</span>
                <span className="text-sm text-gray-700">
                  {formatCurrency(listing.pricePerDay)}/ day
                </span>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  )
}

