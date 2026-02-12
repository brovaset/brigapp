'use client'

import { useState, FormEvent } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { getCurrentPosition, GeoError } from '@/lib/geolocation'

const DEFAULT_RADIUS_KM = '10'

interface SearchBarProps {
  compact?: boolean
  onSearch?: (query: string) => void
}

export default function SearchBar({ compact = false, onSearch }: SearchBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const [location, setLocation] = useState('')
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    priceRange: [0, 100],
    vehicleSize: '',
    instantBook: false,
  })
  const [locationLoading, setLocationLoading] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)

  const handleUseMyLocation = async () => {
    setLocationError(null)
    setLocationLoading(true)
    try {
      const { lat, lng } = await getCurrentPosition()
      const params = new URLSearchParams(pathname === '/search' ? searchParams.toString() : '')
      params.set('lat', String(lat))
      params.set('lng', String(lng))
      if (!params.has('radius')) params.set('radius', DEFAULT_RADIUS_KM)
      params.delete('location')
      router.push(`/search?${params.toString()}`)
    } catch (err) {
      const message = err instanceof GeoError ? err.message : 'Could not get location. Try again or enter an address.'
      setLocationError(message)
    } finally {
      setLocationLoading(false)
    }
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setLocationError(null)
    const params = new URLSearchParams()
    if (location) params.set('location', location)
    if (checkIn) params.set('startDate', checkIn)
    if (checkOut) params.set('endDate', checkOut)
    if (onSearch) {
      onSearch(location)
    } else {
      router.push(`/search${params.toString() ? '?' + params.toString() : ''}`)
    }
  }

  if (compact) {
    return (
      <form onSubmit={handleSubmit} className="relative">
        {locationError && (
          <div className="flex items-center justify-between gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-2" role="alert">
            <span>{locationError}</span>
            <button
              type="button"
              onClick={() => setLocationError(null)}
              className="shrink-0 p-1 rounded hover:bg-amber-100 text-amber-600"
              aria-label="Dismiss"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        )}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center bg-white rounded-2xl sm:rounded-full shadow-lg border border-gray-200 overflow-hidden hover:border-car-neon/50 hover:shadow-xl transition-all gap-0 sm:gap-0">
          <div className="flex-1 px-4 sm:px-6 py-3 border-b sm:border-b-0 sm:border-r border-gray-100">
            <div className="flex items-center justify-between gap-2 mb-1">
              <label className="text-xs font-semibold text-gray-700">Location</label>
              <button
                type="button"
                onClick={handleUseMyLocation}
                disabled={locationLoading}
                className="text-xs font-medium text-car-neon hover:text-car-electric disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {locationLoading ? 'Getting location…' : 'Use my location'}
              </button>
            </div>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Where are you going?"
              className="w-full outline-none bg-transparent text-gray-900 placeholder-gray-400 focus:text-car-neon"
            />
          </div>
          <div className="hidden sm:block h-10 w-px bg-gray-200 flex-shrink-0" />
          <div className="px-4 sm:px-6 py-3 border-b sm:border-b-0 sm:border-r border-gray-100">
            <label className="block text-xs font-semibold text-gray-700 mb-1">Check in</label>
            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="w-full outline-none bg-transparent text-gray-900 text-sm focus:text-car-neon"
            />
          </div>
          <div className="hidden sm:block h-10 w-px bg-gray-200 flex-shrink-0" />
          <div className="px-4 sm:px-6 py-3 border-b sm:border-b-0 sm:border-r border-gray-100">
            <label className="block text-xs font-semibold text-gray-700 mb-1">Check out</label>
            <input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full outline-none bg-transparent text-gray-900 text-sm focus:text-car-neon"
            />
          </div>
          <div className="hidden sm:block h-10 w-px bg-gray-200 flex-shrink-0" />
          <div className="px-4 sm:px-6 py-3">
            <label className="block text-xs font-semibold text-gray-700 mb-1">Guests</label>
            <input
              type="text"
              className="w-full outline-none bg-transparent text-gray-900 text-sm focus:text-car-neon"
              placeholder="Add guests"
            />
          </div>
          <button
            type="submit"
            className="m-2 p-3 bg-gradient-to-r from-car-neon to-car-electric text-white rounded-xl sm:rounded-full hover:from-car-neon/90 hover:to-car-electric/90 transition-all shadow-md font-semibold text-sm hover:shadow-lg active:scale-[0.98]"
          >
            Search
          </button>
        </div>
      </form>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto">
      {locationError && (
        <div className="flex items-center justify-between gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-2" role="alert">
          <span>{locationError}</span>
          <button
            type="button"
            onClick={() => setLocationError(null)}
            className="shrink-0 p-1 rounded hover:bg-amber-100 text-amber-600"
            aria-label="Dismiss"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      )}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.01 }}
        className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border-2 border-gray-200/80 overflow-hidden transition-all duration-300 focus-within:border-car-neon/50 focus-within:shadow-[0_8px_30px_rgba(0,122,255,0.12)]"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-0">
          <div className="border-b md:border-b-0 md:border-r border-gray-200 p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between gap-2 mb-2">
              <label className="text-xs font-semibold text-gray-700">Location</label>
              <button
                type="button"
                onClick={handleUseMyLocation}
                disabled={locationLoading}
                className="text-xs font-medium text-car-neon hover:text-car-electric disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {locationLoading ? 'Getting location…' : 'Use my location'}
              </button>
            </div>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Where are you going?"
              className="w-full outline-none bg-transparent text-gray-900 placeholder-gray-400 focus:text-car-neon"
            />
          </div>
          <div className="border-b md:border-b-0 md:border-r border-gray-200 p-4 hover:bg-gray-50 transition-colors">
            <label className="block text-xs font-semibold text-gray-700 mb-2">Check in</label>
            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="w-full outline-none bg-transparent text-gray-900 text-sm focus:text-car-neon"
            />
          </div>
          <div className="border-b md:border-b-0 md:border-r border-gray-200 p-4 hover:bg-gray-50 transition-colors">
            <label className="block text-xs font-semibold text-gray-700 mb-2">Check out</label>
            <input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full outline-none bg-transparent text-gray-900 text-sm focus:text-car-neon"
            />
          </div>
          <div className="p-4 flex items-end">
            <button
              type="submit"
              className="w-full px-6 py-3 bg-gradient-to-r from-car-neon to-car-electric text-white rounded-lg transition-all font-semibold shadow-lg shadow-car-neon/20 hover:shadow-xl hover:shadow-car-neon/30 hover:scale-[1.02] active:scale-[0.98]"
            >
              Search
            </button>
          </div>
        </div>
      </motion.div>
    </form>
  )
}

