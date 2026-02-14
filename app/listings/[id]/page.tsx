'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { formatCurrency, calculateBookingPrice, parseResponseJson, US_STATES } from '@/lib/utils'
import NeonButton from '@/components/NeonButton'
import { Input, Select, ErrorMessage } from '@/components/ui'
import { motion } from 'framer-motion'
import type { Listing } from '@/types'

function parsePhotos(photos: string | string[] | undefined): string[] {
  if (!photos) return []
  if (Array.isArray(photos)) return photos
  try {
    const parsed = JSON.parse(photos)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export default function ListingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [listing, setListing] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [bookingData, setBookingData] = useState({
    startTime: '',
    endTime: '',
    vehicleMake: '',
    vehicleModel: '',
    licensePlate: '',
    licensePlateState: '',
  })
  const [booking, setBooking] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchListing()
  }, [params.id])

  const fetchListing = async () => {
    try {
      const res = await fetch(`/api/listings/${params.id}`)
      const data = await parseResponseJson<Listing>(res)

      if (!res.ok) {
        setListing(null)
        return
      }

      setListing({
        ...data,
        photos: parsePhotos(data.photos),
      })
    } catch (err) {
      console.error('Error fetching listing:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      router.push(`/login?redirect=/listings/${params.id}`)
      return
    }

    setError('')
    setBooking(true)

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: listing.id,
          ...bookingData,
        }),
      })

      const data = await parseResponseJson<{ booking?: { id: string }; error?: string }>(res)

      if (!res.ok) {
        setError(data?.error || 'Booking failed')
        return
      }

      router.push(`/bookings/${data.booking.id}/payment`)
    } catch {
      setError('Something went wrong')
    } finally {
      setBooking(false)
    }
  }

  const totalPrice = listing && bookingData.startTime && bookingData.endTime
    ? calculateBookingPrice(
        new Date(bookingData.startTime),
        new Date(bookingData.endTime),
        listing.pricePerHour,
        listing.pricePerDay
      )
    : 0

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-car-neon border-t-transparent" />
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Listing not found</h1>
          <Link href="/search" className="text-car-neon hover:underline">
            Browse listings
          </Link>
        </div>
      </div>
    )
  }

  const photos = parsePhotos(listing.photos)
  const mainPhoto = photos[0] || null

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back */}
        <Link
          href="/search"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          ← Back to search
        </Link>

        {/* Photo gallery */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 rounded-2xl overflow-hidden bg-gray-200 aspect-[21/9] max-h-[400px]"
        >
          {mainPhoto ? (
            <img
              src={mainPhoto}
              alt={listing.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg className="w-24 h-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
            </div>
          )}
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-lg border-2 border-gray-200/80 border-l-4 border-l-car-neon p-6 hover:shadow-[0_8px_30px_rgba(0,122,255,0.12)] hover:bg-gradient-to-br hover:from-white hover:to-car-neon/5 transition-all duration-300"
            >
              <div className="flex justify-between items-start mb-4">
                <h1 className="text-2xl font-bold text-gray-900">{listing.title}</h1>
                {listing.instantBook && (
                  <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-semibold">
                    Instant book
                  </span>
                )}
                {listing.averageRating > 0 && (
                  <div className="flex items-center gap-1">
                    <svg className="w-5 h-5 fill-yellow-400" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                    <span className="font-semibold">{listing.averageRating?.toFixed(1)}</span>
                    <span className="text-gray-500 text-sm">
                      ({listing.ratingCount} {listing.ratingCount === 1 ? 'review' : 'reviews'})
                    </span>
                  </div>
                )}
              </div>
              <p className="text-gray-600 mb-4">{listing.address}</p>
              <p className="text-gray-700 leading-relaxed mb-4">{listing.description}</p>

              {(() => {
                const amenities = typeof listing.amenities === 'string'
                  ? (() => { try { return JSON.parse(listing.amenities) } catch { return {} } })()
                  : listing.amenities || {}
                const amenityList = [
                  amenities.covered && { label: 'Covered' },
                  amenities.evCharging && { label: 'EV charging' },
                  amenities.gated && { label: 'Gated' },
                  amenities.accessible24_7 && { label: '24/7 access' },
                ].filter(Boolean)
                if (amenityList.length > 0) {
                  return (
                    <div className="flex flex-wrap gap-3 mb-4">
                      {amenityList.map((a: any) => (
                        <span key={a.label} className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-lg text-sm">
                          <span>{a.label}</span>
                        </span>
                      ))}
                    </div>
                  )
                }
                return null
              })()}

              {listing.cancellationPolicy && listing.cancellationPolicy !== 'FLEXIBLE' && (
                <p className="text-sm text-gray-500">
                  Cancellation: {listing.cancellationPolicy === 'MODERATE' ? 'Free cancellation up to 24h before' : 'Strict - see policy'}
                </p>
              )}
            </motion.div>

            {/* Host */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-lg border-2 border-gray-200/80 border-l-4 border-l-car-electric p-6 hover:shadow-[0_8px_30px_rgba(52,199,89,0.12)] hover:bg-gradient-to-br hover:from-white hover:to-car-electric/5 transition-all duration-300"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Hosted by</h2>
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-car-neon/20 flex items-center justify-center text-xl font-semibold text-car-neon">
                    {listing.host?.firstName?.[0]}{listing.host?.lastName?.[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {listing.host?.firstName} {listing.host?.lastName}
                    </p>
                    <p className="text-sm text-gray-500">Driveway host</p>
                  </div>
                </div>
                {user && listing.hostId && user.userId !== listing.hostId && (
                  <Link href={`/listings/${listing.id}/message`} className="inline-block">
                    <NeonButton variant="outline" className="shrink-0" type="button">
                      Message host
                    </NeonButton>
                  </Link>
                )}
              </div>
            </motion.div>

            {/* Reviews */}
            {listing.ratings?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl shadow-lg border-2 border-gray-200/80 border-l-4 border-l-car-turbo p-6 hover:shadow-[0_8px_30px_rgba(88,86,214,0.12)] transition-all duration-300"
              >
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Reviews ({listing.ratings.length})
                </h2>
                <div className="space-y-4">
                  {listing.ratings.slice(0, 5).map((r: any) => (
                    <div key={r.id} className="border-b border-gray-100 pb-4 last:border-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium">
                          {r.driver?.firstName} {r.driver?.lastName}
                        </span>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg
                              key={star}
                              className={`w-4 h-4 ${star <= r.rating ? 'fill-yellow-400' : 'fill-gray-200'}`}
                              viewBox="0 0 20 20"
                            >
                              <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                      {r.comment && <p className="text-gray-600 text-sm">{r.comment}</p>}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Booking sidebar */}
          <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-white rounded-xl shadow-lg border-2 border-gray-200/80 border-t-4 border-t-car-neon p-6 sticky top-24 hover:shadow-[0_8px_30px_rgba(0,122,255,0.15)] transition-all duration-300"
              >
              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-gray-900">
                    {formatCurrency(listing.pricePerHour)}
                  </span>
                  <span className="text-gray-600">/ hour</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {formatCurrency(listing.pricePerDay)} per day
                </p>
                {listing.maxVehicleSize && (
                  <p className="text-sm text-gray-600 mt-2">
                    Max vehicle: {listing.maxVehicleSize}
                  </p>
                )}
              </div>

              <form onSubmit={handleBook} className="space-y-4">
                {error && <ErrorMessage message={error} className="mb-4" />}

                <Input
                  type="datetime-local"
                  label="Start time"
                  required
                  value={bookingData.startTime}
                  onChange={(e) => setBookingData({ ...bookingData, startTime: e.target.value })}
                />
                <Input
                  type="datetime-local"
                  label="End time"
                  required
                  value={bookingData.endTime}
                  onChange={(e) => setBookingData({ ...bookingData, endTime: e.target.value })}
                />
                <Input
                  label="Vehicle make"
                  required
                  placeholder="e.g. Toyota"
                  value={bookingData.vehicleMake}
                  onChange={(e) => setBookingData({ ...bookingData, vehicleMake: e.target.value })}
                />
                <Input
                  label="Vehicle model"
                  required
                  placeholder="e.g. Camry"
                  value={bookingData.vehicleModel}
                  onChange={(e) => setBookingData({ ...bookingData, vehicleModel: e.target.value })}
                />
                <Input
                  label="License plate"
                  required
                  placeholder="e.g. ABC1234"
                  value={bookingData.licensePlate}
                  onChange={(e) => setBookingData({ ...bookingData, licensePlate: e.target.value })}
                />
                <Select
                  label="License plate state"
                  options={US_STATES}
                  value={bookingData.licensePlateState}
                  onChange={(e) => setBookingData({ ...bookingData, licensePlateState: e.target.value })}
                />

                {totalPrice > 0 && (
                  <div className="py-4 border-t border-gray-200">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total</span>
                      <span className="font-semibold">{formatCurrency(totalPrice)}</span>
                    </div>
                  </div>
                )}

                <NeonButton
                  type="submit"
                  variant="primary"
                  disabled={booking}
                  className="w-full"
                >
                  {user
                    ? booking
                      ? 'Booking...'
                      : 'Reserve & Pay'
                    : 'Sign in to book'}
                </NeonButton>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
