'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

const QUICK_FILTERS = [
  { id: 'all',     label: 'All' },
  { id: 'nearby',  label: 'Nearby' },
  { id: 'cheap',   label: 'Budget' },
  { id: 'rated',   label: 'Top rated' },
  { id: 'instant', label: 'Instant book' },
  { id: 'large',   label: 'Large vehicles' },
]

const AMENITIES = [
  { id: 'covered',       label: 'Covered',    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { id: 'evCharging',    label: 'EV charger', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
  { id: 'gated',         label: 'Gated',      icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
  { id: 'accessible24_7',label: '24/7 access','icon': 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
]

const EV_TYPES = [
  { id: 'level1', label: 'Level 1' },
  { id: 'level2', label: 'Level 2' },
  { id: 'tesla',  label: 'Tesla NACS' },
]

const VEHICLE_SIZES = [
  { id: 'sedan', label: 'Sedan' },
  { id: 'suv',   label: 'SUV' },
  { id: 'truck', label: 'Truck' },
  { id: 'van',   label: 'Van' },
]

const PRICE_OPTIONS = [
  { val: 0,  label: 'Any' },
  { val: 10, label: 'Under $10' },
  { val: 20, label: 'Under $20' },
  { val: 30, label: 'Under $30' },
  { val: 50, label: 'Under $50' },
]

function parseFilters(sp: URLSearchParams) {
  return {
    filtersParam:    sp.get('filters')?.split(',').filter(Boolean) ?? [],
    amenities:       sp.get('amenities')?.split(',').filter(Boolean) ?? [],
    evChargerTypes:  sp.get('evChargerTypes')?.split(',').filter(Boolean) ?? [],
    maxPrice:        sp.get('maxPrice') ? parseInt(sp.get('maxPrice')!, 10) : 0,
    vehicleSizes:    sp.get('vehicleSizes')?.split(',').filter(Boolean) ?? [],
    instantBook:     sp.get('instantBook') === 'true',
  }
}

/* ── small pill helper ── */
function Pill({
  active,
  onClick,
  children,
  icon,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
  icon?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border whitespace-nowrap transition-all duration-150 ${
        active
          ? 'bg-gray-900 border-gray-900 text-white'
          : 'bg-white border-gray-200 text-gray-700 hover:border-gray-400'
      }`}
    >
      {icon && (
        <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
        </svg>
      )}
      {children}
    </button>
  )
}

/* ── toggle switch ── */
function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onChange}
      className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors duration-200 focus:outline-none ${
        on ? 'bg-car-neon' : 'bg-gray-200'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform duration-200 mt-0.5 ${
          on ? 'translate-x-4' : 'translate-x-0.5'
        }`}
      />
    </button>
  )
}

export default function SearchFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  const {
    filtersParam, amenities, evChargerTypes,
    maxPrice, vehicleSizes, instantBook,
  } = parseFilters(searchParams)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const updateParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())
    for (const [k, v] of Object.entries(updates)) {
      if (v === null || v === '') params.delete(k)
      else params.set(k, v)
    }
    router.push(`/search?${params.toString()}`)
  }

  const toggleQuickFilter = (id: string) => {
    if (id === 'all') { updateParams({ filters: null }); return }
    const next = filtersParam.includes(id)
      ? filtersParam.filter((f) => f !== id)
      : [...filtersParam, id]
    updateParams({ filters: next.length ? next.join(',') : null })
  }

  const toggleAmenity = (id: string) => {
    const next = amenities.includes(id) ? amenities.filter((a) => a !== id) : [...amenities, id]
    updateParams({ amenities: next.length ? next.join(',') : null })
  }

  const toggleEvType = (id: string) => {
    const next = evChargerTypes.includes(id) ? evChargerTypes.filter((t) => t !== id) : [...evChargerTypes, id]
    updateParams({ evChargerTypes: next.length ? next.join(',') : null })
  }

  const toggleVehicleSize = (id: string) => {
    const next = vehicleSizes.includes(id) ? vehicleSizes.filter((s) => s !== id) : [...vehicleSizes, id]
    updateParams({ vehicleSizes: next.length ? next.join(',') : null })
  }

  const clearAll = () => {
    const params = new URLSearchParams(searchParams.toString())
    for (const k of ['filters', 'amenities', 'evChargerTypes', 'maxPrice', 'vehicleSizes', 'instantBook']) {
      params.delete(k)
    }
    router.push(`/search?${params.toString()}`)
    setOpen(false)
  }

  const detailCount =
    amenities.length +
    evChargerTypes.length +
    (maxPrice > 0 ? 1 : 0) +
    vehicleSizes.length +
    (instantBook ? 1 : 0)

  const totalCount = filtersParam.length + detailCount

  return (
    <div className="bg-white border-b border-gray-200 sticky top-16 z-40" ref={panelRef}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Sticky bar ── */}
        <div className="flex items-center gap-3 py-3">
          {/* Quick filters — horizontal scroll */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide flex-1 min-w-0">
            {QUICK_FILTERS.map(({ id, label }) => {
              const active = id === 'all' ? filtersParam.length === 0 : filtersParam.includes(id)
              return (
                <Pill key={id} active={active} onClick={() => toggleQuickFilter(id)}>
                  {label}
                </Pill>
              )
            })}
          </div>

          {/* Divider */}
          <div className="h-5 w-px bg-gray-200 shrink-0" />

          {/* Detail-filters button */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border shrink-0 transition-all duration-150 ${
              open || detailCount > 0
                ? 'bg-gray-900 border-gray-900 text-white'
                : 'bg-white border-gray-200 text-gray-700 hover:border-gray-400'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
            </svg>
            Filters
            {detailCount > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white text-gray-900 text-[10px] font-semibold">
                {detailCount}
              </span>
            )}
            <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.15 }}>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </motion.span>
          </button>
        </div>
      </div>

      {/* ── Dropdown panel ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="overflow-hidden border-t border-gray-100"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-5">

                {/* Amenities */}
                <div className="sm:col-span-2">
                  <p className="text-xs font-semibold text-gray-500 mb-2.5">Amenities</p>
                  <div className="flex flex-wrap gap-2">
                    {AMENITIES.map(({ id, label, icon }) => (
                      <Pill key={id} active={amenities.includes(id)} onClick={() => toggleAmenity(id)} icon={icon}>
                        {label}
                      </Pill>
                    ))}
                  </div>

                  {/* EV type sub-filter */}
                  <AnimatePresence>
                    {amenities.includes('evCharging') && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="mt-3 pl-3 border-l-2 border-car-neon/30"
                      >
                        <p className="text-xs text-gray-400 mb-1.5">Charger type</p>
                        <div className="flex flex-wrap gap-2">
                          {EV_TYPES.map(({ id, label }) => (
                            <Pill key={id} active={evChargerTypes.includes(id)} onClick={() => toggleEvType(id)}>
                              {label}
                            </Pill>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Max price */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-2.5">Max price / hr</p>
                  <div className="flex flex-wrap gap-2">
                    {PRICE_OPTIONS.map(({ val, label }) => (
                      <Pill
                        key={val}
                        active={maxPrice === val}
                        onClick={() => updateParams({ maxPrice: val > 0 ? String(val) : null })}
                      >
                        {label}
                      </Pill>
                    ))}
                  </div>
                </div>

                {/* Vehicle size + Instant book */}
                <div className="flex flex-col gap-5">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-2.5">Vehicle size</p>
                    <div className="flex flex-wrap gap-2">
                      {VEHICLE_SIZES.map(({ id, label }) => (
                        <Pill key={id} active={vehicleSizes.includes(id)} onClick={() => toggleVehicleSize(id)}>
                          {label}
                        </Pill>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-gray-500">Instant book only</p>
                    <Toggle
                      on={instantBook}
                      onChange={() => updateParams({ instantBook: !instantBook ? 'true' : null })}
                    />
                  </div>
                </div>
              </div>

              {/* Footer */}
              {detailCount > 0 && (
                <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-500">{detailCount} filter{detailCount !== 1 ? 's' : ''} active</span>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={clearAll}
                      className="text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors"
                    >
                      Clear all
                    </button>
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="text-xs font-medium px-3 py-1.5 bg-gray-900 text-white rounded-full hover:bg-gray-700 transition-colors"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
              {detailCount === 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
