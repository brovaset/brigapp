'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { formatCurrency, parseResponseJson } from '@/lib/utils'
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
        .then(async (r) => {
          try {
            const d = await parseResponseJson<{ saved?: boolean }>(r)
            setIsFavorite(!!d?.saved)
          } catch {}
        })
        .catch(() => {})
    } else {
      const saved = localStorage.getItem('savedListings')
      if (saved) {
        try {
          queueMicrotask(() => setIsFavorite(JSON.parse(saved).includes(listing.id)))
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
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.04, duration: 0.3 }}
        whileHover={{ y: -3 }}
        className="group cursor-pointer"
      >
        {/* Image */}
        <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden mb-3 bg-gray-100">
          {imageUrl && !imageError ? (
            <Image
              src={imageUrl}
              alt={listing.title}
              fill
              className="object-cover group-hover:scale-[1.03] transition-transform duration-400 ease-out"
              onError={() => setImageError(true)}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
          )}

          {/* Favorite */}
          <button
            onClick={handleFavoriteClick}
            className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-white/90 hover:bg-white transition-colors shadow-sm focus:outline-none"
            aria-label={isFavorite ? 'Remove from saved' : 'Save'}
          >
            <svg
              className={`w-4 h-4 transition-colors ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-gray-400 hover:text-gray-600'}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>

          {/* Inactive badge */}
          {!listing.isActive && (
            <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-white/90 text-gray-600 text-xs font-medium">
              Unavailable
            </div>
          )}

          {/* Instant book badge */}
          {listing.instantBook && (
            <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-full bg-car-neon/90 text-white text-xs font-medium">
              Instant book
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-0.5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-medium text-gray-900 truncate text-sm leading-snug">
              {listing.title}
            </h3>
            {listing.averageRating && listing.averageRating > 0 ? (
              <div className="flex items-center gap-0.5 shrink-0 text-sm">
                <svg className="w-3.5 h-3.5 fill-amber-400" viewBox="0 0 20 20">
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                </svg>
                <span className="font-medium text-gray-700 text-xs">{listing.averageRating.toFixed(1)}</span>
              </div>
            ) : null}
          </div>

          <p className="text-xs text-gray-500 truncate">
            {listing.city}, {listing.state}
            {listing.distance !== undefined && (
              <span className="ml-1 text-car-neon font-medium">
                · {listing.distance < 1
                  ? `${Math.round(listing.distance * 1000)} m`
                  : `${listing.distance.toFixed(1)} km`}
              </span>
            )}
          </p>

          <div className="flex items-baseline gap-1 pt-0.5">
            <span className="font-semibold text-gray-900 text-sm">{formatCurrency(listing.pricePerHour)}</span>
            <span className="text-xs text-gray-500">/ hr</span>
            {listing.pricePerDay > 0 && (
              <span className="text-xs text-gray-400 ml-1">· {formatCurrency(listing.pricePerDay)} / day</span>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  )
}
