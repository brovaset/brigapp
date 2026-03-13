'use client'

import { useState, FormEvent } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
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
      setLocationError(
        err instanceof GeoError ? err.message : 'Could not get location. Enter an address instead.'
      )
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

  const errorBanner = locationError && (
    <div className="flex items-center justify-between gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-2">
      <span>{locationError}</span>
      <button
        type="button"
        onClick={() => setLocationError(null)}
        className="shrink-0 p-1 rounded hover:bg-amber-100 text-amber-600"
        aria-label="Dismiss"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )

  /* ── Compact (used inside search page header) ── */
  if (compact) {
    return (
      <form onSubmit={handleSubmit} className="relative">
        {errorBanner}
        <div className="flex items-center bg-white rounded-full shadow border border-gray-200 overflow-hidden hover:border-car-neon/40 transition-colors">
          <div className="flex-1 px-4 py-2.5 border-r border-gray-100 min-w-0">
            <div className="flex items-center justify-between gap-1 mb-0.5">
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Where</label>
              <button
                type="button"
                onClick={handleUseMyLocation}
                disabled={locationLoading}
                className="text-[10px] font-medium text-car-neon hover:text-car-electric disabled:opacity-50 whitespace-nowrap"
              >
                {locationLoading ? 'Locating…' : 'Use location'}
              </button>
            </div>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, address…"
              className="w-full text-sm outline-none bg-transparent text-gray-900 placeholder-gray-400"
            />
          </div>

          <div className="px-4 py-2.5 border-r border-gray-100 hidden sm:block">
            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-0.5">Check in</label>
            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="text-sm outline-none bg-transparent text-gray-900 w-32"
            />
          </div>

          <div className="px-4 py-2.5 border-r border-gray-100 hidden sm:block">
            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-0.5">Check out</label>
            <input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="text-sm outline-none bg-transparent text-gray-900 w-32"
            />
          </div>

          <button
            type="submit"
            className="m-1.5 px-5 py-2 bg-car-neon text-white text-sm font-semibold rounded-full hover:bg-car-electric transition-colors"
          >
            Search
          </button>
        </div>
      </form>
    )
  }

  /* ── Full (home page) ── */
  return (
    <form onSubmit={handleSubmit} className="w-full">
      {errorBanner}
      <div className="flex flex-col sm:flex-row items-stretch bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden focus-within:border-car-neon/50 focus-within:shadow-xl transition-all duration-200">
        {/* Location */}
        <div className="flex-1 px-5 py-4 border-b sm:border-b-0 sm:border-r border-gray-100">
          <div className="flex items-center justify-between mb-1">
            <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Where</label>
            <button
              type="button"
              onClick={handleUseMyLocation}
              disabled={locationLoading}
              className="text-[11px] font-medium text-car-neon hover:text-car-electric disabled:opacity-50 whitespace-nowrap"
            >
              {locationLoading ? 'Locating…' : 'Use my location'}
            </button>
          </div>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="City, neighbourhood or address"
            className="w-full outline-none bg-transparent text-gray-900 placeholder-gray-400 text-sm"
          />
        </div>

        {/* Check in */}
        <div className="px-5 py-4 border-b sm:border-b-0 sm:border-r border-gray-100">
          <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Check in</label>
          <input
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="outline-none bg-transparent text-gray-900 text-sm w-36"
          />
        </div>

        {/* Check out */}
        <div className="px-5 py-4 border-b sm:border-b-0 sm:border-r border-gray-100">
          <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Check out</label>
          <input
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="outline-none bg-transparent text-gray-900 text-sm w-36"
          />
        </div>

        {/* CTA */}
        <div className="px-4 py-3 flex items-center">
          <button
            type="submit"
            className="w-full sm:w-auto px-8 py-3 bg-car-neon text-white font-semibold rounded-xl hover:bg-car-electric transition-colors text-sm shadow-md hover:shadow-lg active:scale-[0.98]"
          >
            Search
          </button>
        </div>
      </div>
    </form>
  )
}
