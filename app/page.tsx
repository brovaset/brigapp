'use client'

import { Suspense, useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/components/AuthProvider'
import SearchBar from '@/components/SearchBar'
import { parseResponseJson } from '@/lib/utils'
import type { Listing } from '@/types'

const HomeFeaturedListings = dynamic(
  () => import('@/components/HomeFeaturedListings'),
  { ssr: true, loading: () => <div className="h-64 animate-pulse bg-gray-100 rounded-xl" /> }
)

const HomeFeaturesSection = dynamic(
  () => import('@/components/HomeFeaturesSection'),
  { ssr: true, loading: () => <div className="h-80 bg-gray-50" /> }
)

const STATS = [
  { value: '5,000+', label: 'Parking spaces' },
  { value: '4.8★', label: 'Average rating' },
  { value: 'Instant', label: 'Booking' },
]

export default function Home() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [listings, setListings] = useState<Listing[]>([])
  const [loadingListings, setLoadingListings] = useState(true)

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  useEffect(() => {
    fetch('/api/listings?limit=12')
      .then((r) => parseResponseJson<{ listings?: Listing[] }>(r))
      .then((d) => { if (d?.listings) setListings(d.listings.slice(0, 12)) })
      .catch(() => {})
      .finally(() => setLoadingListings(false))
  }, [])

  if (!loading && user) return null

  return (
    <div className="min-h-screen bg-white">
      {/* ── Hero ── */}
      <section className="relative bg-gradient-to-b from-slate-50 to-white overflow-hidden pt-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight leading-[1.1] mb-5">
              Park smarter,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-car-neon to-car-electric">
                stress less
              </span>
            </h1>

            <p className="text-lg text-gray-500 max-w-xl mx-auto mb-10">
              Find driveways, garages, and private spots near you — book in seconds.
            </p>
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="max-w-3xl mx-auto mb-10"
          >
            <Suspense fallback={<div className="h-16 max-w-3xl mx-auto rounded-2xl bg-gray-100 animate-pulse" />}>
              <SearchBar />
            </Suspense>
          </motion.div>

          {/* Trust stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex items-center justify-center gap-8 flex-wrap"
          >
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-lg font-semibold text-gray-900">{s.value}</div>
                <div className="text-xs text-gray-500">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Featured listings ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <HomeFeaturedListings listings={listings} loading={loadingListings} />
      </section>

      {/* ── Features + CTA ── */}
      <HomeFeaturesSection />

      {/* ── Minimal footer CTA for non-logged users ── */}
      <div className="border-t border-gray-100 py-10 text-center bg-white">
        <p className="text-sm text-gray-500 mb-4">Have a driveway or garage you&apos;re not using?</p>
        <Link
          href="/register?role=host"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
        >
          List your space →
        </Link>
      </div>
    </div>
  )
}
