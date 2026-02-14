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
  const filtersParam = searchParams.get('filters')?.split(',').filter(Boolean) ?? []
  const amenities = searchParams.get('amenities')?.split(',').filter(Boolean) ?? []
  const evChargerTypes = searchParams.get('evChargerTypes')?.split(',').filter(Boolean) ?? []
  const maxPrice = searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!, 10) : 0
  const vehicleSizes = searchParams.get('vehicleSizes')?.split(',').filter(Boolean) ?? []
  const instantBook = searchParams.get('instantBook') === 'true'

  return { filtersParam, amenities, evChargerTypes, maxPrice, vehicleSizes, instantBook }
}

export default function SearchFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [expanded, setExpanded] = useState(true)
  // Optimistic state so every filter button lights up immediately on click (before URL updates)
  const [optimisticQuickFilters, setOptimisticQuickFilters] = useState<string[] | null>(null)
  const [optimisticAmenities, setOptimisticAmenities] = useState<string[] | null>(null)
  const [optimisticEvChargerTypes, setOptimisticEvChargerTypes] = useState<string[] | null>(null)
  const [optimisticVehicleSizes, setOptimisticVehicleSizes] = useState<string[] | null>(null)
  const [optimisticInstantBook, setOptimisticInstantBook] = useState<boolean | null>(null)

  const { filtersParam, amenities, evChargerTypes, maxPrice, vehicleSizes, instantBook } = parseFilters(searchParams)

  const filtersFromUrl = searchParams.get('filters') ?? ''
  const amenitiesFromUrl = searchParams.get('amenities') ?? ''
  const evChargerTypesFromUrl = searchParams.get('evChargerTypes') ?? ''
  const vehicleSizesFromUrl = searchParams.get('vehicleSizes') ?? ''
  const instantBookFromUrl = searchParams.get('instantBook') ?? ''

  useEffect(() => {
    setOptimisticQuickFilters(null)
  }, [filtersFromUrl])
  useEffect(() => {
    setOptimisticAmenities(null)
  }, [amenitiesFromUrl])
  useEffect(() => {
    setOptimisticEvChargerTypes(null)
  }, [evChargerTypesFromUrl])
  useEffect(() => {
    setOptimisticVehicleSizes(null)
  }, [vehicleSizesFromUrl])
  useEffect(() => {
    setOptimisticInstantBook(null)
  }, [instantBookFromUrl])

  useEffect(() => {
    if (expanded) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [expanded])

  const activeQuickFilters = optimisticQuickFilters ?? filtersParam
  const activeAmenities = optimisticAmenities ?? amenities
  const activeEvChargerTypes = optimisticEvChargerTypes ?? evChargerTypes
  const activeVehicleSizes = optimisticVehicleSizes ?? vehicleSizes
  const activeInstantBook = optimisticInstantBook !== null ? optimisticInstantBook : instantBook

  const toggleQuickFilter = (id: string) => {
    let next: string[]
    if (id === 'all') {
      next = []
    } else {
      const current = activeQuickFilters.includes(id)
        ? activeQuickFilters.filter((f) => f !== id)
        : [...activeQuickFilters, id]
      next = current
    }
    setOptimisticQuickFilters(next)
    updateParams({ filters: next.length ? next.join(',') : null })
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

  const toggleEvChargerType = (id: string) => {
    const next = activeEvChargerTypes.includes(id)
      ? activeEvChargerTypes.filter((t) => t !== id)
      : [...activeEvChargerTypes, id]
    setOptimisticEvChargerTypes(next)
    updateParams({ evChargerTypes: next.length ? next.join(',') : null })
  }

  const setMaxPrice = (value: number) => {
    updateParams({ maxPrice: value > 0 ? String(value) : null })
  }

  const toggleVehicleSize = (id: string) => {
    const next = activeVehicleSizes.includes(id)
      ? activeVehicleSizes.filter((s) => s !== id)
      : [...activeVehicleSizes, id]
    setOptimisticVehicleSizes(next)
    updateParams({ vehicleSizes: next.length ? next.join(',') : null })
  }

  const toggleInstantBook = () => {
    const next = !activeInstantBook
    setOptimisticInstantBook(next)
    updateParams({ instantBook: next ? 'true' : null })
  }

  const clearAll = () => {
    setOptimisticQuickFilters(null)
    setOptimisticAmenities(null)
    setOptimisticEvChargerTypes(null)
    setOptimisticVehicleSizes(null)
    setOptimisticInstantBook(null)
    const params = new URLSearchParams(searchParams.toString())
    params.delete('filters')
    params.delete('amenities')
    params.delete('evChargerTypes')
    params.delete('maxPrice')
    params.delete('vehicleSizes')
    params.delete('instantBook')
    router.push(`/search?${params.toString()}`)
  }

  const activeCount =
    activeQuickFilters.length +
    activeAmenities.length +
    activeEvChargerTypes.length +
    (maxPrice > 0 ? 1 : 0) +
    activeVehicleSizes.length +
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
                {/* Quick filters (All, Nearby, Budget, etc.) - multi-select, blue activation */}
                <div>
                  <div className="flex flex-wrap gap-2">
                    {QUICK_FILTERS.map(({ id, label }) => (
                      <motion.button
                        key={id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => toggleQuickFilter(id)}
                        className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 transition-shadow ${
                          id === 'all'
                            ? activeQuickFilters.length === 0
                              ? 'bg-car-neon border-car-neon text-white shadow-[0_0_14px_rgba(0,122,255,0.5)]'
                              : 'bg-white border-gray-200 text-gray-700 hover:border-car-neon/50 hover:text-car-neon shadow-none'
                            : activeQuickFilters.includes(id)
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

                {/* EV Charger Type (when EV Charger selected) - same blue activation as amenity pills */}
                {activeAmenities.includes('evCharging') && (
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-xs uppercase tracking-wider text-gray-500 mb-2 font-medium flex items-center gap-1">
                      <svg className="w-4 h-4 text-car-neon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                          onClick={() => toggleEvChargerType(id)}
                          className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 transition-shadow ${
                            activeEvChargerTypes.includes(id)
                              ? 'bg-car-neon border-car-neon text-white shadow-[0_0_14px_rgba(0,122,255,0.5)]'
                              : 'bg-white border-gray-200 text-gray-700 hover:border-car-neon/50 hover:text-car-neon shadow-none'
                          }`}
                        >
                          {label}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Max price per hour - price pills for consistent blue activation style */}
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-xs uppercase tracking-wider text-gray-500 mb-2 font-medium flex items-center gap-1">
                    <svg className="w-4 h-4 text-car-neon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Max Price/Hour
                  </p>
                  <div className="flex flex-wrap gap-2 items-center">
                    {[0, 5, 10, 15, 20, 25, 30, 40, 50].map((val) => (
                      <motion.button
                        key={val}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setMaxPrice(val)}
                        className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 transition-shadow ${
                          maxPrice === val
                            ? 'bg-car-neon border-car-neon text-white shadow-[0_0_14px_rgba(0,122,255,0.5)]'
                            : 'bg-white border-gray-200 text-gray-700 hover:border-car-neon/50 hover:text-car-neon shadow-none'
                        }`}
                      >
                        {val === 0 ? 'Any' : `$${val}`}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Vehicle size - same blue activation as amenity pills, supports multiple */}
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
                        onClick={() => toggleVehicleSize(id)}
                        className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 transition-shadow capitalize ${
                          activeVehicleSizes.includes(id)
                            ? 'bg-car-neon border-car-neon text-white shadow-[0_0_14px_rgba(0,122,255,0.5)]'
                            : 'bg-white border-gray-200 text-gray-700 hover:border-car-neon/50 hover:text-car-neon shadow-none'
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
