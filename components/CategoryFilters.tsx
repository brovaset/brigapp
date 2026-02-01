'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'

interface Filter {
  id: string
  label: string
}

const filters: Filter[] = [
  { id: 'all', label: 'All' },
  { id: 'nearby', label: 'Nearby' },
  { id: 'cheap', label: 'Budget' },
  { id: 'rated', label: 'Top Rated' },
  { id: 'instant', label: 'Instant Book' },
  { id: 'large', label: 'Large Vehicles' },
]

export default function CategoryFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeFilter, setActiveFilter] = useState(searchParams.get('filter') || 'all')

  const handleFilterClick = (filterId: string) => {
    setActiveFilter(filterId)
    const params = new URLSearchParams(searchParams.toString())
    
    if (filterId === 'all') {
      params.delete('filter')
    } else {
      params.set('filter', filterId)
    }
    
    router.push(`/search?${params.toString()}`)
  }

  return (
    <div className="bg-white/95 backdrop-blur-xl border-b border-gray-200 sticky top-16 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 overflow-x-auto py-4 scrollbar-hide">
          {filters.map((filter) => (
            <motion.button
              key={filter.id}
              whileHover={{ scale: 1.08, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleFilterClick(filter.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                activeFilter === filter.id
                  ? 'bg-gradient-to-r from-car-neon to-car-electric text-white shadow-lg font-semibold'
                  : 'bg-white text-gray-700 hover:text-car-neon hover:bg-car-neon/5 border border-gray-200 hover:border-car-neon/50'
              }`}
            >
              <span>{filter.label}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
}

