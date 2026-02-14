'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import MapSearch, { type MapSearchListing } from '@/components/MapSearch'
import ListingCard from '@/components/ListingCard'
import SearchBar from '@/components/SearchBar'
import { formatCurrency, parseResponseJson, US_STATES } from '@/lib/utils'
import { getCurrentPosition, GeoError } from '@/lib/geolocation'
import { motion } from 'framer-motion'
import FloatingCard from '@/components/FloatingCard'
import NeonButton from '@/components/NeonButton'
import { Modal, Input, Select } from '@/components/ui'
import SearchFilters from '@/components/SearchFilters'
import type { Listing, ListingAmenities } from '@/types'

export default function SearchPageClient({
  initialListings,
}: {
  initialListings: Listing[]
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null)
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [showMapView, setShowMapView] = useState(false)
  const [bookingData, setBookingData] = useState({
    startTime: '',
    endTime: '',
    vehicleMake: '',
    vehicleModel: '',
    licensePlate: '',
    licensePlateState: '',
  })
  const [nearMeLoading, setNearMeLoading] = useState(false)
  const [nearMeError, setNearMeError] = useState<string | null>(null)

  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')
  const filter = searchParams.get('filter')
  const amenitiesParam = searchParams.get('amenities')?.split(',').filter(Boolean) ?? []
  const evChargerType = searchParams.get('evChargerType') ?? ''
  const maxPrice = searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!, 10) : 0
  const vehicleSize = searchParams.get('vehicleSize') ?? ''
  const instantBookFilter = searchParams.get('instantBook') === 'true'

  const parseAmenities = (a: string | undefined | null): ListingAmenities | null => {
    if (!a) return null
    try {
      const parsed = typeof a === 'string' ? JSON.parse(a) : a
      return parsed as ListingAmenities
    } catch {
      return null
    }
  }

  const listings = useMemo(() => {
    let filtered = [...initialListings]

    if (lat && lng) {
      const userLat = parseFloat(lat)
      const userLng = parseFloat(lng)
      const R = 6371
      filtered = filtered.map((listing: Listing) => {
        const dLat = (listing.latitude - userLat) * (Math.PI / 180)
        const dLng = (listing.longitude - userLng) * (Math.PI / 180)
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(userLat * (Math.PI / 180)) *
            Math.cos(listing.latitude * (Math.PI / 180)) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        const distance = R * c
        return { ...listing, distance }
      })
    }

    if (amenitiesParam.length > 0 || evChargerType || maxPrice > 0 || vehicleSize || instantBookFilter) {
      filtered = filtered.filter((l: Listing) => {
        const amenities = parseAmenities((l as any).amenities)
        if (amenitiesParam.length > 0) {
          for (const a of amenitiesParam) {
            const val = amenities?.[a as keyof ListingAmenities]
            if (a === 'evCharging') {
              if (!val) return false
            } else if (a === 'covered' || a === 'gated' || a === 'accessible24_7') {
              if (!val) return false
            }
          }
        }
        if (evChargerType && amenitiesParam.includes('evCharging')) {
          const listingType = amenities?.evChargerType
          if (!listingType) return false
          if (evChargerType === 'level1' && listingType !== 'level1') return false
          if (evChargerType === 'level2' && listingType !== 'level2') return false
          if (evChargerType === 'tesla' && listingType !== 'tesla') return false
        }
        if (maxPrice > 0 && l.pricePerHour > maxPrice) return false
        if (vehicleSize) {
          const accommodates: Record<string, string[]> = {
            sedan: ['Sedan', 'SUV', 'Truck', 'Van'],
            suv: ['SUV', 'Truck', 'Van'],
            truck: ['Truck', 'Van'],
            van: ['Van'],
          }
          const allowed = accommodates[vehicleSize.toLowerCase()]
          if (!allowed || !l.maxVehicleSize || !allowed.includes(l.maxVehicleSize)) return false
        }
        if (instantBookFilter && !(l as any).instantBook) return false
        return true
      })
    }

    if (filter) {
      switch (filter) {
        case 'nearby':
          filtered = filtered.sort((a: Listing, b: Listing) =>
            (a.distance ?? Infinity) - (b.distance ?? Infinity)
          )
          break
        case 'cheap':
          filtered = filtered.sort((a: Listing, b: Listing) => a.pricePerHour - b.pricePerHour)
          break
        case 'rated':
          filtered = filtered
            .filter((l: Listing) => (l.averageRating || 0) > 0)
            .sort((a: Listing, b: Listing) => (b.averageRating || 0) - (a.averageRating || 0))
          break
        case 'large':
          filtered = filtered.filter((l: Listing) =>
            l.maxVehicleSize && ['SUV', 'Truck', 'Van'].includes(l.maxVehicleSize)
          )
          break
        case 'instant':
          filtered = filtered.filter((l: Listing) => l.isActive)
          break
        default:
          break
      }
    } else if (lat && lng) {
      filtered = filtered.sort((a: Listing, b: Listing) =>
        (a.distance ?? Infinity) - (b.distance ?? Infinity)
      )
    }

    return filtered
  }, [initialListings, lat, lng, filter, amenitiesParam, evChargerType, maxPrice, vehicleSize, instantBookFilter])

  const mapListings = useMemo((): MapSearchListing[] => (
    listings.map((l) => ({
      id: l.id,
      title: l.title,
      address: l.address,
      latitude: l.latitude,
      longitude: l.longitude,
      pricePerHour: l.pricePerHour,
      pricePerDay: l.pricePerDay,
      averageRating: l.averageRating ?? 0,
      ratingCount: l.ratingCount ?? 0,
      photos: l.photos ?? [],
      distance: l.distance,
    }))
  ), [listings])

  const handleFindNearMe = async () => {
    setNearMeError(null)
    setNearMeLoading(true)
    try {
      const { lat: userLat, lng: userLng } = await getCurrentPosition()
      const params = new URLSearchParams(searchParams.toString())
      params.set('lat', String(userLat))
      params.set('lng', String(userLng))
      if (!params.has('radius')) params.set('radius', '10')
      params.delete('location')
      router.push(`/search?${params.toString()}`)
    } catch (err) {
      const message = err instanceof GeoError ? err.message : 'Could not get location. Try again or enter an address.'
      setNearMeError(message)
    } finally {
      setNearMeLoading(false)
    }
  }

  useEffect(() => {
    const hasLocation = searchParams.get('location') || (searchParams.get('lat') && searchParams.get('lng'))
    if (hasLocation) setNearMeError(null)
  }, [searchParams])

  const handleListingSelect = (listing: MapSearchListing) => {
    setSelectedListing(listing as Listing)
  }

  const handleBook = async () => {
    if (!selectedListing) return

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: selectedListing.id,
          ...bookingData,
        }),
      })

      const data = await parseResponseJson<{ booking?: { id: string }; error?: string }>(res)

      if (!res.ok) {
        alert(data?.error || 'Booking failed')
        return
      }

      router.push(`/bookings/${data.booking.id}/payment`)
    } catch (error) {
      alert('Something went wrong')
    }
  }

  const calculatePrice = () => {
    if (!selectedListing || !bookingData.startTime || !bookingData.endTime) return 0

    const start = new Date(bookingData.startTime)
    const end = new Date(bookingData.endTime)
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)

    if (hours >= 24) {
      const days = Math.ceil(hours / 24)
      return days * selectedListing.pricePerDay
    }

    return Math.ceil(hours) * selectedListing.pricePerHour
  }

  return (
    <div className="min-h-screen bg-white">
      <SearchFilters />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <SearchBar compact />
        </div>

        {!searchParams.get('lat') && !searchParams.get('lng') && (
          <div className="mb-6">
            {nearMeError && (
              <div className="flex items-center justify-between gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-2" role="alert">
                <span>{nearMeError}</span>
                <button
                  type="button"
                  onClick={() => setNearMeError(null)}
                  className="shrink-0 p-1 rounded hover:bg-amber-100 text-amber-600"
                  aria-label="Dismiss"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            )}
            <motion.button
              type="button"
              onClick={handleFindNearMe}
              disabled={nearMeLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold bg-car-neon/10 text-car-neon border-2 border-car-neon/30 hover:bg-car-neon/20 hover:border-car-neon/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {nearMeLoading ? 'Getting location…' : 'Find parking near me'}
            </motion.button>
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-gray-900"
          >
            Search Results
          </motion.h1>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <motion.button
            onClick={() => setShowMapView(false)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              !showMapView
                ? 'bg-gradient-to-r from-car-neon to-car-electric text-white shadow-md font-semibold'
                : 'bg-white text-gray-700 hover:text-car-neon hover:bg-car-neon/5 border border-gray-200 hover:border-car-neon/50'
            }`}
          >
            List View
          </motion.button>
          <motion.button
            onClick={() => setShowMapView(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              showMapView
                ? 'bg-gradient-to-r from-car-neon to-car-electric text-white shadow-md font-semibold'
                : 'bg-white text-gray-700 hover:text-car-neon hover:bg-car-neon/5 border border-gray-200 hover:border-car-neon/50'
            }`}
          >
            Map View
          </motion.button>
        </div>

        {showMapView ? (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-xl shadow-lg border-2 border-gray-200/80 overflow-hidden hover:shadow-[0_8px_30px_rgba(0,122,255,0.08)] transition-shadow duration-300">
              <MapSearch
                onListingSelect={handleListingSelect}
                initialCenter={
                  searchParams.get('lat') && searchParams.get('lng')
                    ? {
                        lat: parseFloat(searchParams.get('lat')!),
                        lng: parseFloat(searchParams.get('lng')!),
                      }
                    : undefined
                }
                listings={mapListings}
              />
            </div>

            <div className="space-y-4">
              {selectedListing && (
                <FloatingCard delay={0.3} glowColor="electric">
                  <h2 className="text-xl font-semibold mb-2 text-gray-900">{selectedListing.title}</h2>
                  <p className="text-gray-600 text-sm mb-4">{selectedListing.address}</p>

                  {selectedListing.distance !== undefined && (
                    <div className="mb-3 p-2 bg-car-neon/10 rounded-lg">
                      <p className="text-sm font-semibold text-car-neon flex items-center gap-1">
                        <span className="text-car-neon">Near</span>
                        {selectedListing.distance < 1
                          ? `${Math.round(selectedListing.distance * 1000)}m away`
                          : `${selectedListing.distance.toFixed(1)}km away`}
                      </p>
                    </div>
                  )}

                  {selectedListing.averageRating && selectedListing.averageRating > 0 && (
                    <div className="mb-4">
                      <svg className="w-5 h-5 fill-yellow-400 inline" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" /></svg>
                      <span className="ml-1 text-gray-900 font-semibold">{selectedListing.averageRating.toFixed(1)}</span>
                      <span className="text-gray-500 text-sm ml-1">
                        ({selectedListing.ratingCount || 0} reviews)
                      </span>
                    </div>
                  )}

                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Price</p>
                    <p className="text-2xl font-bold text-car-neon">
                      {formatCurrency(selectedListing.pricePerHour)}/hour
                    </p>
                    <p className="text-sm text-gray-700">
                      {formatCurrency(selectedListing.pricePerDay)}/day
                    </p>
                  </div>

                  {selectedListing.maxVehicleSize && (
                    <p className="text-sm text-gray-600 mb-2">
                      Max size: <span className="text-car-electric font-semibold">{selectedListing.maxVehicleSize}</span>
                    </p>
                  )}

                  <NeonButton
                    variant="primary"
                    onClick={() => setShowBookingForm(true)}
                    className="w-full"
                  >
                    Book This Spot
                  </NeonButton>
                </FloatingCard>
              )}

              {!selectedListing && (
                <FloatingCard delay={0.3} glowColor="neutral">
                  <p className="text-gray-600 text-center">Select a parking spot on the map to view details</p>
                </FloatingCard>
              )}
            </div>
          </div>
        ) : (
          <div>
            {listings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {listings.map((listing, index) => (
                  <ListingCard key={listing.id} listing={listing} index={index} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-xl shadow-md border-2 border-gray-200/80 border-l-4 border-l-car-neon">
                <p className="text-gray-500 text-lg">No listings found. Try adjusting your search.</p>
              </div>
            )}
          </div>
        )}

        <Modal
          isOpen={showBookingForm && selectedListing !== null}
          onClose={() => setShowBookingForm(false)}
          title={selectedListing?.title || 'Book Parking'}
          size="md"
          footer={
            <>
              <NeonButton variant="outline" onClick={() => setShowBookingForm(false)}>
                Cancel
              </NeonButton>
              <NeonButton variant="primary" onClick={handleBook}>
                Continue to Payment
              </NeonButton>
            </>
          }
        >
          {selectedListing && (
            <div className="space-y-4">
              <Input
                label="Start Time"
                type="datetime-local"
                required
                value={bookingData.startTime}
                onChange={(e) => setBookingData({ ...bookingData, startTime: e.target.value })}
              />

              <Input
                label="End Time"
                type="datetime-local"
                required
                value={bookingData.endTime}
                onChange={(e) => setBookingData({ ...bookingData, endTime: e.target.value })}
              />

              <Input
                label="Vehicle Make"
                type="text"
                required
                value={bookingData.vehicleMake}
                onChange={(e) => setBookingData({ ...bookingData, vehicleMake: e.target.value })}
                placeholder="e.g., Toyota"
              />

              <Input
                label="Vehicle Model"
                type="text"
                required
                value={bookingData.vehicleModel}
                onChange={(e) => setBookingData({ ...bookingData, vehicleModel: e.target.value })}
                placeholder="e.g., Camry"
              />

              <Input
                label="License Plate"
                type="text"
                required
                value={bookingData.licensePlate}
                onChange={(e) => setBookingData({ ...bookingData, licensePlate: e.target.value })}
                placeholder="e.g., ABC-1234"
              />

              <Select
                label="License plate state"
                options={US_STATES}
                value={bookingData.licensePlateState}
                onChange={(e) => setBookingData({ ...bookingData, licensePlateState: e.target.value })}
              />

              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between mb-4">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-car-electric">
                    {formatCurrency(calculatePrice())}
                  </span>
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  )
}
