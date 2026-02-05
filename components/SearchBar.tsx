'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

interface SearchBarProps {
  compact?: boolean
  onSearch?: (query: string) => void
}

export default function SearchBar({ compact = false, onSearch }: SearchBarProps) {
  const router = useRouter()
  const [location, setLocation] = useState('')
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    priceRange: [0, 100],
    vehicleSize: '',
    instantBook: false,
  })

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
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
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center bg-white rounded-2xl sm:rounded-full shadow-lg border border-gray-200 overflow-hidden hover:border-car-neon/50 hover:shadow-xl transition-all gap-0 sm:gap-0">
          <div className="flex-1 px-4 sm:px-6 py-3 border-b sm:border-b-0 sm:border-r border-gray-100">
            <label className="block text-xs font-semibold text-gray-700 mb-1">Location</label>
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileFocusWithin={{ scale: 1.01 }}
        className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border-2 border-gray-200/80 overflow-hidden transition-all duration-300 focus-within:border-car-neon/50 focus-within:shadow-[0_8px_30px_rgba(0,122,255,0.12)]"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-0">
          <div className="border-b md:border-b-0 md:border-r border-gray-200 p-4 hover:bg-gray-50 transition-colors">
            <label className="block text-xs font-semibold text-gray-700 mb-2">Location</label>
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

