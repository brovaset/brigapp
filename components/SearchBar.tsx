'use client'

import { useState, FormEvent } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { getCurrentPosition, GeoError } from '@/lib/geolocation'

const DEFAULT_RADIUS_KM = '10'

interface SearchBarProps {
  compact?: boolean
  onSearch?: (query: string) => void
}

interface GeoCoords {
  lat: number
  lng: number
}

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
    { headers: { 'Accept-Language': 'en' } }
  )
  if (!res.ok) throw new Error('Geocode failed')
  const data = await res.json()
  const a = data.address || {}
  const parts = [
    a.suburb || a.neighbourhood || a.quarter,
    a.city || a.town || a.village || a.county,
    a.state,
  ].filter(Boolean)
  return parts.slice(0, 2).join(', ') || data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`
}

export default function SearchBar({ compact = false, onSearch }: SearchBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const [location, setLocation] = useState('')
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [geoCoords, setGeoCoords] = useState<GeoCoords | null>(null)
  const [locationLoading, setLocationLoading] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)

  const handleUseMyLocation = async () => {
    setLocationError(null)
    setLocationLoading(true)
    try {
      const { lat, lng } = await getCurrentPosition()
      let label = `${lat.toFixed(4)}, ${lng.toFixed(4)}`
      try {
        label = await reverseGeocode(lat, lng)
      } catch {
        // fallback to raw coords if geocode fails
      }
      setLocation(label)
      setGeoCoords({ lat, lng })
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
    const params = new URLSearchParams(pathname === '/search' ? searchParams.toString() : '')

    if (geoCoords) {
      params.set('lat', String(geoCoords.lat))
      params.set('lng', String(geoCoords.lng))
      if (!params.has('radius')) params.set('radius', DEFAULT_RADIUS_KM)
      params.delete('location')
    } else if (location) {
      params.set('location', location)
      params.delete('lat')
      params.delete('lng')
    }

    if (checkIn) params.set('startDate', checkIn)
    if (checkOut) params.set('endDate', checkOut)

    if (onSearch) {
      onSearch(location)
    } else {
      router.push(`/search?${params.toString()}`)
    }
  }

  const handleLocationChange = (val: string) => {
    setLocation(val)
    if (geoCoords) setGeoCoords(null)
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

  /* ── Compact (search page header) ── */
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
                className="text-[10px] font-medium text-car-neon hover:text-car-electric disabled:opacity-50 whitespace-nowrap flex items-center gap-1"
              >
                {locationLoading ? (
                  <>
                    <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Locating…
                  </>
                ) : (
                  <>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Use location
                  </>
                )}
              </button>
            </div>
            <input
              type="text"
              value={location}
              onChange={(e) => handleLocationChange(e.target.value)}
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
              className="text-[11px] font-medium text-car-neon hover:text-car-electric disabled:opacity-50 whitespace-nowrap flex items-center gap-1"
            >
              {locationLoading ? (
                <>
                  <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Detecting location…
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Use my location
                </>
              )}
            </button>
          </div>
          <input
            type="text"
            value={location}
            onChange={(e) => handleLocationChange(e.target.value)}
            placeholder="City, neighbourhood or address"
            className="w-full outline-none bg-transparent text-gray-900 placeholder-gray-400 text-sm"
          />
          {geoCoords && (
            <p className="text-[10px] text-car-neon mt-0.5">Using your precise location</p>
          )}
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
