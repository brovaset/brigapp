'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

// Quick sort/filter row (All, Nearby, Budget, etc.)
const QUICK_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'nearby', label: 'Nearby' },
  { id: 'cheap', label: 'Budget' },
  { id: 'rated', label: 'Top Rated' },
  { id: 'instant', label: 'Instant Book' },
  { id: 'large', label: 'Large Vehicles' },
]

// Amenity pill filters for driveways
const AMENITY_PILLS = [
  { id: 'covered', label: 'Covered', icon: 'M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3' },
  { id: 'evCharging', label: 'EV Charger', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
  { id: 'gated', label: 'Gated', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
  { id: 'accessible24_7', label: '24/7 Access', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
]

const EV_CHARGER_TYPES = [
  { id: 'level1', label: 'Level 1' },
  { id: 'level2', label: 'Level 2' },
  { id: 'tesla', label: 'Tesla NACS' },
]

const VEHICLE_SIZES = [
  { id: 'sedan', label: 'Sedan' },
  { id: 'suv', label: 'SUV' },
  { id: 'truck', label: 'Truck' },
  { id: 'van', label: 'Van' },
]

function parseFilters(searchParams: URLSearchParams) {
  const filter = searchParams.get('filter') || 'all'
  const amenities = searchParams.get('amenities')?.split(',').filter(Boolean) ?? []
  const evChargerType = searchParams.get('evChargerType') ?? ''
  const maxPrice = searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!, 10) : 0
  const vehicleSize = searchParams.get('vehicleSize') ?? ''
  const instantBook = searchParams.get('instantBook') === 'true'

  return { filter, amenities, evChargerType, maxPrice, vehicleSize, instantBook }
}

export default function SearchFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [expanded, setExpanded] = useState(true)
  // Optimistic state so every filter button lights up immediately on click (before URL updates)
  const [quickFilterActive, setQuickFilterActive] = useState<string | null>(null)
  const [optimisticAmenities, setOptimisticAmenities] = useState<string[] | null>(null)
  const [optimisticEvChargerType, setOptimisticEvChargerType] = useState<string | null>(null)
  const [optimisticVehicleSize, setOptimisticVehicleSize] = useState<string | null>(null)
  const [optimisticInstantBook, setOptimisticInstantBook] = useState<boolean | null>(null)

  const { filter, amenities, evChargerType, maxPrice, vehicleSize, instantBook } = parseFilters(searchParams)

  const filterFromUrl = searchParams.get('filter') || 'all'
  const amenitiesFromUrl = searchParams.get('amenities') ?? ''
  const evChargerTypeFromUrl = searchParams.get('evChargerType') ?? ''
  const vehicleSizeFromUrl = searchParams.get('vehicleSize') ?? ''
  const instantBookFromUrl = searchParams.get('instantBook') ?? ''

  useEffect(() => {
    setQuickFilterActive(null)
  }, [filterFromUrl])
  useEffect(() => {
    setOptimisticAmenities(null)
  }, [amenitiesFromUrl])
  useEffect(() => {
    setOptimisticEvChargerType(null)
  }, [evChargerTypeFromUrl])
  useEffect(() => {
    setOptimisticVehicleSize(null)
  }, [vehicleSizeFromUrl])
  useEffect(() => {
    setOptimisticInstantBook(null)
  }, [instantBookFromUrl])

  const activeQuickFilter = quickFilterActive ?? filter
  const activeAmenities = optimisticAmenities ?? amenities
  const activeEvChargerType = optimisticEvChargerType !== null ? optimisticEvChargerType : evChargerType
  const activeVehicleSize = optimisticVehicleSize !== null ? optimisticVehicleSize : vehicleSize
  const activeInstantBook = optimisticInstantBook !== null ? optimisticInstantBook : instantBook

  const setQuickFilter = (id: string) => {
    setQuickFilterActive(id)
    const params = new URLSearchParams(searchParams.toString())
    if (id === 'all') {
      params.delete('filter')
    } else {
      params.set('filter', id)
    }
    router.push(`/search?${params.toString()}`)
  }

  const updateParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())
    for (const [key, val] of Object.entries(updates)) {
      if (val === null || val === '') {
        params.delete(key)
      } else {
        params.set(key, val)
      }
    }
    router.push(`/search?${params.toString()}`)
  }

  const toggleAmenity = (id: string) => {
    const next = activeAmenities.includes(id) ? activeAmenities.filter((a) => a !== id) : [...activeAmenities, id]
    setOptimisticAmenities(next)
    updateParams({ amenities: next.length ? next.join(',') : null })
  }

  const setEvChargerType = (id: string) => {
    const next = activeEvChargerType === id ? '' : id
    setOptimisticEvChargerType(next || null)
    updateParams({ evChargerType: next || null })
  }

  const setMaxPrice = (value: number) => {
    updateParams({ maxPrice: value > 0 ? String(value) : null })
  }

  const setVehicleSize = (id: string) => {
    const next = activeVehicleSize === id ? '' : id
    setOptimisticVehicleSize(next || null)
    updateParams({ vehicleSize: next || null })
  }

  const toggleInstantBook = () => {
    const next = !activeInstantBook
    setOptimisticInstantBook(next)
    updateParams({ instantBook: next ? 'true' : null })
  }

  const clearAll = () => {
    setQuickFilterActive(null)
    setOptimisticAmenities(null)
    setOptimisticEvChargerType(null)
    setOptimisticVehicleSize(null)
    setOptimisticInstantBook(null)
    const params = new URLSearchParams(searchParams.toString())
    params.delete('filter')
    params.delete('amenities')
    params.delete('evChargerType')
    params.delete('maxPrice')
    params.delete('vehicleSize')
    params.delete('instantBook')
    router.push(`/search?${params.toString()}`)
  }

  const activeCount =
    (activeQuickFilter !== 'all' ? 1 : 0) +
    activeAmenities.length +
    (activeEvChargerType ? 1 : 0) +
    (maxPrice > 0 ? 1 : 0) +
    (activeVehicleSize ? 1 : 0) +
    (activeInstantBook ? 1 : 0)

  return (
    <div className="bg-white/95 backdrop-blur-xl border-b border-gray-200 sticky top-16 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center justify-between w-full py-4 text-left font-semibold text-gray-900 hover:text-car-neon transition-colors uppercase tracking-wide text-sm"
        >
          <span className="uppercase tracking-wider">{expanded ? 'Hide filters' : 'Show filters'}</span>
          {activeCount > 0 && (
            <span className="ml-2 flex h-6 w-6 items-center justify-center rounded-full bg-car-neon text-xs font-medium text-white">
              {activeCount}
            </span>
          )}
          <motion.span
            animate={{ rotate: expanded ? 180 : 0 }}
            className="inline-block ml-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </motion.span>
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-t border-gray-100 relative"
            >
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-car-neon to-car-electric" aria-hidden />
              <div className="pb-6 pt-4 space-y-6 pl-4">
                {/* Quick filters (All, Nearby, Budget, etc.) */}
                <div>
                  <div className="flex flex-wrap gap-2">
                    {QUICK_FILTERS.map(({ id, label }) => (
                      <motion.button
                        key={id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setQuickFilter(id)}
                        className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 transition-shadow ${
                          activeQuickFilter === id
                            ? 'bg-car-neon border-car-neon text-white shadow-[0_0_14px_rgba(0,122,255,0.5)]'
                            : 'bg-white border-gray-200 text-gray-700 hover:border-car-neon/50 hover:text-car-neon shadow-none'
                        }`}
                      >
                        {label}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Amenity pills */}
                <div className="pt-2 border-t border-gray-100">
                  <div className="flex flex-wrap gap-2">
                    {AMENITY_PILLS.map(({ id, label, icon }) => (
                      <motion.button
                        key={id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => toggleAmenity(id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 transition-shadow ${
                          activeAmenities.includes(id)
                            ? 'bg-car-neon border-car-neon text-white shadow-[0_0_14px_rgba(0,122,255,0.5)]'
                            : 'bg-white border-gray-200 text-gray-700 hover:border-car-neon/50 hover:text-car-neon shadow-none'
                        }`}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
                        </svg>
                        {label}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* EV Charger Type (when EV Charger selected) */}
                {activeAmenities.includes('evCharging') && (
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-xs uppercase tracking-wider text-gray-500 mb-2 font-medium flex items-center gap-1">
                      <svg className="w-4 h-4 text-car-electric" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      EV Charger Type
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {EV_CHARGER_TYPES.map(({ id, label }) => (
                        <motion.button
                          key={id}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setEvChargerType(id)}
                          className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 transition-shadow ${
                            activeEvChargerType === id
                              ? 'bg-car-electric border-car-electric text-white shadow-[0_0_14px_rgba(52,199,89,0.5)]'
                              : 'bg-white border-gray-200 text-gray-700 hover:border-car-electric/50 hover:text-car-electric shadow-none'
                          }`}
                        >
                          {label}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Max price per hour */}
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-xs uppercase tracking-wider text-gray-500 mb-2 font-medium flex items-center gap-1">
                    <svg className="w-4 h-4 text-car-neon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Max Price/Hour
                  </p>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold text-car-neon">{maxPrice > 0 ? `$${maxPrice}` : 'Any'}</span>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      step="5"
                      value={maxPrice || 0}
                      onChange={(e) => setMaxPrice(parseInt(e.target.value, 10))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-car-neon"
                    />
                  </div>
                </div>

                {/* Vehicle size */}
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-xs uppercase tracking-wider text-gray-500 mb-2 font-medium flex items-center gap-1">
                    <svg className="w-4 h-4 text-car-neon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1-1V6a1 1 0 00-1-1h-1m-1-1a1 1 0 00-1 1v10a1 1 0 001 1h1m-8-1a1 1 0 01-1-1V6a1 1 0 010-2h1V4a1 1 0 011-1h4a1 1 0 011 1v1h1a1 1 0 010 2v10a1 1 0 01-1 1h-1z" />
                    </svg>
                    Vehicle Size
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {VEHICLE_SIZES.map(({ id, label }) => (
                      <motion.button
                        key={id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setVehicleSize(id)}
                        className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 transition-shadow capitalize ${
                          activeVehicleSize === id
                            ? 'bg-car-electric border-car-electric text-white shadow-[0_0_14px_rgba(52,199,89,0.5)]'
                            : 'bg-white border-gray-200 text-gray-700 hover:border-car-electric/50 hover:text-car-electric shadow-none'
                        }`}
                      >
                        {label}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Instant book */}
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                  <p className="text-xs uppercase tracking-wider text-gray-500 font-medium">Instant Book</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={toggleInstantBook}
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 transition-shadow ${
                      activeInstantBook
                        ? 'bg-car-neon border-car-neon text-white shadow-[0_0_14px_rgba(0,122,255,0.5)]'
                        : 'bg-white border-gray-200 text-gray-700 hover:border-car-neon/50 hover:text-car-neon shadow-none'
                    }`}
                  >
                    {activeInstantBook ? 'On' : 'Off'}
                  </motion.button>
                </div>

                {activeCount > 0 && (
                  <button
                    onClick={clearAll}
                    className="text-sm font-medium text-gray-500 hover:text-car-neon transition-colors"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
